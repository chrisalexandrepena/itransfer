import { Path, PathTypes } from '../../../db/entities/Path';
import { existsSync, statSync } from 'fs';
import { parse } from 'path';
import PathRepository from '../repositories/PathRepository';

class PathService {
  getPath(term: { id?: string; pathString?: string }): Promise<Path | undefined> {
    const { id, pathString } = term;
    if (id) {
      return PathRepository.getPathById(id);
    } else if (pathString) {
      return PathRepository.getPathByPathString(pathString);
    } else {
      throw new Error('Specify an id or a pathString');
    }
  }

  generateAndInsertPath(pathString: string): Promise<Path> {
    const path = this.generatePath(pathString);
    return this.insertPath(path);
  }

  generatePath(pathString: string): Path {
    if (!pathString || !existsSync(pathString)) {
      throw new Error('path must point to a valid file or directory');
    }

    const path = new Path();
    if (statSync(pathString).isDirectory()) {
      path.type = PathTypes.DIRECTORY;
    } else {
      path.type = PathTypes.FILE;
    }
    path.path = pathString;
    path.name = parse(pathString).base;

    return path;
  }

  async insertPath(path: Path): Promise<Path> {
    if (!path.exists()) {
      throw new Error('Path must point to a valid file');
    }
    const existingPath = await this.getPath({ pathString: path.path });

    return existingPath || (await PathRepository.insertPath(path));
  }
}

export default new PathService();
