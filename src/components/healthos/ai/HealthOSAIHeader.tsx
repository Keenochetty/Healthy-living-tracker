import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Clock3, Settings, Sparkles } from "lucide-react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  onHistoryPress?: () => void;
  onSettingsPress?: () => void;
};

export function HealthOSAIHeader({ onHistoryPress, onSettingsPress }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <View style={styles.header}>
      <View style={[styles.iconBadge, surfaces.aiSurface]}>
        <Sparkles color={palette.ai} size={22} />
      </View>
      <View style={styles.copy}>
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          HealthOS AI
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Ask questions, search safely, and turn useful results into review-only imports.
        </Text>
      </View>
      <View style={styles.actions}>
        <IconButton label="AI history" onPress={onHistoryPress}>
          <Clock3 color={palette.inkText} size={18} />
        </IconButton>
        <IconButton label="AI settings" onPress={onSettingsPress}>
          <Settings color={palette.inkText} size={18} />
        </IconButton>
      </View>
    </View>
  );
}

function IconButton({
  children,
  label,
  onPress,
}: {
  children: ReactNode;
  label: string;
  onPress?: () => void;
}) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const surfaces = getHealthOSSurfaces(mode);
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, surfaces.glassPill, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  iconBadge: {
    alignItems: "center",
    borderRadius: healthOSRadius.pill,
    height: 48,
    justifyContent: "center",
    padding: 0,
    width: 48,
  },
  iconButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 40,
  },
  pressed: {
    opacity: 0.72,
  },
});
