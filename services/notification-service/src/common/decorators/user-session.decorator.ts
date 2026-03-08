import { TUserSession } from '@/common/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserSession = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const user = context.switchToHttp().getRequest<Request>()
      .user as TUserSession;

    return user;
  },
);
