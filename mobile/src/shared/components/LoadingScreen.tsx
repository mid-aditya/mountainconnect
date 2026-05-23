import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../config/theme';

interface LoadingScreenProps {
  message?: string;
  progress?: number; // 0-1
  onFinish?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'MountainConnect',
  progress,
  onFinish,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (progress !== undefined) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();

      if (progress >= 1 && onFinish) {
        setTimeout(onFinish, 500);
      }
    }
  }, [progress, progressAnim, onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryDark}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Mountain Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏔️</Text>
        </View>

        {/* App Name */}
        <Text style={styles.title}>MountainConnect</Text>
        <Text style={styles.subtitle}>Indonesia</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Jelajahi. Terhubung. Selamat.
        </Text>

        {/* Progress */}
        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}

        {/* Loading spinner */}
        <ActivityIndicator
          size="large"
          color={Colors.textInverse}
          style={styles.spinner}
        />

        {/* Status message */}
        {message && (
          <Text style={styles.message}>{message}</Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    ...Typography.h1,
    color: Colors.textInverse,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    ...Typography.subtitle1,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  tagline: {
    ...Typography.body2,
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing.lg,
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.textInverse,
    borderRadius: 2,
  },
  progressText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  spinner: {
    marginTop: Spacing.xl,
  },
  message: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});

export default LoadingScreen;
