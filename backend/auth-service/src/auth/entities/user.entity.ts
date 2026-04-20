import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users') // → table name in PostgreSQL
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  // UUID instead of integer — harder to guess, safer in URLs

  @Column({ unique: true })
  email!: string;
  // unique:true → PostgreSQL adds a UNIQUE constraint

  @Column()
  password!: string;
  // We NEVER store plain text — always a bcrypt hash

  @Column({ default: 'Anonymous' })
  name!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;
  // Stored as a string ('admin' | 'user') in the DB

  @Column({ type: 'varchar', nullable: true })
  refreshToken!: string | null;
  // Null when logged out. Stores a HASH of the refresh token, not the token itself

  @CreateDateColumn()
  createdAt!: Date; // TypeORM sets this automatically on INSERT

  @UpdateDateColumn()
  updatedAt!: Date; // TypeORM updates this automatically on every save

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Runs automatically before any INSERT or UPDATE
    // The "$2" check prevents double-hashing if you save the user twice
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    // 10 = "salt rounds" — how many times bcrypt hashes itself
    // Higher = slower = harder to brute force. 10 is the safe standard.
  }

  async validatePassword(plaintext: string): Promise<boolean> {
    return bcrypt.compare(plaintext, this.password);
    // bcrypt.compare hashes the plaintext the same way and compares
    // You never "decrypt" a bcrypt hash — you re-hash and compare
  }
}
