import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSFamilyAvatar } from "./HealthOSFamilyAvatar";
import type {
  HealthOSFamilyCircleDisplay,
  HealthOSFamilyMemberDisplay,
} from "./HealthOSFamilyTypes";

type HealthOSFamilyHeroProps = {
  circle: HealthOSFamilyCircleDisplay;
  eventsCount: number;
  members: HealthOSFamilyMemberDisplay[];
  onInvite: () => void;
  onManage: () => void;
  updatesCount: number;
};

export function HealthOSFamilyHero({
  circle,
  eventsCount,
  members,
  onInvite,
  onManage,
  updatesCount,
}: HealthOSFamilyHeroProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const hasCircle = Boolean(circle.id);

  return (
    <HealthOSCard variant="elevated">
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.caption, { color: palette.family }]}>
            FAMILY CIRCLE
          </Text>
          <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
            {circle.name}
          </Text>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {circle.statusLine}
          </Text>
        </View>
        <HealthOSPill
          label={hasCircle ? "Manage" : "Create"}
          onPress={hasCircle ? onManage : onInvite}
          variant="realm"
        />
      </View>

      <View style={[styles.circleBlock, { borderColor: `${palette.family}33` }]}>
        <View style={[styles.connectionGlow, { backgroundColor: `${palette.family}14` }]} />
        <View style={[styles.centerCircle, { backgroundColor: `${palette.family}18` }]}>
          <AppIcon decorative name="circle" size={30} variant="primary" />
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {hasCircle ? "Connected" : "Private"}
          </Text>
        </View>
        <View style={styles.avatarRow}>
          {members.slice(0, 5).map((member, index) => (
            <View key={member.id} style={{ marginLeft: index ? -10 : 0 }}>
              <HealthOSFamilyAvatar initials={member.initials} />
            </View>
          ))}
          {!members.length ? (
            <HealthOSFamilyAvatar initials="+" />
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <HealthOSPill label={circle.privacyLabel} size="sm" variant="glass" />
        <HealthOSPill label={`${updatesCount} updates`} size="sm" variant="glass" />
        <HealthOSPill label={`${eventsCount} events`} size="sm" variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: healthOSSpacing.md,
  },
  centerCircle: {
    alignItems: "center",
    borderRadius: healthOSRadius.xl,
    gap: healthOSSpacing.xs,
    padding: healthOSSpacing.md,
  },
  circleBlock: {
    alignItems: "center",
    borderRadius: healthOSRadius["2xl"],
    borderWidth: 1,
    marginTop: healthOSSpacing.lg,
    overflow: "hidden",
    padding: healthOSSpacing.lg,
  },
  connectionGlow: {
    borderRadius: 999,
    height: 180,
    position: "absolute",
    width: 180,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
});

