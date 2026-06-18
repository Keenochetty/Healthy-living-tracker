import { Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSChildContentItem } from "./HealthOSBabyChildTypes";

type Props = {
  items: HealthOSChildContentItem[];
  onOpenSource: (url: string) => void;
};

export function HealthOSChildContentSection({ items, onOpenSource }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="Source-linked education only." title="Baby and child care articles" variant="elevated">
      <View style={{ gap: healthOSSpacing.md }}>
        {items.length ? (
          items.slice(0, 4).map((item) => (
            <View key={item.id} style={{ gap: healthOSSpacing.xs }}>
              <HealthOSPill label={item.topic} size="sm" variant="glass" />
              <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>{item.title}</Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>{item.summary}</Text>
              <HealthOSPill label={`Open source · ${item.sourceName}`} onPress={() => onOpenSource(item.sourceUrl)} size="sm" variant="ai" />
            </View>
          ))
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Baby and child care articles will appear when trusted content is connected.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}
