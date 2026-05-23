import React, { useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { useAppSelector } from '../store';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';

interface OfflineIndicatorProps {
  showQueueCount?: boolean;
  onSyncPress?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showQueueCount = true,
}) => {
  const { isOnline, isSyncing, queue, syncStatus } = useAppSelector(
    (state) => state.offline,
  );

  const queueCount = queue.length;

  const statusConfig = useMemo(() => {
    if (isSyncing) {
      return {
        backgroundColor: Colors.info,
        icon: '🔄',
        text: 'Menyinkronkan...',
        show: true,
      };
    }
    if (!isOnline) {
      return {
        backgroundColor: Colors.warning,
        icon: '📡',
        text: 'Offline - perubahan akan tersimpan',
        show: true,
      };
    }
    if (queueCount > 0) {
      return {
        backgroundColor: Colors.accent,
        icon: '⏳',
        text: `${queueCount} perubahan menunggu sinkronisasi`,
        show: true,
      };
    }
    if (syncStatus === 'success') {
      return {
        backgroundColor: Colors.success,
        icon: '✅',
        text: 'Tersinkronisasi',
        show: false, // Auto-hide after sync
      };
    }
    if (syncStatus === 'failed') {
      return {
        backgroundColor: Colors.danger,
        icon: '⚠️',
        text: 'Sinkronisasi gagal',
        show: true,
      };
    }
    return { backgroundColor: Colors.success, icon: '', text: '', show: false };
  }, [isOnline, isSyncing, queueCount, syncStatus]);

  if (!statusConfig.show) return null;

  return (
    <View style={[styles.container, { backgroundColor: statusConfig.backgroundColor }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{statusConfig.icon}</Text>
        <Text style={styles.text}>{statusConfig.text}</Text>

        {isSyncing && (
          <ActivityIndicator size="small" color={Colors.textInverse} style={styles.spinner} />
        )}

        {showQueueCount && queueCount > 0 && !isSyncing && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{queueCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    ...Shadows.sm,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  text: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '600',
    flex: 1,
  },
  spinner: {
    marginLeft: Spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default OfflineIndicator;
