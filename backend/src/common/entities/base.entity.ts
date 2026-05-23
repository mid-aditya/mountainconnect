import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  VersionColumn,
} from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp with time zone" })
  updatedAt: Date;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamp with time zone",
    nullable: true,
  })
  deletedAt: Date | null;

  /**
   * Version field for optimistic locking and offline-first conflict resolution.
   * Incremented on each update. Client must send correct version to update.
   */
  @VersionColumn({ type: "int", default: 1 })
  version: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;
}
