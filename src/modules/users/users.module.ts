import { Module } from '@nestjs/common';
import { OtpService } from '../auth/services/otp.service';
import { RedisService } from '../redis/redis.service';
import { RateLimitService } from '../../common/services/rate-limit.service';

@Module({
  controllers: [],
  providers: [RedisService, RateLimitService],
})
export class UsersModule {}
