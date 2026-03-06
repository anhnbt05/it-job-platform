import { Controller } from '@nestjs/common';
import { WorkExperiencesService } from './work-experiences.service';

@Controller('work-experiences')
export class WorkExperiencesController {
  constructor(private readonly workExperiencesService: WorkExperiencesService) {}
}
