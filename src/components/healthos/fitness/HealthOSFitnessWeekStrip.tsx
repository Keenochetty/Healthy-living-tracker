import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSFitnessWeekDay } from "./HealthOSFitnessTypes";

type HealthOSFitnessWeekStripProps = {
  days: HealthOSFitnessWeekDay[];
  onLongPressDate: (day: HealthOSFitnessWeekDay) => void;
  onSelectDate: (dateKey: string) => void;
  selectedDate: string;
};

export function HealthOSFitnessWeekStrip({
  days,
  onLongPressDate,
  onSelectDate,
}: HealthOSFitnessWeekStripProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {days.map((day) => {
          const selected = day.status === "selected";
          const color =
            day.status === "completed"
              ? palette.fitness
              : day.status === "missed"
                ? palette.danger
                : day.status === "today" || selected
                  ? palette.skyBlue
                  : palette.softText;
          return (
            <Pressable
              accessibilityLabel={`${day.dayLabel} ${day.numberLabel}, ${day.status}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={day.dateKey}
              onLongPress={() => onLongPressDate(day)}
              onPress={() => onSelectDate(day.dateKey)}
              style={[
                styles.day,
                surfaces.compactCard,
                selected && { borderColor: palette.skyBlue },
              ]}
            >
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                {day.dayLabel}
              </Text>
              <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                {day.numberLabel}
              </Text>
              <View style={[styles.marker, { backgroundColor: color }]} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  day: {
    alignItems: "center",
    borderRadius: healthOSRadius.lg,
    borderWidth: healthOSBorderWidth.thin,
    gap: healthOSSpacing.xxs,
    minHeight: 74,
    paddingHorizontal: healthOSSpacing.md,
    paddingVertical: healthOSSpacing.sm,
    width: 58,
  },
  marker: {
    borderRadius: 999,
    height: 4,
    width: 24,
  },
  row: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});

