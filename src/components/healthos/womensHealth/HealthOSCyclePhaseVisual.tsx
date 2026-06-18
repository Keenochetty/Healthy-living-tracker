import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSRadius, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSCycleDay, HealthOSWomenLogType } from "./HealthOSWomenHealthTypes";

type Props = {
  days: HealthOSCycleDay[];
  onOpenQuickLog: (type: HealthOSWomenLogType) => void;
};

export function HealthOSCyclePhaseVisual({ days, onOpenQuickLog }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Private cycle visual" subtitle="Compact estimate strip. Full calendar stays separate." variant="compact">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {days.map((day) => (
            <View
              accessibilityLabel={`${day.date}${day.isToday ? ", today" : ""}${day.markers.length ? `, ${day.markers.join(", ")}` : ""}`}
              key={day.date}
              style={[
                styles.day,
                { borderColor: palette.borderSubtle },
                day.isSelected && { borderColor: palette.skyBlue },
                day.isLoggedPeriod && { backgroundColor: `${palette.women}24` },
                day.isEstimatedFertile && { backgroundColor: `${palette.warning}1F` },
              ]}
            >
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                {day.isToday ? "Today" : day.date.slice(5)}
              </Text>
              <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                {day.dayLabel}
              </Text>
              {day.markers.length ? <View style={[styles.marker, { backgroundColor: palette.women }]} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <HealthOSPill label="Log symptom" onPress={() => onOpenQuickLog("symptom")} size="sm" variant="glass" />
        <HealthOSPill label="Log period" onPress={() => onOpenQuickLog("period")} size="sm" variant="glass" />
        <HealthOSPill label="View calendar" onPress={() => onOpenQuickLog("note")} size="sm" variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  day: {
    alignItems: "center",
    borderRadius: healthOSRadius.lg,
    borderWidth: 1,
    gap: healthOSSpacing.xs,
    minHeight: 76,
    padding: healthOSSpacing.sm,
    width: 62,
  },
  marker: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  row: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});
