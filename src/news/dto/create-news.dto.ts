import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  newsSource: string;

  @IsNotEmpty()
  Content: string;

  @IsOptional()
  isFeatured: boolean;
}
