import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { SOSEvent } from './emergency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SOSEvent]),
    ScheduleModule.forRoot(),
  ],
  controllers: [EmergencyController],
  providers: [EmergencyService],
  exports: [EmergencyService],
})
export class EmergencyModule {}
