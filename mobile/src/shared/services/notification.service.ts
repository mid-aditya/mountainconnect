import { Platform, AppState, AppStateStatus } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { store } from '../store';
import { setDeviceToken } from '../store/slices/authSlice';

export type NotificationType =
  | 'sos_alert'
  | 'weather_warning'
  | 'trip_reminder'
  | 'check_in_due'
  | 'forum_reply'
  | 'marketplace_message'
  | 'emergency_checkin'
  | 'system';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  badge?: number;
}

class NotificationService {
  private channelId = 'mountainconnect_main';
  private channelSos = 'mountainconnect_sos';
  private appState: AppStateStatus = 'active';

  // ── Initialize ────────────────────────────────────────────────────────────────
  async initialize(): Promise<void> {
    this.configurePushNotifications();
    this.createNotificationChannels();
    this.handleAppState();
    this.requestPermissions();
    this.registerForRemoteNotifications();
  }

  private configurePushNotifications(): void {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('[Notification] FCM token received:', token.token);
        store.dispatch(setDeviceToken(token.token));
      },

      onNotification: (notification) => {
        console.log('[Notification] Received:', notification);
        this.handleIncomingNotification(notification);
        // Call finish on iOS
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      onAction: (notification) => {
        console.log('[Notification] Action:', notification.action);
        this.handleNotificationAction(notification);
      },

      onRegistrationError: (error) => {
        console.error('[Notification] Registration error:', error);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  private createNotificationChannels(): void {
    if (Platform.OS === 'android') {
      // Main channel
      PushNotification.createChannel(
        {
          channelId: this.channelId,
          channelName: 'MountainConnect',
          channelDescription: 'General notifications',
          importance: 4, // High
          vibrate: true,
          vibration: 200,
          playSound: true,
          soundName: 'default',
        },
        (created) => console.log(`[Notification] Main channel created: ${created}`),
      );

      // SOS channel (critical - always high priority)
      PushNotification.createChannel(
        {
          channelId: this.channelSos,
          channelName: 'Emergency SOS',
          channelDescription: 'Emergency SOS alerts - cannot be disabled',
          importance: 5, // Max
          vibrate: true,
          vibration: [500, 200, 500, 200, 500],
          playSound: true,
          soundName: 'emergency_sound',
        },
        (created) => console.log(`[Notification] SOS channel created: ${created}`),
      );
    }
  }

  private handleAppState(): void {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      this.appState = nextAppState;
      if (nextAppState === 'active') {
        this.clearBadge();
      }
    });
  }

  private async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        if (permissions.alert || permissions.badge || permissions.sound) {
          resolve(true);
        } else {
          PushNotification.requestPermissions().then((result) => {
            resolve(result.alert || result.badge || result.sound);
          });
        }
      });
    });
  }

  private registerForRemoteNotifications(): void {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
        critical: false,
      });
    }
  }

  // ── Handle Incoming Notifications ─────────────────────────────────────────────
  private handleIncomingNotification(notification: any): void {
    const { title, body, data, foreground } = notification;

    if (!foreground) {
      // App was in background - navigate to appropriate screen
      this.navigateFromNotification(data);
    }

    // Handle specific notification types
    switch (data?.type) {
      case 'sos_alert':
        this.handleSOSAlert(data);
        break;
      case 'weather_warning':
        this.handleWeatherWarning(data);
        break;
      case 'check_in_due':
        this.handleCheckInDue(data);
        break;
      default:
        break;
    }
  }

  private handleNotificationAction(notification: any): void {
    const { action, data } = notification;

    switch (action) {
      case 'mark_safe':
        // User tapped "I'm Safe" action
        this.handleMarkSafe(data);
        break;
      case 'view_trip':
        this.navigateFromNotification({ screen: 'TripDetail', tripId: data?.tripId });
        break;
      case 'reply':
        this.navigateFromNotification({ screen: 'Chat', threadId: data?.threadId });
        break;
      default:
        break;
    }
  }

  private handleSOSAlert(data: any): void {
    // Play SOS sound and vibrate
    PushNotification.invokeApp({
      id: 'sos',
      channelId: this.channelSos,
      title: '🚨 SOS ALERT',
      message: `${data?.userName || 'Someone'} triggered an SOS!`,
      playSound: true,
      soundName: 'emergency_sound',
      vibrate: true,
      vibration: 1000,
      importance: 'high',
      priority: 'max',
      data: data,
    });
  }

  private handleWeatherWarning(data: any): void {
    PushNotification.localNotification({
      id: `weather_${Date.now()}`,
      channelId: this.channelId,
      title: `⛈️ ${data?.warningType || 'Weather Warning'}`,
      message: data?.message || 'Check weather conditions before your trip',
      importance: 'high',
      priority: 'high',
      data: data,
    });
  }

  private handleCheckInDue(data: any): void {
    PushNotification.localNotification({
      id: `checkin_${Date.now()}`,
      channelId: this.channelId,
      title: '⏰ Check-in Due',
      message: `Time to check in on your trip to ${data?.mountainName || 'the mountain'}`,
      importance: 'high',
      priority: 'high',
      data: data,
    });
  }

  private handleMarkSafe(data: any): void {
    // Navigate to mark safe screen
    console.log('[Notification] User marked safe:', data);
  }

  private navigateFromNotification(data: any): void {
    // Deep linking is handled by React Navigation
    // This is a fallback mechanism
    console.log('[Notification] Navigate from notification:', data);
  }

  // ── Local Notifications ──────────────────────────────────────────────────────
  showLocalNotification(payload: NotificationPayload): void {
    const {
      type,
      title,
      body,
      data,
      priority = 'normal',
      badge,
    } = payload;

    const notificationConfig: Record<string, any> = {
      id: `${type}_${Date.now()}`,
      channelId: type === 'sos_alert' ? this.channelSos : this.channelId,
      title,
      message: body,
      importance: priority === 'high' ? 'high' : 'default',
      priority: priority === 'high' ? 'high' : 'default',
      importance: priority === 'high' ? 'high' : 'default',
      data,
      playSound: type === 'sos_alert',
      soundName: type === 'sos_alert' ? 'emergency_sound' : 'default',
    };

    if (badge !== undefined && Platform.OS === 'ios') {
      notificationConfig['badge'] = badge;
    }

    PushNotification.localNotification(notificationConfig);
  }

  // ── Schedule Notifications ────────────────────────────────────────────────────
  scheduleTripReminder(tripId: string, mountainName: string, tripDate: Date): void {
    // Schedule reminder 24 hours before trip
    const reminderDate = new Date(tripDate.getTime() - 24 * 60 * 60 * 1000);

    if (reminderDate > new Date()) {
      PushNotification.localNotificationSchedule({
        id: `trip_reminder_${tripId}`,
        channelId: this.channelId,
        title: '🏔️ Trip Tomorrow',
        message: `Don't forget! Your trip to ${mountainName} is tomorrow. Check your gear and weather conditions.`,
        date: reminderDate,
        importance: 'high',
        priority: 'high',
        allowWhileIdle: true,
        data: { type: 'trip_reminder', tripId, mountainName },
      });
    }
  }

  scheduleCheckInReminder(tripId: string, mountainName: string, dueTime: Date): void {
    // Schedule reminder 30 minutes before check-in is due
    const reminderDate = new Date(dueTime.getTime() - 30 * 60 * 1000);

    if (reminderDate > new Date()) {
      PushNotification.localNotificationSchedule({
        id: `checkin_reminder_${tripId}`,
        channelId: this.channelId,
        title: '⏰ Check-in Reminder',
        message: `Please check in on your trip to ${mountainName}`,
        date: reminderDate,
        importance: 'high',
        priority: 'high',
        allowWhileIdle: true,
        data: { type: 'check_in_due', tripId, mountainName },
      });
    }
  }

  cancelTripReminders(tripId: string): void {
    PushNotification.cancelLocalNotification(`trip_reminder_${tripId}`);
    PushNotification.cancelLocalNotification(`checkin_reminder_${tripId}`);
  }

  // ── Badge Management ────────────────────────────────────────────────────────
  setBadge(count: number): void {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(count);
    }
    PushNotification.setApplicationIconBadgeNumber(count);
  }

  clearBadge(): void {
    this.setBadge(0);
  }

  // ── Cancel All ───────────────────────────────────────────────────────────────
  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
    this.clearBadge();
  }
}

export const notificationService = new NotificationService();
export default notificationService;
