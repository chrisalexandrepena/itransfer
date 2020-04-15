import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, BaseEntity, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import randomstring from 'randomstring';
import moment, { Moment } from 'moment';
import { Zip } from './Zip';
import { Path } from './Path';

export enum LinkTypes {
  'PATH' = 'path',
  'ZIP' = 'zip',
}

@Entity()
export class Link extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ update: false })
  created_at: Date;

  @Column({ type: 'enum', enum: LinkTypes })
  type: LinkTypes;

  @ManyToOne((type) => Path, { nullable: true })
  @JoinColumn()
  path?: Path;

  @ManyToOne((type) => Zip, { nullable: true })
  @JoinColumn()
  zip?: Zip;

  @Column('timestamptz', { name: 'expiration_date', nullable: true })
  _expiration_date?: Date;

  get expiration_date(): Moment | undefined | null {
    return this._expiration_date ? moment(this._expiration_date) : this._expiration_date;
  }

  @Column({ type: 'varchar', unique: true })
  hash: string;

  isValid() {
    switch (this.type) {
      case LinkTypes.PATH: {
        return this.path?.exists();
      }
      case LinkTypes.ZIP: {
        return this.zip?.isValid();
      }
    }
  }

  getUrl() {
    return `${process.env.HOST}/download/${this.hash}`;
  }

  generateHash() {
    this.hash = randomstring.generate({ capitalization: 'lowercase' });
  }
}
