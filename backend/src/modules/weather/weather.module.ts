import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { BMKGAdapter } from '../../adapters/bmkg.adapter';
import { InaRiskAdapter } from '../../adapters/inarisk.adapter';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, BMKGAdapter, InaRiskAdapter],
  exports: [WeatherService],
})
export class WeatherModule {}
