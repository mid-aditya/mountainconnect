import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { store } from '../store';
import {
  enqueueAction,
  dequeueAction,
  setOnlineStatus,
  setSyncStatus,
  setSyncProgress,
  setLastSyncAt,
  setSyncError,
  removeFailedActions,
  type PendingAction,
} from '../store/slices/offlineSlice';
import { apiClient } from './api-client';
import { encryptionService } from './encryption.service';
import { compressionService } from '../utils/compression';

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

class OfflineSyncService {
  private isMonitoring = false;
  private unsubscribe: (() => void) | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  // ── Start Monitoring ──────────────────────────────────────────────────────────
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('[OfflineSync] Started network monitoring');

    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange.bind(this));

    // Periodic sync check every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncPendingActions();
    }, 5 * 60 * 1000);

    // Check initial state
    NetInfo.fetch().then(this.handleNetworkChange.bind(this));
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.unsubscribe?.();
    this.unsubscribe = null;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    console.log('[OfflineSync] Stopped network monitoring');
  }

  private async handleNetworkChange(state: NetInfoState): Promise<void> {
    const isOnline = !!(state.isConnected && state.isInternetReachable !== false);

    console.log(`[OfflineSync] Network changed: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);

    store.dispatch(setOnlineStatus(isOnline));

    if (isOnline) {
      // Trigger immediate sync when coming back online
      await this.syncPendingActions();
    }
  }

  // ── Sync Operations ──────────────────────────────────────────────────────────
  async syncPendingActions(): Promise<void> {
    const state = store.getState();
    const { queue, isOnline, isSyncing } = state.offline;

    if (!isOnline || isSyncing || queue.length === 0) {
      return;
    }

    console.log(`[OfflineSync] Starting sync for ${queue.length} action(s)`);

    store.dispatch(setSyncStatus('syncing'));
    store.dispatch(setSyncProgress(0));

    const totalItems = queue.length;
    let processedCount = 0;

    for (const action of queue) {
      // Skip items that are being retried
      if (action.retryCount >= MAX_RETRIES) {
        continue;
      }

      try {
        await this.sendQueuedAction(action);
        store.dispatch(dequeueAction(action.id));
        processedCount++;
        store.dispatch(setSyncProgress(Math.round((processedCount / totalItems) * 100)));
        console.log(`[OfflineSync] Synced action: ${action.id}`);
      } catch (error: any) {
        const updatedRetryCount = action.retryCount + 1;

        if (updatedRetryCount >= MAX_RETRIES) {
          console.warn(`[OfflineSync] Action ${action.id} failed permanently after ${MAX_RETRIES} retries`);
        } else {
          console.warn(`[OfflineSync] Action ${action.id} failed (attempt ${updatedRetryCount}), will retry`);
          const delay = BASE_RETRY_DELAY * Math.pow(2, updatedRetryCount);

          setTimeout(() => {
            store.dispatch(enqueueAction({
              type: action.type,
              payload: action.payload,
            }));
          }, delay);
        }
      }
    }

    const currentState = store.getState();
    const remaining = currentState.offline.queue.length;

    if (remaining === 0) {
      store.dispatch(setSyncStatus('success'));
      store.dispatch(setLastSyncAt(new Date().toISOString()));
      console.log('[OfflineSync] Sync completed successfully');
    } else {
      store.dispatch(setSyncStatus('failed'));
      store.dispatch(setSyncError(`${remaining} action(s) failed to sync`));
    }

    store.dispatch(setSyncProgress(100));
  }

  private async sendQueuedAction(action: PendingAction): Promise<void> {
    const endpointMap: Record<string, string> = {
      CREATE_POST: '/forum/posts',
      UPDATE_PROFILE: '/users/me',
      TRIGGER_SOS: '/emergency/sos',
      CHECK_IN: '/trips/check-in',
      CHECK_OUT: '/trips/check-out',
      UPDATE_TRIP: '/trips/update',
      CREATE_LISTING: '/marketplace/listings',
      SEND_MESSAGE: '/chat/messages',
    };

    const endpoint = endpointMap[action.type] || '/unknown';
    const method = this.getMethodForType(action.type);

    // Compress location data if present
    let payload = { ...action.payload };
    if (payload.location || payload.breadcrumbTrail) {
      if (payload.breadcrumbTrail && Array.isArray(payload.breadcrumbTrail)) {
        payload.breadcrumbTrail = await compressionService.compressLocationBatch(
          payload.breadcrumbTrail,
        );
      }
    }

    // Encrypt sensitive data
    const encryptionKey = await encryptionService.getOrCreateKey();
    const sensitiveFields = ['emergencyContacts', 'medicalInfo', 'message'];
    const hasSensitiveData = sensitiveFields.some((f) => f in payload);

    if (hasSensitiveData) {
      sensitiveFields.forEach((field) => {
        if (field in payload) {
          payload[field] = encryptionService.encryptData(
            JSON.stringify(payload[field]),
            encryptionKey,
          );
        }
      });
    }

    const response = await apiClient({
      method,
      url: endpoint,
      data: payload,
    });

    return response.data;
  }

  private getMethodForType(type: string): 'post' | 'put' | 'patch' | 'delete' {
    const methodMap: Record<string, 'post' | 'put' | 'patch' | 'delete'> = {
      CREATE_POST: 'post',
      UPDATE_PROFILE: 'patch',
      UPDATE_TRIP: 'patch',
      CHECK_IN: 'post',
      CHECK_OUT: 'post',
      TRIGGER_SOS: 'post',
      CREATE_LISTING: 'post',
      SEND_MESSAGE: 'post',
    };
    return methodMap[type] || 'post';
  }

  // ── Queue Management ─────────────────────────────────────────────────────────
  enqueue(type: PendingAction['type'], payload: Record<string, any>): string {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    store.dispatch(
      enqueueAction({
        type,
        payload,
      }),
    );
    console.log(`[OfflineSync] Enqueued action: ${type} (${id})`);
    return id;
  }

  removeFromQueue(id: string): void {
    store.dispatch(dequeueAction(id));
    console.log(`[OfflineSync] Removed action from queue: ${id}`);
  }

  clearFailedActions(): void {
    store.dispatch(removeFailedActions());
    console.log('[OfflineSync] Cleared failed actions');
  }

  // ── Status ───────────────────────────────────────────────────────────────────
  getLastSyncTimestamp(): string | null {
    return store.getState().offline.lastSyncAt;
  }

  getQueueLength(): number {
    return store.getState().offline.queue.length;
  }

  isOnline(): boolean {
    return store.getState().offline.isOnline;
  }
}

export const offlineSyncService = new OfflineSyncService();
export default offlineSyncService;
