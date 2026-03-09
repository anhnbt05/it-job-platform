import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkExperiencesService } from './work-experiences.service';
import { Roles, UserSession } from '@/common/decorators';
import { RoleEnum } from '@/common/enums';
import {
  CreateWorkExperienceDto,
  UpdateWorkExperienceDto,
} from '@/modules/work-experiences/dto';
import { TUserSession } from '@/common/types';

@Controller('work-experiences')
export class WorkExperiencesController {
  constructor(
    private readonly workExperiencesService: WorkExperiencesService,
  ) {}

  @Roles(RoleEnum.CANDIDATE)
  @Post()
  async createWorkExperience(
    @Body() dto: CreateWorkExperienceDto,
    @UserSession() session: TUserSession,
  ) {
    return this.workExperiencesService.createWorkExperience(dto, session);
  }

  @Patch(':id')
  @Roles(RoleEnum.CANDIDATE)
  async updateWorkExperience(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkExperienceDto,
    @UserSession() session: TUserSession,
  ) {
    return this.workExperiencesService.updateWorkExperience(id, dto, session);
  }

  @Delete(':id')
  @Roles(RoleEnum.CANDIDATE)
  async deleteWorkExperience(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() session: TUserSession,
  ) {
    return this.workExperiencesService.deleteWorkExperience(id, session);
  }
}
