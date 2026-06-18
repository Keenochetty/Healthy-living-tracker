import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";

import { getContentDisclaimer, type HealthOSTrustedContentItem } from "@/features/trustedContent";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  item: HealthOSTrustedContentItem;
};

export function HealthOSContentSafetyDisclaimer({ item }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.row}>
      <ShieldCheck color={palette.warning} size={16} />
      <Text style={[healthOSTypography.caption, styles.text, { color: palette.softText }]}>
        {getContentDisclaimer(item)}
      </Text>
    </View>
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
    lineHeight: 18,
  },
});
