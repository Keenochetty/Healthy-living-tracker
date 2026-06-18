import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";
import type { BabyChildProfile } from "@/types/child";

import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  activeChild: BabyChildProfile;
  onManageProfile: () => void;
  onSelectProfile: (id: string) => void;
  profileState: HealthOSBabyChildData["profileState"];
  profiles: BabyChildProfile[];
};

export function HealthOSChildProfileHeader({
  activeChild,
  onManageProfile,
  onSelectProfile,
  profileState,
  profiles,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const initials = activeChild.displayName.trim().slice(0, 2).toUpperCase() || "CH";

  return (
    <HealthOSCard variant="glass">
      <View style={styles.profileRow}>
        <View style={[styles.avatar, { borderColor: palette.baby }]}>
          <Text style={[styles.avatarText, { color: palette.inkText }]}>
            {activeChild.avatarEmoji || initials}
          </Text>
        </View>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
            {activeChild.displayName}
          </Text>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {profileState.ageLabel} · {profileState.relationshipLabel}
          </Text>
          <View style={styles.pills}>
            <HealthOSPill label="Parent controlled" realmColor={palette.baby} size="sm" variant="realm" />
            <HealthOSPill label={profileState.privacyLabel} size="sm" variant="glass" />
            <HealthOSPill label="Manage" onPress={onManageProfile} size="sm" variant="ai" />
          </View>
        </View>
      </View>
      {profiles.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selector}>
          {profiles.map((profile) => (
            <HealthOSPill
              key={profile.id}
              label={profile.displayName}
              onPress={() => onSelectProfile(profile.id)}
              selected={profile.id === activeChild.id}
              variant="glass"
            />
          ))}
        </ScrollView>
      ) : null}
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 2,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.xs,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  selector: {
    gap: healthOSSpacing.sm,
    paddingTop: healthOSSpacing.md,
  },
});
