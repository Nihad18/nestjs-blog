import {
  Entity,
  Column,
  PrimaryColumn,
  Generated,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Tag } from './tag.entity';
import { User } from './user.entity';

@Entity()
export class Blog {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 0 })
  order: number;

  @Column()
  content: string;

  @Column()
  summary: string;

  @Column({ default: true })
  published: boolean;

  @Column()
  createdTime: string;

  @Column({ nullable: true })
  updatedTime: string;

  @Column({ nullable: true })
  coverImg: string;

  @ManyToOne(() => User, (user) => user.blogs)
  author: User;

  @ManyToMany(() => Tag, (tag) => tag.blogs)
  @JoinTable()
  tags: Tag[];
  tag: any;
}
