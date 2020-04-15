import { Entity, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Path, PathTypes } from './Path';
import { logger } from '../../modules/logging';
import { parse } from 'path';
import { Response } from 'express';
import archiver from 'archiver';
import ZipService from '../../modules/linkGen/services/ZipService';

@Entity()
export class Zip extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ update: false })
  created_at: Date;

  @ManyToMany((type) => Path)
  @JoinTable()
  paths: Path[];

  isValid() {
    return this.paths.reduce((accumulator, current) => accumulator && current.exists(), true);
  }

  async isInDb(): Promise<boolean> {
    if (!this.id) return false;
    const dbEntry = await ZipService.getZip(this.id);
    return Boolean(dbEntry);
  }

  appendZipStreamToRes(res: Response): Response {
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') logger.warning(err.message);
      else throw err;
    });
    archive.on('error', (err) => {
      throw err;
    });

    const validPaths: Path[] = this.paths.filter((path) => path.exists());
    for (const path of validPaths) {
      switch (path.type) {
        case PathTypes.DIRECTORY: {
          archive.directory(path.path, path.name);
          break;
        }
        case PathTypes.FILE: {
          archive.file(path.path, { name: parse(path.path).base });
        }
      }
    }
    archive.finalize();
    return res;
  }
}
