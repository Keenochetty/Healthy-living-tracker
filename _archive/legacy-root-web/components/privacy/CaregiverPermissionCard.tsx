import { StyleSheet, Text, View } from "react-native";

import {
  AppIcon,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type CaregiverPermissionCardProps = {
  assignedOnly?: boolean;
  onConfigure?: () => void;
};

export function CaregiverPermissionCard({
  assignedOnly = true,
  onConfigure,
}: CaregiverPermissionCardProps) {
  return (
    <WidgetCard
      accentColor={colors.status.success}
      action={
        <StatusPill
          label={assignedOnly ? "Assigned only" : "Needs assignment"}
          tone={assignedOnly ? "success" : "warning"}
        />
      }
      subtitle="Caregiver access is scoped to assigned care profiles and the exact fields granted."
      title="Caregiver permissions"
    >
      <View style={styles.body}>
        <View style={styles.iconShell}>
          <AppIcon color={colors.status.success} name="caregiver" size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>No full family access</Text>
          <Text style={styles.text}>
            Caregivers can later receive schedule, care instruction, logging,
            and emergency permissions per assignment.
          </Text>
        </View>
      </View>
      <QuickActionButton
        label="Configure caregiver placeholder"
        onPress={onConfigure ?? (() => undefined)}
        toneColor={colors.status.success}
      />
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.status.successSoft,
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  text: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900",
  },
});
