import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, OneToOne } from 'typeorm';
import { Link } from './Link';

type EventTypes = 'download' | 'generate_link';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'enum', enum: ['download', 'generate_link'] })
  type: EventTypes;

  @OneToOne((type) => Link)
  link: Link;
}
