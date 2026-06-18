import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type Props = {
  onManagePrivacy: () => void;
  onOpenBabyProfile: () => void;
  onOpenMedication: () => void;
  onUploadRecord: () => void;
  onViewCalendar: () => void;
};

export function HealthOSPregnancyCalendarPrivacyRecordsCard({
  onManagePrivacy,
  onOpenBabyProfile,
  onOpenMedication,
  onUploadRecord,
  onViewCalendar,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="Connect pregnancy to calendar, records, baby profile, and privacy settings." title="Calendar, privacy, and records" variant="elevated">
      <View style={styles.stack}>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          These actions open existing HealthOS areas. This card does not create records, reminders, or sharing permissions by itself.
        </Text>
        <View style={styles.pills}>
          <HealthOSPill label="View calendar" onPress={onViewCalendar} variant="glass" />
          <HealthOSPill label="Upload record" onPress={onUploadRecord} variant="glass" />
          <HealthOSPill label="Manage privacy" onPress={onManagePrivacy} variant="glass" />
          <HealthOSPill label="Open baby profile" onPress={onOpenBabyProfile} variant="glass" />
          <HealthOSPill label="View medication" onPress={onOpenMedication} variant="glass" />
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
