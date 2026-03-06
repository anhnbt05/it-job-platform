import { RoleEnum } from '@/common/enums';
import { UserStatus } from 'generated/prisma/client';

export type JwtTokenPayload = {
  id: string;
  email: string;
  role: RoleEnum;
  status: UserStatus;
  is_email_verified: boolean;
  iat: number;
  exp: number;
};
