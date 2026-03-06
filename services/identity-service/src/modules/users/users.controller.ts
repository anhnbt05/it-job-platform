import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles, UserSession } from '@/common/decorators';
import { RoleEnum } from '@/common/enums';
import { TUserSession } from '@/common/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.CANDIDATE, RoleEnum.RECRUITER)
  async getMe(@UserSession() userSession: TUserSession) {
    return this.usersService.getMe(userSession);
  }
}
