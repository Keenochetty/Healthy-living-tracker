import { Linking, StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSFamilyAvatar } from "./HealthOSFamilyAvatar";
import type { HealthOSCaregiverDisplay } from "./HealthOSFamilyTypes";

type HealthOSCaregiverCardProps = {
  caregiver: HealthOSCaregiverDisplay | null;
  onAddCaregiver: () => void;
  onOpenCaregiver: (caregiver?: HealthOSCaregiverDisplay) => void;
};

export function HealthOSCaregiverCard({
  caregiver,
  onAddCaregiver,
  onOpenCaregiver,
}: HealthOSCaregiverCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      icon={<AppIcon decorative name="caregiver" size={20} variant="primary" />}
      onPress={() => (caregiver ? onOpenCaregiver(caregiver) : onAddCaregiver())}
      subtitle="Permission-aware care support"
      title="Caregiver"
      variant="elevated"
    >
      {caregiver ? (
        <View style={styles.content}>
          <View style={styles.row}>
            <HealthOSFamilyAvatar initials={caregiver.initials} />
            <View style={styles.copy}>
              <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                {caregiver.name}
              </Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {caregiver.roleLabel ?? "Caregiver"}
              </Text>
              {caregiver.linkedMemberName ? (
                <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                  Linked to {caregiver.linkedMemberName}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.pills}>
            {caregiver.availabilityLabel ? (
              <HealthOSPill label={caregiver.availabilityLabel} size="sm" variant="glass" />
            ) : null}
            {caregiver.rateLabel ? (
              <HealthOSPill label={caregiver.rateLabel} size="sm" variant="glass" />
            ) : null}
          </View>
          <View style={styles.pills}>
            <HealthOSPill
              disabled={!caregiver.contactPhone}
              label="Call"
              onPress={() => caregiver.contactPhone ? void Linking.openURL(`tel:${caregiver.contactPhone}`) : undefined}
              size="sm"
              variant="realm"
            />
            <HealthOSPill
              disabled={!caregiver.contactEmail}
              label="Email"
              onPress={() => caregiver.contactEmail ? void Linking.openURL(`mailto:${caregiver.contactEmail}`) : undefined}
              size="sm"
              variant="glass"
            />
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            No caregiver added yet. Add one only when someone helps with care tasks.
          </Text>
          <HealthOSPill label="Add caregiver" onPress={onAddCaregiver} size="sm" variant="realm" />
        </View>
      )}
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.md,
  },
  copy: {
    flex: 1,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});

