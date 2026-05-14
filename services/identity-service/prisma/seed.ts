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

  console.log('Admin seeded');

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

  await prisma.candidateSkill.createMany({
    data: [
      {
        candidate_id: candidate.id,
        skill_name: 'NestJS',
        level: 'junior',
      },
      {
        candidate_id: candidate.id,
        skill_name: 'PostgreSQL',
        level: 'mid',
      },
      {
        candidate_id: candidate.id,
        skill_name: 'Kafka',
        level: 'mid',
      },
      {
        candidate_id: candidate.id,
        skill_name: 'Docker',
        level: 'mid',
      },
      {
        candidate_id: candidate.id,
        skill_name: 'Redis',
        level: 'mid',
      },
      {
        candidate_id: candidate.id,
        skill_name: 'Golang',
        level: 'junior',
      },
    ],
    skipDuplicates: true,
  });

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

  await prisma.candidate.upsert({
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

  await prisma.candidate.upsert({
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

  console.log('Additional recruiter seeded');

  console.log('Seeding finished');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
