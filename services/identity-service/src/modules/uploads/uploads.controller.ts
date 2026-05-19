import { Public, Roles, UserSession } from '@/common/decorators';
import { TUserSession, UploadedImage } from '@/common/types';
import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'resume', maxCount: 1 },
        { name: 'avatar', maxCount: 1 },
      ],
      {
      storage: memoryStorage(),
      },
    ),
  )
  async uploadResume(
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      resume?: Express.Multer.File[];
      avatar?: Express.Multer.File[];
    },
    @UserSession() userSession: TUserSession,
  ) {
    const file = files.file?.[0] || files.resume?.[0] || files.avatar?.[0];

    if (!file) {
      throw new BadRequestException('Không tìm thấy tệp CV cần tải lên.');
    }

    return this.uploadsService.uploadResume(file, userSession);
  }
}
