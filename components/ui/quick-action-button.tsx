import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { componentRadius } from "@/constants/radius";
import { layoutSpacing, spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type QuickActionButtonProps = {
  icon?: ReactNode;
  label: string;
  onPress: () => void;
  toneColor?: string;
};

export function QuickActionButton({ icon, label, onPress, toneColor = colors.brand.primary }: QuickActionButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {icon ? <View style={styles.icon}>{icon}</View> : <View style={[styles.iconDot, { backgroundColor: toneColor }]} />}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: componentRadius.chip,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: layoutSpacing.touchTarget,
    paddingHorizontal: spacing.lg
  },
  icon: {
    alignItems: "center",
    justifyContent: "center"
  },
  iconDot: {
    borderRadius: 999,
    height: 10,
    width: 10
  },
  label: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  pressed: {
    backgroundColor: colors.background.mist,
    opacity: 0.9,
    transform: [{ scale: 0.97 }, { translateY: 1 }]
  }
});
