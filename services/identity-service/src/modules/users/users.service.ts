import { RoleEnum } from '@/common/enums';
import { TUserSession } from '@/common/types';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { omit } from 'lodash';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userSession: TUserSession) {
    const { id, role } = userSession;

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        ...(role === RoleEnum.CANDIDATE && {
          candidate: true,
        }),
        ...(role === RoleEnum.RECRUITER && {
          recruiter: {
            include: {
              company: true,
              branch: true,
            },
          },
        }),
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin của bạn.');
    }

    return omit(user, ['password']);
  }
}
