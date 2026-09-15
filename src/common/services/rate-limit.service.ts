import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class RateLimitService {
  constructor(private readonly redisService: RedisService) {}

  async check(
    key: string,
    limit: number,
    windowSeconds: number,
    message = 'Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau.',
  ): Promise<void> {
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, windowSeconds);
    }

    if (count > limit) {
      throw new BadRequestException(message);
    }
  }
}
