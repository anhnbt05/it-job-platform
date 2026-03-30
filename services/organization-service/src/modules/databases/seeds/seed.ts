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
  'Software Development',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile Development',
  'DevOps & Cloud',
  'Data Engineering',
  'Data Science & AI/ML',
  'Cybersecurity',
  'QA & Testing',
  'UI/UX Design',
  'System & Network Administration',
  'Database Administration',
  'Embedded & IoT',
  'Blockchain',
  'Game Development',
  'IT Project Management',
  'IT Support & Helpdesk',
];

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  const repo = AppDataSource.getRepository(Categories);

  const existing = await repo.find({ select: { name: true } });
  const existingNames = new Set(existing.map((c) => c.name));

  const toInsert = CATEGORIES.filter((name) => !existingNames.has(name)).map(
    (name) => repo.create({ name }),
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
