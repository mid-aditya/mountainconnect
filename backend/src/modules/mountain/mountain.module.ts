import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MountainController } from './mountain.controller';
import { MountainService } from './mountain.service';
import { Mountain } from './mountain.entity';
import { Route } from './route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mountain, Route])],
  controllers: [MountainController],
  providers: [MountainService],
  exports: [MountainService],
})
export class MountainModule {}
