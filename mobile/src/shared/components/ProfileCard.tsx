import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import Badge, { BadgeLevel } from './Badge';
import type { SkillLevel } from '../store/slices/authSlice';
import { formatRelativeTime } from '../utils/formatters';

export interface ProfileCardProps {
  id: string;
  avatar?: string;
  fullName: string;
  verificationLevel: BadgeLevel;
  skillLevel: SkillLevel;
  bio?: string;
  badges?: Array<{ id: string; name: string; icon: string }>;
  lastActive?: string;
  onPress?: () => void;
  onVerificationPress?: () => void;
  variant?: 'default' | 'compact' | 'horizontal';
}

const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Pemula',
  intermediate: 'Menengah',
  advanced: 'Mahir',
  expert: 'Ahli',
};

const SKILL_COLORS: Record<SkillLevel, string> = {
  beginner: Colors.success,
  intermediate: Colors.accent,
  advanced: Colors.danger,
  expert: Colors.primaryDark,
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  avatar,
  fullName,
  verificationLevel,
  skillLevel,
  bio,
  badges = [],
  lastActive,
  onPress,
  onVerificationPress,
  variant = 'default',
}) => {
  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compact} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.avatarCompact}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImageCompact} />
          ) : (
            <Text style={styles.avatarPlaceholderCompact}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {fullName}
          </Text>
          <View style={styles.badgeRow}>
            <Badge level={verificationLevel} size="small" showLabel={false} />
            <View
              style={[
                styles.skillBadge,
                { backgroundColor: SKILL_COLORS[skillLevel] + '20' },
              ]}
            >
              <Text
                style={[
                  styles.skillText,
                  { color: SKILL_COLORS[skillLevel] },
                ]}
              >
                {SKILL_LABELS[skillLevel]}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.horizontal} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.avatarHorizontal}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImageHorizontal} />
          ) : (
            <Text style={styles.avatarPlaceholderHorizontal}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.horizontalInfo}>
          <Text style={styles.horizontalName} numberOfLines={1}>
            {fullName}
          </Text>
          <Badge level={verificationLevel} size="small" />
          {lastActive && (
            <Text style={styles.lastActive}>
              Aktif {formatRelativeTime(lastActive)}
            </Text>
          )}
        </View>
        <View style={styles.skillBadgeHorizontal}>
          <Text
            style={[styles.skillTextSmall, { color: SKILL_COLORS[skillLevel] }]}
          >
            {SKILL_LABELS[skillLevel]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={onVerificationPress} style={styles.badgeOverlay}>
            <Badge level={verificationLevel} size="small" showLabel={false} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.metaRow}>
            <Badge level={verificationLevel} size="small" showLabel={false} />
            <View
              style={[
                styles.skillBadge,
                { backgroundColor: SKILL_COLORS[skillLevel] + '20' },
              ]}
            >
              <Text
                style={[styles.skillText, { color: SKILL_COLORS[skillLevel] }]}
              >
                {SKILL_LABELS[skillLevel]}
              </Text>
            </View>
          </View>
          {bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {bio}
            </Text>
          )}
          {lastActive && (
            <Text style={styles.lastActive}>
              Terakhir aktif {formatRelativeTime(lastActive)}
            </Text>
          )}
        </View>
      </View>

      {badges.length > 0 && (
        <View style={styles.badgesRow}>
          {badges.slice(0, 5).map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
            </View>
          ))}
          {badges.length > 5 && (
            <Text style={styles.moreBadges}>+{badges.length - 5}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.cardPadding,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    ...Typography.subtitle1,
    color: Colors.text,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  bio: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  lastActive: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  badgeItem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 14,
  },
  moreBadges: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Compact
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  avatarCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  avatarImageCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholderCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryFaded,
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    ...Typography.subtitle2,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Horizontal
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  avatarHorizontal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  avatarImageHorizontal: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholderHorizontal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryFaded,
    textAlign: 'center',
    lineHeight: 48,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  horizontalInfo: {
    flex: 1,
  },
  horizontalName: {
    ...Typography.subtitle2,
    color: Colors.text,
    fontWeight: '600',
  },
  skillBadgeHorizontal: {
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  skillTextSmall: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ProfileCard;
