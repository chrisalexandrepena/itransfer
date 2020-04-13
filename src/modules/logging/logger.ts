import winston from 'winston';
const { combine, timestamp, simple, colorize } = winston.format;

export const logger = winston.createLogger({
  level: process.env.ENV === 'prod' ? 'info' : 'verbose',
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), simple()),
    }),
  ],
});
