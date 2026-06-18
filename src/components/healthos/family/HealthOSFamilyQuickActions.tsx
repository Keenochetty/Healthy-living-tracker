import { ScrollView, StyleSheet, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

type HealthOSFamilyQuickActionsProps = {
  onAddCaregiver: () => void;
  onAddChild: () => void;
  onFamilyNote: () => void;
  onInvite: () => void;
  onManagePermissions: () => void;
  onSharedEvent: () => void;
};

export function HealthOSFamilyQuickActions({
  onAddCaregiver,
  onAddChild,
  onFamilyNote,
  onInvite,
  onManagePermissions,
  onSharedEvent,
}: HealthOSFamilyQuickActionsProps) {
  const actions = [
    { icon: "shared" as const, label: "Invite member", onPress: onInvite },
    { icon: "child_baby" as const, label: "Add child", onPress: onAddChild },
    { icon: "caregiver" as const, label: "Add caregiver", onPress: onAddCaregiver },
    { icon: "calendar" as const, label: "Shared event", onPress: onSharedEvent },
    { icon: "note" as const, label: "Family note", onPress: onFamilyNote },
    { icon: "privacy" as const, label: "Permissions", onPress: onManagePermissions },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {actions.map((action) => (
          <HealthOSPill
            icon={<AppIcon decorative name={action.icon} size={16} variant="muted" />}
            key={action.label}
            label={action.label}
            onPress={action.onPress}
            variant="glass"
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});

