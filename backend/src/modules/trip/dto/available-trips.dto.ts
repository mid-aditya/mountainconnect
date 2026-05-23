import { IsOptional, IsString, IsInt, IsNumber, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TripType } from '../trip.entity';

export class AvailableTripsDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  mountainId?: string;

  @IsOptional()
  @IsEnum(TripType)
  type?: TripType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  difficulty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  participants?: number;
}
