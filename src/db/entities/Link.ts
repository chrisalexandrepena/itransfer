import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, Generated, BaseEntity, UpdateDateColumn } from 'typeorm';
import randomstring from 'randomstring';
import moment, { Moment } from 'moment';
import LinkRepository from '../../modules/linkGen/repositories/LinkRepository';
import { existsSync } from 'fs';

@Entity()
export class Link extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ update: false })
  created_at: Date;

  @Column()
  file: string;

  @Column('timestamptz', { name: 'expiration_date', nullable: true })
  _expiration_date?: Date;

  get expiration_date(): Moment | undefined | null {
    return this._expiration_date ? moment(this._expiration_date) : this._expiration_date;
  }

  @Column({ type: 'varchar', unique: true })
  hash: string;

  fileExists() {
    if (!this.file || !existsSync(this.file)) return false;
    return true;
  }

  getUrl() {
    return `${process.env.HOST}/download/${this.hash}`;
  }

  generateHash() {
    this.hash = randomstring.generate({ capitalization: 'lowercase' });
  }
}
