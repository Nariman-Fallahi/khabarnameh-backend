import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly redis: Redis | null;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
  }

  async signUp(createAuthDto: CreateAuthDto) {
    const existingEmail = await this.redis.sismember(
      'emails',
      createAuthDto.email,
    );

    if (existingEmail === 1) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    await this.redis.sadd('emails', createAuthDto.email);
    const userId = await this.redis.incr('USER_ID');

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    const userData = {
      id: userId,
      ...createAuthDto,
      password: hashedPassword,
    };

    await this.redis.set(`user:${userData.id}`, JSON.stringify(userData));

    return { message: 'User created successfully', userId: userData.id };
  }
}
