import {
  Entity,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum SOSStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm',
}

@Entity('sos_events')
export class SOSEvent extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'trip_id', nullable: true })
  tripId: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', precision: 7, scale: 1, nullable: true })
  altitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  accuracy: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  batteryLevel: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'enum', enum: SOSStatus, default: SOSStatus.ACTIVE })
  status: SOSStatus;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'json', nullable: true })
  notifiedContacts: Array<{ name: string; phone: string; notifiedAt: string }>;

  @Column({ name: 'notified_authorities', default: false })
  notifiedAuthorities: boolean;
}
