import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  LikeDislikeCommentDto,
} from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Headers('Authorization') headers: string,
  ) {
    const token = headers.split(' ')[1];

    return this.commentsService.create(createCommentDto, token);
  }

  @Get(':newsID')
  getComments(@Param('newsID') newsID: string) {
    return this.commentsService.getComments(newsID);
  }

  @Post(['like', 'deslike'])
  likeComments(
    @Body() likeDislikeCommentDto: LikeDislikeCommentDto,
    @Headers('Authorization') headers: string,
    @Req() req: Request,
  ) {
    const token = headers.split(' ')[1];
    const param = req.url.split('/')[2];
    return this.commentsService.likeComments(
      likeDislikeCommentDto,
      token,
      param,
    );
  }
}
