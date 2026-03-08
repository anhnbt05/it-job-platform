import { RoleEnum, UserStatus } from '@/common/enums';

export type JwtTokenPayload = {
  id: string;
  email: string;
  role: RoleEnum;
  status: UserStatus;
  is_email_verified: boolean;
  iat: number;
  exp: number;
};
