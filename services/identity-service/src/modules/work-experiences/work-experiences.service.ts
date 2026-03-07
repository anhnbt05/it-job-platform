import { CreateWorkExperienceDto } from '@/modules/work-experiences/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkExperiencesService {
  constructor() {}

  async createWorkExperience(dto: CreateWorkExperienceDto) {}
}
