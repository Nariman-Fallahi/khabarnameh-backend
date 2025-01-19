import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';

@Module({
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
