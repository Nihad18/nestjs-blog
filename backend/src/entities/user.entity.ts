import {
  Entity,
  Column,
  PrimaryColumn,
  Generated,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { Blog } from './blog.entity';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @OneToMany(() => Role, (role) => role.user)
  roles: Role[];

  @OneToMany(() => Blog, (author) => author.author)
  blogs: Blog[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
