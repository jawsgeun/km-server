import path from 'path';

import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

function setDotenv(nodeEnv: string) {
  let envPath: string;
  switch (nodeEnv) {
    case 'local':
      envPath = path.join(__dirname, `/../.env.local`);
      break;
    case 'dev':
      envPath = path.join(__dirname, `/../.env.development`);
      break;
    case 'prod':
      envPath = path.join(__dirname, `/../.env.production`);
      break;
    default:
      throw new Error('NODE_ENV invalid (local, dev, prod)');
  }

  dotenv.config({ path: envPath });
}

if (
  !process.env.NODE_ENV ||
  !['local', 'dev', 'prod'].includes(process.env.NODE_ENV)
) {
  throw new Error('NODE_ENV invalid (local, dev, prod)');
}

const nodeEnv = process.env.NODE_ENV as 'local' | 'dev' | 'prod';

setDotenv(nodeEnv);

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.NUVI_DB_HOST,
  port: Number(process.env.NUVI_DB_PORT),
  username: process.env.NUVI_DB_USER,
  password: process.env.NUVI_DB_PASSWORD,
  database: 'kitchen_manager',
  logging: true,
  entities: [__dirname + '/../src/**/*.entity.ts'],
  migrations: [__dirname + `/scripts/${nodeEnv}/*.ts`],
});
