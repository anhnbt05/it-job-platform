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
  private static readonly IMAGEKIT_URL_ENDPOINT_FALLBACK =
    'https://ik.imagekit.io/local-demo';
  private readonly imagekit: ImageKit;
  private readonly defaultFolder: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.defaultFolder =
      this.configService.get<string>('imagekit.folder') ?? '/captures';

    this.imagekit = new ImageKit({
      publicKey: this.configService.get<string>('imagekit.public_key') ?? '',
      privateKey: this.configService.get<string>('imagekit.private_key') ?? '',
      urlEndpoint:
        this.configService.get<string>('imagekit.url_endpoint') ||
        UploadsService.IMAGEKIT_URL_ENDPOINT_FALLBACK,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadedImage> {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const targetFolder = folder?.trim() || this.defaultFolder;

    const uploadResult = await this.imagekit.upload({
      file: base64,
      fileName: file.originalname,
      folder: targetFolder,
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
