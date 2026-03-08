import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const createEmailTransporter = (configService: ConfigService) => {
  const host = configService.get<string>('mail_host');
  const port = Number(configService.get<number>('mail_port') ?? 587);
  const secure = configService.get<string>('mail_secure') === 'true';

  const user = configService.get<string>('mail_user');
  const pass = configService.get<string>('mail_pass');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};
