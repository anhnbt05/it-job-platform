import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import bcryptjs from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const hashPassword = (pw: string) =>
  bcryptjs.hashSync(pw, bcryptjs.genSaltSync());

type CandidateSkillSeed = {
  skill_name: string;
  level?: string | null;
};

type CandidateEducationSeed = {
  id: string;
  school_name: string;
  degree?: string | null;
  field?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
};

type CandidateCertificationSeed = {
  id: string;
  name: string;
  organization?: string | null;
  issue_date?: Date | null;
};

type WorkExperienceSeed = {
  id: string;
  company_name: string;
  company_logo_url?: string | null;
  position: string;
  descriptions: string[];
  start_date: Date;
  end_date?: Date | null;
  location: string;
  job_type: 'part_time' | 'full_time' | 'remote' | 'free_lance';
};

type UserDeviceSeed = {
  device_name?: string | null;
  device_type: 'web' | 'mobile';
  ip_address?: string | null;
};

async function replaceCandidateSkills(
  candidateId: string,
  skills: CandidateSkillSeed[],
) {
  await prisma.candidateSkill.deleteMany({
    where: { candidate_id: candidateId },
  });

  if (skills.length > 0) {
    await prisma.candidateSkill.createMany({
      data: skills.map((skill) => ({
        candidate_id: candidateId,
        skill_name: skill.skill_name,
        level: skill.level ?? null,
      })),
    });
  }
}

async function upsertCandidateEducations(
  candidateId: string,
  educations: CandidateEducationSeed[],
) {
  for (const education of educations) {
    await prisma.candidateEducation.upsert({
      where: { id: education.id },
      update: {
        candidate_id: candidateId,
        school_name: education.school_name,
        degree: education.degree ?? null,
        field: education.field ?? null,
        start_date: education.start_date ?? null,
        end_date: education.end_date ?? null,
      },
      create: {
        id: education.id,
        candidate_id: candidateId,
        school_name: education.school_name,
        degree: education.degree ?? null,
        field: education.field ?? null,
        start_date: education.start_date ?? null,
        end_date: education.end_date ?? null,
      },
    });
  }
}

async function upsertCandidateCertifications(
  candidateId: string,
  certifications: CandidateCertificationSeed[],
) {
  for (const certification of certifications) {
    await prisma.candidateCertification.upsert({
      where: { id: certification.id },
      update: {
        candidate_id: candidateId,
        name: certification.name,
        organization: certification.organization ?? null,
        issue_date: certification.issue_date ?? null,
      },
      create: {
        id: certification.id,
        candidate_id: candidateId,
        name: certification.name,
        organization: certification.organization ?? null,
        issue_date: certification.issue_date ?? null,
      },
    });
  }
}

async function upsertWorkExperiences(
  candidateId: string,
  experiences: WorkExperienceSeed[],
) {
  for (const experience of experiences) {
    await prisma.workExperience.upsert({
      where: { id: experience.id },
      update: {
        candidate_id: candidateId,
        company_name: experience.company_name,
        company_logo_url: experience.company_logo_url ?? null,
        position: experience.position,
        descriptions: experience.descriptions,
        start_date: experience.start_date,
        end_date: experience.end_date ?? null,
        location: experience.location,
        job_type: experience.job_type,
      },
      create: {
        id: experience.id,
        candidate_id: candidateId,
        company_name: experience.company_name,
        company_logo_url: experience.company_logo_url ?? null,
        position: experience.position,
        descriptions: experience.descriptions,
        start_date: experience.start_date,
        end_date: experience.end_date ?? null,
        location: experience.location,
        job_type: experience.job_type,
      },
    });
  }
}

async function replaceUserDevices(userId: string, devices: UserDeviceSeed[]) {
  await prisma.userDevice.deleteMany({
    where: { user_id: userId },
  });

  if (devices.length > 0) {
    await prisma.userDevice.createMany({
      data: devices.map((device) => ({
        user_id: userId,
        device_name: device.device_name ?? null,
        device_type: device.device_type,
        ip_address: device.ip_address ?? null,
      })),
    });
  }
}

async function main() {
  console.log('Seeding database...');

  /* =======================================================
      COMPANY SNAPSHOT
  ======================================================= */

  const companyId = '11111111-1111-1111-1111-111111111111';
  const branchId = '22222222-2222-2222-2222-222222222222';
  const adminUserId = '33333333-3333-3333-3333-333333333333';
  const candidateUserId = '44444444-4444-4444-4444-444444444444';
  const candidateId = '55555555-5555-5555-5555-555555555555';
  const recruiterUserId = '66666666-6666-6666-6666-666666666666';
  const recruiterId = '77777777-7777-7777-7777-777777777777';
  const extraCandidateUserId = '88888888-8888-8888-8888-888888888888';
  const extraCandidateId = '99999999-9999-9999-9999-999999999999';
  const extraRecruiterUserId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const extraRecruiterId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const extraCompanyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  const extraBranchId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  const qaCandidateUserId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  const qaCandidateId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
  const opsAdminUserId = 'abababab-1111-2222-3333-444444444444';
  const dataCandidateUserId = '12121212-3434-5656-7878-909090909090';
  const dataCandidateId = '21212121-3434-5656-7878-909090909090';
  const mobileCandidateUserId = '31313131-4242-5353-6464-757575757575';
  const mobileCandidateId = '41414141-5252-6363-7474-858585858585';
  const designerCandidateUserId = '51515151-6262-7373-8484-959595959595';
  const designerCandidateId = '61616161-7272-8383-9494-a5a5a5a5a5a5';
  const cloudRecruiterUserId = '72727272-8181-9191-a2a2-b3b3b3b3b3b3';
  const cloudRecruiterId = '82828282-9191-a1a1-b2b2-c3c3c3c3c3c3';
  const productRecruiterUserId = '93939393-a4a4-b5b5-c6c6-d7d7d7d7d7d7';
  const productRecruiterId = 'a4a4a4a4-b5b5-c6c6-d7d7-e8e8e8e8e8e8';
  const horizonRecruiterUserId = 'b1b1b1b1-c2c2-d3d3-e4e4-f5f5f5f5f5f5';
  const horizonRecruiterId = 'b2b2b2b2-c3c3-d4d4-e5e5-f6f6f6f6f6f6';
  const greenRecruiterUserId = 'c1c1c1c1-d2d2-e3e3-f4f4-a5a5a5a5a5a5';
  const greenRecruiterId = 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6';

  const company = await prisma.companySnapshot.upsert({
    where: { id: companyId },
    update: {
      name: 'Tech Corp Vietnam',
      logo_url:
        'https://ui-avatars.com/api/?name=Tech+Corp+Vietnam&background=0f766e&color=ffffff&size=256',
      location: 'Ho Chi Minh City, Vietnam',
      updated_at: new Date(),
    },
    create: {
      id: companyId,
      name: 'Tech Corp Vietnam',
      logo_url:
        'https://ui-avatars.com/api/?name=Tech+Corp+Vietnam&background=0f766e&color=ffffff&size=256',
      location: 'Ho Chi Minh City, Vietnam',
      updated_at: new Date(),
    },
  });

  console.log('Company seeded');

  const extraCompany = await prisma.companySnapshot.upsert({
    where: { id: extraCompanyId },
    update: {
      name: 'NovaHR Solutions',
      logo_url:
        'https://ui-avatars.com/api/?name=NovaHR+Solutions&background=1d4ed8&color=ffffff&size=256',
      location: 'Da Nang, Vietnam',
      updated_at: new Date(),
    },
    create: {
      id: extraCompanyId,
      name: 'NovaHR Solutions',
      logo_url:
        'https://ui-avatars.com/api/?name=NovaHR+Solutions&background=1d4ed8&color=ffffff&size=256',
      location: 'Da Nang, Vietnam',
      updated_at: new Date(),
    },
  });

  console.log('Extra company seeded');

  /* =======================================================
      COMPANY BRANCH
  ======================================================= */

  const branch = await prisma.companyBranchSnapshot.upsert({
    where: { id: branchId },
    update: {
      name: 'Tech Corp Vietnam HQ',
      address: '81 Nguyen Hue, Ben Nghe Ward, District 1',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
      updated_at: new Date(),
    },
    create: {
      id: branchId,
      company_id: company.id,
      name: 'Tech Corp Vietnam HQ',
      address: '81 Nguyen Hue, Ben Nghe Ward, District 1',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
      updated_at: new Date(),
    },
  });

  console.log('Branch seeded');

  const extraBranch = await prisma.companyBranchSnapshot.upsert({
    where: { id: extraBranchId },
    update: {
      name: 'NovaHR Da Nang Hub',
      address: '108 Vo Nguyen Giap, Son Tra District',
      city: 'Da Nang',
      country: 'Vietnam',
      updated_at: new Date(),
    },
    create: {
      id: extraBranchId,
      company_id: extraCompany.id,
      name: 'NovaHR Da Nang Hub',
      address: '108 Vo Nguyen Giap, Son Tra District',
      city: 'Da Nang',
      country: 'Vietnam',
      updated_at: new Date(),
    },
  });

  console.log('Extra branch seeded');

  const additionalCompanySnapshots = [
    {
      id: '12121212-1212-1212-1212-121212121212',
      name: 'CloudVerse Labs',
      logo_url:
        'https://ui-avatars.com/api/?name=CloudVerse+Labs&background=7c3aed&color=ffffff&size=256',
      location: 'Hanoi, Vietnam',
    },
    {
      id: '34343434-3434-3434-3434-343434343434',
      name: 'ProductForge Asia',
      logo_url:
        'https://ui-avatars.com/api/?name=ProductForge+Asia&background=ea580c&color=ffffff&size=256',
      location: 'Thu Duc City, Ho Chi Minh City',
    },
    {
      id: '45454545-4545-4545-4545-454545454545',
      name: 'Horizon Commerce',
      logo_url:
        'https://ui-avatars.com/api/?name=Horizon+Commerce&background=0284c7&color=ffffff&size=256',
      location: 'Can Tho, Vietnam',
    },
    {
      id: '67676767-6767-6767-6767-676767676767',
      name: 'ByteBridge Health',
      logo_url:
        'https://ui-avatars.com/api/?name=ByteBridge+Health&background=16a34a&color=ffffff&size=256',
      location: 'Hue, Vietnam',
    },
    {
      id: '89898989-8989-8989-8989-898989898989',
      name: 'GreenNode Systems',
      logo_url:
        'https://ui-avatars.com/api/?name=GreenNode+Systems&background=65a30d&color=ffffff&size=256',
      location: 'Hai Phong, Vietnam',
    },
    {
      id: '90909090-9090-9090-9090-909090909090',
      name: 'FinStack Digital',
      logo_url:
        'https://ui-avatars.com/api/?name=FinStack+Digital&background=7c2d12&color=ffffff&size=256',
      location: 'Nha Trang, Vietnam',
    },
  ];

  for (const companySnapshot of additionalCompanySnapshots) {
    await prisma.companySnapshot.upsert({
      where: { id: companySnapshot.id },
      update: {
        name: companySnapshot.name,
        logo_url: companySnapshot.logo_url,
        location: companySnapshot.location,
        updated_at: new Date(),
      },
      create: {
        id: companySnapshot.id,
        name: companySnapshot.name,
        logo_url: companySnapshot.logo_url,
        location: companySnapshot.location,
        updated_at: new Date(),
      },
    });
  }

  const additionalBranchSnapshots = [
    {
      id: '56565656-5656-5656-5656-565656565656',
      company_id: '12121212-1212-1212-1212-121212121212',
      name: 'CloudVerse Hanoi Engineering Hub',
      address: '17 Duy Tan, Cau Giay District',
      city: 'Hanoi',
      country: 'Vietnam',
    },
    {
      id: '78787878-7878-7878-7878-787878787878',
      company_id: '34343434-3434-3434-3434-343434343434',
      name: 'ProductForge Thu Duc Studio',
      address: '12 Street 6, Thao Dien Ward',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
    },
    {
      id: '80808080-8080-8080-8080-808080808080',
      company_id: '45454545-4545-4545-4545-454545454545',
      name: 'Horizon Commerce Mekong Center',
      address: '28 Hoa Binh Avenue, Ninh Kieu District',
      city: 'Can Tho',
      country: 'Vietnam',
    },
    {
      id: '82828282-8282-8282-8282-828282828282',
      company_id: '67676767-6767-6767-6767-676767676767',
      name: 'ByteBridge Health Hue Lab',
      address: '32 Hung Vuong, Phu Nhuan Ward',
      city: 'Hue',
      country: 'Vietnam',
    },
    {
      id: '84848484-8484-8484-8484-848484848484',
      company_id: '89898989-8989-8989-8989-898989898989',
      name: 'GreenNode Hai Phong Core Platform',
      address: '16 Lach Tray, Ngo Quyen District',
      city: 'Hai Phong',
      country: 'Vietnam',
    },
    {
      id: '85858585-8585-8585-8585-858585858585',
      company_id: '90909090-9090-9090-9090-909090909090',
      name: 'FinStack Nha Trang Delivery Team',
      address: '101 Tran Phu, Loc Tho Ward',
      city: 'Nha Trang',
      country: 'Vietnam',
    },
  ];

  for (const branchSnapshot of additionalBranchSnapshots) {
    await prisma.companyBranchSnapshot.upsert({
      where: { id: branchSnapshot.id },
      update: {
        company_id: branchSnapshot.company_id,
        name: branchSnapshot.name,
        address: branchSnapshot.address,
        city: branchSnapshot.city,
        country: branchSnapshot.country,
        updated_at: new Date(),
      },
      create: {
        id: branchSnapshot.id,
        company_id: branchSnapshot.company_id,
        name: branchSnapshot.name,
        address: branchSnapshot.address,
        city: branchSnapshot.city,
        country: branchSnapshot.country,
        updated_at: new Date(),
      },
    });
  }

  /* =======================================================
      ADMIN
  ======================================================= */

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: hashPassword('admin123'),
    },
    create: {
      id: adminUserId,
      email: 'admin@example.com',
      password: hashPassword('admin123'),
      role: 'admin',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: admin.id },
    update: {
      full_name: 'System Admin',
      avatar_url: 'https://i.pravatar.cc/200?img=12',
      phone_number: '0900000001',
      bio: 'Quan tri he thong demo, phu trach duyet bai dang va kiem soat du lieu nen.',
    },
    create: {
      user_id: admin.id,
      full_name: 'System Admin',
      avatar_url: 'https://i.pravatar.cc/200?img=12',
      phone_number: '0900000001',
      bio: 'Quan tri he thong demo, phu trach duyet bai dang va kiem soat du lieu nen.',
    },
  });

  await replaceUserDevices(admin.id, [
    {
      device_name: 'Admin MacBook Pro',
      device_type: 'web',
      ip_address: '10.10.0.11',
    },
    {
      device_name: 'Admin iPhone',
      device_type: 'mobile',
      ip_address: '10.10.0.12',
    },
  ]);

  console.log('Admin seeded');

  const opsAdmin = await prisma.user.upsert({
    where: { email: 'opsadmin@example.com' },
    update: {
      password: hashPassword('admin123'),
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: opsAdminUserId,
      email: 'opsadmin@example.com',
      password: hashPassword('admin123'),
      role: 'admin',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: opsAdmin.id },
    update: {
      full_name: 'Operations Admin',
      avatar_url: 'https://i.pravatar.cc/200?img=22',
      phone_number: '0900000010',
      bio: 'Phu trach van hanh demo, observability, seed data va quy trinh release tren VPS.',
    },
    create: {
      user_id: opsAdmin.id,
      full_name: 'Operations Admin',
      avatar_url: 'https://i.pravatar.cc/200?img=22',
      phone_number: '0900000010',
      bio: 'Phu trach van hanh demo, observability, seed data va quy trinh release tren VPS.',
    },
  });

  await replaceUserDevices(opsAdmin.id, [
    {
      device_name: 'Ops Admin ThinkPad',
      device_type: 'web',
      ip_address: '10.10.0.21',
    },
  ]);

  /* =======================================================
      CANDIDATE
  ======================================================= */

  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {
      password: hashPassword('candidate123'),
    },
    create: {
      id: candidateUserId,
      email: 'candidate@example.com',
      password: hashPassword('candidate123'),
      role: 'candidate',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: candidateUser.id },
    update: {
      full_name: 'Ngoc Anh Nguyen',
      avatar_url: 'https://i.pravatar.cc/200?img=32',
      phone_number: '0900000002',
      bio: 'Backend developer 3 nam kinh nghiem voi NestJS, PostgreSQL va kien truc microservices. Dang tim co hoi product hoac platform team tai Viet Nam.',
    },
    create: {
      user_id: candidateUser.id,
      full_name: 'Ngoc Anh Nguyen',
      avatar_url: 'https://i.pravatar.cc/200?img=32',
      phone_number: '0900000002',
      bio: 'Backend developer 3 nam kinh nghiem voi NestJS, PostgreSQL va kien truc microservices. Dang tim co hoi product hoac platform team tai Viet Nam.',
    },
  });

  const candidate = await prisma.candidate.upsert({
    where: { user_id: candidateUser.id },
    update: {
      headline: 'Backend Developer | NestJS | Golang',
      summary: [
        'Xay dung API va he thong microservices voi NestJS, PostgreSQL va Kafka.',
        'Tung trien khai dashboard van hanh, auth flow va worker xu ly nen cho san pham B2B.',
        'Uu tien codebase ro rang, monitoring day du va quy trinh release on dinh.',
        'Co the lam viec hybrid tai Ho Chi Minh City hoac remote trong nuoc.',
      ],
      level: 'mid',
      resume_urls: [
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        'https://www.orimi.com/pdf-test.pdf',
      ],
    },
    create: {
      id: candidateId,
      user_id: candidateUser.id,
      headline: 'Backend Developer | NestJS | Golang',
      summary: [
        'Xay dung API va he thong microservices voi NestJS, PostgreSQL va Kafka.',
        'Tung trien khai dashboard van hanh, auth flow va worker xu ly nen cho san pham B2B.',
        'Uu tien codebase ro rang, monitoring day du va quy trinh release on dinh.',
        'Co the lam viec hybrid tai Ho Chi Minh City hoac remote trong nuoc.',
      ],
      level: 'mid',
      resume_urls: [
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        'https://www.orimi.com/pdf-test.pdf',
      ],
    },
  });

  await replaceCandidateSkills(candidate.id, [
    {
      skill_name: 'NestJS',
      level: 'junior',
    },
    {
      skill_name: 'PostgreSQL',
      level: 'mid',
    },
    {
      skill_name: 'Kafka',
      level: 'mid',
    },
    {
      skill_name: 'Docker',
      level: 'mid',
    },
    {
      skill_name: 'Redis',
      level: 'mid',
    },
    {
      skill_name: 'Golang',
      level: 'junior',
    },
    {
      skill_name: 'OpenTelemetry',
      level: 'junior',
    },
  ]);

  await prisma.workExperience.upsert({
    where: { id: '10101010-1010-1010-1010-101010101010' },
    update: {
      candidate_id: candidate.id,
      company_name: 'Fintech Gateway',
      company_logo_url:
        'https://ui-avatars.com/api/?name=Fintech+Gateway&background=0f172a&color=ffffff&size=256',
      position: 'Backend Developer',
      descriptions: [
        'Phat trien cac API thanh toan va doi soat su dung NestJS va PostgreSQL.',
        'Thiet ke queue xu ly bat dong bo cho email, webhook va dong bo du lieu.',
        'Phoi hop voi frontend va QA de rut ngan thoi gian release hang tuan.',
      ],
      start_date: new Date('2023-06-01T00:00:00.000Z'),
      end_date: null,
      location: 'Ho Chi Minh City',
      job_type: 'full_time',
    },
    create: {
      id: '10101010-1010-1010-1010-101010101010',
      candidate_id: candidate.id,
      company_name: 'Fintech Gateway',
      company_logo_url:
        'https://ui-avatars.com/api/?name=Fintech+Gateway&background=0f172a&color=ffffff&size=256',
      position: 'Backend Developer',
      descriptions: [
        'Phat trien cac API thanh toan va doi soat su dung NestJS va PostgreSQL.',
        'Thiet ke queue xu ly bat dong bo cho email, webhook va dong bo du lieu.',
        'Phoi hop voi frontend va QA de rut ngan thoi gian release hang tuan.',
      ],
      start_date: new Date('2023-06-01T00:00:00.000Z'),
      end_date: null,
      location: 'Ho Chi Minh City',
      job_type: 'full_time',
    },
  });

  await upsertCandidateEducations(candidate.id, [
    {
      id: '30303030-3030-3030-3030-303030303030',
      school_name: 'Ho Chi Minh City University of Technology',
      degree: 'Bachelor of Engineering',
      field: 'Computer Science',
      start_date: new Date('2018-09-01T00:00:00.000Z'),
      end_date: new Date('2022-06-01T00:00:00.000Z'),
    },
  ]);

  await upsertCandidateCertifications(candidate.id, [
    {
      id: '40404040-4040-4040-4040-404040404040',
      name: 'AWS Certified Cloud Practitioner',
      organization: 'Amazon Web Services',
      issue_date: new Date('2024-02-10T00:00:00.000Z'),
    },
    {
      id: '50505050-5050-5050-5050-505050505050',
      name: 'Kafka for Developers',
      organization: 'Confluent',
      issue_date: new Date('2024-09-14T00:00:00.000Z'),
    },
  ]);

  await replaceUserDevices(candidateUser.id, [
    {
      device_name: 'Candidate Work Laptop',
      device_type: 'web',
      ip_address: '10.20.0.11',
    },
    {
      device_name: 'Candidate Android',
      device_type: 'mobile',
      ip_address: '10.20.0.12',
    },
  ]);

  await prisma.workExperience.upsert({
    where: { id: '20202020-2020-2020-2020-202020202020' },
    update: {
      candidate_id: candidate.id,
      company_name: 'SaaS Metrics',
      company_logo_url:
        'https://ui-avatars.com/api/?name=SaaS+Metrics&background=be123c&color=ffffff&size=256',
      position: 'Software Engineer Intern',
      descriptions: [
        'Ho tro xay dung dashboard noi bo va toi uu query cho bao cao doanh thu.',
        'Viet automation test cho module auth va notification.',
      ],
      start_date: new Date('2022-01-01T00:00:00.000Z'),
      end_date: new Date('2023-04-30T00:00:00.000Z'),
      location: 'Ho Chi Minh City',
      job_type: 'full_time',
    },
    create: {
      id: '20202020-2020-2020-2020-202020202020',
      candidate_id: candidate.id,
      company_name: 'SaaS Metrics',
      company_logo_url:
        'https://ui-avatars.com/api/?name=SaaS+Metrics&background=be123c&color=ffffff&size=256',
      position: 'Software Engineer Intern',
      descriptions: [
        'Ho tro xay dung dashboard noi bo va toi uu query cho bao cao doanh thu.',
        'Viet automation test cho module auth va notification.',
      ],
      start_date: new Date('2022-01-01T00:00:00.000Z'),
      end_date: new Date('2023-04-30T00:00:00.000Z'),
      location: 'Ho Chi Minh City',
      job_type: 'full_time',
    },
  });

  console.log('Candidate seeded');

  const extraCandidateUser = await prisma.user.upsert({
    where: { email: 'frontend@example.com' },
    update: {
      password: hashPassword('candidate123'),
    },
    create: {
      id: extraCandidateUserId,
      email: 'frontend@example.com',
      password: hashPassword('candidate123'),
      role: 'candidate',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: extraCandidateUser.id },
    update: {
      full_name: 'Minh Chau Tran',
      avatar_url: 'https://i.pravatar.cc/200?img=47',
      phone_number: '0900000004',
      bio: 'Frontend developer theo duoi React, TypeScript va dashboard UX cho san pham B2B.',
    },
    create: {
      user_id: extraCandidateUser.id,
      full_name: 'Minh Chau Tran',
      avatar_url: 'https://i.pravatar.cc/200?img=47',
      phone_number: '0900000004',
      bio: 'Frontend developer theo duoi React, TypeScript va dashboard UX cho san pham B2B.',
    },
  });

  const extraCandidate = await prisma.candidate.upsert({
    where: { user_id: extraCandidateUser.id },
    update: {
      headline: 'Frontend Developer',
      summary: [
        'Tap trung xay dung giao dien quan tri, table, chart va dashboard phuc vu demo san pham.',
        'Su dung React, Next.js, TypeScript va Tailwind CSS.',
      ],
      level: 'fresher',
      resume_urls: [
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ],
    },
    create: {
      id: extraCandidateId,
      user_id: extraCandidateUser.id,
      headline: 'Frontend Developer',
      summary: [
        'Tap trung xay dung giao dien quan tri, table, chart va dashboard phuc vu demo san pham.',
        'Su dung React, Next.js, TypeScript va Tailwind CSS.',
      ],
      level: 'fresher',
      resume_urls: [
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ],
    },
  });

  await replaceCandidateSkills(extraCandidate.id, [
    { skill_name: 'React', level: 'mid' },
    { skill_name: 'Next.js', level: 'junior' },
    { skill_name: 'TypeScript', level: 'mid' },
    { skill_name: 'Tailwind CSS', level: 'mid' },
    { skill_name: 'Figma Handoff', level: 'junior' },
  ]);

  await upsertCandidateEducations(extraCandidate.id, [
    {
      id: '60606060-6060-6060-6060-606060606060',
      school_name: 'University of Economics Ho Chi Minh City',
      degree: 'Bachelor',
      field: 'Information Systems',
      start_date: new Date('2019-09-01T00:00:00.000Z'),
      end_date: new Date('2023-06-01T00:00:00.000Z'),
    },
  ]);

  await upsertCandidateCertifications(extraCandidate.id, [
    {
      id: '61616161-6161-6161-6161-616161616161',
      name: 'Meta Front-End Developer',
      organization: 'Coursera',
      issue_date: new Date('2024-03-04T00:00:00.000Z'),
    },
  ]);

  await replaceUserDevices(extraCandidateUser.id, [
    {
      device_name: 'Frontend MacBook Air',
      device_type: 'web',
      ip_address: '10.20.0.21',
    },
  ]);

  const qaCandidateUser = await prisma.user.upsert({
    where: { email: 'qa@example.com' },
    update: {
      password: hashPassword('candidate123'),
    },
    create: {
      id: qaCandidateUserId,
      email: 'qa@example.com',
      password: hashPassword('candidate123'),
      role: 'candidate',
      status: 'inactive',
      is_email_verified: false,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: qaCandidateUser.id },
    update: {
      full_name: 'Bao An Le',
      avatar_url: 'https://i.pravatar.cc/200?img=15',
      phone_number: '0900000005',
      bio: 'QA engineer chuyen test API, regression va release checklist.',
    },
    create: {
      user_id: qaCandidateUser.id,
      full_name: 'Bao An Le',
      avatar_url: 'https://i.pravatar.cc/200?img=15',
      phone_number: '0900000005',
      bio: 'QA engineer chuyen test API, regression va release checklist.',
    },
  });

  const qaCandidate = await prisma.candidate.upsert({
    where: { user_id: qaCandidateUser.id },
    update: {
      headline: 'QA Engineer',
      summary: [
        'Kinh nghiem test thu cong va viet testcase cho web app va API.',
        'Da tham gia release cho nhieu sprint voi quy trinh bug triage ro rang.',
      ],
      level: 'junior',
      resume_urls: [],
    },
    create: {
      id: qaCandidateId,
      user_id: qaCandidateUser.id,
      headline: 'QA Engineer',
      summary: [
        'Kinh nghiem test thu cong va viet testcase cho web app va API.',
        'Da tham gia release cho nhieu sprint voi quy trinh bug triage ro rang.',
      ],
      level: 'junior',
      resume_urls: [],
    },
  });

  await replaceCandidateSkills(qaCandidate.id, [
    { skill_name: 'Manual Testing', level: 'mid' },
    { skill_name: 'Postman', level: 'junior' },
    { skill_name: 'TestRail', level: 'junior' },
    { skill_name: 'Regression Testing', level: 'mid' },
  ]);

  await upsertCandidateEducations(qaCandidate.id, [
    {
      id: '62626262-6262-6262-6262-626262626262',
      school_name: 'Ton Duc Thang University',
      degree: 'Bachelor',
      field: 'Software Engineering',
      start_date: new Date('2018-09-01T00:00:00.000Z'),
      end_date: new Date('2022-07-01T00:00:00.000Z'),
    },
  ]);

  await upsertCandidateCertifications(qaCandidate.id, [
    {
      id: '63636363-6363-6363-6363-636363636363',
      name: 'ISTQB Foundation Level',
      organization: 'ISTQB',
      issue_date: new Date('2024-05-20T00:00:00.000Z'),
    },
  ]);

  await replaceUserDevices(qaCandidateUser.id, [
    {
      device_name: 'QA Windows Laptop',
      device_type: 'web',
      ip_address: '10.20.0.31',
    },
  ]);

  const dataCandidateUser = await prisma.user.upsert({
    where: { email: 'data@example.com' },
    update: {
      password: hashPassword('candidate123'),
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: dataCandidateUserId,
      email: 'data@example.com',
      password: hashPassword('candidate123'),
      role: 'candidate',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: dataCandidateUser.id },
    update: {
      full_name: 'Tran Minh Data',
      avatar_url: 'https://i.pravatar.cc/200?img=40',
      phone_number: '0900000011',
      bio: 'Data engineer tap trung pipeline, dashboard so lieu va quality cho analytics products.',
    },
    create: {
      user_id: dataCandidateUser.id,
      full_name: 'Tran Minh Data',
      avatar_url: 'https://i.pravatar.cc/200?img=40',
      phone_number: '0900000011',
      bio: 'Data engineer tap trung pipeline, dashboard so lieu va quality cho analytics products.',
    },
  });

  const dataCandidate = await prisma.candidate.upsert({
    where: { user_id: dataCandidateUser.id },
    update: {
      headline: 'Data Engineer | Airflow | dbt',
      summary: [
        'Xay dung ETL, warehouse va dashboard cho san pham B2B.',
        'Quan tam data quality, lineage, orchestration va chi so san pham.',
      ],
      level: 'senior',
      resume_urls: ['https://www.orimi.com/pdf-test.pdf'],
    },
    create: {
      id: dataCandidateId,
      user_id: dataCandidateUser.id,
      headline: 'Data Engineer | Airflow | dbt',
      summary: [
        'Xay dung ETL, warehouse va dashboard cho san pham B2B.',
        'Quan tam data quality, lineage, orchestration va chi so san pham.',
      ],
      level: 'senior',
      resume_urls: ['https://www.orimi.com/pdf-test.pdf'],
    },
  });

  await replaceCandidateSkills(dataCandidate.id, [
    { skill_name: 'SQL', level: 'senior' },
    { skill_name: 'Airflow', level: 'mid' },
    { skill_name: 'dbt', level: 'mid' },
    { skill_name: 'BigQuery', level: 'junior' },
    { skill_name: 'Python', level: 'mid' },
  ]);

  await upsertCandidateEducations(dataCandidate.id, [
    {
      id: '64646464-6464-6464-6464-646464646464',
      school_name: 'University of Science Ho Chi Minh City',
      degree: 'Bachelor',
      field: 'Data Science',
      start_date: new Date('2017-09-01T00:00:00.000Z'),
      end_date: new Date('2021-06-01T00:00:00.000Z'),
    },
  ]);

  await upsertCandidateCertifications(dataCandidate.id, [
    {
      id: '65656565-6565-6565-6565-656565656565',
      name: 'Google Data Analytics',
      organization: 'Google',
      issue_date: new Date('2023-11-08T00:00:00.000Z'),
    },
  ]);

  await upsertWorkExperiences(dataCandidate.id, [
    {
      id: '66666666-6666-6666-1111-111111111111',
      company_name: 'Insight Works',
      company_logo_url:
        'https://ui-avatars.com/api/?name=Insight+Works&background=1e3a8a&color=ffffff&size=256',
      position: 'Data Engineer',
      descriptions: [
        'Xay dung pipeline ETL va dashboard van hanh cho team business.',
        'Phoi hop voi backend de dinh nghia event schema va job funnel analytics.',
      ],
      start_date: new Date('2021-07-01T00:00:00.000Z'),
      end_date: null,
      location: 'Ho Chi Minh City',
      job_type: 'full_time',
    },
  ]);

  await replaceUserDevices(dataCandidateUser.id, [
    {
      device_name: 'Data Candidate Dell XPS',
      device_type: 'web',
      ip_address: '10.20.0.41',
    },
  ]);

  const mobileCandidateUser = await prisma.user.upsert({
    where: { email: 'mobile@example.com' },
    update: {
      password: hashPassword('candidate123'),
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: mobileCandidateUserId,
      email: 'mobile@example.com',
      password: hashPassword('candidate123'),
      role: 'candidate',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: mobileCandidateUser.id },
    update: {
      full_name: 'Hoang Linh Mobile',
      avatar_url: 'https://i.pravatar.cc/200?img=52',
      phone_number: '0900000012',
      bio: 'Mobile developer chuyen Flutter, Firebase va tracking cho ung dung viec lam.',
    },
    create: {
      user_id: mobileCandidateUser.id,
      full_name: 'Hoang Linh Mobile',
      avatar_url: 'https://i.pravatar.cc/200?img=52',
      phone_number: '0900000012',
      bio: 'Mobile developer chuyen Flutter, Firebase va tracking cho ung dung viec lam.',
    },
  });

  const mobileCandidate = await prisma.candidate.upsert({
    where: { user_id: mobileCandidateUser.id },
    update: {
      headline: 'Flutter Developer | Mobile Product',
      summary: [
        'Tap trung xay dung candidate app, push notification va profile flow tren mobile.',
        'Quan tam UX, analytics event va release chuan cho App Store/Google Play.',
      ],
      level: 'junior',
      resume_urls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    },
    create: {
      id: mobileCandidateId,
      user_id: mobileCandidateUser.id,
      headline: 'Flutter Developer | Mobile Product',
      summary: [
        'Tap trung xay dung candidate app, push notification va profile flow tren mobile.',
        'Quan tam UX, analytics event va release chuan cho App Store/Google Play.',
      ],
      level: 'junior',
      resume_urls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    },
  });

  await replaceCandidateSkills(mobileCandidate.id, [
    { skill_name: 'Flutter', level: 'mid' },
    { skill_name: 'Dart', level: 'mid' },
    { skill_name: 'Firebase', level: 'junior' },
    { skill_name: 'REST API', level: 'junior' },
    { skill_name: 'CI/CD Mobile', level: 'junior' },
  ]);

  await upsertCandidateEducations(mobileCandidate.id, [
    {
      id: '67676767-1111-2222-3333-444444444444',
      school_name: 'FPT University',
      degree: 'Bachelor',
      field: 'Software Engineering',
      start_date: new Date('2019-09-01T00:00:00.000Z'),
      end_date: new Date('2023-08-01T00:00:00.000Z'),
    },
  ]);

  await upsertWorkExperiences(mobileCandidate.id, [
    {
      id: '68686868-1111-2222-3333-444444444444',
      company_name: 'AppFlow Studio',
      company_logo_url:
        'https://ui-avatars.com/api/?name=AppFlow+Studio&background=be185d&color=ffffff&size=256',
      position: 'Mobile Developer',
      descriptions: [
        'Phat trien app ung vien, onboarding flow va push notification.',
        'Phoi hop voi backend team de toi uu API cho mang di dong.',
      ],
      start_date: new Date('2023-09-01T00:00:00.000Z'),
      end_date: null,
      location: 'Da Nang',
      job_type: 'full_time',
    },
  ]);

  await replaceUserDevices(mobileCandidateUser.id, [
    {
      device_name: 'Pixel 8 Demo Device',
      device_type: 'mobile',
      ip_address: '10.20.0.51',
    },
  ]);

  const designerCandidateUser = await prisma.user.upsert({
    where: { email: 'designer@example.com' },
    update: {
      password: hashPassword('candidate123'),
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: designerCandidateUserId,
      email: 'designer@example.com',
      password: hashPassword('candidate123'),
      role: 'candidate',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: designerCandidateUser.id },
    update: {
      full_name: 'Khanh Linh Designer',
      avatar_url: 'https://i.pravatar.cc/200?img=29',
      phone_number: '0900000013',
      bio: 'Product designer theo duoi dashboard, onboarding flow va design system cho san pham B2B.',
    },
    create: {
      user_id: designerCandidateUser.id,
      full_name: 'Khanh Linh Designer',
      avatar_url: 'https://i.pravatar.cc/200?img=29',
      phone_number: '0900000013',
      bio: 'Product designer theo duoi dashboard, onboarding flow va design system cho san pham B2B.',
    },
  });

  const designerCandidate = await prisma.candidate.upsert({
    where: { user_id: designerCandidateUser.id },
    update: {
      headline: 'Product Designer | UX for B2B',
      summary: [
        'Thiet ke dashboard, settings va workflow nghiep vu cho recruiter va admin.',
        'Co kinh nghiem xay dung component library, research va prototype nhanh.',
      ],
      level: 'mid',
      resume_urls: ['https://www.orimi.com/pdf-test.pdf'],
    },
    create: {
      id: designerCandidateId,
      user_id: designerCandidateUser.id,
      headline: 'Product Designer | UX for B2B',
      summary: [
        'Thiet ke dashboard, settings va workflow nghiep vu cho recruiter va admin.',
        'Co kinh nghiem xay dung component library, research va prototype nhanh.',
      ],
      level: 'mid',
      resume_urls: ['https://www.orimi.com/pdf-test.pdf'],
    },
  });

  await replaceCandidateSkills(designerCandidate.id, [
    { skill_name: 'Figma', level: 'senior' },
    { skill_name: 'Design System', level: 'mid' },
    { skill_name: 'UX Research', level: 'mid' },
    { skill_name: 'Prototyping', level: 'mid' },
    { skill_name: 'Dashboard UX', level: 'mid' },
  ]);

  await upsertCandidateEducations(designerCandidate.id, [
    {
      id: '69696969-1111-2222-3333-444444444444',
      school_name: 'Van Lang University',
      degree: 'Bachelor',
      field: 'Multimedia Design',
      start_date: new Date('2017-09-01T00:00:00.000Z'),
      end_date: new Date('2021-05-01T00:00:00.000Z'),
    },
  ]);

  await upsertCandidateCertifications(designerCandidate.id, [
    {
      id: '70707070-1111-2222-3333-444444444444',
      name: 'Google UX Design Certificate',
      organization: 'Google',
      issue_date: new Date('2023-08-12T00:00:00.000Z'),
    },
  ]);

  await upsertWorkExperiences(designerCandidate.id, [
    {
      id: '71717171-1111-2222-3333-444444444444',
      company_name: 'Pixel Narrative',
      company_logo_url:
        'https://ui-avatars.com/api/?name=Pixel+Narrative&background=7c3aed&color=ffffff&size=256',
      position: 'Product Designer',
      descriptions: [
        'Thiet ke dashboard va quy trinh quan tri cho san pham SaaS.',
        'Phoi hop voi frontend de chot component va handoff cho release.',
      ],
      start_date: new Date('2021-06-01T00:00:00.000Z'),
      end_date: null,
      location: 'Ho Chi Minh City',
      job_type: 'full_time',
    },
  ]);

  await replaceUserDevices(designerCandidateUser.id, [
    {
      device_name: 'Designer iPad',
      device_type: 'mobile',
      ip_address: '10.20.0.61',
    },
    {
      device_name: 'Designer MacBook',
      device_type: 'web',
      ip_address: '10.20.0.62',
    },
  ]);

  console.log('Additional candidates seeded');

  /* =======================================================
      RECRUITER
  ======================================================= */

  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {
      password: hashPassword('recruiter123'),
    },
    create: {
      id: recruiterUserId,
      email: 'recruiter@example.com',
      password: hashPassword('recruiter123'),
      role: 'recruiter',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: recruiterUser.id },
    update: {
      full_name: 'Linh Tran',
      avatar_url: 'https://i.pravatar.cc/200?img=25',
      phone_number: '0900000003',
      bio: 'Talent acquisition lead phu trach tuyen ky su backend, data va product engineering.',
    },
    create: {
      user_id: recruiterUser.id,
      full_name: 'Linh Tran',
      avatar_url: 'https://i.pravatar.cc/200?img=25',
      phone_number: '0900000003',
      bio: 'Talent acquisition lead phu trach tuyen ky su backend, data va product engineering.',
    },
  });

  await prisma.recruiter.upsert({
    where: { user_id: recruiterUser.id },
    update: {
      department: 'Talent Acquisition',
      company_id: company.id,
      branch_id: branch.id,
      last_active_at: new Date(),
    },
    create: {
      id: recruiterId,
      user_id: recruiterUser.id,
      company_id: company.id,
      branch_id: branch.id,
      department: 'Talent Acquisition',
      last_active_at: new Date(),
    },
  });

  await replaceUserDevices(recruiterUser.id, [
    {
      device_name: 'Recruiter Office Laptop',
      device_type: 'web',
      ip_address: '10.30.0.11',
    },
  ]);

  console.log('Recruiter seeded');

  const extraRecruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter2@example.com' },
    update: {
      password: hashPassword('recruiter123'),
    },
    create: {
      id: extraRecruiterUserId,
      email: 'recruiter2@example.com',
      password: hashPassword('recruiter123'),
      role: 'recruiter',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: extraRecruiterUser.id },
    update: {
      full_name: 'Thao Vo',
      avatar_url: 'https://i.pravatar.cc/200?img=5',
      phone_number: '0900000006',
      bio: 'Recruiter phu trach khoi engineering va customer success cho khu vuc Da Nang.',
    },
    create: {
      user_id: extraRecruiterUser.id,
      full_name: 'Thao Vo',
      avatar_url: 'https://i.pravatar.cc/200?img=5',
      phone_number: '0900000006',
      bio: 'Recruiter phu trach khoi engineering va customer success cho khu vuc Da Nang.',
    },
  });

  await prisma.recruiter.upsert({
    where: { user_id: extraRecruiterUser.id },
    update: {
      department: 'People Operations',
      company_id: extraCompany.id,
      branch_id: extraBranch.id,
      last_active_at: new Date(),
    },
    create: {
      id: extraRecruiterId,
      user_id: extraRecruiterUser.id,
      company_id: extraCompany.id,
      branch_id: extraBranch.id,
      department: 'People Operations',
      last_active_at: new Date(),
    },
  });

  await replaceUserDevices(extraRecruiterUser.id, [
    {
      device_name: 'Recruiter Da Nang Laptop',
      device_type: 'web',
      ip_address: '10.30.0.21',
    },
  ]);

  const cloudRecruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter.cloud@example.com' },
    update: {
      password: hashPassword('recruiter123'),
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: cloudRecruiterUserId,
      email: 'recruiter.cloud@example.com',
      password: hashPassword('recruiter123'),
      role: 'recruiter',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: cloudRecruiterUser.id },
    update: {
      full_name: 'Gia Han Cloud Recruiter',
      avatar_url: 'https://i.pravatar.cc/200?img=18',
      phone_number: '0900000014',
      bio: 'Phu trach nhom platform, cloud, security va reliability hiring.',
    },
    create: {
      user_id: cloudRecruiterUser.id,
      full_name: 'Gia Han Cloud Recruiter',
      avatar_url: 'https://i.pravatar.cc/200?img=18',
      phone_number: '0900000014',
      bio: 'Phu trach nhom platform, cloud, security va reliability hiring.',
    },
  });

  await prisma.recruiter.upsert({
    where: { user_id: cloudRecruiterUser.id },
    update: {
      department: 'Platform Hiring',
      company_id: '12121212-1212-1212-1212-121212121212',
      branch_id: '56565656-5656-5656-5656-565656565656',
      last_active_at: new Date(),
    },
    create: {
      id: cloudRecruiterId,
      user_id: cloudRecruiterUser.id,
      company_id: '12121212-1212-1212-1212-121212121212',
      branch_id: '56565656-5656-5656-5656-565656565656',
      department: 'Platform Hiring',
      last_active_at: new Date(),
    },
  });

  await replaceUserDevices(cloudRecruiterUser.id, [
    {
      device_name: 'Cloud Recruiter Laptop',
      device_type: 'web',
      ip_address: '10.30.0.31',
    },
  ]);

  const productRecruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter.product@example.com' },
    update: {
      password: hashPassword('recruiter123'),
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: productRecruiterUserId,
      email: 'recruiter.product@example.com',
      password: hashPassword('recruiter123'),
      role: 'recruiter',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: productRecruiterUser.id },
    update: {
      full_name: 'Nha Uyen Product Recruiter',
      avatar_url: 'https://i.pravatar.cc/200?img=9',
      phone_number: '0900000015',
      bio: 'Recruiter phu trach product, design va BA cho cac team dashboard va AI initiative.',
    },
    create: {
      user_id: productRecruiterUser.id,
      full_name: 'Nha Uyen Product Recruiter',
      avatar_url: 'https://i.pravatar.cc/200?img=9',
      phone_number: '0900000015',
      bio: 'Recruiter phu trach product, design va BA cho cac team dashboard va AI initiative.',
    },
  });

  await prisma.recruiter.upsert({
    where: { user_id: productRecruiterUser.id },
    update: {
      department: 'Product Hiring',
      company_id: '34343434-3434-3434-3434-343434343434',
      branch_id: '78787878-7878-7878-7878-787878787878',
      last_active_at: new Date(),
    },
    create: {
      id: productRecruiterId,
      user_id: productRecruiterUser.id,
      company_id: '34343434-3434-3434-3434-343434343434',
      branch_id: '78787878-7878-7878-7878-787878787878',
      department: 'Product Hiring',
      last_active_at: new Date(),
    },
  });

  await replaceUserDevices(productRecruiterUser.id, [
    {
      device_name: 'Product Recruiter Laptop',
      device_type: 'web',
      ip_address: '10.30.0.41',
    },
  ]);

  const horizonRecruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter.horizon@example.com' },
    update: {
      password: hashPassword('recruiter123'),
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: horizonRecruiterUserId,
      email: 'recruiter.horizon@example.com',
      password: hashPassword('recruiter123'),
      role: 'recruiter',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: horizonRecruiterUser.id },
    update: {
      full_name: 'Bao Ngoc Horizon Recruiter',
      avatar_url: 'https://i.pravatar.cc/200?img=31',
      phone_number: '0900000016',
      bio: 'Recruiter phu trach khoi commerce, BA va customer success cho khu vuc Can Tho va HCMC.',
    },
    create: {
      user_id: horizonRecruiterUser.id,
      full_name: 'Bao Ngoc Horizon Recruiter',
      avatar_url: 'https://i.pravatar.cc/200?img=31',
      phone_number: '0900000016',
      bio: 'Recruiter phu trach khoi commerce, BA va customer success cho khu vuc Can Tho va HCMC.',
    },
  });

  await prisma.recruiter.upsert({
    where: { user_id: horizonRecruiterUser.id },
    update: {
      department: 'Commerce Hiring',
      company_id: '45454545-4545-4545-4545-454545454545',
      branch_id: '81818181-8181-8181-8181-818181818181',
      last_active_at: new Date(),
    },
    create: {
      id: horizonRecruiterId,
      user_id: horizonRecruiterUser.id,
      company_id: '45454545-4545-4545-4545-454545454545',
      branch_id: '81818181-8181-8181-8181-818181818181',
      department: 'Commerce Hiring',
      last_active_at: new Date(),
    },
  });

  await replaceUserDevices(horizonRecruiterUser.id, [
    {
      device_name: 'Horizon Recruiter Laptop',
      device_type: 'web',
      ip_address: '10.30.0.51',
    },
  ]);

  const greenRecruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter.green@example.com' },
    update: {
      password: hashPassword('recruiter123'),
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: greenRecruiterUserId,
      email: 'recruiter.green@example.com',
      password: hashPassword('recruiter123'),
      role: 'recruiter',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: greenRecruiterUser.id },
    update: {
      full_name: 'Tuan Anh Green Recruiter',
      avatar_url: 'https://i.pravatar.cc/200?img=11',
      phone_number: '0900000017',
      bio: 'Recruiter phu trach cloud, security va ha tang cho khu vuc Hai Phong.',
    },
    create: {
      user_id: greenRecruiterUser.id,
      full_name: 'Tuan Anh Green Recruiter',
      avatar_url: 'https://i.pravatar.cc/200?img=11',
      phone_number: '0900000017',
      bio: 'Recruiter phu trach cloud, security va ha tang cho khu vuc Hai Phong.',
    },
  });

  await prisma.recruiter.upsert({
    where: { user_id: greenRecruiterUser.id },
    update: {
      department: 'Infrastructure Hiring',
      company_id: '89898989-8989-8989-8989-898989898989',
      branch_id: '84848484-8484-8484-8484-848484848484',
      last_active_at: new Date(),
    },
    create: {
      id: greenRecruiterId,
      user_id: greenRecruiterUser.id,
      company_id: '89898989-8989-8989-8989-898989898989',
      branch_id: '84848484-8484-8484-8484-848484848484',
      department: 'Infrastructure Hiring',
      last_active_at: new Date(),
    },
  });

  await replaceUserDevices(greenRecruiterUser.id, [
    {
      device_name: 'GreenNode Recruiter Laptop',
      device_type: 'web',
      ip_address: '10.30.0.61',
    },
  ]);

  console.log('Additional recruiter seeded');

  console.log('Seeding finished');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
