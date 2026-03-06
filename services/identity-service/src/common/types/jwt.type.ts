import { RoleEnum } from '@/common/enums';

export type JwtTokenPayload = {
  id: string;
  role: RoleEnum;
  iat: number;
  exp: number;
};
