import { Controller, Post, Get, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { EmergencyService } from './emergency.service';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('sos')
  async triggerSOS(
    @Body() body: {
      userId: string;
      latitude: number;
      longitude: number;
      altitude?: number;
      accuracy?: number;
      batteryLevel?: number;
      message?: string;
      tripId?: string;
    },
  ) {
    return this.emergencyService.triggerSOS(
      body.userId,
      {
        latitude: body.latitude,
        longitude: body.longitude,
        altitude: body.altitude,
        accuracy: body.accuracy,
        batteryLevel: body.batteryLevel,
      },
      body.message,
      body.tripId,
    );
  }

  @Post('sos/:id/resolve')
  async resolveSOS(@Param('id', ParseUUIDPipe) id: string) {
    return this.emergencyService.resolveSOS(id);
  }

  @Get('sos/active')
  async getActiveSOS() {
    return this.emergencyService.getActiveSOS();
  }

  @Get('hike/:bookingId/overdue-check')
  async checkOverdueHike(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    await this.emergencyService.sendSafeConfirmation(bookingId);
    return { message: 'Overdue check initiated' };
  }
}
