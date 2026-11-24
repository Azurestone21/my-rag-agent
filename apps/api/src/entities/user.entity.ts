import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Base } from './base.entity.js';
import { type Role, Roles } from '@my-rag-agent/shared';

@Entity('users')
export class User extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'username', comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 255, name: 'password', comment: '密码' })
  password: string;

  @Column({ type: 'varchar', length: 255, name: 'role', default: Roles.User, comment: '角色' })
  role: Role;
}