import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, Generated } from 'typeorm';
import randomstring from 'randomstring';

@Entity()
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  file: string;

  @Column({ type: 'varchar', unique: true, name: 'hash' })
  private _hash: string;

  get hash() {
    return this._hash;
  }
  generateHash() {
    this._hash = randomstring.generate({capitalization:'lowercase'})
  }
}
