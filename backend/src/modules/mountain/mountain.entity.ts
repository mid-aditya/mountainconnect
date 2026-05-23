import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Route } from './route.entity';

@Entity('mountains')
export class Mountain extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  region: string;

  @Column()
  province: string;

  @Column({ type: 'decimal', precision: 7, scale: 1 })
  elevation: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'int', default: 5 })
  difficultyLevel: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  estimatedDuration: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  permits: {
    required: boolean;
    prices?: { local: number; foreign: number };
    url?: string;
  };

  @Column({ type: 'text', nullable: true })
  rules: string;

  @Column({ type: 'jsonb', nullable: true })
  weatherInfo: {
    avgTemp?: number;
    rainyDays?: number;
    bestSeason?: string;
    humidity?: number;
  };

  @OneToMany(() => Route, (route) => route.mountain, { cascade: true })
  routes: Route[];
}
