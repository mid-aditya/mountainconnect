import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  async getCurrentWeather(
    @Query('mountainId') mountainId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    return this.weatherService.getCurrentWeather({
      mountainId,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
    });
  }

  @Get('forecast')
  async getForecast(
    @Query('mountainId') mountainId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('days') days: string,
  ) {
    return this.weatherService.getForecast({
      mountainId,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      days: days ? parseInt(days, 10) : 3,
    });
  }

  @Get('hazards')
  async checkHazardConditions(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    return this.weatherService.checkHazardConditions(parseFloat(lat), parseFloat(lng));
  }

  @Get('alerts')
  async getAlerts(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    return this.weatherService.getAlertsForArea(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 10,
    );
  }
}
