import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  newsSource: string;

  @IsNotEmpty()
  Content: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  keywords: string[];
}
