import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class OtpService {
  private readonly redis: Redis | null;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
  }

  async sendOTP(email: string) {
    const code = Math.floor(Math.random() * 90000) + 10000;

    const exists = await this.redis.exists(`otp:${email}`);

    if (exists === 0) {
      console.log(code);

      this.redis.set(`otp:${email}`, code, 'EX', 2 * 60);
      throw new HttpException('Code sent', HttpStatus.OK);
    } else {
      throw new HttpException('Code already sent', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyOtp(email: string, codeEntered: string) {
    const codeSent = await this.redis.get(`otp:${email}`);

    return codeSent === codeEntered;
  }
}
