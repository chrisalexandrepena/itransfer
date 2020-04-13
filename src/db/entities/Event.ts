import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, OneToOne, BaseEntity } from 'typeorm';
import { Link } from './Link';

type EventTypes = 'download' | 'generate_link';

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ update: false })
  created_at: Date;

  @Column({ type: 'enum', enum: ['download', 'generate_link'] })
  type: EventTypes;

  @OneToOne((type) => Link)
  link: Link;
}
