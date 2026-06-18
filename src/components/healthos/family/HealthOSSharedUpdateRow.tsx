import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSFamilyAvatar } from "./HealthOSFamilyAvatar";
import type { HealthOSSharedUpdateDisplay } from "./HealthOSFamilyTypes";

type HealthOSSharedUpdateRowProps = {
  update: HealthOSSharedUpdateDisplay;
};

export function HealthOSSharedUpdateRow({ update }: HealthOSSharedUpdateRowProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.row}>
      <HealthOSFamilyAvatar initials={update.memberInitials ?? "HS"} size={38} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {update.title}
          </Text>
          <HealthOSPill label={formatType(update.type)} size="sm" variant="glass" />
        </View>
        {update.subtitle ? (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {update.subtitle}
          </Text>
        ) : null}
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          {[update.memberName, update.timeLabel, update.visibility].filter(Boolean).join(" | ")}
        </Text>
      </View>
    </View>
  );
}

function formatType(type: HealthOSSharedUpdateDisplay["type"]) {
  return type.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});

