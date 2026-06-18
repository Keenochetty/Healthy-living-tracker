import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSMedicationKind, HealthOSMedicationPrivacyStatus } from "./HealthOSMedicationTypes";

type Props = {
  activeFocus: HealthOSMedicationKind;
  medicationCount: number;
  onSetFocus: (focus: HealthOSMedicationKind) => void;
  privacyStatus: HealthOSMedicationPrivacyStatus;
  supplementCount: number;
};

export function HealthOSMedicationHeader({
  activeFocus,
  medicationCount,
  onSetFocus,
  privacyStatus,
  supplementCount,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard variant="darkHero">
      <View style={styles.content}>
        <HealthOSPill label="Medication + Supplements" realmColor={palette.medication} variant="realm" />
        <Text style={[healthOSTypography.screenTitle, { color: "#f8fafc" }]}>Medication</Text>
        <Text style={[healthOSTypography.bodySmall, { color: "#cbd5e1" }]}>
          Track reminders, labels, supplement routines, missed doses, side-effect notes, records, and sharing from one private review-first space.
        </Text>
        <View style={styles.pills}>
          <HealthOSPill
            label={`Medication ${medicationCount}`}
            onPress={() => onSetFocus("medication")}
            selected={activeFocus === "medication"}
            size="sm"
          />
          <HealthOSPill
            label={`Supplements ${supplementCount}`}
            onPress={() => onSetFocus("supplement")}
            selected={activeFocus === "supplement"}
            size="sm"
          />
          <HealthOSPill label={`Privacy: ${formatPrivacy(privacyStatus)}`} size="sm" variant="glass" />
        </View>
      </View>
    </HealthOSCard>
  );
}

function formatPrivacy(value: HealthOSMedicationPrivacyStatus) {
  if (value === "sharedSelected") return "selected shared";
  if (value === "caregiverLimited") return "caregiver limited";
  return value;
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
