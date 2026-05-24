import { Entity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum NotificationChannel {
  PUSH = "push",
  SMS = "sms",
  EMAIL = "email",
  IN_APP = "in_app",
}

@Entity("notifications")
export class Notification {
  @Column({ primary: true, generated: "uuid" })
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({
    type: "enum",
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @Column({ nullable: true })
  type: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  body: string;

  @Column({ type: "json", nullable: true })
  data: Record<string, any>;

  @Column({ name: "is_read", default: false })
  isRead: boolean;

  @Column({ name: "read_at", type: "timestamp with time zone", nullable: true })
  readAt: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp with time zone" })
  updatedAt: Date;
}
