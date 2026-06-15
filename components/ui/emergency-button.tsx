import { Pressable, StyleSheet, Text } from "react-native";

import { componentRadius } from "@/constants/radius";
import { layoutSpacing, spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type EmergencyButtonProps = {
  label?: string;
  onPress: () => void;
};

export function EmergencyButton({
  label = "Emergency",
  onPress,
}: EmergencyButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.status.emergency,
    borderRadius: componentRadius.button,
    justifyContent: "center",
    minHeight: layoutSpacing.touchTarget + 8,
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
});
