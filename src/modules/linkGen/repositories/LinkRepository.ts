import { Link } from '../../../db/entities/Link';
import { getRepository, Repository } from 'typeorm';

class LinkRepository {
  getLinkById(id: string): Promise<Link | undefined> {
    return this.defaultQueryBuilder.where('link.id = :id', { id }).getOne();
  }
  getLinkByHash(hash: string): Promise<Link | undefined> {
    return this.defaultQueryBuilder.where('link.hash = :hash', { hash }).getOne();
  }
  getAllLinks(): Promise<Link[]> {
    return this.defaultQueryBuilder.getMany();
  }
  getLinksByFileName(fileName: string): Promise<Link[]> {
    return this.defaultQueryBuilder.where('linkPath.name = :fileName OR zipPath = :fileName', { fileName }).getMany();
  }
  insertLink(link: Link): Promise<Link> {
    return Link.create(link).save();
  }
  async deleteLink(link: Link): Promise<void> {
    await Link.delete({ id: link.id });
    return;
  }

  private get defaultQueryBuilder() {
    return getRepository(Link)
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.zip', 'zip')
      .leftJoinAndSelect('link.path', 'linkPaths')
      .leftJoinAndSelect('zip.paths', 'zipPaths')
  }
}

export default new LinkRepository();
