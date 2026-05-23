import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation, { GeoPosition, GeoError } from '@react-native-community/geolocation';
import BackgroundGeolocation from 'react-native-background-geolocation';
import RNFS from 'react-native-fs';
import { store } from '../store';
import { updateLocation, type Location } from '../store/slices/emergencySlice';
import { compressionService } from '../utils/compression';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface TrackingConfig {
  activeInterval: number; // seconds
  idleInterval: number; // seconds
  distanceFilter: number; // meters
  stationaryRadius: number; // meters
  desiredAccuracy: 'HIGH' | 'MEDIUM' | 'LOW';
  pausesLocationUpdates: boolean;
}

export interface BreadcrumbPoint {
  location: Location;
  speed: number;
  distanceFromLast: number;
}

const DEFAULT_CONFIG: TrackingConfig = {
  activeInterval: 60,
  idleInterval: 300,
  distanceFilter: 10,
  stationaryRadius: 50,
  desiredAccuracy: 'HIGH',
  pausesLocationUpdates: false,
};

class LocationService {
  private isTracking = false;
  private watchId: number | null = null;
  private config: TrackingConfig = DEFAULT_CONFIG;
  private lastBreadcrumb: BreadcrumbPoint | null = null;
  private onLocationUpdate: ((location: Location) => void) | null = null;
  private breadcrumbTrail: Location[] = [];
  private backgroundGeoConfigured = false;

  // ── Permission Handling ───────────────────────────────────────────────────────
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('always');
      return status === 'granted';
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        ]);

        const fineLocation = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
        const coarseLocation = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];
        const backgroundLocation = granted[PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION];

        return (
          fineLocation === PermissionsAndroid.RESULTS.GRANTED ||
          coarseLocation === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.error('[Location] Permission request failed:', err);
        return false;
      }
    }

    return false;
  }

  async checkPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 5000 },
      );
    });
  }

  // ── Get Current Position ──────────────────────────────────────────────────────
  getCurrentPosition(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude ?? undefined,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed ?? undefined,
            heading: position.coords.heading ?? undefined,
          };
          resolve(location);
        },
        (error: GeoError) => {
          console.error('[Location] getCurrentPosition error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  // ── Watch Position ────────────────────────────────────────────────────────────
  watchPosition(callback: (location: Location) => void): number {
    this.onLocationUpdate = callback;

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
    }

    this.watchId = Geolocation.watchPosition(
      (position: GeoPosition) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude ?? undefined,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed ?? undefined,
          heading: position.coords.heading ?? undefined,
        };

        // Update Redux
        store.dispatch(updateLocation(location));

        // Add to breadcrumb trail
        this.addToBreadcrumbTrail(location);

        // Notify callback
        this.onLocationUpdate?.(location);
      },
      (error: GeoError) => {
        console.error('[Location] watchPosition error:', error);
      },
      {
        enableHighAccuracy: this.config.desiredAccuracy === 'HIGH',
        distanceFilter: this.config.distanceFilter,
        interval: this.config.activeInterval * 1000,
        fastestInterval: (this.config.activeInterval / 2) * 1000,
      },
    );

    return this.watchId;
  }

  // ── Start Tracking ────────────────────────────────────────────────────────────
  async startTracking(config?: Partial<TrackingConfig>): Promise<void> {
    if (this.isTracking) {
      console.warn('[Location] Already tracking');
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Izin Lokasi',
        'MountainConnect butuh akses lokasi untuk tracking pendakian Anda.',
        [{ text: 'OK' }],
      );
      return;
    }

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isTracking = true;
    this.breadcrumbTrail = [];

    // Use background geolocation for better reliability
    await this.configureBackgroundGeo();

    console.log('[Location] Tracking started with config:', this.config);
  }

  private async configureBackgroundGeo(): Promise<void> {
    if (this.backgroundGeoConfigured) return;

    try {
      await BackgroundGeolocation.ready({
        locationTemplate: '{"lat":<%= latitude %>,"lng":<%= longitude %>,"alt":<%= altitude %>,"spd":<%= speed %>,"hd":<%= heading %>,"ts":<%= timestamp %>}',
        geofenceTemplate: '{"id":"<%= geofence_identifier %>","act":<%= geofence_action %>}',
        reset: false,
        autoSync: false,
        debug: __DEV__,
        logLevel: __DEV__ ? BackgroundGeolocation.LOG_LEVEL_VERBOSE : BackgroundGeolocation.LOG_LEVEL_ERROR,
      });

      this.backgroundGeoConfigured = true;
    } catch (error) {
      console.warn('[Location] BackgroundGeolocation setup failed, falling back to standard:', error);
    }
  }

  // ── Stop Tracking ────────────────────────────────────────────────────────────
  stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    BackgroundGeolocation.stop();

    this.isTracking = false;
    console.log('[Location] Tracking stopped');
  }

  // ── Breadcrumb Trail ─────────────────────────────────────────────────────────
  private addToBreadcrumbTrail(location: Location): void {
    const lastPoint = this.breadcrumbTrail[this.breadcrumbTrail.length - 1];

    // Add if first point or moved significantly
    if (!lastPoint) {
      this.breadcrumbTrail.push(location);
    } else {
      const distance = this.calculateDistance(
        lastPoint.latitude,
        lastPoint.longitude,
        location.latitude,
        location.longitude,
      );
      const timeDiff = location.timestamp - lastPoint.timestamp;

      // Add if moved > 10m or 10s passed
      if (distance > 10 || timeDiff > 10000) {
        this.breadcrumbTrail.push(location);

        // Keep last 1000 points
        if (this.breadcrumbTrail.length > 1000) {
          this.breadcrumbTrail.splice(0, this.breadcrumbTrail.length - 1000);
        }
      }
    }

    // Persist to storage periodically
    if (this.breadcrumbTrail.length % 50 === 0) {
      this.persistBreadcrumbTrail();
    }
  }

  private async persistBreadcrumbTrail(): Promise<void> {
    try {
      const compressed = await compressionService.compressLocationBatch(this.breadcrumbTrail);
      await RNFS.writeFile(
        `${RNFS.DocumentDirectoryPath}/breadcrumb_trail.json`,
        JSON.stringify({ trail: compressed, updatedAt: Date.now() }),
        'utf8',
      );
    } catch (error) {
      console.error('[Location] Failed to persist breadcrumb trail:', error);
    }
  }

  async loadBreadcrumbTrail(): Promise<Location[]> {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/breadcrumb_trail.json`;
      const exists = await RNFS.exists(filePath);
      if (!exists) return [];

      const data = await RNFS.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.trail || [];
    } catch (error) {
      console.error('[Location] Failed to load breadcrumb trail:', error);
      return [];
    }
  }

  // ── Export GPX/KML ────────────────────────────────────────────────────────────
  async exportAsGPX(mountainName: string): Promise<string> {
    const trail = this.breadcrumbTrail;
    if (trail.length === 0) {
      throw new Error('No tracking data to export');
    }

    const startTime = new Date(trail[0].timestamp).toISOString();
    const endTime = new Date(trail[trail.length - 1].timestamp).toISOString();

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MountainConnect"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${mountainName}</name>
    <time>${startTime}</time>
  </metadata>
  <trk>
    <name>${mountainName}</name>
    <trkseg>
${trail
  .map(
    (point) => `      <trkpt lat="${point.latitude}" lon="${point.longitude}">
        <ele>${point.altitude ?? 0}</ele>
        <time>${new Date(point.timestamp).toISOString()}</time>
      </trkpt>`,
  )
  .join('\n')}
    </trkseg>
  </trk>
</gpx>`;

    const fileName = `${mountainName.replace(/\s+/g, '_')}_${Date.now()}.gpx`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, gpx, 'utf8');

    return filePath;
  }

  async exportAsKML(mountainName: string): Promise<string> {
    const trail = this.breadcrumbTrail;
    if (trail.length === 0) {
      throw new Error('No tracking data to export');
    }

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${mountainName}</name>
    <Placemark>
      <name>Track</name>
      <LineString>
        <coordinates>
${trail.map((point) => `${point.longitude},${point.latitude},${point.altitude ?? 0}`).join('\n')}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

    const fileName = `${mountainName.replace(/\s+/g, '_')}_${Date.now()}.kml`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, kml, 'utf8');

    return filePath;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────
  getBreadcrumbTrail(): Location[] {
    return [...this.breadcrumbTrail];
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  getTotalDistance(): number {
    let total = 0;
    for (let i = 1; i < this.breadcrumbTrail.length; i++) {
      total += this.calculateDistance(
        this.breadcrumbTrail[i - 1].latitude,
        this.breadcrumbTrail[i - 1].longitude,
        this.breadcrumbTrail[i].latitude,
        this.breadcrumbTrail[i].longitude,
      );
    }
    return total;
  }
}

export const locationService = new LocationService();
export default locationService;
