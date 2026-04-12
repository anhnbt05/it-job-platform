import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Categories } from '../../categories/entities/categories.entity';

config();

const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  entities: [Categories],
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

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  const repo = AppDataSource.getRepository(Categories);

  const existing = await repo.find({ select: { name: true } });
  const existingNames = new Set(existing.map((c) => c.name));

  const toInsert = CATEGORIES.filter(({ name }) => !existingNames.has(name)).map(
    ({ id, name }) =>
      repo.create({
        id,
        name,
      }),
  );

  if (toInsert.length === 0) {
    console.log('Categories already seeded, skipping');
  } else {
    await repo.save(toInsert);
    console.log(`Seeded ${toInsert.length} categories`);
  }

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
