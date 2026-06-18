import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSGlassMenu, type HealthOSGlassMenuItem } from "@/components/healthos/HealthOSGlassMenu";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSFamilyMemberCard } from "./HealthOSFamilyMemberCard";
import type { HealthOSFamilyMemberDisplay } from "./HealthOSFamilyTypes";

type HealthOSFamilyMemberListProps = {
  activeMenuMember: HealthOSFamilyMemberDisplay | null;
  members: HealthOSFamilyMemberDisplay[];
  onContact: (member: HealthOSFamilyMemberDisplay) => void;
  onManagePermissions: () => void;
  onNotifications: () => void;
  onOpenMember: (member: HealthOSFamilyMemberDisplay) => void;
  onSetActiveMenuMember: (member: HealthOSFamilyMemberDisplay | null) => void;
};

export function HealthOSFamilyMemberList({
  activeMenuMember,
  members,
  onContact,
  onManagePermissions,
  onNotifications,
  onOpenMember,
  onSetActiveMenuMember,
}: HealthOSFamilyMemberListProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const menuItems: HealthOSGlassMenuItem[] = activeMenuMember
    ? [
        {
          key: "view",
          label: "View profile",
          onPress: () => onOpenMember(activeMenuMember),
        },
        {
          key: "notifications",
          label: "Notification settings",
          onPress: onNotifications,
        },
        {
          key: "shared",
          label: "Shared with me",
          onPress: () => onOpenMember(activeMenuMember),
        },
        {
          key: "permissions",
          label: "Manage permissions",
          onPress: onManagePermissions,
        },
        {
          disabled: !activeMenuMember.contactEmail && !activeMenuMember.contactPhone,
          key: "contact",
          label: "Contact",
          onPress: () => onContact(activeMenuMember),
        },
        {
          destructive: true,
          disabled: true,
          key: "remove",
          label: "Remove from circle",
          subtitle: "Requires permission checks later",
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      <HealthOSSectionHeader
        subtitle="Tap a member for details or long-press for quick actions."
        title="Members"
      />
      {members.length ? (
        <View style={styles.list}>
          {members.map((member) => (
            <HealthOSFamilyMemberCard
              key={member.id}
              member={member}
              onLongPress={() => onSetActiveMenuMember(member)}
              onPress={() => onOpenMember(member)}
            />
          ))}
        </View>
      ) : (
        <HealthOSCard variant="compact">
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Invite family when you are ready.
          </Text>
        </HealthOSCard>
      )}
      <HealthOSGlassMenu
        items={menuItems}
        mode="menu"
        onClose={() => onSetActiveMenuMember(null)}
        visible={Boolean(activeMenuMember)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: healthOSSpacing.md,
  },
  list: {
    gap: healthOSSpacing.sm,
  },
});

