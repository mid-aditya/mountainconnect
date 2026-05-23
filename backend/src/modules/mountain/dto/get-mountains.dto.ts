import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMountainsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  difficulty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minElevation?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxElevation?: number;
}
