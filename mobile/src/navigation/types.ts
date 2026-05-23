import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ── Auth Stack ────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: { email?: string };
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

// ── Main Tabs ─────────────────────────────────────────────────────────────────
export type MainTabParamList = {
  Home: undefined;
  Maps: undefined;
  Community: undefined;
  Marketplace: undefined;
  Profile: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// ── Root Stack ────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SOS: undefined;
  TripDetail: { tripId: string };
  Chat: { threadId: string };
  MountainDetail: { mountainId: string };
  ThreadDetail: { threadId: string };
  GearDetail: { listingId: string };
  CreateListing: undefined;
  OfflineMapManager: undefined;
  GPSTracker: undefined;
  Emergency: undefined;
  CheckInOut: { mode: 'checkin' | 'checkout' };
  VerifyIdentity: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

// ── Common Navigation Types ───────────────────────────────────────────────────
export type ScreenNavigationProp<T extends keyof RootStackParamList> =
  RootStackScreenProps<T>['navigation'];

export type ScreenRouteProp<T extends keyof RootStackParamList> =
  RootStackScreenProps<T>['route'];
