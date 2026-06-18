import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Library } from "lucide-react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  hasContent: boolean;
};

export function HealthOSTrustedContentHeader({ hasContent }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.header}>
      <Library color={palette.ai} size={24} />
      <View style={styles.copy}>
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          Trusted Content
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {hasContent
            ? "Source-linked articles, guides, and health education."
            : "Trusted articles will appear when content sources are connected."}
        </Text>
        <View style={styles.chips}>
          <HealthOSPill label="Source-linked" size="sm" variant="success" />
          <HealthOSPill label="Review before acting" size="sm" variant="warning" />
          <HealthOSPill label="Educational" size="sm" variant="glass" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.sm,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
});
