import { router } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSHomeTimelineItem } from "./HealthOSHomeTypes";

type HealthOSPrimaryAttentionCardProps = {
  nextItem?: HealthOSHomeTimelineItem;
};

export function HealthOSPrimaryAttentionCard({
  nextItem,
}: HealthOSPrimaryAttentionCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const targetRoute = nextItem?.route ? String(nextItem.route) : "/(tabs)/calendar";
  const iconName = nextItem?.icon ? String(nextItem.icon) : "calendar";

  return (
    <HealthOSCard
      icon={
        <AppIcon
          color={palette.skyBlue}
          decorative
          name={iconName as never}
          size={22}
        />
      }
      onPress={() => router.push(targetRoute as never)}
      rightAccessory={<HealthOSPill label="Open" size="sm" variant="active" />}
      subtitle={
        nextItem
          ? `${nextItem.type} · ${formatTime(nextItem.dueAt)}`
          : "Add a reminder, meal, workout, or medication when you're ready."
      }
      title={nextItem ? nextItem.title : "Your day is clear"}
      variant="elevated"
    >
      <View style={styles.actions}>
        <HealthOSPill
          label="Add event"
          onPress={() => router.push("/(tabs)/calendar" as never)}
          variant="active"
        />
        <HealthOSPill
          label="Log medicine"
          onPress={() => router.push("/medication" as never)}
          variant="glass"
        />
        <HealthOSPill
          label="Scan"
          onPress={() => router.push("/(tabs)/scan" as never)}
          variant="ai"
        />
      </View>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        {nextItem
          ? "This is a read-only preview from existing reminder or calendar data."
          : "No medication, calendar, or family attention item is shown here until real data is available."}
      </Text>
    </HealthOSCard>
  );
}

function formatTime(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
