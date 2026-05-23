import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BMKGAdapter } from "../adapters/bmkg.adapter";

interface ActiveTripLocation {
  tripId: string;
  lat: number;
  lng: number;
}

@Injectable()
export class WeatherPollingWorker {
  private readonly logger = new Logger(WeatherPollingWorker.name);
  private activeLocations: ActiveTripLocation[] = [];

  constructor(private readonly bmkgAdapter: BMKGAdapter) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async pollWeatherForActiveTrips(): Promise<void> {
    this.activeLocations = this.getActiveTripLocations();
    if (this.activeLocations.length === 0) return;

    this.logger.log(
      `[Worker:weather-polling] Polling weather for ${this.activeLocations.length} locations`,
    );

    for (const loc of this.activeLocations) {
      try {
        const weather = await this.bmkgAdapter.getWeather(loc.lat, loc.lng);
        const forecast = await this.bmkgAdapter.getForecast(
          loc.lat,
          loc.lng,
          1,
        );

        const isHazardous = this.checkHazardous(weather, forecast);
        if (isHazardous) {
          this.logger.warn(
            `[Worker] Hazardous weather for trip #${loc.tripId}`,
          );
        }
      } catch (err) {
        this.logger.error(
          `[Worker] Weather polling failed for ${loc.tripId}:`,
          err,
        );
      }
    }
  }

  private getActiveTripLocations(): ActiveTripLocation[] {
    return [
      { tripId: "trip-1", lat: -6.2088, lng: 106.8456 },
      { tripId: "trip-2", lat: -7.5361, lng: 110.4453 },
      { tripId: "trip-3", lat: -8.3405, lng: 115.092 },
    ];
  }

  private checkHazardous(weather: any, forecast: any[]): boolean {
    if (!weather) return false;
    return weather.windSpeed > 60 || weather.visibility < 500;
  }
}
