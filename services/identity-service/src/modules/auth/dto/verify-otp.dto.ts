import { OtpTypeEnum } from '@/common/enums';

export class VerifyOtpDto {
  readonly email: string;
  readonly otp: string;
  readonly type: OtpTypeEnum;
}
