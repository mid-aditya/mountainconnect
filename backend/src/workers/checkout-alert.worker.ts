import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, IsNull } from "typeorm";
import { Booking } from "../modules/trip/booking.entity";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class CheckoutAlertWorker {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  @Cron("*/5 * * * *")
  async checkOverdueBookings(): Promise<void> {
    console.log("[Worker:checkout-alert] Checking overdue bookings");

    const threshold = new Date(Date.now() - 30 * 60 * 1000);
    const overdues = await this.bookingRepo.find({
      where: {
        isLateCheckout: false,
        lateCheckoutAlertSent: false,
        checkInTime: LessThan(threshold),
        checkOutTime: IsNull(),
      },
    });

    for (const booking of overdues) {
      try {
        booking.isLateCheckout = true;
        booking.lateCheckoutAlertSent = true;
        await this.bookingRepo.save(booking);
        console.log(`[Worker] Overdue checkout: Booking #${booking.id}`);
      } catch (err) {
        console.error(
          `[Worker] Failed processing booking #${booking.id}:`,
          err,
        );
      }
    }

    console.log(`[Worker] Checked ${overdues.length} overdue bookings`);
  }
}
