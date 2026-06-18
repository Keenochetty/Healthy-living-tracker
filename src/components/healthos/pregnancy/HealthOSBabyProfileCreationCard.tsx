import { Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPregnancyData } from "./HealthOSPregnancyTypes";

type Props = {
  babyProfile: HealthOSPregnancyData["babyProfile"];
  onCreateBabyProfile: () => void;
  onOpenBabyProfile: () => void;
};

export function HealthOSBabyProfileCreationCard({
  babyProfile,
  onCreateBabyProfile,
  onOpenBabyProfile,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="You can update these details later." title="Create baby profile" variant="elevated">
      <View style={{ gap: healthOSSpacing.sm }}>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {babyProfile.status}
        </Text>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          {babyProfile.dueDate ? `Linked due date: ${babyProfile.dueDate}` : "No due date linked yet."}
        </Text>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          {babyProfile.genderStatus}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: healthOSSpacing.sm }}>
          <HealthOSPill label="Create baby profile" onPress={onCreateBabyProfile} variant="ai" />
          <HealthOSPill label="Open Baby/Child" onPress={onOpenBabyProfile} variant="glass" />
        </View>
      </View>
    </HealthOSCard>
  );
}
