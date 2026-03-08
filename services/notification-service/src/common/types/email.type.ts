import { RoleEnum } from '@/common/enums';

export type WelcomePayload = {
  name?: string;
  role: RoleEnum;
  loginUrl?: string;
};
