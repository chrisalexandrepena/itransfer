import { Link } from '../../../db/entities/Link';

class LinkRepository {
  getLinkById(id: string): Promise<Link | undefined> {
    return Link.findOne({ id });
  }
  getLinkByHash(hash: string): Promise<Link | undefined> {
    return Link.findOne({ hash });
  }
  getAllLinks(): Promise<Link[]> {
    return Link.find();
  }
  getLinksByFile(file: string): Promise<Link[]> {
    return Link.find({ where: { file } });
  }
  insertLink(link: Link): Promise<Link> {
    return Link.create(link).save();
  }
  deleteLink(id: string): Promise<any> {
    return Link.delete({ id });
  }
}

export default new LinkRepository();
