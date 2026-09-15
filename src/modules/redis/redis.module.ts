import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

// @Global():Dùng @Global() để các module khác có thể inject RedisService mà không phải import RedisModule ở từng module.
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
