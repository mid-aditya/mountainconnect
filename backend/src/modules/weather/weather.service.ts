import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { BMKGAdapter } from "../../adapters/bmkg.adapter";
import { InaRiskAdapter } from "../../adapters/inarisk.adapter";

export interface HazardCheckResult {
  isHazardous: boolean;
  hazards: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
  }>;
  recommendation: "turn_back" | "caution" | "safe";
}

export interface DisasterInfo {
  landslide_risk?: string;
  flood_risk?: string;
  [key: string]: any;
}

@Injectable()
export class WeatherService {
  private readonly CACHE_TTL = 60 * 30; // 30 min
  private readonly redis: Redis;

  constructor(
    private readonly bmkgAdapter: BMKGAdapter,
    private readonly inaRiskAdapter: InaRiskAdapter,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  async getCurrentWeather(params: {
    mountainId?: string;
    lat?: number;
    lng?: number;
  }) {
    const cacheKey = `weather:current:${params.lat}:${params.lng}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const weather = await this.bmkgAdapter.getWeather(params.lat!, params.lng!);
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(weather));
    return weather;
  }

  async getForecast(params: {
    mountainId?: string;
    lat?: number;
    lng?: number;
    days?: number;
  }) {
    const cacheKey = `weather:forecast:${params.lat}:${params.lng}:${params.days || 3}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const forecast = await this.bmkgAdapter.getForecast(
      params.lat!,
      params.lng!,
      params.days || 3,
    );
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(forecast));
    return forecast;
  }

  async checkHazardConditions(
    lat: number,
    lng: number,
  ): Promise<HazardCheckResult> {
    const hazards: HazardCheckResult["hazards"] = [];
    let recommendation: HazardCheckResult["recommendation"] = "safe";

    try {
      const weather = await this.getCurrentWeather({ lat, lng });
      if (weather) {
        if (weather.windSpeed > 50) {
          hazards.push({
            type: "high_wind",
            severity: weather.windSpeed > 80 ? "critical" : "high",
            description: `Kecepatan angin ${weather.windSpeed}km/h, berbahaya untuk pendakian.`,
          });
        }
        if (weather.visibility < 1000) {
          hazards.push({
            type: "low_visibility",
            severity: "medium",
            description: `Visibilitas rendah ${weather.visibility}m, hati-hati di jalur.`,
          });
        }
      }

      const riskInfo: any = await this.inaRiskAdapter.getDisasterInfo(
        lat,
        lng,
        10,
      );
      if (
        riskInfo?.landslide_risk === "high" ||
        riskInfo?.flood_risk === "high"
      ) {
        hazards.push({
          type: riskInfo.landslide_risk === "high" ? "landslide" : "flood",
          severity: "critical",
          description: `Risiko ${riskInfo.landslide_risk === "high" ? "longsor" : "banjir"} tinggi di area ini.`,
        });
      }

      if (hazards.some((h) => h.severity === "critical")) {
        recommendation = "turn_back";
      } else if (hazards.length > 0) {
        recommendation = "caution";
      }
    } catch (error) {
      console.error("[Weather] Hazard check error:", error);
      recommendation = "caution";
    }

    return { isHazardous: hazards.length > 0, hazards, recommendation };
  }

  async getAlertsForArea(lat: number, lng: number, radiusKm: number) {
    const cacheKey = `weather:alerts:${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [weatherAlerts, disasterAlerts] = await Promise.allSettled([
      this.bmkgAdapter.getEarlyWarning().catch(() => []),
      this.inaRiskAdapter.getDisasterInfo(lat, lng, radiusKm).catch(() => null),
    ]);

    const alerts: any[] = [];
    if (weatherAlerts.status === "fulfilled") {
      alerts.push(...(weatherAlerts.value || []));
    }
    if (disasterAlerts.status === "fulfilled" && disasterAlerts.value) {
      alerts.push(disasterAlerts.value);
    }

    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(alerts));
    return alerts;
  }
}
