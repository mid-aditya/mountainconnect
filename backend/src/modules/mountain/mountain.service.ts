import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mountain } from './mountain.entity';
import { Route } from './route.entity';
import { GetMountainsDto } from './dto/get-mountains.dto';
import { NearbyDto } from './dto/nearby.dto';
import { RecommendationsDto } from './dto/recommendations.dto';

@Injectable()
export class MountainService {
  constructor(
    @InjectRepository(Mountain)
    private readonly mountainRepo: Repository<Mountain>,
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
  ) {}

  async findAll(filters: GetMountainsDto): Promise<Mountain[]> {
    const qb = this.mountainRepo.createQueryBuilder('m').where('m.isActive = :active', { active: true });

    if (filters.region) {
      qb.andWhere('m.region ILIKE :region', { region: `%${filters.region}%` });
    }
    if (filters.difficulty) {
      qb.andWhere('m.difficultyLevel = :diff', { diff: filters.difficulty });
    }
    if (filters.minElevation) {
      qb.andWhere('m.elevation >= :minElev', { minElev: filters.minElevation });
    }
    if (filters.maxElevation) {
      qb.andWhere('m.elevation <= :maxElev', { maxElev: filters.maxElevation });
    }
    if (filters.province) {
      qb.andWhere('m.province ILIKE :province', { province: `%${filters.province}%` });
    }
    if (filters.search) {
      qb.andWhere('m.name ILIKE :search', { search: `%${filters.search}%` });
    }

    return qb.leftJoinAndSelect('m.routes', 'r').getMany();
  }

  async findById(id: string): Promise<Mountain> {
    const mountain = await this.mountainRepo.findOne({
      where: { id, isActive: true },
      relations: ['routes'],
    });
    if (!mountain) throw new NotFoundException(`Mountain #${id} not found`);
    return mountain;
  }

  async findByName(name: string): Promise<Mountain | null> {
    return this.mountainRepo.findOne({
      where: { name, isActive: true },
      relations: ['routes'],
    });
  }

  async getRoutes(mountainId: string): Promise<Route[]> {
    const mountain = await this.mountainRepo.findOne({
      where: { id: mountainId, isActive: true },
    });
    if (!mountain) throw new NotFoundException(`Mountain #${mountainId} not found`);

    return this.routeRepo.find({
      where: { mountainId, isActive: true },
      order: { difficulty: 'ASC' },
    });
  }

  async getNearby(dto: NearbyDto): Promise<Mountain[]> {
    const { lat, lng, radiusKm = 50 } = dto;
    // ~111km per degree lat, ~111*cos(lat) per degree lng
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    return this.mountainRepo
      .createQueryBuilder('m')
      .where('m.isActive = :active', { active: true })
      .andWhere('m.latitude BETWEEN :minLat AND :maxLat', {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
      })
      .andWhere('m.longitude BETWEEN :minLng AND :maxLng', {
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta,
      })
      .orderBy(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(m.latitude))))`,
        'ASC',
      )
      .setParameters({ lat, lng })
      .take(20)
      .getMany();
  }

  getDifficultyScale(): Array<{ level: number; label: string; description: string }> {
    return [
      { level: 1, label: 'Sangat Mudah', description: 'Jalur pendek, landai, cocok untuk pemula' },
      { level: 2, label: 'Mudah', description: 'Jalur jelas, sedikit tanjakan' },
      { level: 3, label: 'Cukup Mudah', description: 'Trek sedang, butuh kebugaran dasar' },
      { level: 4, label: 'Sedang', description: 'Tanjakan teratur, butuh persiapan' },
      { level: 5, label: 'Cukup Berat', description: 'Medan bervariasi, jam trekking panjang' },
      { level: 6, label: 'Berat', description: 'Tanjakan curam, medan teknis ringan' },
      { level: 7, label: 'Sangat Berat', description: 'Medan terjal, butuh pengalaman' },
      { level: 8, label: 'Ekstrem', description: 'Scrambling, eksposur tinggi' },
      { level: 9, label: 'Sangat Ekstrem', description: 'Butuh teknik panjat tebing dasar' },
      { level: 10, label: 'Ultimate', description: 'Ekspedisi multi-hari, medan sangat berbahaya' },
    ];
  }

  async getRecommended(dto: RecommendationsDto): Promise<Mountain[]> {
    const { userLevel, preferences } = dto;

    const levelMin = Math.max(1, userLevel - 2);
    const levelMax = Math.min(10, userLevel + 1);

    const qb = this.mountainRepo
      .createQueryBuilder('m')
      .where('m.isActive = :active', { active: true })
      .andWhere('m.difficultyLevel BETWEEN :min AND :max', { min: levelMin, max: levelMax });

    if (preferences?.regions?.length) {
      qb.andWhere('m.region IN (:...regions)', { regions: preferences.regions });
    }
    if (preferences?.maxElevation) {
      qb.andWhere('m.elevation <= :maxElev', { maxElev: preferences.maxElevation });
    }
    if (preferences?.maxDuration) {
      qb.andWhere('m.estimatedDuration <= :maxDur OR m.estimatedDuration IS NULL', {
        maxDur: preferences.maxDuration,
      });
    }

    return qb.leftJoinAndSelect('m.routes', 'r').orderBy('m.difficultyLevel', 'ASC').take(10).getMany();
  }

  // Offline-sync: package data for client-side cache
  async getOfflineSyncData(): Promise<{ mountains: Mountain[]; timestamp: Date }> {
    const mountains = await this.mountainRepo.find({
      where: { isActive: true },
      relations: ['routes'],
    });
    return { mountains, timestamp: new Date() };
  }
}
