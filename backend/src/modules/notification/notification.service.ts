import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification, NotificationChannel } from "./notification.entity";
import { SMSAdapter } from "../../adapters/sms.adapter";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly smsAdapter: SMSAdapter,
  ) {}

  async sendPush(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    const notif = this.notificationRepo.create({
      userId,
      type: NotificationChannel.PUSH,
      channel: NotificationChannel.PUSH,
      title,
      body,
      data: data || {},
    });
    await this.notificationRepo.save(notif);
  }

  async sendSMS(phone: string, message: string): Promise<void> {
    await this.smsAdapter.sendSMS(phone, message);
  }

  async sendEmail(email: string, subject: string, body: string): Promise<void> {
    const notif = this.notificationRepo.create({
      userId: "",
      type: NotificationChannel.EMAIL,
      channel: NotificationChannel.EMAIL,
      title: subject,
      body,
      data: { email },
    });
    await this.notificationRepo.save(notif);
  }

  async broadcastToTrip(
    tripId: string,
    title: string,
    body: string,
  ): Promise<void> {
    console.log(`[Notification] Broadcast to trip ${tripId}: ${title}`);
  }

  async sendEmergencyAlert(
    emergencyContact: any,
    location: any,
    userInfo: any,
  ): Promise<void> {
    const message = `EMERGENCY: ${userInfo.fullName} SOS at ${location.lat},${location.lng}`;
    await this.sendSMS(emergencyContact.phone, message);
  }

  async notifyOverdueHike(
    bookingId: string,
    emergencyContacts: any[],
  ): Promise<void> {
    for (const contact of emergencyContacts) {
      const message = `OVERDUE ALERT: Hike #${bookingId} exceeded ETA. Check safety.`;
      await this.sendSMS(contact.phone, message);
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepo.update(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }
}
