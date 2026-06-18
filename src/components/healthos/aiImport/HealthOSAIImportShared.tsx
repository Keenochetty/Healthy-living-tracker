import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill, type HealthOSPillVariant } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

export function AIImportText({
  children,
  muted = false,
  strong = false,
}: {
  children: string;
  muted?: boolean;
  strong?: boolean;
}) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <Text style={[strong ? healthOSTypography.cardTitle : healthOSTypography.bodySmall, { color: muted ? palette.softText : palette.inkText }]}>
      {children}
    </Text>
  );
}

export function AIImportAction({
  disabled = false,
  label,
  onPress,
  variant = "default",
}: {
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  variant?: HealthOSPillVariant;
}) {
  return <HealthOSPill disabled={disabled} label={label} onPress={onPress} size="sm" variant={variant} />;
}

export const aiImportStyles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  row: {
    gap: healthOSSpacing.sm,
  },
  split: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
  },
});
