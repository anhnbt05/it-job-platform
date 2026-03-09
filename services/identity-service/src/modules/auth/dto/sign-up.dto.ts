import { RoleEnum } from '@/common/enums';
import { Level } from 'generated/prisma/enums';

export class SignUpDto {
  readonly email: string;
  readonly password: string;
  readonly role: RoleEnum;
  readonly full_name: string;
  readonly phone_number: string;
  readonly candidate?: CandidateSignUpDto;
  readonly recruiter?: RecruiterSignUpDto;
}

class CandidateSignUpDto {
  readonly level: Level;
  readonly resume_url?: string;
  readonly headline?: string;
  readonly summary?: string[];
  readonly skills?: string[];
  readonly educations?: string[];
  readonly certifications?: string[];
  readonly work_experiences?: string[];
}

class RecruiterSignUpDto {
  // Phòng ban của recruiter trong công ty (HR, Talent Acquisition, ...)
  readonly department?: string;

  // Nếu company đã tồn tại thì gửi id
  readonly company_id?: string;
  // Nếu company chưa tồn tại thì gửi thông tin để tạo mới
  readonly company?: CompanySignUpDto;

  // Nếu chi nhánh đã tồn tại thì gửi id
  readonly branch_id?: string;
  // Nếu chi nhánh chưa tồn tại thì gửi thông tin để tạo mới
  readonly branch?: CompanyBranchSignUpDto;
}

class CompanySignUpDto {
  readonly name?: string;
  readonly size?: string;
  readonly website?: string;
  readonly logo_url?: string;
  readonly description?: string;
  readonly location?: string;
}

class CompanyBranchSignUpDto {
  readonly name?: string;
  readonly address?: string;
  readonly city?: string;
  readonly country?: string;
}
