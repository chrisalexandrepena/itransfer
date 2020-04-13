import {Entity, PrimaryGeneratedColumn, CreateDateColumn, Column} from "typeorm";

@Entity()
export class Error {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column('text', { nullable: true })
  stack: string;

  @Column('json')
  request_meta?: {
    requestMethod: string,
    requestUrl: string,
    remoteIp: string,
    date: Date
  }
}
