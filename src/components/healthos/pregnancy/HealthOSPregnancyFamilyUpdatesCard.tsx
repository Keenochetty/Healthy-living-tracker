import { Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPregnancyData } from "./HealthOSPregnancyTypes";

type Props = {
  familyUpdates: HealthOSPregnancyData["familyUpdates"];
  onShareFamilyUpdate: () => void;
};

export function HealthOSPregnancyFamilyUpdatesCard({ familyUpdates, onShareFamilyUpdate }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="You choose what family can see." title="Family updates" variant="elevated">
      <View style={{ gap: healthOSSpacing.sm }}>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {familyUpdates.status}
        </Text>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          Shared updates: {familyUpdates.count}
        </Text>
        <HealthOSPill label="Update family" onPress={onShareFamilyUpdate} variant="glass" />
      </View>
    </HealthOSCard>
  );
}
