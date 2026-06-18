import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSFamilyAvatar } from "./HealthOSFamilyAvatar";
import type { HealthOSFamilyMemberDisplay } from "./HealthOSFamilyTypes";

type HealthOSFamilyMemberCardProps = {
  member: HealthOSFamilyMemberDisplay;
  onLongPress: () => void;
  onPress: () => void;
};

export function HealthOSFamilyMemberCard({
  member,
  onLongPress,
  onPress,
}: HealthOSFamilyMemberCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      onLongPress={onLongPress}
      onPress={onPress}
      testID={`healthos-family-member-${member.id}`}
      variant="compact"
    >
      <View style={styles.row}>
        <HealthOSFamilyAvatar initials={member.initials} />
        <View style={styles.copy}>
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {member.name}
          </Text>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {member.relationshipLabel ?? member.role}
          </Text>
          {member.statusLine ? (
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              {member.statusLine}
            </Text>
          ) : null}
        </View>
        <Text style={[healthOSTypography.cardTitle, { color: palette.softText }]}>
          ›
        </Text>
      </View>
      <View style={styles.chips}>
        <HealthOSPill
          label={member.permissionLabel ?? "Private by default"}
          size="sm"
          variant="glass"
        />
        <HealthOSPill
          label={member.notificationSummary ?? "Notifications pending"}
          size="sm"
          variant="glass"
        />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.sm,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});

