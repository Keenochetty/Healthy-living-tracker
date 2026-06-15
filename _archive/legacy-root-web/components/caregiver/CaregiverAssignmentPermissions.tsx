import { StyleSheet, Text, View } from "react-native";

import { ToggleRow } from "@/components/ui";
import {
  caregiverAssignmentPermissionDescriptions,
  caregiverAssignmentPermissionGroupLabels,
  caregiverAssignmentPermissionGroups,
  caregiverAssignmentPermissionLabels,
} from "@/constants/caregiver-assignments";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type {
  CaregiverAssignmentPermissionKey,
  CaregiverAssignmentPermissions as AssignmentPermissions,
} from "@/types/caregiver-assignments";

type CaregiverAssignmentPermissionsProps = {
  onChange: (
    permissionKey: CaregiverAssignmentPermissionKey,
    enabled: boolean,
  ) => void;
  permissions: AssignmentPermissions;
};

export function CaregiverAssignmentPermissions({
  onChange,
  permissions,
}: CaregiverAssignmentPermissionsProps) {
  return (
    <View style={styles.container}>
      {Object.entries(caregiverAssignmentPermissionGroups).map(
        ([groupKey, permissionKeys]) => (
          <View key={groupKey} style={styles.group}>
            <Text style={styles.groupTitle}>
              {
                caregiverAssignmentPermissionGroupLabels[
                  groupKey as keyof typeof caregiverAssignmentPermissionGroupLabels
                ]
              }
            </Text>
            <View style={styles.groupBody}>
              {permissionKeys.map((permissionKey) => (
                <ToggleRow
                  key={permissionKey}
                  label={caregiverAssignmentPermissionLabels[permissionKey]}
                  onValueChange={(enabled) => onChange(permissionKey, enabled)}
                  subtitle={
                    caregiverAssignmentPermissionDescriptions[permissionKey]
                  }
                  value={permissions[permissionKey]}
                />
              ))}
            </View>
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupBody: {
    gap: spacing.sm,
  },
  groupTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900",
  },
});
