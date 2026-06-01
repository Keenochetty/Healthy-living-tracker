import { StyleSheet, Text, View } from "react-native";

import { ToggleRow } from "@/components/ui";
import {
  permissionCategoryDescriptions,
  permissionCategoryLabels,
  permissionGroupLabels,
  permissionGroups
} from "@/constants/permissions";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { PermissionGrant } from "@/types/permissions";

type PermissionToggleGroupProps = {
  grants: PermissionGrant[];
  onChange: (category: PermissionGrant["category"], enabled: boolean) => void;
};

export function PermissionToggleGroup({ grants, onChange }: PermissionToggleGroupProps) {
  const grantsByCategory = new Map(grants.map((grant) => [grant.category, grant]));

  return (
    <View style={styles.container}>
      {Object.entries(permissionGroups).map(([group, categories]) => {
        const groupGrants = categories.map((category) => grantsByCategory.get(category)).filter((grant): grant is PermissionGrant => Boolean(grant));

        if (groupGrants.length === 0) {
          return null;
        }

        return (
          <View key={group} style={styles.group}>
            <Text style={styles.groupTitle}>{permissionGroupLabels[group as keyof typeof permissionGroupLabels]}</Text>
            <View style={styles.groupBody}>
              {groupGrants.map((grant) => (
                <ToggleRow
                  disabled={grant.locked}
                  key={grant.category}
                  label={permissionCategoryLabels[grant.category]}
                  onValueChange={(enabled) => onChange(grant.category, enabled)}
                  subtitle={grant.note ?? permissionCategoryDescriptions[grant.category]}
                  value={grant.enabled}
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg
  },
  group: {
    gap: spacing.sm
  },
  groupBody: {
    gap: spacing.sm
  },
  groupTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  }
});
