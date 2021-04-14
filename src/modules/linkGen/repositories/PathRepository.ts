import { Path } from '../../../db/entities/Path';
import { getRepository } from 'typeorm';

class PathRepository {
  getPathById(id: string): Promise<Path | undefined> {
    return this.defaultQueryBuilder.where('path.id = :id', { id }).getOne();
  }
  getPathsByName(name: string): Promise<Path[]> {
    return this.defaultQueryBuilder.where('path.name = :name', { name }).getMany();
  }
  getPathByPathString(pathString: string): Promise<Path | undefined> {
    return this.defaultQueryBuilder.where('path.path = :pathString', { pathString }).getOne();
  }
  insertPath(path: Path): Promise<Path> {
    return Path.create(path).save();
  }
  async deletePath(path: Path): Promise<void> {
    await Path.delete({ id: path.id });
    return;
  }

  private get defaultQueryBuilder() {
    return getRepository(Path).createQueryBuilder('path');
  }
}

export default new PathRepository();
