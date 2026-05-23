import { Controller, Get, Param, Query } from '@nestjs/common';
import { MountainService } from './mountain.service';
import { GetMountainsDto } from './dto/get-mountains.dto';
import { NearbyDto } from './dto/nearby.dto';
import { RecommendationsDto } from './dto/recommendations.dto';

@Controller('mountains')
export class MountainController {
  constructor(private readonly mountainService: MountainService) {}

  @Get()
  async findAll(@Query() filters: GetMountainsDto) {
    return this.mountainService.findAll(filters);
  }

  @Get('nearby')
  async getNearby(@Query() dto: NearbyDto) {
    return this.mountainService.getNearby(dto);
  }

  @Get('recommendations')
  async getRecommendations(@Query() dto: RecommendationsDto) {
    return this.mountainService.getRecommended(dto);
  }

  @Get('difficulty-scale')
  getDifficultyScale() {
    return this.mountainService.getDifficultyScale();
  }

  @Get('offline-sync')
  getOfflineSyncData() {
    return this.mountainService.getOfflineSyncData();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.mountainService.findById(id);
  }

  @Get(':id/routes')
  async getRoutes(@Param('id') id: string) {
    return this.mountainService.getRoutes(id);
  }
}
