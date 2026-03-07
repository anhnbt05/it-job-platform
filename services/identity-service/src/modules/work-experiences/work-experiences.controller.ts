import { Body, Controller, Post } from '@nestjs/common';
import { WorkExperiencesService } from './work-experiences.service';
import { Roles } from '@/common/decorators';
import { RoleEnum } from '@/common/enums';
import { CreateWorkExperienceDto } from '@/modules/work-experiences/dto';

@Controller('work-experiences')
export class WorkExperiencesController {
  constructor(
    private readonly workExperiencesService: WorkExperiencesService,
  ) {}

  @Roles(RoleEnum.CANDIDATE)
  @Post()
  async createWorkExperience(@Body() dto: CreateWorkExperienceDto) {
    return this.workExperiencesService.createWorkExperience(dto);
  }
}
