import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSRecordsData } from "./HealthOSRecordsTypes";
import { RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  data: Pick<HealthOSRecordsData, "emergencyPacketSummary" | "records" | "reviewQueue" | "sharingSummary">;
};

export function HealthOSRecordsVaultHero({ data }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const total = data.records.length;
  return (
    <HealthOSCard title="Secure vault" subtitle="Private-first document organizer">
      <View style={styles.hero}>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
            {total ? "Your records vault" : "Your records vault is empty."}
          </Text>
          <RecordsText muted>
            {total ? "Search, review, link, and prepare records without auto-sharing." : "Scan or upload documents when you're ready."}
          </RecordsText>
          <View style={recordsSharedStyles.actions}>
            <RecordsText muted>{`${data.reviewQueue.length} need review`}</RecordsText>
            <RecordsText muted>{`${data.sharingSummary.sharedCount} shared`}</RecordsText>
          </View>
        </View>
        <HealthOSProgressRingPlaceholder
          label={`${total}`}
          max={Math.max(total + data.reviewQueue.length, 1)}
          sublabel="records"
          value={total}
        />
      </View>
      <RecordsText muted>{data.emergencyPacketSummary.status}</RecordsText>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.sm,
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.lg,
    marginBottom: healthOSSpacing.md,
  },
});
