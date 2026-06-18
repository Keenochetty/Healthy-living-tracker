import { Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPregnancyData } from "./HealthOSPregnancyTypes";

type Props = {
  babyGrowth: HealthOSPregnancyData["babyGrowth"];
  onOpenSource: (url: string) => void;
};

export function HealthOSWeeklyBabyGrowthCard({ babyGrowth, onOpenSource }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const content = babyGrowth.content;

  return (
    <HealthOSCard
      subtitle={babyGrowth.status}
      title="Weekly baby growth"
      variant="elevated"
    >
      <View style={{ gap: healthOSSpacing.sm }}>
        <HealthOSPill
          label={babyGrowth.weekLabel}
          realmColor={palette.pregnancy}
          size="sm"
          variant="realm"
        />
        {content ? (
          <>
            <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
              {content.title}
            </Text>
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              {content.summary}
            </Text>
            <HealthOSPill
              label={`Open source · ${content.sourceName}`}
              onPress={() => onOpenSource(content.sourceUrl)}
              variant="glass"
            />
          </>
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Weekly baby growth tips will appear when pregnancy content is connected.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}
