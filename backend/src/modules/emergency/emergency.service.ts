import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SOSEvent, SOSStatus } from './emergency.entity';

@Injectable()
export class EmergencyService {
  constructor(
    @InjectRepository(SOSEvent)
    private readonly sosRepo: Repository<SOSEvent>,
  ) {}

  async triggerSOS(
    userId: string,
    location: { latitude: number; longitude: number; altitude?: number; accuracy?: number; batteryLevel?: number },
    message?: string,
    tripId?: string,
  ): Promise<SOSEvent> {
    const sos = this.sosRepo.create({
      userId,
      tripId,
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude,
      accuracy: location.accuracy,
      batteryLevel: location.batteryLevel,
      message,
      status: SOSStatus.ACTIVE,
    });

    const saved = await this.sosRepo.save(sos);

    // Fire notification handlers - non-blocking
    await Promise.allSettled([
      this.notifyEmergencyContacts(saved),
      this.notifyBasecamp(saved),
      this.notifySAR(saved),
    ]);

    return saved;
  }

  private async notifyEmergencyContacts(sos: SOSEvent): Promise<void> {
    // Placeholder: integrate with NotificationService
    console.log(`[EMERGENCY] Notify contacts for SOS #${sos.id}`);
    sos.notifiedContacts = [
      { name: 'Emergency Contact', phone: '+62xxx', notifiedAt: new Date().toISOString() },
    ];
    sos.notifiedAuthorities = false;
    await this.sosRepo.save(sos);
  }

  private async notifyBasecamp(sos: SOSEvent): Promise<void> {
    console.log(`[EMERGENCY] Notify basecamp for SOS #${sos.id} at [${sos.latitude},${sos.longitude}]`);
  }

  private async notifySAR(sos: SOSEvent): Promise<void> {
    // Placeholder: In production, integrate with BMKG/InaRISK/BASARNAS
    console.log(`[EMERGENCY] Notify SAR authorities for SOS #${sos.id}`);
    sos.notifiedAuthorities = true;
    await this.sosRepo.save(sos);
  }

  async resolveSOS(id: string): Promise<SOSEvent> {
    const sos = await this.sosRepo.findOne({ where: { id } });
    if (!sos) throw new NotFoundException(`SOS #${id} not found`);
    if (sos.status !== SOSStatus.ACTIVE) {
      throw new BadRequestException('SOS event is not active');
    }
    sos.status = SOSStatus.RESOLVED;
    sos.resolvedAt = new Date();
    return this.sosRepo.save(sos);
  }

  async getActiveSOS(): Promise<SOSEvent[]> {
    return this.sosRepo.find({
      where: { status: SOSStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async sendSafeConfirmation(bookingId: string): Promise<void> {
    console.log(`[EMERGENCY] Send safe confirmation for booking #${bookingId}`);
    // Placeholder: Notify emergency contacts that hiker is safe
  }

  // Cron every 5 min: check overdue hikes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkOverdueHikes(): Promise<void> {
    const now = new Date();
    // Find bookings checked in but not checked out, past estimated end + 30min
    // Simplified: we check bookings that checked in more than 14 hours ago (typical day hike)
    const overdueThreshold = new Date(now.getTime() - 14 * 60 * 60 * 1000);

    const overdueBookings = await this.sosRepo
      .createQueryBuilder('s')
      .select('s.tripId')
      .where('EXISTS (SELECT 1 FROM bookings b WHERE b.id = s.tripId AND b.check_in_time IS NOT NULL AND b.check_out_time IS NULL AND b.check_in_time < :threshold)', { threshold: overdueThreshold })
      .getRawMany();

    for (const row of overdueBookings) {
      console.log(`[EMERGENCY] Overdue hike alert for booking #${row.tripId}`);
      // In production: integrate with notification service
    }
  }
}
