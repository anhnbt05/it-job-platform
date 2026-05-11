import { RoleEnum } from '../../common/enums/role.enum';
import { EmailType } from '../../common/enums/email-type.enum';
import { EmailStrategyRegistry } from './email-strategy.registry';
import {
  LockAccountStrategy,
  PasswordResetOtpStrategy,
  UnlockAccountStrategy,
  VerificationOtpStrategy,
  WelcomeStrategy,
} from './strategies';

describe('EmailStrategyRegistry', () => {
  const registry = new EmailStrategyRegistry(
    new VerificationOtpStrategy(),
    new PasswordResetOtpStrategy(),
    new WelcomeStrategy(),
    new LockAccountStrategy(),
    new UnlockAccountStrategy(),
  );

  it('returns the registered strategy for each email type', () => {
    const strategy = registry.get(EmailType.WELCOME);
    const content = strategy.build('dev@example.com', {
      name: 'Dev',
      role: RoleEnum.CANDIDATE,
    });

    expect(strategy.type).toBe(EmailType.WELCOME);
    expect(content.subject).toContain('Chào mừng');
  });

  it('throws when the email type is not supported', () => {
    expect(() => registry.get('unsupported' as EmailType)).toThrow(
      'Loại email không được hỗ trợ: unsupported',
    );
  });
});
