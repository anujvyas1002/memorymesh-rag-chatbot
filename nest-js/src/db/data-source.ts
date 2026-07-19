import { config as loadEnv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

loadEnv();

/**
 * Standalone TypeORM DataSource used by the TypeORM CLI for migrations.
 * The Nest runtime configures its own connection via TypeOrmModule.forRootAsync.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'rag',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

export default new DataSource(dataSourceOptions);
