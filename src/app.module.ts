import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NewsModule } from './news/news.module';
import { S3Module } from './s3/s3.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommentsModule } from './comments/comments.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        config:
          configService.get<string>('NODE_ENV') === 'production'
            ? {
                url: configService.get<string>('REDIS_URL'),
              }
            : {
                host: 'localhost',
                port: 6379,
              },
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    NewsModule,
    S3Module,
    CommentsModule,
    OtpModule,
  ],
})
export class AppModule {}
