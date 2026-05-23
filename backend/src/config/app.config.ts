import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  jwtSecret: string;
  jwtExpiry: string;
  jwtRefreshExpiry: string;
  redisUrl: string;
  twilio: {
    sid: string;
    token: string;
    phoneNumber: string;
  };
  bmkgApiKey: string;
  midtrans: {
    serverKey: string;
    clientKey: string;
    isProduction: boolean;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

export const getAppConfig = (configService: ConfigService): AppConfig => ({
  jwtSecret: configService.get('JWT_SECRET', 'mountainconnect-secret-key-change-in-production'),
  jwtExpiry: configService.get('JWT_EXPIRY', '15m'),
  jwtRefreshExpiry: configService.get('JWT_REFRESH_EXPIRY', '7d'),
  redisUrl: configService.get('REDIS_URL', 'redis://localhost:6379'),
  twilio: {
    sid: configService.get('TWILIO_SID', ''),
    token: configService.get('TWILIO_TOKEN', ''),
    phoneNumber: configService.get('TWILIO_PHONE_NUMBER', ''),
  },
  bmkgApiKey: configService.get('BMKG_API_KEY', ''),
  midtrans: {
    serverKey: configService.get('MIDTRANS_SERVER_KEY', ''),
    clientKey: configService.get('MIDTRANS_CLIENT_KEY', ''),
    isProduction: configService.get('NODE_ENV') === 'production',
  },
  cloudinary: {
    cloudName: configService.get('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: configService.get('CLOUDINARY_API_KEY', ''),
    apiSecret: configService.get('CLOUDINARY_API_SECRET', ''),
  },
});
