import { Link, LinkTypes } from '../../../db/entities/Link';
import moment, { Moment } from 'moment';
import LinkRepository from '../repositories/LinkRepository';
import ZipService from './ZipService';
import { Path, PathTypes } from '../../../db/entities/Path';
import PathService from './PathService';
import { readdirSync } from 'fs';
import { join } from 'path';
import { logger } from 'modules/logging';

class LinkService {
  private async shuffleLinkHash(link: Link) {
    link.generateHash();
    while (await Link.findOne({ hash: link.hash })) {
      link.generateHash();
    }
    return link;
  }

  async generateUniqueZipLink(paths: Path[], expirationDate?: Moment): Promise<Link> {
    const link = new Link();
    link.type = LinkTypes.ZIP;

    if (paths?.find((path) => !path.exists())) {
      throw new Error('One or more of the provided paths are invalid');
    }

    link.zip = await ZipService.generateZip(...paths);
    if (expirationDate?.isAfter(moment())) {
      link._expiration_date = expirationDate.toDate();
    }
    await this.shuffleLinkHash(link);
    return link;
  }

  async generateUniquePathLinks(paths: Path[], expirationDate?: Moment): Promise<Link[]> {
    const links: Link[] = [];

    if (paths?.find((path) => !path.exists())) {
      throw new Error('One or more of the provided paths are invalid');
    }

    const generateLinkFromFilePath = async (path: Path) => {
      const link = new Link();
      link.type = LinkTypes.PATH;
      link.path = path;
      if (expirationDate?.isAfter(moment())) {
        link._expiration_date = expirationDate.toDate();
      }
      await this.shuffleLinkHash(link);
      return link;
    };

    for (const path of paths) {
      switch (path.type) {
        case PathTypes.DIRECTORY: {
          const files = readdirSync(path.path)
            .map((fileName) => PathService.generatePath(join(path.path, fileName)))
            .filter((p) => p.type === PathTypes.FILE);
          for (const file of files) {
            const link = await generateLinkFromFilePath(file);
            links.push(link);
          }
          break;
        }
        case PathTypes.FILE: {
          const link = await generateLinkFromFilePath(path);
          links.push(link);
          break;
        }
      }
    }
    return links;
  }

  getLink(term: { id?: string; hash?: string }): Promise<Link | undefined> {
    const { id, hash } = term;
    if (id) return LinkRepository.getLinkById(id);
    else if (hash) return LinkRepository.getLinkByHash(hash);
    else throw new Error('You must specify an id or hash');
  }

  getLinks(fileName?: string): Promise<Link[]> {
    if (fileName) return LinkRepository.getLinksByFileName(fileName);
    else return LinkRepository.getAllLinks();
  }

  async insertLink(link: Link): Promise<Link> {
    if (!link.isValid()) {
      throw new Error('Link must point to a valid file or zip');
    }
    if (!link.hash || (await LinkRepository.getLinkByHash(link.hash))) {
      await this.shuffleLinkHash(link);
    }

    switch (link.type) {
      case LinkTypes.PATH: {
        if (link.path && !(await link.path?.isInDb())) {
          link.path = await PathService.insertPath(link.path);
        }
        break;
      }
      case LinkTypes.ZIP: {
        if (link.zip && !(await link.zip.isInDb())) {
          const newPaths: Path[] = [];
          for (const path of link.zip.paths) {
            newPaths.push((await path.isInDb()) ? path : await PathService.insertPath(path));
          }
          link.zip.paths = newPaths;
          link.zip = await ZipService.insertZip(link.zip);
        }
      }
    }

    return await LinkRepository.insertLink(link);
  }

  async deleteLink(link: Link): Promise<any> {
    if (link.id && LinkRepository.getLinkById(link.id)) return LinkRepository.deleteLink(link);
    else {
      const existingLink = await LinkRepository.getLinkByHash(link.hash);
      if (existingLink) return LinkRepository.deleteLink(existingLink);
      throw new Error('link must have an existing id or an existing hash');
    }
  }
}

export default new LinkService();
