import { Link } from '../../../db/entities/Link';
import { existsSync } from 'fs';
import moment, { Moment } from 'moment';
import LinkRepository from '../repositories/LinkRepository';

class LinkService {
  private async shuffleLinkHash(link: Link) {
    link.generateHash();
    while (await Link.findOne({ hash: link.hash })) {
      link.generateHash();
    }
    return link;
  }

  async generateUniqueLink(filePath: string, expirationDate?: Moment): Promise<Link> {
    const link = new Link();
    if (!existsSync(filePath)) {
      throw new Error(`The file ${filePath} doesn't exist`);
    }
    link.file = filePath;
    if (expirationDate?.isAfter(moment())) {
      link._expiration_date = expirationDate.toDate();
    }
    await this.shuffleLinkHash(link);

    return link;
  }

  getLink(term: { id?: string; hash?: string }): Promise<Link | undefined> {
    const { id, hash } = term;
    if (id) return LinkRepository.getLinkById(id);
    else if (hash) return LinkRepository.getLinkByHash(hash);
    else throw new Error('You must specify an id or hash');
  }

  getLinks(file?: string): Promise<Link[]> {
    if (file) return LinkRepository.getLinksByFile(file);
    else return LinkRepository.getAllLinks();
  }

  async insertLink(link: Link): Promise<Link> {
    if (!link.file || !existsSync(link.file)) {
      throw new Error('Link must point to a valid file');
    }
    if (!link.hash || LinkRepository.getLinkByHash(link.hash)) {
      await this.shuffleLinkHash(link);
    }

    return await LinkRepository.insertLink(link);
  }

  async deleteLink(link: Link): Promise<any> {
    if (link.id && LinkRepository.getLinkById(link.id)) return LinkRepository.deleteLink(link.id);
    else {
      const existingLink = await LinkRepository.getLinkByHash(link.hash);
      if (existingLink) return LinkRepository.deleteLink(existingLink.id);
      throw new Error('link must have an existing id or an existing hash');
    }
  }
}

export default new LinkService();
