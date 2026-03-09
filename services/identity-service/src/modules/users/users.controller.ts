import { Roles, UserSession } from '@/common/decorators';
import { RoleEnum } from '@/common/enums';
import { TUserSession } from '@/common/types';
import {
  GetUsersQueryDto,
  UpdateProfileDto,
  UpdateStatusOfUserDto,
} from '@/modules/users/dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles(RoleEnum.ADMIN, RoleEnum.CANDIDATE, RoleEnum.RECRUITER)
  async getMe(@UserSession() userSession: TUserSession) {
    return this.usersService.getMe(userSession);
  }

  @Get()
  @Roles(RoleEnum.ADMIN)
  async getUsers(@Query() getUsersQueryDto: GetUsersQueryDto) {
    return this.usersService.getUsers(getUsersQueryDto);
  }

  @Get('detail/:id')
  async getUserDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() session: TUserSession,
  ) {
    return this.usersService.getUserDetail(id, session);
  }

  @Patch('me')
  @Roles(RoleEnum.CANDIDATE, RoleEnum.RECRUITER, RoleEnum.ADMIN)
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @UserSession() session: TUserSession,
  ) {
    return this.usersService.updateProfile(updateProfileDto, session);
  }

  @Delete()
  @Roles(RoleEnum.CANDIDATE, RoleEnum.RECRUITER, RoleEnum.ADMIN)
  async deleteAccount(@UserSession() session: TUserSession) {
    return this.usersService.deleteAccount(session);
  }

  @Patch(':id/status')
  @Roles(RoleEnum.ADMIN)
  async updateStatusOfUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusOfUserDto,
  ) {
    return this.usersService.updateStatusOfUser(id, dto);
  }
}
