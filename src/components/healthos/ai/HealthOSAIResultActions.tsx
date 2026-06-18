import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { FileCheck2 } from "lucide-react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  onReview: () => void;
};

export function HealthOSAIResultActions({ onReview }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Review AI import"
        accessibilityRole="button"
        onPress={onReview}
        style={({ pressed }) => [
          styles.button,
          surfaces.glassPill,
          { backgroundColor: palette.ai },
          pressed && styles.pressed,
        ]}
      >
        <FileCheck2 color={palette.deepNavy} size={16} />
        <Text style={[healthOSTypography.buttonLabel, { color: palette.deepNavy }]}>
          Review import
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: healthOSRadius.pill,
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    minHeight: 42,
    paddingHorizontal: healthOSSpacing.lg,
    paddingVertical: healthOSSpacing.sm,
  },
  pressed: {
    opacity: 0.76,
  },
  row: {
    flexDirection: "row",
  },
});
