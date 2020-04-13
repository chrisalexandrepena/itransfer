import express from 'express';
import dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

if (existsSync(join(__dirname, '../.env'))) {
  dotenv.config({ path: join(__dirname, '../.env') });
} else console.log('no .env file found, resorting to defaults');

const app = express();

app.listen(process.env.PORT || '8080', () => console.log(`App listening on port ${process.env.PORT || '8080'}`));
