import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Trip } from './trip.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum PaymentMethod {
  TRANSFER = 'transfer',
  VIRTUAL_ACCOUNT = 'virtual_account',
  CREDIT_CARD = 'credit_card',
  E_WALLET = 'e_wallet',
  CONVENIENCE_STORE = 'convenience_store',
}

@Entity('bookings')
export class Booking extends BaseEntity {
  @Column({ name: 'trip_id' })
  tripId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: 1 })
  participants: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  specialRequests: string;

  @Column({ name: 'check_in_time', type: 'datetime', nullable: true })
  checkInTime: Date;

  @Column({ name: 'check_out_time', type: 'datetime', nullable: true })
  checkOutTime: Date;

  @Column({ name: 'is_late_checkout', default: false })
  isLateCheckout: boolean;

  @Column({ name: 'late_checkout_alert_sent', default: false })
  lateCheckoutAlertSent: boolean;

  @ManyToOne(() => Trip, (trip) => trip.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;
}
