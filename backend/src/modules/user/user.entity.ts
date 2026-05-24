import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum VerificationLevel {
  LEVEL_1_BASIC = 1,
  LEVEL_2_VERIFIED = 2,
  LEVEL_3_FULLY_VERIFIED = 3,
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface MedicalInfo {
  conditions: string[];
  allergies: string[];
  medications: string[];
  bloodType?: string;
  notes?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'int',
    default: VerificationLevel.LEVEL_1_BASIC,
  })
  @Index()
  verificationLevel: VerificationLevel;

  @Column({ type: 'json' })
  roles: string[];

  @Column({ type: 'json', nullable: true })
  emergencyContact: EmergencyContact | null;

  @Column({ type: 'json', nullable: true })
  medicalInfo: MedicalInfo | null;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ type: 'json', nullable: true })
  badges: Badge[];

  @Column({ name: 'ktp_verified', default: false })
  ktpVerified: boolean;

  @Column({ name: 'guide_certified', default: false })
  guideCertified: boolean;

  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date | null;

  @Column({ type: 'json', nullable: true })
  deviceTokens: string[];

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ name: 'social_provider', nullable: true })
  socialProvider: string;

  @Column({ name: 'social_id', nullable: true })
  socialId: string;
}
