import { Entity, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, PrimaryColumn, Column } from 'typeorm';
import { existsSync } from 'fs';
import PathService from '../../modules/linkGen/services/PathService';
export enum PathTypes {
  'FILE' = 'file',
  'DIRECTORY' = 'directory',
}

@Entity()
export class Path extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ update: false })
  created_at: Date;

  @Column({ type: 'enum', enum: PathTypes })
  type: PathTypes;

  @Column({ type: 'varchar' })
  @PrimaryColumn()
  path: string;

  @Column({ type: 'varchar' })
  name: string;

  exists() {
    return existsSync(this.path);
  }

  async isInDb(): Promise<boolean> {
    if (!this.id) return false;
    const dbEntry = await PathService.getPath({id:this.id});
    return Boolean(dbEntry);
  }
}
