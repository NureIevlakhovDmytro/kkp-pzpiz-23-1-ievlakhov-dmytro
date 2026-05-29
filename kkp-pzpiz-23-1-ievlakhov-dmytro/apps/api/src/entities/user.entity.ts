import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Locale, Role } from '@app/shared';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'enum', enum: Locale, default: Locale.UK })
  locale: Locale;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'anonymized_at', type: 'timestamptz', nullable: true })
  anonymizedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
