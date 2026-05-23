import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from "../../config/theme";

// ── Types ─────────────────────────────────────────────────────────────────────
export type BadgeLevel = 1 | 2 | 3;

interface BadgeProps {
  level: BadgeLevel;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  verified?: boolean; // Show checkmark
}

const LEVEL_CONFIG: Record<
  BadgeLevel,
  { label: string; color: string; icon: string }
> = {
  1: { label: "Level 1", color: Colors.badgeBronze, icon: "🟤" },
  2: { label: "Level 2", color: Colors.badgeSilver, icon: "⚪" },
  3: { label: "Level 3", color: Colors.badgeGold, icon: "🟡" },
};

const Badge: React.FC<BadgeProps> = ({
  level,
  size = "medium",
  showLabel = true,
  verified = false,
}) => {
  const config = LEVEL_CONFIG[level];
  const sizeConfig = {
    small: { badgeSize: 24, iconSize: 12, fontSize: 9 },
    medium: { badgeSize: 32, iconSize: 16, fontSize: 11 },
    large: { badgeSize: 44, iconSize: 22, fontSize: 13 },
  };

  const { badgeSize, iconSize, fontSize } = sizeConfig[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: config.color,
            borderWidth: 2,
            borderColor: verified ? Colors.success : "transparent",
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: iconSize }]}>
          {verified ? "✓" : config.icon}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { fontSize }]}>{config.label}</Text>
      )}
    </View>
  );
};

// ── Static Badge Components ───────────────────────────────────────────────────
export const BadgeBronze: React.FC<Omit<BadgeProps, "level">> = (props) => (
  <Badge level={1} {...props} />
);
export const BadgeSilver: React.FC<Omit<BadgeProps, "level">> = (props) => (
  <Badge level={2} {...props} />
);
export const BadgeGold: React.FC<Omit<BadgeProps, "level">> = (props) => (
  <Badge level={3} {...props} />
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 2,
  },
  badge: {
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  icon: {
    fontWeight: "700",
    color: Colors.textInverse,
  },
  label: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});

export default Badge;
