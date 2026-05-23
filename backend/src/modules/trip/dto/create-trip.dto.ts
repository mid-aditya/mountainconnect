import { IsString, IsOptional, IsInt, IsNumber, IsDateString, IsEnum, IsArray, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TripType } from '../trip.entity';

class ItineraryItem {
  @IsInt()
  day: number;

  @IsString()
  activities: string;

  @IsOptional()
  @IsString()
  overnight?: string;
}

export class CreateTripDto {
  @IsString()
  title: string;

  @IsString()
  mountainId: string;

  @IsString()
  operatorId: string;

  @IsOptional()
  @IsEnum(TripType)
  type?: TripType;

  @IsInt()
  @Min(1)
  maxParticipants: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  difficulty?: number;

  @IsOptional()
  @IsArray()
  includes?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryItem)
  itinerary?: ItineraryItem[];

  @IsOptional()
  @IsString()
  cancellationPolicy?: string;
}
