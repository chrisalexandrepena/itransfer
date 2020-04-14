import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class LogError extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ update: false })
  created_at: Date;

  @Column('text', { nullable: true })
  stack: string;

  @Column('json')
  request_meta?: {
    requestMethod: string;
    requestUrl: string;
    requestBody: any;
    remoteIp: string;
    date: Date;
  };
}
