import { EmailType } from '@/common/enums';
import {
  EmailStrategy,
  LockAccountStrategy,
  PasswordResetOtpStrategy,
  UnlockAccountStrategy,
  VerificationOtpStrategy,
  WelcomeStrategy,
} from '@/modules/emails/strategies';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailStrategyRegistry {
  private readonly strategies: Map<EmailType, EmailStrategy>;

  constructor(
    verificationOtpStrategy: VerificationOtpStrategy,
    passwordResetOtpStrategy: PasswordResetOtpStrategy,
    welcomeStrategy: WelcomeStrategy,
    lockAccountStrategy: LockAccountStrategy,
    unlockAccountStrategy: UnlockAccountStrategy,
  ) {
    this.strategies = new Map(
      [
        verificationOtpStrategy,
        passwordResetOtpStrategy,
        welcomeStrategy,
        lockAccountStrategy,
        unlockAccountStrategy,
      ].map((strategy) => [strategy.type, strategy]),
    );
  }

  get(type: EmailType): EmailStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      throw new Error(`Loại email không được hỗ trợ: ${type}`);
    }

    return strategy;
  }
}
