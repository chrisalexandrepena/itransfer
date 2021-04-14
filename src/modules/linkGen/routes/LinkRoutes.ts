import { Express, Request, Response, NextFunction } from 'express';
import LinkController from '../controllers/LinkController';

class LinkRoutes {
  useAllRoutes(app: Express) {
    this.get_downloadLink(app);
    this.get_links(app);
    this.post_linkGenerate(app);
    this.post_linksGenerate(app);
    this.delete_link(app);
    this.delete_links(app);
  }

  get_downloadLink(app: Express): void {
    app.get('/download/:hash', (req, res, next) => {
      LinkController.downloadFile(req, res, next).catch(next);
    });
  }

  get_links(app: Express): void {
    app.get('/links', (req, res, next) => {
      LinkController.getAllLinks(req, res, next).catch(next);
    });
  }

  post_linkGenerate(app: Express): void {
    app.post('/link/generate', (req, res, next) => {
      LinkController.createLink(req, res, next).catch(next);
    });
  }

  post_linksGenerate(app: Express): void {
    app.post('/links/generate', (req, res, next) => {
      LinkController.createLinks(req, res, next).catch(next);
    });
  }

  delete_link(app: Express): void {
    app.delete('/link/:hash', (req, res, next) => {
      LinkController.deleteLink(req, res, next).catch(next);
    });
  }

  delete_links(app: Express): void {
    app.delete('/links', (req, res, next) => {
      LinkController.deleteLinks(req, res, next).catch(next);
    });
  }
}

export default new LinkRoutes();
