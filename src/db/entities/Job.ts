import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, OneToOne } from 'typeorm';
import { Link } from './Link';

type JobTypes = 'delete';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'enum', enum: ['delete'] })
  type: JobTypes;

  @OneToOne((type) => Link)
  link: Link;

  @Column('timestamp')
  job_date: Date;
}
