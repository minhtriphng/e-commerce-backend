import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../modules/redis/redis.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];

    // Không có key thì chạy request bình thường
    if (!idempotencyKey) {
      return next.handle();
    }

    const redisKey = `idempotency:${idempotencyKey}`;

    // 1. Kiểm tra xem key đã có kết quả lưu trữ chưa
    //(req1 null chạy thẳng xuống dưới)
    const cachedResponse = await this.redisService.get(redisKey);
    if (cachedResponse) {
      // Nếu có rồi và không phải trạng thái đang xử lý, trả về luôn kết quả cũ(req3)
      if (cachedResponse !== 'PROCESSING') {
        return of(JSON.parse(cachedResponse));
      }
      //(req2) cực nhanh race condition
      throw new ConflictException(
        'Request đang được xử lý, vui lòng thử lại sau.',
      );
    }

    // 2. Chống Race Condition bằng cơ chế SET NX (Khóa tạm 60 giây)
    const isLockAcquired = await this.redisService.set(
      redisKey,
      'PROCESSING',
      'EX',
      60,
      'NX',
    );
    if (!isLockAcquired) {
      throw new ConflictException(
        'Request đang được xử lý, vui lòng thử lại sau.',
      );
    }

    // 3. Cho request đi tiếp xuống Controller/Service, sau đó lưu kết quả thật vào Redis
    return next.handle().pipe(
      tap(async (response) => {
        // BƯỚC NÀY CHẠY SAU KHI CONTROLLER & SERVICE ĐÃ THỰC THI XONG XUÔI!
        await this.redisService.set(
          redisKey,
          JSON.stringify(response),
          'EX',
          86400,
        );
      }),
    );
  }
}
