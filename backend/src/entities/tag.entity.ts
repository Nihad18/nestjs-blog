import { Entity, Column, PrimaryColumn, Generated, ManyToMany } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
export class Tag {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column({ unique: true })
  tagName: string;

  @ManyToMany(() => Blog, (blog) => blog.tags)
  blogs: Blog[];
}
