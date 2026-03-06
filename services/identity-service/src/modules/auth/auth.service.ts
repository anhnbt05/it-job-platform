import { OtpTypeEnum, RoleEnum } from '@/common/enums';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyOtpDto,
} from '@/modules/auth/dto';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { EmailsService } from '@/modules/emails/emails.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailsService: EmailsService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        status: true,
        is_email_verified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role as RoleEnum,
      status: user.status,
      is_email_verified: user.is_email_verified,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt_secret'),
      expiresIn: this.configService.get('jwt_expiration_time'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt_refresh_secret'),
      expiresIn: this.configService.get('jwt_refresh_expiration_time'),
    });

    const refreshExpiration =
      this.configService.get<string>('jwt_refresh_expiration_time') ?? '0';

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        expires_at: new Date(
          Date.now() + this.parseExpirationToMs(refreshExpiration),
        ),
        user_id: user.id,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      password,
      role,
      full_name,
      phone_number,
      candidate,
      recruiter,
    } = signUpDto;

    if (!email || !password || !full_name || !phone_number) {
      throw new BadRequestException('Thiếu thông tin bắt buộc');
    }

    if (!Object.values(RoleEnum).includes(role)) {
      throw new BadRequestException('Vai trò không hợp lệ');
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const existingProfile = await this.prismaService.userProfile.findUnique({
      where: { phone_number },
    });

    if (existingProfile) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    if (role === RoleEnum.CANDIDATE && !candidate) {
      throw new BadRequestException('Thiếu thông tin ứng viên');
    }

    if (role === RoleEnum.RECRUITER && !recruiter) {
      throw new BadRequestException('Thiếu thông tin nhà tuyển dụng');
    }

    const hashedPassword = await this.hashPassword(password);

    const otp = this.generateOtp();
    const otpExpiresInMinutes = 15;

    await this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role.toLowerCase() as any,
        },
      });

      await tx.userProfile.create({
        data: {
          user_id: user.id,
          full_name,
          phone_number,
        },
      });

      if (role === RoleEnum.CANDIDATE && candidate) {
        await tx.candidate.create({
          data: {
            user_id: user.id,
            headline: candidate.headline,
            summary: candidate.summary ?? [],
          },
        });
      }

      if (role === RoleEnum.RECRUITER && recruiter) {
        let companyId: string | null = null;
        let branchId: string | null = null;

        if (recruiter.company_id) {
          const existingCompany = await tx.company.findUnique({
            where: { id: recruiter.company_id },
          });

          if (!existingCompany) {
            throw new BadRequestException('Không tìm thấy công ty');
          }

          companyId = existingCompany.id;
        } else if (recruiter.company && recruiter.company.name) {
          const existingCompany = await tx.company.findFirst({
            where: {
              name: recruiter.company.name,
              website: recruiter.company.website,
            },
          });

          const company =
            existingCompany ||
            (await tx.company.create({
              data: {
                name: recruiter.company.name,
                size: recruiter.company.size,
                website: recruiter.company.website,
                logo_url: recruiter.company.logo_url,
                description: recruiter.company.description,
                location: recruiter.company.location,
              },
            }));

          companyId = company.id;
        } else {
          throw new BadRequestException(
            'Nhà tuyển dụng cần cung cấp company_id hoặc thông tin công ty',
          );
        }

        if (!companyId) {
          throw new BadRequestException('Không xác định được công ty');
        }

        if (recruiter.branch_id || recruiter.branch) {
          if (recruiter.branch_id) {
            const existingBranch = await tx.companyBranch.findUnique({
              where: { id: recruiter.branch_id },
            });

            if (!existingBranch || existingBranch.company_id !== companyId) {
              throw new BadRequestException(
                'Không tìm thấy chi nhánh thuộc công ty này',
              );
            }

            branchId = existingBranch.id;
          } else if (recruiter.branch && recruiter.branch.name) {
            const newBranch = await tx.companyBranch.create({
              data: {
                company_id: companyId,
                name: recruiter.branch.name,
                address: recruiter.branch.address,
                city: recruiter.branch.city,
                country: recruiter.branch.country,
              },
            });

            branchId = newBranch.id;
          }
        }

        if (!branchId?.trim()) {
          throw new BadRequestException(
            'Không xác định được chi nhánh làm việc.',
          );
        }

        await tx.recruiter.create({
          data: {
            user_id: user.id,
            company_id: companyId,
            department: recruiter.department,
            branch_id: branchId,
          },
        });
      }

      await tx.otpToken.create({
        data: {
          user_id: user.id,
          token: otp,
          type: OtpTypeEnum.EMAIL_VERIFICATION,
          expires_at: new Date(Date.now() + otpExpiresInMinutes * 60 * 1000),
        },
      });
    });

    await this.emailsService.sendVerificationOtpEmail(
      email,
      otp,
      otpExpiresInMinutes,
    );

    return {
      message:
        'Vui lòng kiểm tra email để xác thực tài khoản bằng mã OTP đã được gửi.',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    if (!email) {
      throw new BadRequestException('Email là bắt buộc');
    }

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    // Không tiết lộ thông tin user tồn tại hay không để tránh lộ dữ liệu
    if (!user) {
      return {
        message:
          'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã OTP đặt lại mật khẩu.',
      };
    }

    const otp = this.generateOtp();
    const otpExpiresInMinutes = 15;

    await this.prismaService.$transaction(async (tx) => {
      // Xoá các OTP reset password cũ của user
      await tx.otpToken.deleteMany({
        where: {
          user_id: user.id,
          type: OtpTypeEnum.PASSWORD_RESET,
        },
      });

      await tx.otpToken.create({
        data: {
          user_id: user.id,
          token: otp,
          type: OtpTypeEnum.PASSWORD_RESET,
          expires_at: new Date(Date.now() + otpExpiresInMinutes * 60 * 1000),
        },
      });
    });

    await this.emailsService.sendPasswordResetOtpEmail(
      email,
      otp,
      otpExpiresInMinutes,
    );

    return {
      message:
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã OTP đặt lại mật khẩu.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp, type } = verifyOtpDto;

    if (!email || !otp || !type) {
      throw new BadRequestException('Thiếu thông tin xác thực OTP');
    }

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    const otpRecord = await this.prismaService.otpToken.findFirst({
      where: {
        user_id: user.id,
        token: otp,
        type,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!otpRecord || otpRecord.expires_at < new Date()) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    if (type === OtpTypeEnum.EMAIL_VERIFICATION) {
      if (user.is_email_verified) {
        await this.prismaService.otpToken.deleteMany({
          where: {
            user_id: user.id,
            type,
          },
        });

        return {
          message: 'Email đã được xác thực trước đó.',
        };
      }

      await this.prismaService.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { is_email_verified: true },
        });

        await tx.otpToken.deleteMany({
          where: {
            user_id: user.id,
            type,
          },
        });
      });

      return {
        message: 'Xác thực email thành công.',
      };
    }

    if (type === OtpTypeEnum.PASSWORD_RESET) {
      // Xoá các OTP reset password cũ của user để tránh reuse
      await this.prismaService.otpToken.deleteMany({
        where: {
          user_id: user.id,
          type: OtpTypeEnum.PASSWORD_RESET,
        },
      });

      // Sinh token xác nhận bước 2 (dùng cho reset mật khẩu)
      const confirmToken = crypto.randomBytes(32).toString('hex');
      const confirmExpiresInMinutes = 15;

      await this.prismaService.otpToken.create({
        data: {
          user_id: user.id,
          token: confirmToken,
          type: OtpTypeEnum.PASSWORD_RESET_CONFIRM,
          expires_at: new Date(
            Date.now() + confirmExpiresInMinutes * 60 * 1000,
          ),
        },
      });

      return {
        message:
          'Mã OTP hợp lệ. Bạn có thể tiếp tục đến bước đặt lại mật khẩu.',
        token: confirmToken,
      };
    }

    throw new BadRequestException('Loại OTP không được hỗ trợ');
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { newPassword, token } = resetPasswordDto;

    if (!newPassword || !token) {
      throw new BadRequestException('Thiếu mật khẩu mới hoặc token xác nhận');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const otpRecord = await this.prismaService.otpToken.findFirst({
      where: {
        token,
        type: OtpTypeEnum.PASSWORD_RESET_CONFIRM,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!otpRecord || otpRecord.expires_at < new Date()) {
      throw new BadRequestException(
        'Token xác nhận đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: otpRecord.user_id },
    });

    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });

      // Xoá tất cả token liên quan đến reset password để tránh reuse
      await tx.otpToken.deleteMany({
        where: {
          user_id: user.id,
          type: {
            in: [
              OtpTypeEnum.PASSWORD_RESET,
              OtpTypeEnum.PASSWORD_RESET_CONFIRM,
            ],
          },
        },
      });

      // Có thể cân nhắc revoke toàn bộ refresh token hiện tại của user
      await tx.refreshToken.updateMany({
        where: {
          user_id: user.id,
          revoked: false,
        },
        data: {
          revoked: true,
        },
      });
    });

    return {
      message:
        'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Convert a duration string like "15m", "15p", "30s", "2h" to milliseconds.
   * If unit is omitted, it is treated as seconds.
   */
  private parseExpirationToMs(value: string): number {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    const match = trimmed.match(/^(\d+)\s*([a-zA-Z]*)$/);
    if (!match) return 0;

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    if (Number.isNaN(amount)) return 0;

    switch (unit) {
      case 'm':
      case 'p': // phút
      case 'min':
      case 'mins':
        return amount * 60 * 1000;
      case 'h':
      case 'hr':
      case 'hrs':
        return amount * 60 * 60 * 1000;
      case 'd':
      case 'day':
      case 'days':
        return amount * 24 * 60 * 60 * 1000;
      case 's':
      case 'sec':
      case 'secs':
      case '':
        return amount * 1000;
      default:
        return 0;
    }
  }
}
