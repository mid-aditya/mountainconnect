import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  StyleSheet,
  Platform,
  Vibration,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { triggerSOS, selectIsSOSActive, startSOSCountdown, decrementCountdown, clearSOSCountdown } from '../store/slices/emergencySlice';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { locationService } from '../services/location.service';

const SOS_HOLD_DURATION = 3000;
const COUNTDOWN_SECONDS = 5;

interface SOSButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onPress, disabled = false }) => {
  const dispatch = useAppDispatch();
  const isSOSActive = useAppSelector(selectIsSOSActive);
  const countdown = useAppSelector((s) => s.emergency.countdownSeconds);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulsing animation when SOS is active
  useEffect(() => {
    if (isSOSActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSOSActive, pulseAnim]);

  // Countdown logic
  const startCountdown = useCallback(() => {
    dispatch(startSOSCountdown(COUNTDOWN_SECONDS));
    countdownTimer.current = setInterval(() => {
      dispatch(decrementCountdown());
    }, 1000);
  }, [dispatch]);

  useEffect(() => {
    if (countdown > 0 && isSOSActive) {
      Vibration.vibrate(200);
    }

    if (countdown === 0 && isSOSActive) {
      // Countdown finished - actually send SOS
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }

      locationService.getCurrentPosition().then((location) => {
        dispatch(
          triggerSOS({
            location,
            message: 'SOS Emergency - Saya butuh bantuan!',
          }),
        );
      });
    }
  }, [countdown, isSOSActive, dispatch]);

  const cancelCountdown = useCallback(() => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
    }
    dispatch(clearSOSCountdown());
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [dispatch, scaleAnim]);

  const handlePressIn = useCallback(() => {
    if (disabled || isSOSActive) return;

    Vibration.vibrate(100);

    // Animate hold progress
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: SOS_HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    // Scale up slightly
    Animated.timing(scaleAnim, {
      toValue: 1.1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Start hold timer
    holdTimer.current = setTimeout(() => {
      // Hold complete - activate SOS countdown
      Vibration.vibrate([0, 100, 100, 200]);
      startCountdown();
    }, SOS_HOLD_DURATION);
  }, [disabled, isSOSActive, holdProgress, scaleAnim, startCountdown]);

  const handlePressOut = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }

    if (!isSOSActive) {
      Animated.timing(holdProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();

      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSOSActive, holdProgress, scaleAnim]);

  const handlePress = useCallback(() => {
    if (isSOSActive) {
      // Short press while active - cancel countdown
      cancelCountdown();
      return;
    }
    onPress?.();
  }, [isSOSActive, onPress, cancelCountdown]);

  // Hold progress width
  const holdWidth = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const containerStyle = useMemo(
    () => ({
      transform: [{ scale: scaleAnim }],
      opacity: disabled ? 0.5 : 1,
    }),
    [scaleAnim, disabled],
  );

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {isSOSActive && countdown > 0 && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>SOS in {countdown}s</Text>
          <View style={styles.countdownBar}>
            <Animated.View
              style={[
                styles.countdownProgress,
                { width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={[
          styles.button,
          isSOSActive && styles.buttonActive,
        ]}
        accessibilityLabel={isSOSActive ? 'SOS Aktif' : 'Tahan 3 detik untuk SOS'}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Animated.View
          style={[
            styles.pulseRing,
            isSOSActive && { opacity: pulseAnim, transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Text style={styles.icon}>🆘</Text>
        <Text style={styles.label}>SOS</Text>
      </TouchableOpacity>

      {isSOSActive && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusDot}>🔴</Text>
          <Text style={styles.statusText}>
            {countdown > 0
              ? 'Mengaktifkan...'
              : 'SOS Terkirim'}
          </Text>
        </View>
      )}

      {/* Hold progress bar */}
      {!isSOSActive && (
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: holdWidth }]} />
        </View>
      )}

      {!isSOSActive && (
        <Text style={styles.hint}>Tahan 3 detik</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.sosButtonMargin + 60, // Above tab bar
    right: Spacing.sosButtonMargin,
    alignItems: 'center',
    zIndex: 9999,
  },
  button: {
    width: Spacing.sosButtonSize,
    height: Spacing.sosButtonSize,
    borderRadius: Spacing.sosButtonSize / 2,
    backgroundColor: Colors.sos,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sos,
  },
  buttonActive: {
    backgroundColor: Colors.sosActive,
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: Spacing.sosButtonSize + 10,
    height: Spacing.sosButtonSize + 10,
    borderRadius: (Spacing.sosButtonSize + 10) / 2,
    backgroundColor: Colors.sos,
    opacity: 0.3,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
    marginTop: -2,
  },
  progressContainer: {
    width: Spacing.sosButtonSize,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.textInverse,
    borderRadius: 2,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  countdownContainer: {
    position: 'absolute',
    bottom: Spacing.sosButtonSize + 12,
    alignItems: 'center',
    width: 120,
  },
  countdownText: {
    color: Colors.sos,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  countdownBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.dangerFaded,
    borderRadius: 2,
    overflow: 'hidden',
  },
  countdownProgress: {
    height: '100%',
    backgroundColor: Colors.sos,
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    fontSize: 8,
    marginRight: 4,
  },
  statusText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default SOSButton;
