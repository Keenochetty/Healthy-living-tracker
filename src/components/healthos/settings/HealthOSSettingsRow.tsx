import type { ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, useColorScheme, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  accessibilityLabel?: string;
  chip?: string;
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onPress?: () => void;
  subtitle?: string;
  title: string;
  toggle?: { onValueChange: (value: boolean) => void; value: boolean };
  value?: string;
};

export function HealthOSSettingsRow({
  accessibilityLabel,
  chip,
  destructive = false,
  disabled = false,
  icon,
  onPress,
  subtitle,
  title,
  toggle,
  value,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const pressable = Boolean(onPress);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? `${title}${value ? `, ${value}` : ""}`}
      accessibilityRole={toggle ? "switch" : pressable ? "button" : undefined}
      accessibilityState={{ checked: toggle?.value, disabled }}
      disabled={disabled || (!pressable && !toggle)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        surfaces.listRow,
        destructive && styles.dangerRow,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.copy}>
        <View style={styles.heading}>
          <Text style={[healthOSTypography.cardTitle, { color: destructive ? palette.danger : palette.inkText }]}>
            {title}
          </Text>
          {chip ? <HealthOSPill label={chip} size="sm" variant={destructive ? "danger" : "glass"} /> : null}
        </View>
        {subtitle ? (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text numberOfLines={1} style={[healthOSTypography.caption, styles.value, { color: palette.softText }]}>
          {value}
        </Text>
      ) : null}
      {toggle ? <Switch onValueChange={toggle.onValueChange} value={toggle.value} /> : null}
      {pressable ? <ChevronRight color={palette.softText} size={18} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
    minWidth: 0,
  },
  dangerRow: {
    borderRadius: healthOSRadius.lg,
  },
  disabled: {
    opacity: 0.52,
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  value: {
    maxWidth: 108,
    textAlign: "right",
  },
});
