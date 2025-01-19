import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class OtpService {
  private resend: Resend;
  private readonly redis: Redis | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.redis = this.redisService.getOrThrow();
  }

  async sendOTP(email: string) {
    const code = Math.floor(Math.random() * 90000) + 10000;

    const emailContent = `
    <html dir="rtl">
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
        }
        .confirmation-code {
          font-size: 22px;
          font-weight: bold;
          color: #007bff;
        }
        .text-style {
         direction: rtl; 
         text-align: right; 
        }
      </style>
    </head>
    <body>
      <p class="text-style">سلام وقت شما بخیر</p>
      <p class="text-style">کد تایید اپلیکیشن خبرنامه :</p>
      <p class="confirmation-code text-style">${code}</p>
      <p class="text-style">بابت استفاده از اپلیکیشن خبرنامه ممنونم.</p>
      <p class="text-style">توسعه دهنده: نریمان فلاحی</p>
    </body>
  </html>
`;

    const exists = await this.redis.exists(`otp:${email}`);

    if (exists === 0) {
      const { data, error } = await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'کد تایید اپلیکیشن خبرنامه',
        html: emailContent,
      });

      if (error) {
        throw new HttpException(
          'Error sending email',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.redis.set(`otp:${email}`, code, 'EX', 2 * 60);
      throw new HttpException('Code sent', HttpStatus.OK);
    } else {
      throw new HttpException('Code already sent', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyOtp(email: string, codeEntered: string) {
    const codeSent = this.redis.get(`otp:${email}`);

    return (await codeSent) === codeEntered ? true : false;
  }
}
