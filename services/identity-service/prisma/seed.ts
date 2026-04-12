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

  const company = await prisma.companySnapshot.upsert({
    where: { id: companyId },
    update: {
      name: 'Tech Corp',
      location: 'Ho Chi Minh City',
      updated_at: new Date(),
    },
    create: {
      id: companyId,
      name: 'Tech Corp',
      logo_url: null,
      location: 'Ho Chi Minh City',
      updated_at: new Date(),
    },
  });

  console.log('Company seeded');

  /* =======================================================
      COMPANY BRANCH
  ======================================================= */

  const branch = await prisma.companyBranchSnapshot.upsert({
    where: { id: branchId },
    update: {
      name: 'Tech Corp HCM Branch',
      address: 'District 1',
      city: 'HCM',
      country: 'Vietnam',
      updated_at: new Date(),
    },
    create: {
      id: branchId,
      company_id: company.id,
      name: 'Tech Corp HCM Branch',
      address: 'District 1',
      city: 'HCM',
      country: 'Vietnam',
      updated_at: new Date(),
    },
  });

  console.log('Branch seeded');

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
      phone_number: '0900000001',
      bio: 'Administrator',
    },
    create: {
      user_id: admin.id,
      full_name: 'System Admin',
      phone_number: '0900000001',
      bio: 'Administrator',
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
      full_name: 'Ngoc Anh Candidate',
      phone_number: '0900000002',
      bio: 'Software Developer',
    },
    create: {
      user_id: candidateUser.id,
      full_name: 'Ngoc Anh Candidate',
      phone_number: '0900000002',
      bio: 'Software Developer',
    },
  });

  const candidate = await prisma.candidate.upsert({
    where: { user_id: candidateUser.id },
    update: {
      headline: 'Backend Developer',
    },
    create: {
      id: candidateId,
      user_id: candidateUser.id,
      headline: 'Backend Developer',
      summary: ['NestJS Developer', 'Microservices enthusiast'],
      level: 'junior',
      resume_urls: [],
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
        level: 'junior',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Candidate seeded');

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
      full_name: 'Jane Recruiter',
      phone_number: '0900000003',
      bio: 'HR Manager',
    },
    create: {
      user_id: recruiterUser.id,
      full_name: 'Jane Recruiter',
      phone_number: '0900000003',
      bio: 'HR Manager',
    },
  });

  await prisma.recruiter.upsert({
    where: { user_id: recruiterUser.id },
    update: {
      department: 'HR',
    },
    create: {
      id: recruiterId,
      user_id: recruiterUser.id,
      company_id: company.id,
      branch_id: branch.id,
      department: 'HR',
      last_active_at: new Date(),
    },
  });

  console.log('Recruiter seeded');

  console.log('Seeding finished');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
