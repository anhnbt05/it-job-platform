import { Global, Module } from '@nestjs/common';
import { EmailStrategyRegistry } from './email-strategy.registry';
import { EmailsService } from './emails.service';
import {
  LockAccountStrategy,
  PasswordResetOtpStrategy,
  UnlockAccountStrategy,
  VerificationOtpStrategy,
  WelcomeStrategy,
} from './strategies';

@Global()
@Module({
  providers: [
    EmailsService,
    EmailStrategyRegistry,
    VerificationOtpStrategy,
    PasswordResetOtpStrategy,
    WelcomeStrategy,
    LockAccountStrategy,
    UnlockAccountStrategy,
  ],
  exports: [EmailsService],
})
export class EmailsModule {}
