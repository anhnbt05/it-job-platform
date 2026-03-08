import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/modules/databases/migrations/*.js'],
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
});

export default AppDataSource;
