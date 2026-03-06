import { Module } from '@nestjs/common';
import { WorkExperiencesService } from './work-experiences.service';
import { WorkExperiencesController } from './work-experiences.controller';

@Module({
  controllers: [WorkExperiencesController],
  providers: [WorkExperiencesService],
})
export class WorkExperiencesModule {}
