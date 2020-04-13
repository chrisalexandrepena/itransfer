import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { logger } from '../modules/logging';

async function initDb() {
  const connection = await createConnection();
  logger.info('Successfuly connected to database');
  return connection;
}

export { initDb };
