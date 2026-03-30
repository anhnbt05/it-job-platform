import { TUserSession, UploadedImage } from '@/common/types';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class UploadsService {
  private readonly imagekit: ImageKit;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.imagekit = new ImageKit({
      publicKey: this.configService.get<string>('imagekit.public_key') ?? '',
      privateKey: this.configService.get<string>('imagekit.private_key') ?? '',
      urlEndpoint:
        this.configService.get<string>('imagekit.url_endpoint') ?? '',
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = '/identity-service',
  ): Promise<UploadedImage> {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const uploadResult = await this.imagekit.upload({
      file: base64,
      fileName: file.originalname,
      folder,
    });

    return {
      fileId: uploadResult.fileId,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      name: uploadResult.name,
      height: uploadResult.height,
      width: uploadResult.width,
      size: uploadResult.size,
      fileType: uploadResult.fileType,
    };
  }

  async uploadResume(file: Express.Multer.File, userSession: TUserSession) {
    const { id } = userSession;
    const { url } = await this.uploadImage(file);

    if (!url?.trim()) {
      throw new InternalServerErrorException('Đã xảy ra lỗi khi upload CV.');
    }

    const candidateInfo = await this.prismaService.candidate.findUnique({
      where: {
        user_id: id,
      },
    });

    if (!candidateInfo) {
      throw new NotFoundException('Không tìm thấy thông tin ứng viên của bạn.');
    }

    await this.prismaService.candidate.update({
      where: { user_id: id },
      data: {
        resume_urls: [...candidateInfo.resume_urls, url],
      },
    });

    return {
      success: true,
      mesasge: 'Uploaded CV successfully.',
      data: {
        resumeUrl: url,
      },
    };
  }
}
