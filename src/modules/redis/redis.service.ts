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
  // ===== String =====
  async set(key: string, value: any, ...args: any[]) {
    // Dùng any[] để bypass type checking khắt khe của ioredis
    return this.redis.set(key, value, ...(args as [any]));
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
  // ===== Hash =====
  async hset(key: string, field: string, value: any) {
    return this.redis.hset(key, field, value);
  }
  async hget(key: string, field: string) {
    return this.redis.hget(key, field);
  }
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }
  async hdel(key: string, ...fields: string[]) {
    return this.redis.hdel(key, ...fields);
  }
  async hincrby(key: string, field: string, increment: number) {
    return this.redis.hincrby(key, field, increment);
  }
  async hexists(key: string, field: string) {
    return this.redis.exists(key); // hoặc this.redis.hexists (ioredis có)
  }
  async hlen(key: string) {
    return this.redis.hlen(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
