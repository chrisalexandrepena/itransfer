import expressWinston from 'express-winston';
import winston from 'winston';
import { LogError } from './transports/LogError';
import { SaveToDb } from './transports/SaveToDb';
const { combine, timestamp, simple, colorize } = winston.format;

function extractMeta(req, res) {
  return Object.assign(
    {},
    req
      ? {
          requestMethod: req.method,
          requestUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
          remoteIp: req.clientIp,
          requestSize: req.socket.bytesRead,
          requestBody: req.body
        }
      : {}
  );
}

export const loggerMiddleware = expressWinston.logger({
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), simple()),
    }),
  ],
  meta: true,
  dynamicMeta: extractMeta,
});

export const errorLoggerMiddleware = expressWinston.errorLogger({
  transports: [
    new LogError(), 
    new SaveToDb()
  ],
  meta: true,
  dynamicMeta: extractMeta,
});
