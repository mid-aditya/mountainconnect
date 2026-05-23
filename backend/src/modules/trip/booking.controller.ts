import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  Headers,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller()
export class BookingController {
  constructor(private readonly tripService: TripService) {}

  @Post('trips/:tripId/booking')
  async createBooking(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.tripService.createBooking(tripId, userId, dto);
  }

  @Get('bookings/my')
  async getMyBookings(@Headers('x-user-id') userId: string) {
    return this.tripService.getMyBookings(userId);
  }

  @Patch('bookings/:id/cancel')
  async cancelBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tripService.cancelBooking(id, userId);
  }

  @Post('bookings/:id/check-in')
  async checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tripService.checkIn(id, userId);
  }

  @Post('bookings/:id/check-out')
  async checkOut(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tripService.checkOut(id, userId);
  }
}
