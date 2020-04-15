import LinkService from '../services/LinkService';
import { Link } from '../../../db/entities/Link';
import { Request, Response, NextFunction } from 'express';
import { existsSync, readdirSync, statSync } from 'fs';
import moment from 'moment';
import { logger } from '../../../modules/logging';
import { parse, join } from 'path';
import JobService from '../../../modules/jobs/services/JobService';

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
    logger.info(`${req.clientIp} is downloading file ${parse(link.file).base}`.cyan);
    res.download(link.file, parse(link.file).base);
    return;
  }

  async createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    const links: Link[] = [];
    try {
      let { filePath } = req.body;
      const expirationDate = moment(req.body.expirationDate);

      // Error checks
      if (!filePath) {
        res.status(400);
        throw new Error('request must contain a filePath');
      }
      if (!/^\//gi.test(filePath) && process.env.SHARED_DIR) {
        filePath = join(process.env.SHARED_DIR, filePath);
      }
      if (!existsSync(filePath)) {
        res.status(400);
        throw new Error('requested file does not exists');
      }

      // Managing Link
      if (statSync(filePath).isDirectory()) {
        const files = readdirSync(filePath)
          .filter((file) => statSync(join(filePath, file)).isFile())
          .map((file) => join(filePath, file));
        for (const file of files) {
          const link = await LinkService.generateUniqueLink(file, expirationDate.isValid() ? expirationDate : undefined);
          await LinkService.insertLink(link);
          links.push(link);
        }
        for (const link of links) {
          if (link.expiration_date && link.expiration_date.isAfter(moment())) {
            JobService.addDeleteLinkJob(link);
          }
        }
        res.json(links.map((link) => link.getUrl()));
        next();
      } else {
        const link = await LinkService.generateUniqueLink(filePath, expirationDate.isValid() ? expirationDate : undefined);
        await LinkService.insertLink(link);
        if (link.expiration_date && link.expiration_date.isAfter(moment())) {
          JobService.addDeleteLinkJob(link);
        }
        res.status(200).send(link.getUrl());
        next();
      }
    } catch (err) {
      if (links?.length) {
        for (const link of links) {
          await LinkService.deleteLink(link);
        }
      }
      next(err);
    }
  }

  async createLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    const filePaths: string[] = req.body.filePaths;
    const links: Link[] = [];
    const expirationDate = moment(req.body.expirationDate);
    try {
      for (let filePath of filePaths) {
        // Error checks
        if (!filePath) {
          res.status(400);
          throw new Error('request must contain no empty filePaths');
        }
        if (!/^\//gi.test(filePath) && process.env.SHARED_DIR) {
          filePath = join(process.env.SHARED_DIR, filePath);
        }
        if (!existsSync(filePath)) {
          res.status(400);
          throw new Error("one or more requested files don't exist");
        }

        // Managing links
        if (statSync(filePath).isDirectory()) {
          const files = readdirSync(filePath)
            .filter((file) => statSync(join(filePath, file)).isFile())
            .map((file) => join(filePath, file));
          for (const file of files) {
            const link = await LinkService.generateUniqueLink(file, expirationDate.isValid() ? expirationDate : undefined);
            await LinkService.insertLink(link);
            links.push(link);
          }
        } else {
          const link = await LinkService.generateUniqueLink(filePath, expirationDate.isValid() ? expirationDate : undefined);
          await LinkService.insertLink(link);
          links.push(link);
        }
        for (const link of links) {
          if (link.expiration_date && link.expiration_date.isAfter(moment())) {
            JobService.addDeleteLinkJob(link);
          }
        }
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

  async deleteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    await LinkService.deleteLink(link);
    res.end('success');
    return;
  }

  async deleteLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { hashes } = req.query;
    if (hashes && Array.isArray(hashes)) {
      for (const hash of hashes) {
        if (typeof hash === 'string') {
          const link = await LinkService.getLink({ hash });
          if (!link) {
            res.status(404);
            next(new Error(`invalid hash ${hash}`));
            return;
          }
          await LinkService.deleteLink(link);
        }
      }
    } else {
      res.status(400);
      next(new Error('no hash specified'));
    }
    res.end('success');
    return;
  }
}

export default new LinkController();
