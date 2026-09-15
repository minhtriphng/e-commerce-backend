import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => ({
        code: response.statusCode, // Tự động lấy HTTP status (200, 201...)
        status: true,
        data: data, // Dữ liệu thực tế từ Controller trả về
        message: response.message, // Thông điệp mặc định khi thành công
        error: null,
      })),
    );
  }
}
