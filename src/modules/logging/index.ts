import winston from 'winston';
import { join } from 'path';
const { combine, json, timestamp, simple, colorize } = winston.format;

export const logger = winston.createLogger({
  level: process.env.ENV === 'prod' ? 'info' : 'verbose',
  format: json(),
  transports: [
    new winston.transports.File({ filename: join(__dirname, '../../logs', 'combined.log'), format: combine(timestamp(), simple()) }),
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), simple()),
    }),
  ],
});
