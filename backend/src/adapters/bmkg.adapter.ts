import { Injectable } from '@nestjs/common';

interface BMKGWeatherResponse {
  temp: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  condition: string;
  icon: string;
  timestamp: string;
}

interface BMKGEarthquakeAlert {
  id: string;
  magnitude: number;
  depth: number;
  location: string;
  latitude: number;
  longitude: number;
  time: string;
  potential: string;
}

@Injectable()
export class BMKGAdapter {
  private readonly baseUrl = 'https://api.bmkg.go.id/v1';
  private requestCount = 0;
  private readonly rateLimit = 30; // req/min
  private readonly rateWindow = 60 * 1000;

  private async rateLimitedFetch<T>(path: string): Promise<T> {
    this.requestCount++;
    if (this.requestCount > this.rateLimit) {
      await new Promise((r) => setTimeout(r, this.rateWindow));
      this.requestCount = 0;
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`);
      if (!res.ok) throw new Error(`BMKG API error: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('[BMKG] API request failed:', err);
      // Fallback: return standardized empty
      return {} as T;
    }
  }

  async getWeather(lat: number, lng: number): Promise<BMKGWeatherResponse> {
    try {
      const data = await this.rateLimitedFetch<any>(
        `/weather?lat=${lat}&lon=${lng}`,
      );
      return this.standardizeWeather(data);
    } catch {
      return this.fallbackWeather();
    }
  }

  async getForecast(lat: number, lng: number, days: number): Promise<BMKGWeatherResponse[]> {
    try {
      const data = await this.rateLimitedFetch<any>(
        `/forecast?lat=${lat}&lon=${lng}&days=${days}`,
      );
      return Array.isArray(data) ? data.map((d: any) => this.standardizeWeather(d)) : [];
    } catch {
      return [this.fallbackWeather()];
    }
  }

  async getEarthquakeAlerts(): Promise<BMKGEarthquakeAlert[]> {
    try {
      const data = await this.rateLimitedFetch<any>('/earthquake');
      return Array.isArray(data)
        ? data.map((e: any) => this.standardizeEarthquake(e))
        : [];
    } catch {
      return [];
    }
  }

  async getEarlyWarning(): Promise<Array<{ type: string; severity: string; description: string; area: string }>> {
    try {
      const [earthquakes] = await Promise.allSettled([
        this.getEarthquakeAlerts(),
      ]);
      const warnings: Array<{ type: string; severity: string; description: string; area: string }> = [];
      if (earthquakes.status === 'fulfilled' && earthquakes.value.length > 0) {
        for (const eq of earthquakes.value) {
          if (eq.magnitude >= 5.0) {
            warnings.push({
              type: 'earthquake',
              severity: eq.magnitude >= 6.0 ? 'critical' : 'high',
              description: `Gempa M${eq.magnitude} di ${eq.location}`,
              area: eq.location,
            });
          }
        }
      }
      return warnings;
    } catch {
      return [];
    }
  }

  private standardizeWeather(raw: any): BMKGWeatherResponse {
    return {
      temp: raw?.temperature ?? 25,
      humidity: raw?.humidity ?? 70,
      windSpeed: raw?.wind_speed ?? 10,
      windDirection: raw?.wind_direction ?? 'N',
      visibility: raw?.visibility ?? 10000,
      condition: raw?.condition ?? 'clear',
      icon: raw?.icon ?? '01d',
      timestamp: raw?.timestamp ?? new Date().toISOString(),
    };
  }

  private standardizeEarthquake(raw: any): BMKGEarthquakeAlert {
    return {
      id: raw?.id ?? String(Date.now()),
      magnitude: raw?.magnitude ?? 0,
      depth: raw?.depth ?? 0,
      location: raw?.location ?? 'Unknown',
      latitude: raw?.latitude ?? 0,
      longitude: raw?.longitude ?? 0,
      time: raw?.time ?? new Date().toISOString(),
      potential: raw?.potential ?? 'tidak berpotensi tsunami',
    };
  }

  private fallbackWeather(): BMKGWeatherResponse {
    return {
      temp: 25,
      humidity: 70,
      windSpeed: 10,
      windDirection: 'N',
      visibility: 10000,
      condition: 'clear',
      icon: '01d',
      timestamp: new Date().toISOString(),
    };
  }
}
