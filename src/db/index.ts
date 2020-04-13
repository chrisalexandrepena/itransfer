import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { logger } from '../modules/logging';

async function initDb() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '0', 0) || 5432,
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'custom_wetransfer',
  });
  logger.info('Successfuly connected to database');
  return connection;
}

export { initDb };
