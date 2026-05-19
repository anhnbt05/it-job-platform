import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Branches } from '../../branches/entities/branches.entity';
import { Categories } from '../../categories/entities/categories.entity';
import { Companies } from '../../companies/entities/companies.entity';

config();

const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  entities: [Categories, Companies, Branches],
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
});

const CATEGORIES = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Software Development',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Frontend Development',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Backend Development',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Full Stack Development',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Mobile Development',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name: 'DevOps & Cloud',
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    name: 'Data Engineering',
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    name: 'Data Science & AI/ML',
  },
  {
    id: '10000000-0000-0000-0000-000000000009',
    name: 'Cybersecurity',
  },
  {
    id: '10000000-0000-0000-0000-000000000010',
    name: 'QA & Testing',
  },
  {
    id: '10000000-0000-0000-0000-000000000011',
    name: 'UI/UX Design',
  },
  {
    id: '10000000-0000-0000-0000-000000000012',
    name: 'System & Network Administration',
  },
  {
    id: '10000000-0000-0000-0000-000000000013',
    name: 'Database Administration',
  },
  {
    id: '10000000-0000-0000-0000-000000000014',
    name: 'Embedded & IoT',
  },
  {
    id: '10000000-0000-0000-0000-000000000015',
    name: 'Blockchain',
  },
  {
    id: '10000000-0000-0000-0000-000000000016',
    name: 'Game Development',
  },
  {
    id: '10000000-0000-0000-0000-000000000017',
    name: 'IT Project Management',
  },
  {
    id: '10000000-0000-0000-0000-000000000018',
    name: 'IT Support & Helpdesk',
  },
];

const COMPANIES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Tech Corp Vietnam',
    logo_url:
      'https://ui-avatars.com/api/?name=Tech+Corp+Vietnam&background=0f766e&color=ffffff&size=256',
    location: 'Ho Chi Minh City, Vietnam',
    website: 'https://techcorp.vn',
    size: 180,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'NovaHR Solutions',
    logo_url:
      'https://ui-avatars.com/api/?name=NovaHR+Solutions&background=1d4ed8&color=ffffff&size=256',
    location: 'Da Nang, Vietnam',
    website: 'https://novahr.vn',
    size: 95,
  },
  {
    id: '12121212-1212-1212-1212-121212121212',
    name: 'CloudVerse Labs',
    logo_url:
      'https://ui-avatars.com/api/?name=CloudVerse+Labs&background=7c3aed&color=ffffff&size=256',
    location: 'Hanoi, Vietnam',
    website: 'https://cloudverse.vn',
    size: 320,
  },
  {
    id: '34343434-3434-3434-3434-343434343434',
    name: 'ProductForge Asia',
    logo_url:
      'https://ui-avatars.com/api/?name=ProductForge+Asia&background=ea580c&color=ffffff&size=256',
    location: 'Thu Duc City, Ho Chi Minh City',
    website: 'https://productforge.asia',
    size: 60,
  },
  {
    id: '45454545-4545-4545-4545-454545454545',
    name: 'Horizon Commerce',
    logo_url:
      'https://ui-avatars.com/api/?name=Horizon+Commerce&background=0284c7&color=ffffff&size=256',
    location: 'Can Tho, Vietnam',
    website: 'https://horizon-commerce.vn',
    size: 140,
  },
  {
    id: '67676767-6767-6767-6767-676767676767',
    name: 'ByteBridge Health',
    logo_url:
      'https://ui-avatars.com/api/?name=ByteBridge+Health&background=16a34a&color=ffffff&size=256',
    location: 'Hue, Vietnam',
    website: 'https://bytebridge.health',
    size: 85,
  },
  {
    id: '89898989-8989-8989-8989-898989898989',
    name: 'GreenNode Systems',
    logo_url:
      'https://ui-avatars.com/api/?name=GreenNode+Systems&background=65a30d&color=ffffff&size=256',
    location: 'Hai Phong, Vietnam',
    website: 'https://greennode.systems',
    size: 210,
  },
  {
    id: '90909090-9090-9090-9090-909090909090',
    name: 'FinStack Digital',
    logo_url:
      'https://ui-avatars.com/api/?name=FinStack+Digital&background=7c2d12&color=ffffff&size=256',
    location: 'Nha Trang, Vietnam',
    website: 'https://finstack.digital',
    size: 48,
  },
];

const BRANCHES = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    companyId: '11111111-1111-1111-1111-111111111111',
    name: 'Tech Corp Vietnam HQ',
    address: '81 Nguyen Hue, Ben Nghe Ward, District 1',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
  },
  {
    id: '23232323-2323-2323-2323-232323232323',
    companyId: '11111111-1111-1111-1111-111111111111',
    name: 'Tech Corp Da Nang Delivery Center',
    address: '36 Bach Dang, Hai Chau District',
    city: 'Da Nang',
    country: 'Vietnam',
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    companyId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'NovaHR Da Nang Hub',
    address: '108 Vo Nguyen Giap, Son Tra District',
    city: 'Da Nang',
    country: 'Vietnam',
  },
  {
    id: '56565656-5656-5656-5656-565656565656',
    companyId: '12121212-1212-1212-1212-121212121212',
    name: 'CloudVerse Hanoi Engineering Hub',
    address: '17 Duy Tan, Cau Giay District',
    city: 'Hanoi',
    country: 'Vietnam',
  },
  {
    id: '78787878-7878-7878-7878-787878787878',
    companyId: '34343434-3434-3434-3434-343434343434',
    name: 'ProductForge Thu Duc Studio',
    address: '12 Street 6, Thao Dien Ward',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
  },
  {
    id: '79797979-7979-7979-7979-797979797979',
    companyId: '34343434-3434-3434-3434-343434343434',
    name: 'ProductForge Ha Noi Product Pod',
    address: '9 Pham Hung, Nam Tu Liem District',
    city: 'Hanoi',
    country: 'Vietnam',
  },
  {
    id: '80808080-8080-8080-8080-808080808080',
    companyId: '45454545-4545-4545-4545-454545454545',
    name: 'Horizon Commerce Mekong Center',
    address: '28 Hoa Binh Avenue, Ninh Kieu District',
    city: 'Can Tho',
    country: 'Vietnam',
  },
  {
    id: '81818181-8181-8181-8181-818181818181',
    companyId: '45454545-4545-4545-4545-454545454545',
    name: 'Horizon Commerce HCMC Sales Hub',
    address: '45 Vo Van Tan, District 3',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
  },
  {
    id: '82828282-8282-8282-8282-828282828282',
    companyId: '67676767-6767-6767-6767-676767676767',
    name: 'ByteBridge Health Hue Lab',
    address: '32 Hung Vuong, Phu Nhuan Ward',
    city: 'Hue',
    country: 'Vietnam',
  },
  {
    id: '83838383-8383-8383-8383-838383838383',
    companyId: '67676767-6767-6767-6767-676767676767',
    name: 'ByteBridge Health Da Nang Support Center',
    address: '88 2/9 Street, Hai Chau District',
    city: 'Da Nang',
    country: 'Vietnam',
  },
  {
    id: '84848484-8484-8484-8484-848484848484',
    companyId: '89898989-8989-8989-8989-898989898989',
    name: 'GreenNode Hai Phong Core Platform',
    address: '16 Lach Tray, Ngo Quyen District',
    city: 'Hai Phong',
    country: 'Vietnam',
  },
  {
    id: '85858585-8585-8585-8585-858585858585',
    companyId: '90909090-9090-9090-9090-909090909090',
    name: 'FinStack Nha Trang Delivery Team',
    address: '101 Tran Phu, Loc Tho Ward',
    city: 'Nha Trang',
    country: 'Vietnam',
  },
  {
    id: '86868686-8686-8686-8686-868686868686',
    companyId: '90909090-9090-9090-9090-909090909090',
    name: 'FinStack Ho Chi Minh Product Cell',
    address: '99 Nguyen Thi Minh Khai, District 1',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
  },
];

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  const categoryRepo = AppDataSource.getRepository(Categories);
  const companyRepo = AppDataSource.getRepository(Companies);
  const branchRepo = AppDataSource.getRepository(Branches);

  for (const companyData of COMPANIES) {
    const existingCompany = await companyRepo.findOne({
      where: { id: companyData.id },
    });

    if (existingCompany) {
      companyRepo.merge(existingCompany, companyData);
      await companyRepo.save(existingCompany);
      continue;
    }

    await companyRepo.save(companyRepo.create(companyData));
  }

  console.log(`Seeded ${COMPANIES.length} companies`);

  for (const branchData of BRANCHES) {
    const company = await companyRepo.findOne({
      where: { id: branchData.companyId },
    });

    if (!company) {
      throw new Error(`Company not found for branch ${branchData.name}`);
    }

    const existingBranch = await branchRepo.findOne({
      where: { id: branchData.id },
      relations: {
        company: true,
      },
    });

    if (existingBranch) {
      branchRepo.merge(existingBranch, {
        id: branchData.id,
        name: branchData.name,
        address: branchData.address,
        city: branchData.city,
        country: branchData.country,
        company,
      });
      await branchRepo.save(existingBranch);
      continue;
    }

    await branchRepo.save(
      branchRepo.create({
        id: branchData.id,
        name: branchData.name,
        address: branchData.address,
        city: branchData.city,
        country: branchData.country,
        company,
      }),
    );
  }

  console.log(`Seeded ${BRANCHES.length} branches`);

  const existing = await categoryRepo.find({ select: { name: true } });
  const existingNames = new Set(existing.map((c) => c.name));

  const toInsert = CATEGORIES.filter(({ name }) => !existingNames.has(name)).map(
    ({ id, name }) =>
      categoryRepo.create({
        id,
        name,
      }),
  );

  if (toInsert.length === 0) {
    console.log('Categories already seeded, skipping');
  } else {
    await categoryRepo.save(toInsert);
    console.log(`Seeded ${toInsert.length} categories`);
  }

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
