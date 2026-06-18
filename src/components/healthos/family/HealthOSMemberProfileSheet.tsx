import { Modal, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSFamilyAvatar } from "./HealthOSFamilyAvatar";
import type { HealthOSFamilyMemberDisplay, HealthOSMemberNotificationDisplay } from "./HealthOSFamilyTypes";
import { HealthOSMemberNotificationPreview } from "./HealthOSMemberNotificationPreview";

type HealthOSMemberProfileSheetProps = {
  member: HealthOSFamilyMemberDisplay | null;
  notifications?: HealthOSMemberNotificationDisplay;
  onClose: () => void;
  onContact: () => void;
  onManageNotifications: () => void;
  onManagePermissions: () => void;
  onSharedCalendar: () => void;
};

export function HealthOSMemberProfileSheet({
  member,
  notifications,
  onClose,
  onContact,
  onManageNotifications,
  onManagePermissions,
  onSharedCalendar,
}: HealthOSMemberProfileSheetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <Modal animationType="slide" transparent visible={Boolean(member)} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, surfaces.elevatedCard]}>
          {member ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <HealthOSFamilyAvatar initials={member.initials} size={58} />
                <View style={styles.copy}>
                  <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                    {member.name}
                  </Text>
                  <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                    {member.relationshipLabel ?? member.role}
                  </Text>
                  {member.joinedAt ? (
                    <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
                <HealthOSPill label={member.permissionLabel ?? "Private"} size="sm" variant="glass" />
              </View>

              <HealthOSCard title="Shared with you" variant="compact">
                {member.sharedModules?.length ? (
                  <View style={styles.pills}>
                    {member.sharedModules.map((module) => (
                      <HealthOSPill key={module} label={module} size="sm" variant="glass" />
                    ))}
                  </View>
                ) : (
                  <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                    Shared modules will appear here when permissions are connected.
                  </Text>
                )}
              </HealthOSCard>

              <HealthOSMemberNotificationPreview
                notifications={notifications}
                onManage={onManageNotifications}
              />

              <View style={styles.actions}>
                <HealthOSPill label="View shared calendar" onPress={onSharedCalendar} variant="realm" />
                <HealthOSPill label="Contact" onPress={onContact} variant="glass" />
                <HealthOSPill label="Manage permissions" onPress={onManagePermissions} variant="glass" />
                <HealthOSPill label="Close" onPress={onClose} variant="glass" />
              </View>
            </ScrollView>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.lg,
  },
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.32)",
    flex: 1,
    justifyContent: "flex-end",
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    marginBottom: healthOSSpacing.lg,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: healthOSRadius["2xl"],
    borderTopRightRadius: healthOSRadius["2xl"],
    maxHeight: "82%",
    padding: healthOSSpacing.lg,
  },
});

