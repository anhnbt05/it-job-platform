import { Public, Roles, UserSession } from '@/common/decorators';
import { TUserSession, UploadedImage } from '@/common/types';
import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { RoleEnum } from '@/common/enums';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Public()
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<UploadedImage> {
    return this.uploadsService.uploadImage(file, folder);
  }

  @Post('resume')
  @Roles(RoleEnum.CANDIDATE)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
    }),
  )
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @UserSession() userSession: TUserSession,
  ) {
    return this.uploadsService.uploadResume(file, userSession);
  }
}
