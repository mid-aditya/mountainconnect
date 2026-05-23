import { IsOptional, IsString, IsInt, IsNumber, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TripStatus, TripType } from '../trip.entity';

export class QueryTripsDto {
  @IsOptional()
  @IsString()
  mountainId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TripType)
  type?: TripType;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

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
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
