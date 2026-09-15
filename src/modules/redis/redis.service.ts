// redis.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: +this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async set(key: string, value: string, ttl: number) {
    return this.redis.set(key, value, 'EX', ttl);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  async incr(key: string) {
    return this.redis.incr(key);
  }

  async expire(key: string, ttl: number) {
    return this.redis.expire(key, ttl);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
