import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { categoryLabel, type HealthOSTrustedContentItem } from "@/features/trustedContent";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSSourceQualityBadge } from "./HealthOSSourceQualityBadge";

type Props = {
  item: HealthOSTrustedContentItem;
  onOpen: (item: HealthOSTrustedContentItem) => void;
};

export function HealthOSTrustedContentRow({ item, onOpen }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard onPress={() => onOpen(item)} variant="list">
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {item.title}
          </Text>
          <Text numberOfLines={2} style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {item.summary}
          </Text>
          <View style={styles.chips}>
            <HealthOSPill label={categoryLabel(item.categories[0] ?? "other")} size="sm" variant="glass" />
            <HealthOSSourceQualityBadge quality={item.source.sourceQuality} />
          </View>
        </View>
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.xs,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  row: {
    flexDirection: "row",
  },
});
