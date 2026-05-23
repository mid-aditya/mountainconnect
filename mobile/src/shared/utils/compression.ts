import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ImageCompressor from 'react-native-compressor';

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  compressionRatio: number;
}

class CompressionService {
  private readonly IMAGE_QUALITY = 70;
  private readonly IMAGE_MAX_WIDTH = 1200;
  private readonly IMAGE_MAX_HEIGHT = 1200;
  private readonly LOCATION_BATCH_THRESHOLD = 100;
  private readonly LOCATION_PRECISION = 5; // decimal places

  // ── Image Compression ──────────────────────────────────────────────────────────
  async compressImage(uri: string): Promise<CompressedImage> {
    try {
      const originalSize = await this.getFileSize(uri);

      // Use react-native-compressor for efficient compression
      const compressed = await ImageCompressor.Image.compress(uri, {
        maxWidth: this.IMAGE_MAX_WIDTH,
        maxHeight: this.IMAGE_MAX_HEIGHT,
        quality: this.IMAGE_QUALITY,
        returnableOutputType: 'uri',
        downloadProgress: (progress: number) => {
          console.log(`[Compression] Image compressing: ${progress}%`);
        },
      });

      const compressedSize = await this.getFileSize(compressed);

      return {
        uri: compressed,
        width: this.IMAGE_MAX_WIDTH,
        height: this.IMAGE_MAX_HEIGHT,
        size: compressedSize,
        originalSize,
        compressionRatio: originalSize > 0 ? compressedSize / originalSize : 1,
      };
    } catch (error) {
      console.error('[Compression] Image compression failed:', error);
      // Return original if compression fails
      return {
        uri,
        width: 0,
        height: 0,
        size: await this.getFileSize(uri),
        originalSize: await this.getFileSize(uri),
        compressionRatio: 1,
      };
    }
  }

  async compressMultipleImages(uris: string[]): Promise<CompressedImage[]> {
    const results = await Promise.allSettled(
      uris.map((uri) => this.compressImage(uri)),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<CompressedImage> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  // ── Location Data Compression ────────────────────────────────────────────────
  compressLocationBatch(
    locations: Array<{
      latitude: number;
      longitude: number;
      altitude?: number;
      timestamp: number;
      speed?: number;
      heading?: number;
    }>,
  ): Array<Record<string, number>> {
    // Round coordinates to reduce precision and save space
    return locations.map((loc) => {
      const compressed: Record<string, number> = {
        lt: parseFloat(loc.latitude.toFixed(this.LOCATION_PRECISION)),
        ln: parseFloat(loc.longitude.toFixed(this.LOCATION_PRECISION)),
        ts: Math.round(loc.timestamp / 1000), // timestamp in seconds
      };

      // Only include non-default values
      if (loc.altitude !== undefined && loc.altitude !== 0) {
        compressed.al = Math.round(loc.altitude);
      }
      if (loc.speed !== undefined && loc.speed > 0) {
        compressed.sp = parseFloat(loc.speed.toFixed(1));
      }
      if (loc.heading !== undefined && loc.heading !== 0) {
        compressed.hd = Math.round(loc.heading);
      }

      return compressed;
    });
  }

  decompressLocationBatch(
    compressed: Array<Record<string, number>>,
  ): Array<{
    latitude: number;
    longitude: number;
    altitude?: number;
    timestamp: number;
    speed?: number;
    heading?: number;
  }> {
    return compressed.map((c) => ({
      latitude: c.lt,
      longitude: c.ln,
      altitude: c.al,
      timestamp: c.ts * 1000, // convert back to ms
      speed: c.sp,
      heading: c.hd,
    }));
  }

  // ── Data Serialization ────────────────────────────────────────────────────────
  async serializeForOffline<T>(data: T): Promise<string> {
    // For large datasets, chunk and compress
    const jsonString = JSON.stringify(data);

    // If data is large (>1MB), compress it
    if (jsonString.length > 1024 * 1024) {
      return await this.compressString(jsonString);
    }

    return jsonString;
  }

  async deserializeFromOffline<T>(data: string): Promise<T> {
    try {
      return JSON.parse(data) as T;
    } catch {
      // Maybe it's compressed
      const decompressed = await this.decompressString(data);
      return JSON.parse(decompressed) as T;
    }
  }

  // ── File Operations ──────────────────────────────────────────────────────────
  private async getFileSize(uri: string): Promise<number> {
    try {
      const stat = await RNFS.stat(uri);
      return stat.size;
    } catch {
      return 0;
    }
  }

  async getStorageUsage(): Promise<{ total: number; used: number; free: number }> {
    const documentPath = RNFS.DocumentDirectoryPath;

    try {
      // Get offline map files
      const offlineFiles = await RNFS.readDir(`${documentPath}/maps`);
      const mapSize = offlineFiles.reduce((sum, file) => sum + file.size, 0);

      // Get breadcrumb trail
      const trailExists = await RNFS.exists(`${documentPath}/breadcrumb_trail.json`);
      let trailSize = 0;
      if (trailExists) {
        const trailStat = await RNFS.stat(`${documentPath}/breadcrumb_trail.json`);
        trailSize = trailStat.size;
      }

      // Get cached data
      const cacheFiles = await RNFS.readDir(`${documentPath}/cache`);
      const cacheSize = cacheFiles.reduce((sum, file) => sum + file.size, 0);

      const used = mapSize + trailSize + cacheSize;

      return {
        total: 0, // Platform dependent
        used,
        free: 0,
      };
    } catch {
      return { total: 0, used: 0, free: 0 };
    }
  }

  async clearCache(): Promise<void> {
    try {
      const cacheDir = `${RNFS.DocumentDirectoryPath}/cache`;
      const exists = await RNFS.exists(cacheDir);
      if (exists) {
        await RNFS.unlink(cacheDir);
        await RNFS.mkdir(cacheDir);
      }
      console.log('[Compression] Cache cleared');
    } catch (error) {
      console.error('[Compression] Failed to clear cache:', error);
    }
  }

  // ── String Compression Utilities ─────────────────────────────────────────────
  private async compressString(input: string): Promise<string> {
    // Simple RLE-based compression for location data
    // For production, use a proper compression library
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const compressed: number[] = [];

    let i = 0;
    while (i < data.length) {
      let count = 1;
      while (i + count < data.length && data[i + count] === data[i] && count < 255) {
        count++;
      }
      compressed.push(data[i], count);
      i += count;
    }

    return btoa(String.fromCharCode(...compressed));
  }

  private async decompressString(input: string): Promise<string> {
    const binary = atob(input);
    const bytes: number[] = [];

    for (let i = 0; i < binary.length; i += 2) {
      const value = binary.charCodeAt(i);
      const count = binary.charCodeAt(i + 1);
      for (let j = 0; j < count; j++) {
        bytes.push(value);
      }
    }

    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  }

  // ── Utility ──────────────────────────────────────────────────────────────────
  getEstimatedCompressionRatio(type: 'image' | 'location' | 'general'): number {
    switch (type) {
      case 'image':
        return 0.3; // ~70% reduction
      case 'location':
        return 0.4; // ~60% reduction
      case 'general':
        return 0.7; // ~30% reduction
    }
  }
}

export const compressionService = new CompressionService();
export default compressionService;
