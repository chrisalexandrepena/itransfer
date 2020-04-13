import express from 'express';
import dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';
import { initDb } from './db';
import bodyParser from 'body-parser';
import requestIp from 'request-ip';
import { logger, loggerMiddleware, errorLoggerMiddleware } from './modules/logging';
import 'colors';
import LinkController from './modules/linkGen/controllers/LinkController';

if (existsSync(join(__dirname, '../.env'))) {
  dotenv.config({ path: join(__dirname, '../.env') });
  process.env.ENV = ['dev', 'prod'].includes(process.env.ENV || '') ? process.env.ENV : 'dev';
} else {
  process.env.ENV = 'dev';
  logger.warn('no .env file found, resorting to defaults');
}

// tslint:disable-next-line: no-unused-expression
(async () => {
  try {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(requestIp.mw());
    app.use(loggerMiddleware);
    await initDb();

    app.get('/', (req, res, next) => {
      res.send("coucou l'ami");
      next();
    });
    app.get('/download/:hash', (req, res, next) => {
      LinkController.downloadFile(req, res, next).catch(next);
    });
    app.get('/links', (req, res, next) => {
      LinkController.getAllLinks(req, res, next).catch(next);
    });
    app.post('/link/generate', (req, res, next) => {
      LinkController.createLink(req, res, next).catch(next);
    });
    app.post('/links/generate', (req, res, next) => {
      LinkController.createLinks(req, res, next).catch(next);
    });

    // Log and end request treatment
    app.use(errorLoggerMiddleware);
    app.use((err, req, res, next) => {
      res.end(err.message);
      return;
    });

    app.listen(process.env.PORT || '8080', () => logger.info(`App listening on port ${process.env.PORT || '8080'}`));
  } catch (err) {
    logger.error(err.message);
  }
})();
