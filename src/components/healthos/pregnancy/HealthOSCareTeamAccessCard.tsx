import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPregnancyData } from "./HealthOSPregnancyTypes";

type Props = {
  careTeamAccess: HealthOSPregnancyData["careTeamAccess"];
  onInvite: () => void;
  onManage: () => void;
};

export function HealthOSCareTeamAccessCard({ careTeamAccess, onInvite, onManage }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="Invite a doctor or nursing sister later for limited review access." title="Care team access" variant="elevated">
      <View style={styles.stack}>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {careTeamAccess.status}
        </Text>
        <View style={styles.pills}>
          {careTeamAccess.roles.map((role) => (
            <HealthOSPill key={role} label={formatRole(role)} variant="glass" />
          ))}
        </View>
        <View style={styles.pills}>
          <HealthOSPill label="Invite care professional" onPress={onInvite} variant="ai" />
          <HealthOSPill label="Manage access" onPress={onManage} variant="glass" />
          <HealthOSPill label="Learn about permissions" onPress={onManage} variant="glass" />
        </View>
      </View>
    </HealthOSCard>
  );
}

function formatRole(role: string) {
  return role.replace(/([A-Z])/g, " $1").replace(/\b\w/g, (letter) => letter.toUpperCase());
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
