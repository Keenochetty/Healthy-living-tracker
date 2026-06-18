import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSAIImportEnvelope } from "@/features/aiImport";

import { HealthOSAIConfidenceBadge } from "./HealthOSAIConfidenceBadge";

type Props = {
  envelope: HealthOSAIImportEnvelope | null;
};

export function HealthOSAIImportHeader({ envelope }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  if (!envelope) {
    return (
      <HealthOSCard title="AI Import Review" subtitle="No import payload available.">
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>Start from Scan, AI chat, or Records to review an import.</Text>
      </HealthOSCard>
    );
  }
  return (
    <HealthOSCard variant="ai">
      <View style={styles.stack}>
        <HealthOSPill label={envelope.detectedType} variant="ai" />
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>{envelope.title}</Text>
        {envelope.summary ? <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>{envelope.summary}</Text> : null}
        <View style={styles.pills}>
          <HealthOSAIConfidenceBadge confidence={envelope.confidence} />
          <HealthOSPill label={`Source: ${envelope.source.sourceType}`} size="sm" variant="glass" />
          <HealthOSPill label="Review required" size="sm" variant="warning" />
        </View>
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
