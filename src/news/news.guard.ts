import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class NewsGuard implements CanActivate {
  private readonly VALID_CATEGORIES = [
    'economic',
    'politics',
    'sports',
    'social',
    'latestnews',
  ];

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const category = request.params.category;

    if (!this.VALID_CATEGORIES.includes(category)) {
      throw new NotFoundException();
    }

    return true;
  }
}
