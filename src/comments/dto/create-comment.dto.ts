import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  newsID: string;

  @IsNotEmpty()
  content: string;

  @IsOptional()
  parentId: string | null;
}

export class LikeDislikeCommentDto {
  @IsNotEmpty()
  commentID: string;
}
