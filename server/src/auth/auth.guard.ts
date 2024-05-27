import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionType } from 'src/common/dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { session } = context
      .switchToHttp()
      .getRequest<Request & { session: SessionType }>();

    if (!session.LoggedInBranch) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
