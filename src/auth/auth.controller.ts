import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthSignUpDto,
  CreateAuthLoginDto,
  CreateAccessTokenDto,
} from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() CreateAuthSignUpDto: CreateAuthSignUpDto) {
    return this.authService.signUp(CreateAuthSignUpDto);
  }

  @Post('login')
  login(@Body() CreateAuthLoginDto: CreateAuthLoginDto) {
    return this.authService.login(CreateAuthLoginDto);
  }

  @Post('refresh')
  refresh(@Body() CreateAccessTokenDto: CreateAccessTokenDto) {
    return this.authService.refresh(CreateAccessTokenDto);
  }
}
