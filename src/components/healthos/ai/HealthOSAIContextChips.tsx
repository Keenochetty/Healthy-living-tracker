import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  attachNotice?: string | null;
  contextLabel: string;
  onAttachData?: () => void;
};

export function HealthOSAIContextChips({ attachNotice, contextLabel, onAttachData }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <View style={styles.wrap}>
      <HealthOSPill label={`Context: ${contextLabel}`} size="sm" variant="ai" />
      <HealthOSPill label="No private data attached" size="sm" variant="glass" />
      <HealthOSPill label="Attach data" onPress={onAttachData} size="sm" variant="default" />
      {attachNotice ? (
        <Text style={[healthOSTypography.caption, styles.notice, { color: palette.softText }]}>
          {attachNotice}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    width: "100%",
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
