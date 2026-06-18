import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

export function HealthOSAISafetyNotice() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard variant="ai">
      <View style={styles.row}>
        <ShieldCheck color={palette.ai} size={18} />
        <Text style={[healthOSTypography.bodySmall, styles.text, { color: palette.softText }]}>
          HealthOS AI can help organize information, but it does not diagnose,
          prescribe, dose medication, or replace a healthcare professional.
        </Text>
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  text: {
    flex: 1,
  },
});
