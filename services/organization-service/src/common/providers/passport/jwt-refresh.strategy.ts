import { JWT_REFRESH_STRATEGY } from '@/common/constants';
import { JwtTokenPayload } from '@/common/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(private readonly config: ConfigService) {
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
    });
  }

  async validate(payload: JwtTokenPayload) {
    return payload;
  }
}
