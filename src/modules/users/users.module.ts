import { Module } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { RateLimitService } from '../../common/services/rate-limit.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [],
  providers: [RedisService, RateLimitService],
})
export class UsersModule {}
