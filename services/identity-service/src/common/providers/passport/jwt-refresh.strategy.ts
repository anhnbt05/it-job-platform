import { JWT_REFRESH_STRATEGY } from '@/common/constants';
import { JwtTokenPayload } from '@/common/types';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(
    private readonly config: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const rt = req.body?.refreshToken;
          if (!rt) return null;
          return rt;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt_refresh_secret', ''),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtTokenPayload) {
    const rt = req.body?.refreshToken;

    const validRt = await this.prismaService.refreshToken.findUnique({
      where: {
        user_id_token: {
          user_id: payload.id,
          token: rt,
        },
      },
    });

    if (
      !validRt ||
      validRt.revoked === true ||
      validRt.expires_at < new Date()
    ) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    return payload;
  }
}
