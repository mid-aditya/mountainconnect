import {
  Entity,
  Column,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum ItemCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
}

export enum ItemStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  ARCHIVED = 'archived',
}

export enum EscrowStatus {
  PENDING = 'pending',
  RELEASED = 'released',
  DISPUTED = 'disputed',
}

@Entity('marketplace_items')
export class MarketplaceItem extends BaseEntity {
  @Column({ name: 'seller_id' })
  sellerId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: ItemCondition, default: ItemCondition.GOOD })
  condition: ItemCondition;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'is_sold', default: false })
  isSold: boolean;

  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.ACTIVE })
  status: ItemStatus;

  @Column({ name: 'escrow_status', type: 'enum', enum: EscrowStatus, nullable: true })
  escrowStatus: EscrowStatus;

  @Column({ name: 'buyer_id', nullable: true })
  buyerId: string;
}
