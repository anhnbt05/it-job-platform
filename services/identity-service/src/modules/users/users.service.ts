import { RoleEnum } from '@/common/enums';
import { EmailType, TUserSession } from '@/common/types';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  GetUsersQueryDto,
  UpdateProfileDto,
  UpdateStatusOfUserDto,
} from '@/modules/users/dto';
import { GetWorkExperiencesQueryDto } from '@/modules/work-experiences/dto';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Prisma } from 'generated/prisma/client';
import { UserStatus } from 'generated/prisma/enums';
import { omit } from 'lodash';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kakfaClient: ClientKafka,
  ) {}

  async getWorkExperiencesOfCandidate(
    id: string,
    query: GetWorkExperiencesQueryDto,
    session: TUserSession,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        candidate: {
          select: { id: true },
        },
      },
    });

    if (!user || !user.candidate) {
      throw new NotFoundException(
        `Không tìm thấy thông tin của ${session.id === id ? 'bạn' : 'ứng viên'}.`,
      );
    }

    const { company_name, position, start_date, end_date, location, job_type } =
      query;

    const where: Prisma.WorkExperienceWhereInput = {
      candidate_id: user.candidate.id,
      ...(company_name && {
        company_name: {
          contains: company_name,
          mode: 'insensitive',
        },
      }),
      ...(position && {
        position: {
          contains: position,
          mode: 'insensitive',
        },
      }),
      ...(location && {
        location: {
          contains: location,
          mode: 'insensitive',
        },
      }),
      ...(job_type && {
        job_type,
      }),
      ...(start_date && {
        start_date: {
          gte: new Date(start_date),
        },
      }),
      ...(end_date && {
        end_date: {
          lte: new Date(end_date),
        },
      }),
    };

    const workExperiences = await this.prismaService.workExperience.findMany({
      where,
      orderBy: {
        start_date: 'desc',
      },
    });

    return workExperiences;
  }

  async updateStatusOfUser(id: string, dto: UpdateStatusOfUserDto) {
    const { status, reason } = dto;

    if (status === UserStatus.inactive && !reason?.trim()) {
      throw new ForbiddenException(
        'Vui lòng cung cấp lý do để khoá tài khoản.',
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    }

    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    if (status === UserStatus.inactive && reason?.trim()) {
      this.kakfaClient.emit('email.send', {
        to: user.email,
        type: EmailType.LOCK_ACCOUNT,
        payload: {
          reason,
          contactPhone: '0393873630',
          contactEmail: 'lengocanhpyne363@gmail.com',
        },
      });
    } else if (status === UserStatus.active) {
      this.kakfaClient.emit('email.send', {
        to: user.email,
        type: EmailType.UNLOCK_ACCOUNT,
        payload: {
          contactPhone: '0393873630',
          contactEmail: 'lengocanhpyne363@gmail.com',
        },
      });
    }

    return {
      success: true,
      message: 'Cập nhật trạng thái người dùng thành công',
    };
  }

  async deleteAccount(session: TUserSession) {
    const { id } = session;
    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
    return {
      success: true,
      message: 'Đã xoá thành công tài khoản của bạn khỏi hệ thống.',
    };
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    session: TUserSession,
  ) {
    const { id } = session;

    const {
      full_name,
      avatar_url,
      phone_number,
      bio,
      updateCandidateDto,
      updateRecruiterDto,
    } = updateProfileDto;

    return this.prismaService.$transaction(async (tx) => {
      if (full_name || avatar_url || phone_number || bio) {
        await tx.userProfile.update({
          where: { user_id: id },
          data: {
            full_name,
            avatar_url,
            phone_number,
            bio,
          },
        });
      }

      if (updateCandidateDto) {
        const {
          headline,
          summary,
          level,
          resume_urls,
          skills,
          educations,
          certifications,
        } = updateCandidateDto;

        const candidate = await tx.candidate.findUnique({
          where: { user_id: id },
          select: { id: true },
        });

        if (!candidate) {
          throw new Error('Candidate profile not found');
        }

        await tx.candidate.update({
          where: { id: candidate.id },
          data: {
            headline,
            summary,
            level,
            resume_urls,
          },
        });

        if (skills) {
          await tx.candidateSkill.deleteMany({
            where: { candidate_id: candidate.id },
          });

          await tx.candidateSkill.createMany({
            data: skills.map((skill) => ({
              candidate_id: candidate.id,
              skill_name: skill,
            })),
          });
        }

        if (educations) {
          await tx.candidateEducation.deleteMany({
            where: { candidate_id: candidate.id },
          });

          await tx.candidateEducation.createMany({
            data: educations.map((school) => ({
              candidate_id: candidate.id,
              school_name: school,
            })),
          });
        }

        if (certifications) {
          await tx.candidateCertification.deleteMany({
            where: { candidate_id: candidate.id },
          });

          await tx.candidateCertification.createMany({
            data: certifications.map((cert) => ({
              candidate_id: candidate.id,
              name: cert,
            })),
          });
        }
      }

      if (updateRecruiterDto) {
        const { department } = updateRecruiterDto;

        await tx.recruiter.update({
          where: { user_id: id },
          data: {
            department,
          },
        });
      }

      return {
        success: true,
        message: 'Cập nhật thông tin cá nhân thành công.',
        data: await this.getMe(session),
      };
    });
  }

  async getUserDetail(id: string, session: TUserSession) {
    const { id: userId, role } = session;

    if (role !== RoleEnum.ADMIN && userId !== id) {
      throw new ForbiddenException(
        'Bạn chỉ có thể xem thông tin của chính mình.',
      );
    }

    return this.getMe({
      id,
      role,
    });
  }

  async getUsers(query: GetUsersQueryDto) {
    const { role } = query;

    const users = await this.prismaService.user.findMany({
      where: {
        ...(role && { role }),
      },
      include: {
        recruiter: {
          include: {
            company: true,
            branch: true,
          },
        },
        candidate: true,
      },
    });

    return users.map(({ password, ...user }) => user);
  }

  async getMe(userSession: TUserSession) {
    const { id, role } = userSession;

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        ...((role === RoleEnum.CANDIDATE || role === RoleEnum.ADMIN) && {
          candidate: true,
        }),
        ...((role === RoleEnum.RECRUITER || role === RoleEnum.ADMIN) && {
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
