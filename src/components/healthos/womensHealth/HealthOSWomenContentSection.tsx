import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSWomenContentItem } from "./HealthOSWomenHealthTypes";

type Props = {
  items: HealthOSWomenContentItem[];
  onOpenSource: (url: string) => void;
};

export function HealthOSWomenContentSection({ items, onOpenSource }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <>
      <HealthOSSectionHeader subtitle="Source-linked education when available." title="Articles and sources" />
      {items.length ? (
        items.map((item) => (
          <HealthOSCard key={item.id} variant="compact">
            <View style={styles.header}>
              <HealthOSPill label={item.topic} size="sm" variant="realm" realmColor={palette.women} />
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                {item.sourceName}
              </Text>
            </View>
            <Text style={[healthOSTypography.cardTitle, styles.title, { color: palette.inkText }]}>
              {item.title}
            </Text>
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              {item.summary}
            </Text>
            <View style={styles.actions}>
              <HealthOSPill label="Open source" onPress={() => onOpenSource(item.sourceUrl)} variant="glass" />
            </View>
          </HealthOSCard>
        ))
      ) : (
        <HealthOSCard variant="compact">
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Women's health articles will appear when trusted content is connected.
          </Text>
        </HealthOSCard>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    justifyContent: "space-between",
  },
  title: {
    marginTop: healthOSSpacing.sm,
  },
});
