import { Entity, Column, PrimaryColumn, Generated, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Role {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column()
  roleName: string;

  @ManyToOne(() => User, (user) => user.roles)
  user: User;
}
