import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAuthSignUpDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class CreateAuthLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class CreateAccessTokenDto {
  @IsNotEmpty()
  refresh_token: string;
}
