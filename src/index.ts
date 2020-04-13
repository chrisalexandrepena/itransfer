import express from 'express';
import dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';
import { initDb } from './db';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { logger } from './modules/logging';
import 'colors';

if (existsSync(join(__dirname, '../.env'))) {
  dotenv.config({ path: join(__dirname, '../.env') });
  process.env.ENV = ['dev', 'prod'].includes(process.env.ENV || '') ? process.env.ENV : 'dev';
} else {
  process.env.ENV = 'dev';
  logger.warn('no .env file found, resorting to defaults');
}

(async () => {
  try {
    const app = express();
    app.use(morgan(process.env.ENV === 'prod' ? 'tiny' : 'dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    const db = await initDb();

    app.listen(process.env.PORT || '8080', () => logger.info(`App listening on port ${process.env.PORT || '8080'}`));
  } catch (err) {
    logger.error(err.message.red);
  }
})();
