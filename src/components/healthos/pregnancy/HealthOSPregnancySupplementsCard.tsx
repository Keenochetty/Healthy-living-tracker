import { Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPregnancyData } from "./HealthOSPregnancyTypes";

type Props = {
  onAskAI: () => void;
  onOpenMedication: () => void;
  onOpenSupplements: () => void;
  onScanScript: () => void;
  supplements: HealthOSPregnancyData["supplements"];
};

export function HealthOSPregnancySupplementsCard({
  onAskAI,
  onOpenMedication,
  onOpenSupplements,
  onScanScript,
  supplements,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="Confirm supplements and medication with your healthcare professional." title="Supplements and medication" variant="elevated">
      <View style={{ gap: healthOSSpacing.sm }}>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {supplements.supplementSummary}
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {supplements.medicationSummary}
        </Text>
        <Text style={[healthOSTypography.caption, { color: palette.warning }]}>
          HealthOS does not recommend starting, stopping, or changing medication.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: healthOSSpacing.sm }}>
          <HealthOSPill label="Open supplements" onPress={onOpenSupplements} variant="ai" />
          <HealthOSPill label="View medication" onPress={onOpenMedication} variant="glass" />
          <HealthOSPill label="Scan script" onPress={onScanScript} variant="glass" />
          <HealthOSPill label="Prepare questions" onPress={onAskAI} variant="glass" />
        </View>
      </View>
    </HealthOSCard>
  );
}
