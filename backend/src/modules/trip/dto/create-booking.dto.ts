import { IsString, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { PaymentMethod } from '../booking.entity';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  participants: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
