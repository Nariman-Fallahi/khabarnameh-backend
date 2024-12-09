import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class UsersService {
  private readonly redis: Redis | null;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
  }

  async findOne(email: string) {
    return JSON.parse(await this.redis.get(`user:${email}`));
  }
}
