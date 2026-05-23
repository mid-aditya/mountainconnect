import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Booking } from "./booking.entity";

export enum TripType {
  OPEN_TRIP = "open_trip",
  PRIVATE = "private",
}

export enum TripStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

@Entity("trips")
export class Trip extends BaseEntity {
  @Column()
  title: string;

  @Column({ name: "mountain_id" })
  mountainId: string;

  @Column({ name: "operator_id" })
  operatorId: string;

  @Column({ type: "enum", enum: TripType, default: TripType.OPEN_TRIP })
  type: TripType;

  @Column({ name: "max_participants" })
  maxParticipants: number;

  @Column({ name: "current_participants", default: 0 })
  currentParticipants: number;

  @Column({ name: "start_date", type: "date" })
  startDate: Date;

  @Column({ name: "end_date", type: "date" })
  endDate: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "int", default: 5 })
  difficulty: number;

  @Column({ type: "jsonb", nullable: true })
  includes: any;

  @Column({ type: "jsonb", nullable: true })
  itinerary: Array<{
    day: number;
    activities: string;
    overnight?: string;
  }>;

  @Column({ type: "enum", enum: TripStatus, default: TripStatus.DRAFT })
  status: TripStatus;

  @Column({ type: "text", nullable: true })
  cancellationPolicy: string;

  @OneToMany(() => Booking, (booking) => booking.trip, { cascade: true })
  bookings: Booking[];
}
