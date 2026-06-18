import { Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPregnancyContentItem } from "./HealthOSPregnancyTypes";

type Props = {
  items: HealthOSPregnancyContentItem[];
  onOpenSource: (url: string) => void;
};

export function HealthOSPregnancyContentSection({ items, onOpenSource }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="Source-linked education only. HealthOS does not invent medical claims." title="Pregnancy articles" variant="elevated">
      <View style={{ gap: healthOSSpacing.md }}>
        {items.length ? (
          items.slice(0, 4).map((item) => (
            <View key={item.id} style={{ gap: healthOSSpacing.xs }}>
              <HealthOSPill label={item.topic} size="sm" variant="glass" />
              <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                {item.title}
              </Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {item.summary}
              </Text>
              <HealthOSPill
                label={`Open source · ${item.sourceName}`}
                onPress={() => onOpenSource(item.sourceUrl)}
                size="sm"
                variant="ai"
              />
            </View>
          ))
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Pregnancy articles will appear when trusted content is connected.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}
