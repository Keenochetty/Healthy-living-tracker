import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTouchTargets,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSSectionHeaderProps = {
  actionLabel?: string;
  icon?: ReactNode;
  onAction?: () => void;
  subtitle?: string;
  title: string;
};

export function HealthOSSectionHeader({
  actionLabel,
  icon,
  onAction,
  subtitle,
  title,
}: HealthOSSectionHeaderProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {icon ? <View>{icon}</View> : null}
        <View style={styles.titleBlock}>
          <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAction}
          style={styles.action}
        >
          <Text style={[healthOSTypography.buttonLabel, { color: palette.skyBlue }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: healthOSTouchTargets.minimum,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  titleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});
