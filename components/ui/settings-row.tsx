import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { componentRadius } from "@/constants/radius";
import { layoutSpacing, spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type SettingsRowProps = {
  accessory?: ReactNode;
  icon?: ReactNode;
  label: string;
  onPress?: () => void;
  subtitle?: string;
};

export function SettingsRow({ accessory, icon, label, onPress, subtitle }: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {accessory}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.accent.mint,
    borderRadius: componentRadius.chip,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  label: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.78
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: componentRadius.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: layoutSpacing.touchTarget + 12,
    padding: spacing.lg
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
