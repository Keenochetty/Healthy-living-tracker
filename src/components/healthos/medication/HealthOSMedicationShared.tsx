import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill, type HealthOSPillVariant } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

export function MedicationText({
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
    <Text
      style={[
        strong ? healthOSTypography.cardTitle : healthOSTypography.bodySmall,
        { color: muted ? palette.softText : palette.inkText },
      ]}
    >
      {children}
    </Text>
  );
}

export function MedicationAction({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress?: () => void;
  variant?: HealthOSPillVariant;
}) {
  return <HealthOSPill label={label} onPress={onPress} size="sm" variant={variant} />;
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={medicationSharedStyles.empty}>
      <MedicationText muted>{text}</MedicationText>
    </View>
  );
}

export function CompactLink({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={[healthOSTypography.buttonLabel, { color: palette.medication }]}>{label}</Text>
    </Pressable>
  );
}

export const medicationSharedStyles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  empty: {
    gap: healthOSSpacing.xs,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  row: {
    gap: healthOSSpacing.sm,
  },
  splitRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
  },
});
