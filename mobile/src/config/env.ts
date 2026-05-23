// Environment configuration for MountainConnect ID mobile app
// Switch values based on __DEV__ (React Native's built-in dev flag)

const DevConfig = {
  API_BASE_URL: 'https://dev-api.mountainconnect.id/v1',
  MAPBOX_TOKEN: 'pk.mapbox-dev-token-placeholder',
  SOCKET_URL: 'https://dev-socket.mountainconnect.id',
  MAPBOX_STYLE_URL: 'mapbox://styles/mountainconnect/clmx0dev001',
  featureFlags: {
    enableMarketplace: true,
    enableForum: true,
    enableFindTeam: true,
    enableSOS: true,
    enableOfflineMaps: true,
    enableWeatherOverlay: true,
    enableBiometricAuth: true,
    enableLivenessDetection: true,
  },
};

const ProdConfig = {
  API_BASE_URL: 'https://api.mountainconnect.id/v1',
  MAPBOX_TOKEN: 'pk.mapbox-prod-token-placeholder',
  SOCKET_URL: 'https://socket.mountainconnect.id',
  MAPBOX_STYLE_URL: 'mapbox://styles/mountainconnect/clmx0prod001',
  featureFlags: {
    enableMarketplace: true,
    enableForum: true,
    enableFindTeam: true,
    enableSOS: true,
    enableOfflineMaps: true,
    enableWeatherOverlay: true,
    enableBiometricAuth: true,
    enableLivenessDetection: false,
  },
};

export interface FeatureFlags {
  enableMarketplace: boolean;
  enableForum: boolean;
  enableFindTeam: boolean;
  enableSOS: boolean;
  enableOfflineMaps: boolean;
  enableWeatherOverlay: boolean;
  enableBiometricAuth: boolean;
  enableLivenessDetection: boolean;
}

export interface Environment {
  API_BASE_URL: string;
  MAPBOX_TOKEN: string;
  SOCKET_URL: string;
  MAPBOX_STYLE_URL: string;
  featureFlags: FeatureFlags;
}

const env: Environment = __DEV__ ? DevConfig : ProdConfig;

export const {
  API_BASE_URL,
  MAPBOX_TOKEN,
  SOCKET_URL,
  MAPBOX_STYLE_URL,
  featureFlags,
} = env;

export default env;
