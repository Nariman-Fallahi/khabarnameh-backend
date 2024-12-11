import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { S3Service } from 'src/s3/s3.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService, S3Service],
})
export class NewsModule {}
