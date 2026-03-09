import { TUserSession } from '@/common/types';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  CreateWorkExperienceDto,
  UpdateWorkExperienceDto,
} from '@/modules/work-experiences/dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class WorkExperiencesService {
  constructor(private readonly prismaService: PrismaService) {}

  async deleteWorkExperience(id: string, session: TUserSession) {
    const we = await this.prismaService.workExperience.findUnique({
      where: {
        id,
      },
      include: {
        candidate: true,
      },
    });

    if (!we || !we?.candidate) {
      throw new NotFoundException(
        'Không tìm thấy thông tin kinh nghiệm làm việc.',
      );
    }

    if (we.candidate.user_id !== session.id) {
      throw new ForbiddenException(
        'Bạn chỉ có quyền xoá kinh nghiệm làm việc của chính mình.',
      );
    }

    await this.prismaService.workExperience.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Đã xoá thành công kinh nghiệm làm việc.',
    };
  }

  async createWorkExperience(
    dto: CreateWorkExperienceDto,
    session: TUserSession,
  ) {
    const candidate = await this.prismaService.candidate.findUnique({
      where: {
        user_id: session.id,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Không tìm thấy thông tin ứng viên của bạn.');
    }

    const workExperience = await this.prismaService.workExperience.create({
      data: {
        ...dto,
        candidate: {
          connect: {
            id: candidate.id,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Thêm mới kinh nghiệm làm việc thành công.',
      data: workExperience,
    };
  }

  async updateWorkExperience(
    id: string,
    dto: UpdateWorkExperienceDto,
    session: TUserSession,
  ) {
    const we = await this.prismaService.workExperience.findUnique({
      where: {
        id,
      },
      include: {
        candidate: true,
      },
    });

    if (!we) {
      throw new NotFoundException(
        'Không tìm thấy thông tin kinh nghiệm việc làm.',
      );
    }

    if (we.candidate.user_id !== session.id) {
      throw new ForbiddenException(
        'Bạn chỉ có thể cập nhật kinh nghiệm việc làm của chính mình.',
      );
    }

    const {
      company_name,
      company_logo_url,
      position,
      descriptions,
      start_date,
      end_date,
      location,
      job_type,
    } = dto;

    const updated = await this.prismaService.workExperience.update({
      where: {
        id,
      },
      data: {
        ...(company_name && { company_name }),
        ...(company_logo_url !== undefined && { company_logo_url }),
        ...(position && { position }),
        ...(descriptions && { descriptions }),
        ...(location && { location }),
        ...(job_type && { job_type }),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date !== undefined && {
          end_date: end_date ? new Date(end_date) : null,
        }),
      },
    });

    return {
      success: true,
      message: 'Cập nhật thành công kinh nghiệm việc làm.',
      data: updated,
    };
  }
}
