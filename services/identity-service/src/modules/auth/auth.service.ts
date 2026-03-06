import { SignInDto, SignUpDto } from '@/modules/auth/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}

  async signIn(signInDto: SignInDto) {}

  async signUp(signUpDto: SignUpDto) {}
}
