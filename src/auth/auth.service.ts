import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateAuthSignUpDto,
  CreateAuthLoginDto,
  CreateAccessTokenDto,
} from './dto/create-auth.dto';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

interface User {
  id: number;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private readonly redis: Redis | null;

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async isEmailRegistered(email: string): Promise<boolean> {
    const existingEmail = await this.redis.sismember('emails', email);
    return existingEmail === 1;
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // signUp
  async signUp(CreateAuthSignUpDto: CreateAuthSignUpDto) {
    if (await this.isEmailRegistered(CreateAuthSignUpDto.email)) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    await this.redis.sadd('emails', CreateAuthSignUpDto.email);
    const userId = await this.redis.incr('USER_ID');

    const hashed_password = await bcrypt.hash(CreateAuthSignUpDto.password, 10);

    const userData = {
      id: userId,
      ...CreateAuthSignUpDto,
      password: hashed_password,
    };

    const access_token = await this.jwtService.signAsync(
      { email: userData.email },
      {
        expiresIn: '1h',
      },
    );

    const refresh_token = await this.jwtService.signAsync(
      { id: userData.id },
      {
        expiresIn: '7d',
      },
    );

    await this.redis.set(`user:${userData.email}`, JSON.stringify(userData));
    await this.redis.set(
      `user:${userData.id}:refresh_token`,
      refresh_token,
      'EX',
      7 * 24 * 60 * 60,
    );

    return {
      message: 'User created successfully',
      access_token,
      refresh_token,
    };
  }

  // login
  async login(CreateAuthLoginDto: CreateAuthLoginDto) {
    if (!(await this.isEmailRegistered(CreateAuthLoginDto.email))) {
      throw new UnauthorizedException('Email not found');
    }

    const user: User = await this.usersService.findOne(
      CreateAuthLoginDto.email,
    );

    const access_token = await this.jwtService.signAsync(
      { email: user.email },
      {
        expiresIn: '1h',
      },
    );

    const isPasswordValid = await bcrypt.compare(
      CreateAuthLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    let refresh_token: string;
    const existingRefreshToken = await this.redis.get(
      `user:${user.id}:refresh_token`,
    );

    if (existingRefreshToken) {
      refresh_token = existingRefreshToken;
    } else {
      refresh_token = await this.jwtService.signAsync(
        { id: user.id },
        {
          expiresIn: '7d',
        },
      );

      await this.redis.set(
        `user:${user.id}:refresh_token`,
        refresh_token,
        'EX',
        7 * 24 * 60 * 60,
      );
    }

    return {
      message: 'Login successful',
      access_token,
      refresh_token,
    };
  }

  // refresh
  async refresh(CreateAccessTokenDto: CreateAccessTokenDto) {
    try {
      const decoded = this.jwtService.verify(
        CreateAccessTokenDto.refresh_token,
      );

      const storedRefreshToken = await this.redis.get(
        `user:${decoded.id}:refresh_token`,
      );

      if (
        !storedRefreshToken ||
        storedRefreshToken !== CreateAccessTokenDto.refresh_token
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const access_token = await this.jwtService.signAsync(
        { email: decoded.email },
        {
          expiresIn: '1h',
        },
      );

      return {
        access_token,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
