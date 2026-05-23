import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';

interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'inline' | 'card' | 'fullscreen';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Terjadi Kesalahan',
  onRetry,
  retryLabel = 'Coba Lagi',
  variant = 'card',
}) => {
  if (variant === 'inline') {
    return (
      <View style={styles.inline}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.inlineText}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryInline}>
            <Text style={styles.retryInlineText}>{retryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.largeIcon}>😕</Text>
        <Text style={styles.fullscreenTitle}>{title}</Text>
        <Text style={styles.fullscreenMessage}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>{retryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // card variant (default)
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardIcon}>⚠️</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardMessage}>{message}</Text>
        </View>
      </View>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.cardRetry}>
          <Text style={styles.cardRetryText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Inline variant
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.dangerFaded,
    borderRadius: BorderRadius.sm,
  },
  inlineText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
    marginLeft: Spacing.xs,
  },
  errorIcon: {
    fontSize: 14,
  },
  retryInline: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  retryInlineText: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Card variant
  card: {
    backgroundColor: Colors.dangerFaded,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.danger,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    ...Shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.subtitle2,
    color: Colors.danger,
    marginBottom: 2,
  },
  cardMessage: {
    ...Typography.body2,
    color: Colors.danger,
    opacity: 0.9,
  },
  cardRetry: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-end',
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  cardRetryText: {
    ...Typography.buttonSmall,
    color: Colors.textInverse,
  },

  // Fullscreen variant
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  largeIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  fullscreenTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  fullscreenMessage: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  retryText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
});

export default ErrorMessage;
