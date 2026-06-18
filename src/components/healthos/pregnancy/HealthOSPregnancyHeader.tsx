import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type {
  HealthOSPregnancyPrivacyStatus,
  HealthOSPregnancyStatus,
} from "./HealthOSPregnancyTypes";

type Props = {
  onManagePrivacy: () => void;
  pregnancyStatus: HealthOSPregnancyStatus;
  privacyStatus: HealthOSPregnancyPrivacyStatus;
  setupState: string;
  weekSummary: string;
};

export function HealthOSPregnancyHeader({
  onManagePrivacy,
  pregnancyStatus,
  privacyStatus,
  setupState,
  weekSummary,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const active = pregnancyStatus === "active";

  return (
    <HealthOSCard variant="glass">
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
            Pregnancy
          </Text>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {active ? weekSummary : setupState}
          </Text>
        </View>
        <HealthOSPill
          label={privacyLabel(privacyStatus)}
          onPress={onManagePrivacy}
          realmColor={palette.pregnancy}
          size="sm"
          variant={privacyStatus === "private" ? "realm" : "warning"}
        />
      </View>
    </HealthOSCard>
  );
}

function privacyLabel(status: HealthOSPregnancyPrivacyStatus) {
  if (status === "private") return "Private";
  if (status === "sharedSelected") return "Shared with selected people";
  return "Private status unknown";
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
});
