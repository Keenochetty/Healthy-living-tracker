import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSFamilyInviteManageCardProps = {
  onInvite: () => void;
  onManageFamily: () => void;
  onManagePermissions: () => void;
  pendingInvitesCount: number;
};

export function HealthOSFamilyInviteManageCard({
  onInvite,
  onManageFamily,
  onManagePermissions,
  pendingInvitesCount,
}: HealthOSFamilyInviteManageCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      icon={<AppIcon decorative name="shared" size={20} variant="primary" />}
      subtitle="Prepare invites and permission controls"
      title="Invite / manage family"
      variant="glass"
    >
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {pendingInvitesCount
          ? `${pendingInvitesCount} pending invite${pendingInvitesCount === 1 ? "" : "s"} need review.`
          : "No pending invites."}
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Invite member" onPress={onInvite} size="sm" variant="realm" />
        <HealthOSPill label="Manage family" onPress={onManageFamily} size="sm" variant="glass" />
        <HealthOSPill label="Permissions" onPress={onManagePermissions} size="sm" variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});

