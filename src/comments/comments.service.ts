import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateCommentDto,
  LikeDislikeCommentDto,
} from './dto/create-comment.dto';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentsService {
  private readonly redis: Redis | null;

  constructor(
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async getUser(token: string) {
    const decoded = await this.authService.validateToken(token);

    if (!decoded.email) {
      throw new UnauthorizedException('Invalid access token');
    }

    return await this.usersService.findOne(decoded.email);
  }

  async create(createCommentDto: CreateCommentDto, token: string) {
    const id = await this.redis.incr('COMMENTS_ID');

    const user = await this.getUser(token);

    const data = {
      id,
      ...createCommentDto,
      userName: user.name,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
    };

    await this.redis.zadd(
      `comment:${data.newsID}`,
      Date.now(),
      JSON.stringify(data),
    );

    return { message: 'Comment created successfully' };
  }

  async getComments(newsID: string) {
    const data = await this.redis.zrange(`comment:${newsID}`, 0, -1);
    const parsedData = data.map((item) => JSON.parse(item));

    const commentsMap = new Map();
    parsedData.forEach((comment) => {
      commentsMap.set(comment.id, { ...comment, replies: [] });
    });

    for (const comment of parsedData) {
      if (comment.parentId) {
        const parentComment = commentsMap.get(parseInt(comment.parentId));
        if (parentComment) {
          parentComment.replies.push(commentsMap.get(comment.id));
        }
      }
    }

    const rootComments = [...commentsMap.values()].filter(
      (comment) => !comment.parentId,
    );

    return rootComments;
  }

  async likeComments(
    likeDislikeCommentDto: LikeDislikeCommentDto,
    token: string,
    reaction: string,
  ) {
    const user = await this.getUser(token);
    const userEmail = user.email;
    const reactionKey = `${reaction}:comment:${likeDislikeCommentDto.commentID}`;

    const isEmailAlreadyReacted = await this.redis.sismember(
      reactionKey,
      userEmail,
    );

    const removePreviousReaction = async () => {
      if (isEmailAlreadyReacted === 1) {
        await this.redis.srem(reactionKey, userEmail);
      }
    };

    const checkAndAddReaction = async (reaction: string) => {
      if (isEmailAlreadyReacted === 1) {
        throw new ConflictException(
          `This user has already ${reaction}d this comment`,
        );
      }

      await this.redis.sadd(reactionKey, userEmail);
      return { message: `The comment was successfully ${reaction}d` };
    };

    switch (reaction) {
      case 'like':
        await removePreviousReaction();
        return await checkAndAddReaction('like');
      case 'deslike':
        await removePreviousReaction();
        return await checkAndAddReaction('deslike');
      default:
        throw new BadRequestException('Invalid reaction type');
    }
  }
}
