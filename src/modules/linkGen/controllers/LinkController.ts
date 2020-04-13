import LinkService from '../services/LinkService';
import { Link } from '../../../db/entities/Link';
import { Request, Response, NextFunction } from 'express';
import { existsSync } from 'fs';
import moment from 'moment';
import { logger } from '../../../modules/logging';
import { parse } from 'path';

class LinkController {
  async getAllLinks(req: Request, res: Response, next: NextFunction) {
    const links = await LinkService.getLinks();
    res.json(links.map((link) => link.getUrl()));
  }

  async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { hash } = req.params;
    if (!hash) {
      res.status(400);
      next(new Error('no hash specified'));
    }
    const link = await LinkService.getLink({ hash });
    if (!link) {
      res.status(404);
      next(new Error('invalid hash'));
      return;
    }
    if (!(await link?.fileExists())) {
      res.status(500);
      next(new Error('link is invalid, file not found on server'));
      return;
    }
    logger.info(`${req.clientIp} is downloading file ${parse(link.file).base}`.bgCyan);
    res.download(link.file, parse(link.file).base);
    return;
  }

  async createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filePath } = req.body;
      const expirationDate = moment(req.body.expirationDate);
      if (!filePath || !existsSync(filePath)) {
        res.status(400);
        next(new Error('request must contain a valid filePath'));
      }
      const link = await LinkService.generateUniqueLink(filePath, expirationDate.isValid() ? expirationDate : undefined);

      await LinkService.insertLink(link);
      res.status(200).send(link.getUrl);
      next();
    } catch (err) {
      next(err);
    }
  }

  async createLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    const filePaths: string[] = req.body.filePaths;
    const links: Link[] = [];
    const expirationDate = moment(req.body.expirationDate);
    try {
      for (const filePath of filePaths) {
        if (!filePath || !existsSync(filePath)) {
          res.status(400);
          throw new Error('request must contain a valid filePath');
        }
        const link = await LinkService.generateUniqueLink(filePath, expirationDate.isValid() ? expirationDate : undefined);
        await LinkService.insertLink(link);
        links.push(link);
      }
    } catch (err) {
      for (const link of links) {
        await LinkService.deleteLink(link);
      }
      next(new Error('one or more filePaths were invalid'));
      return;
    }

    res.json(links.map((link) => link.getUrl()));
    next();
  }
}

export default new LinkController();
