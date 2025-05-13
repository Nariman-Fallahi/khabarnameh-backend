import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { S3Service } from 'src/s3/s3.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class NewsService {
  private readonly redis: Redis | null;

  constructor(
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async getAllNews() {
    let cursor = '0';
    let allNews = [];

    do {
      const [newCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        'news:*',
      );
      cursor = newCursor;

      for (const key of keys) {
        const data = await this.redis.zrange(key, 0, -1);
        const parsedData = data.map((item) => JSON.parse(item));
        allNews = allNews.concat(parsedData);
      }
    } while (cursor !== '0');

    return allNews;
  }

  async create(
    createNewsDto: CreateNewsDto,
    image: Express.Multer.File,
    category: string,
  ) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    const id = await this.redis.incr('NEWS_ID');

    const uploadResult = await this.s3Service.uploadFileToS3(image);

    const data = {
      id,
      ...createNewsDto,
      imageURL: uploadResult,
      createdAt: new Date().toISOString(),
    };

    await this.redis.zadd(`news:${category}`, Date.now(), JSON.stringify(data));

    return {
      message: `${category.charAt(0).toUpperCase() + category.slice(1)} news added successfully`,
    };
  }

  async getAllNewsByCategory(page: number, limit: number, category: string) {
    const offset = (page - 1) * limit;
    const stop = offset + limit - 1;

    const totalItems = await this.redis.zcard(`news:${category}`);
    const totalPages = Math.ceil(totalItems / limit);

    const data = await this.redis.zrange(`news:${category}`, offset, stop);
    const parsedData = data.map((item) => JSON.parse(item));

    return { ...parsedData, totalPages };
  }

  async getBreaking() {
    return (await this.getAllNews()).slice(0, 5);
  }

  async getlatest() {
    return (await this.getAllNews()).slice(6, 21);
  }

  async search(search: string) {
    if (!search) {
      return [];
    }

    return (await this.getAllNews()).filter((item) =>
      item.title.includes(search),
    );
  }
}
