import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Mountain } from './mountain.entity';

@Entity('routes')
export class Route extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  startPoint: string;

  @Column({ nullable: true })
  endPoint: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  distance: number;

  @Column({ type: 'int', default: 5 })
  difficulty: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  duration: number;

  @Column({ type: 'int', nullable: true })
  elevationGain: number;

  @Column({ type: 'json', nullable: true })
  waypoints: Array<{
    name: string;
    lat: number;
    lng: number;
    elevation: number;
    isWaterSource: boolean;
    isRestPost: boolean;
    isDangerZone: boolean;
  }>;

  @ManyToOne(() => Mountain, (mountain) => mountain.routes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mountain_id' })
  mountain: Mountain;

  @Column({ name: 'mountain_id' })
  mountainId: string;
}
