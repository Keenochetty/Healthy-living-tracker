import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSRecordPrivacyStatus } from "./HealthOSRecordsTypes";

type Props = {
  onManagePrivacy: () => void;
  privacyStatus: HealthOSRecordPrivacyStatus;
  recordCount: number;
};

export function HealthOSRecordsHeader({ onManagePrivacy, privacyStatus, recordCount }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard variant="darkHero">
      <View style={styles.content}>
        <HealthOSPill label="Private document vault" realmColor={palette.records} variant="realm" />
        <Text style={[healthOSTypography.screenTitle, { color: "#f8fafc" }]}>Records</Text>
        <Text style={[healthOSTypography.bodySmall, { color: "#cbd5e1" }]}>
          Scripts, reports, vaccine cards, scans, labels, doctor notes, and linked health documents stay private by default.
        </Text>
        <View style={styles.pills}>
          <HealthOSPill label={recordCount ? `${recordCount} records` : "No records yet"} size="sm" variant="glass" />
          <HealthOSPill label={formatPrivacy(privacyStatus)} onPress={onManagePrivacy} size="sm" variant="realm" />
        </View>
      </View>
    </HealthOSCard>
  );
}

function formatPrivacy(value: HealthOSRecordPrivacyStatus) {
  if (value === "sharedSelected") return "Shared with selected people";
  if (value === "caregiverLimited") return "Caregiver limited";
  if (value === "private") return "Private";
  return "Private status unknown";
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.md,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
