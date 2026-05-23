import { Injectable } from '@nestjs/common';

export interface DisasterInfo {
  landslide_risk: 'low' | 'medium' | 'high';
  flood_risk: 'low' | 'medium' | 'high';
  earthquake_risk: 'low' | 'medium' | 'high';
  volcanic_risk: 'low' | 'medium' | 'high';
  tsunami_risk: 'low' | 'medium' | 'high';
  forest_fire_risk: 'low' | 'medium' | 'high';
}

export interface RiskMapData {
  areaId: string;
  areaName: string;
  disasterType: string;
  riskLevel: string;
  boundaries: Array<{ lat: number; lng: number }>;
}

@Injectable()
export class InaRiskAdapter {
  private readonly baseUrl = 'https://inarisk.bnpb.go.id/api/v1';

  private async fetchWithFallback<T>(path: string, fallback: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`);
      if (!res.ok) throw new Error(`InaRISK API error: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('[InaRISK] API request failed:', err);
      return fallback;
    }
  }

  async getDisasterInfo(lat: number, lng: number, radiusKm: number): Promise<DisasterInfo> {
    // Placeholder: In production, fetch from InaRISK API
    const fallback: DisasterInfo = {
      landslide_risk: 'low',
      flood_risk: 'low',
      earthquake_risk: 'medium',
      volcanic_risk: 'low',
      tsunami_risk: 'low',
      forest_fire_risk: 'low',
    };

    return this.fetchWithFallback<DisasterInfo>(
      `/disaster?lat=${lat}&lng=${lng}&radius=${radiusKm}`,
      fallback,
    );
  }

  async getRiskMap(areaId: string): Promise<RiskMapData[]> {
    const fallback: RiskMapData[] = [];
    return this.fetchWithFallback<RiskMapData[]>(`/riskmap/${areaId}`, fallback);
  }
}
