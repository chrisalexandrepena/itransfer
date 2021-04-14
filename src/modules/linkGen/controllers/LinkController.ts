import LinkService from '../services/LinkService';
import { Link, LinkTypes } from '../../../db/entities/Link';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import { logger } from '../../../modules/logging';
import { parse, join } from 'path';
import JobService from '../../../modules/jobs/services/JobService';
import PathService from '../services/PathService';
import { PathTypes } from '../../../db/entities/Path';

class LinkController {
  checkPath(filePath: string): string {
    if (!process.env.SHARED_DIR && !/^\//gi.test(filePath)) {
      throw new Error(`filepath ${filePath} is invalid`)
    }
    else if (process.env.SHARED_DIR && !/^\//gi.test(filePath)) return join(process.env.SHARED_DIR, filePath)
    return filePath
  }

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
    if (!(await link?.isValid())) {
      res.status(500);
      next(new Error('link is invalid, file not found on server'));
      return;
    }

    // Launch download
    if (link?.type === LinkTypes.PATH && link.path) {
      logger.info(`${req.clientIp} is downloading file ${parse(link.path.path).base}`.cyan);
      res.download(link.path.path, parse(link.path.path).base);
    } else if (link?.type === LinkTypes.ZIP && link.zip) {
      logger.info(`${req.clientIp} is downloading files (in zip):\n${link.zip.paths.map((path) => ` - ${path.name}`).join('\n')}\n`.cyan);
      res.contentType('application/zip');
      link.zip.appendZipStreamToRes(res);
    }
    return;
  }

  async createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    let filePaths: string[] = req.body.filePaths;
    let link: Link;
    const expirationDate =
      moment(req.body.expirationDate).isValid() && moment(req.body.expirationDate).isAfter(moment()) ? moment(req.body.expirationDate) : undefined;
    
    // Error checks
    if (!filePaths) {
      res.status(400);
      next(Error('request must contain at least one filePath'));
      return;
    }
    try {
      filePaths = filePaths.map(this.checkPath)
    }catch(e) {
      res.status(400)
      next(e)
    }
    
    
    // Generate link
    const paths = filePaths.map(PathService.generatePath);
    if (paths.length === 1 && paths[0].type === PathTypes.FILE) {
      const links = await LinkService.generateUniquePathLinks(paths, expirationDate);
      link = await LinkService.insertLink(links[0]);
    } else {
      const zipLink = await LinkService.generateUniqueZipLink(paths, expirationDate);
      link = await LinkService.insertLink(zipLink);
    }

    // Spawn jobs
    if (expirationDate) {
      JobService.addDeleteLinkJob(link);
    }

    // Return link
    res.end(link.getUrl());
    return;
  }

  async createLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    let filePaths: string[] = req.body.filePaths;
    const links: Link[] = [];
    const expirationDate =
      moment(req.body.expirationDate).isValid() && moment(req.body.expirationDate).isAfter(moment()) ? moment(req.body.expirationDate) : undefined;

    // Error checks
    if (!filePaths) {
      res.status(400);
      next(Error('request must contain at least one filePath'));
      return;
    }
    try {
      filePaths = filePaths.map(this.checkPath)
    }catch(e) {
      res.status(400)
      next(e)
    }

    // Generate Links
    try {
      const paths = filePaths.map(PathService.generatePath);
      if (paths.length === 1 && paths[0].type === PathTypes.FILE) {
        const link = await LinkService.generateUniquePathLinks(paths, expirationDate);
        links.push(await LinkService.insertLink(link[0]));
      } else {
        const pathLinks = await LinkService.generateUniquePathLinks(paths, expirationDate);
        for (const link of pathLinks) {
          links.push(await LinkService.insertLink(link));
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
