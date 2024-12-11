import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsGuard } from './news.guard';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('latestnews')
  getLatest() {
    return this.newsService.getlatest();
  }

  @Get('breaking')
  getBreaking() {
    return this.newsService.getBreaking();
  }

  @Get('search')
  search(@Query('search') search: string) {
    return this.newsService.search(search);
  }

  @Post(':category')
  @UseGuards(NewsGuard)
  create(
    @Param('category') category: string,
    @Body() createNewsDto: CreateNewsDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.newsService.create(createNewsDto, image, category);
  }

  @Get(':category')
  @UseGuards(NewsGuard)
  getAllNewsByCategory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 18,
    @Param('category') category: string,
  ) {
    return this.newsService.getAllNewsByCategory(page, limit, category);
  }
}
