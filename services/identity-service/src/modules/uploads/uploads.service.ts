import { UploadedImage } from '@/common/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class UploadsService {
  private readonly imagekit: ImageKit;

  constructor(private readonly configService: ConfigService) {
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
}
