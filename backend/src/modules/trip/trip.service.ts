import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull } from "typeorm";
import { Trip, TripStatus } from "./trip.entity";
import { Booking, BookingStatus } from "./booking.entity";

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async findAll(filters?: any): Promise<Trip[]> {
    const qb = this.tripRepo.createQueryBuilder("t");
    if (filters?.mountainId)
      qb.andWhere("t.mountainId = :mountainId", {
        mountainId: filters.mountainId,
      });
    if (filters?.type) qb.andWhere("t.type = :type", { type: filters.type });
    if (filters?.minPrice)
      qb.andWhere("t.price >= :minPrice", { minPrice: filters.minPrice });
    if (filters?.maxPrice)
      qb.andWhere("t.price <= :maxPrice", { maxPrice: filters.maxPrice });
    if (filters?.startDate)
      qb.andWhere("t.startDate >= :startDate", {
        startDate: filters.startDate,
      });
    if (filters?.endDate)
      qb.andWhere("t.endDate <= :endDate", { endDate: filters.endDate });
    return qb.orderBy("t.startDate", "ASC").getMany();
  }

  async findAvailable(
    date?: Date,
    mountainId?: string,
    filters?: any,
  ): Promise<Trip[]> {
    const qb = this.tripRepo
      .createQueryBuilder("t")
      .where("t.status = :status", { status: TripStatus.PUBLISHED })
      .andWhere("t.currentParticipants < t.maxParticipants");
    if (date) qb.andWhere("t.startDate >= :date", { date });
    if (mountainId) qb.andWhere("t.mountainId = :mountainId", { mountainId });
    if (filters?.type) qb.andWhere("t.type = :type", { type: filters.type });
    return qb.getMany();
  }

  async findById(id: string): Promise<Trip> {
    const trip = await this.tripRepo.findOne({
      where: { id },
      relations: ["bookings"],
    });
    if (!trip) throw new NotFoundException(`Trip #${id} not found`);
    return trip as any as Trip;
  }

  async createTrip(dto: any): Promise<Trip> {
    const trip = this.tripRepo.create(dto);
    return (await this.tripRepo.save(trip)) as any as Trip;
  }

  async updateTrip(id: string, dto: any): Promise<Trip> {
    const trip = await this.findById(id);
    Object.assign(trip, dto);
    return (await this.tripRepo.save(trip)) as any as Trip;
  }

  async deleteTrip(id: string): Promise<void> {
    const trip = await this.findById(id);
    trip.isActive = false;
    await this.tripRepo.save(trip);
  }

  async cancelTrip(id: string): Promise<void> {
    await this.tripRepo.update(id, { status: TripStatus.CANCELLED });
  }

  async createBooking(
    tripId: string,
    userId: string,
    dto: any,
  ): Promise<Booking> {
    const trip = await this.findById(tripId);
    if (trip.currentParticipants >= trip.maxParticipants) {
      throw new BadRequestException("Trip is fully booked");
    }
    const booking = this.bookingRepo.create({
      ...dto,
      tripId,
      userId,
      status: BookingStatus.PENDING,
      paymentStatus: "pending",
    });
    const saved = await this.bookingRepo.save(booking);
    await this.tripRepo.update(tripId, {
      currentParticipants: trip.currentParticipants + (dto.participants || 1),
    });
    return saved as any as Booking;
  }

  async getMyBookings(userId: string): Promise<any[]> {
    return this.bookingRepo.find({
      where: { userId },
      relations: ["trip"],
      order: { createdAt: "DESC" },
    });
  }

  async cancelBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id, userId },
      relations: ["trip"],
    });
    if (!booking) throw new NotFoundException("Booking not found");
    booking.status = BookingStatus.CANCELLED;
    await this.tripRepo.update(booking.tripId, {
      currentParticipants:
        (await this.findById(booking.tripId)).currentParticipants -
        booking.participants,
    });
    return (await this.bookingRepo.save(booking)) as any as Booking;
  }

  async checkIn(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id, userId } });
    if (!booking) throw new NotFoundException("Booking not found");
    booking.checkInTime = new Date();
    booking.status = BookingStatus.CONFIRMED;
    return (await this.bookingRepo.save(booking)) as any as Booking;
  }

  async checkOut(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id, userId } });
    if (!booking) throw new NotFoundException("Booking not found");
    booking.checkOutTime = new Date();
    booking.status = BookingStatus.COMPLETED;
    return (await this.bookingRepo.save(booking)) as any as Booking;
  }

  async checkLateCheckouts(): Promise<void> {
    const overdues = await this.bookingRepo.find({
      where: {
        checkInTime: Not(IsNull()),
        checkOutTime: IsNull(),
        status: Not(BookingStatus.CANCELLED),
        lateCheckoutAlertSent: false,
      },
    });
    for (const booking of overdues) {
      booking.isLateCheckout = true;
      booking.lateCheckoutAlertSent = true;
      await this.bookingRepo.save(booking);
      console.log(`[TripService] Late checkout alert: Booking #${booking.id}`);
    }
  }
}
