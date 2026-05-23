import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { BookingController } from './booking.controller';
import { Trip } from './trip.entity';
import { Booking } from './booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Booking])],
  controllers: [TripController, BookingController],
  providers: [TripService],
  exports: [TripService],
})
export class TripModule {}
