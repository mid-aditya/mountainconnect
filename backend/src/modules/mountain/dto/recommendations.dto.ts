import { IsInt, IsOptional, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class RecommendationsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  userLevel: number;

  @IsOptional()
  preferences?: {
    regions?: string[];
    maxElevation?: number;
    maxDuration?: number;
    maxPrice?: number;
  };
}
