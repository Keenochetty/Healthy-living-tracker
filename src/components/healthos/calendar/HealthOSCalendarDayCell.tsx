import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { getCalendarCategoryColor } from "./calendarVisuals";
import type { HealthOSCalendarIndicator } from "./HealthOSCalendarTypes";

type HealthOSCalendarDayCellProps = {
  date: Date;
  indicators: HealthOSCalendarIndicator[];
  isOutsideMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  onLongPress: () => void;
  onPress: () => void;
  testID?: string;
};

export function HealthOSCalendarDayCell({
  date,
  indicators,
  isOutsideMonth,
  isSelected,
  isToday,
  onLongPress,
  onPress,
  testID,
}: HealthOSCalendarDayCellProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const visibleIndicators = indicators.slice(0, 3);
  const extraCount = Math.max(0, indicators.length - visibleIndicators.length);

  return (
    <Pressable
      accessibilityLabel={`${date.toDateString()}. ${indicators.length} calendar item${indicators.length === 1 ? "" : "s"}.${isSelected ? " Selected." : ""}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cell,
        {
          borderColor: isToday ? palette.skyBlue : palette.borderSubtle,
          opacity: isOutsideMonth ? 0.42 : 1,
        },
        isSelected && {
          backgroundColor: `${palette.skyBlue}22`,
          borderColor: palette.skyBlue,
        },
        pressed && { opacity: 0.72 },
      ]}
      testID={testID}
    >
      {isToday && !isSelected ? (
        <View style={[styles.todayMarker, { backgroundColor: palette.skyBlue }]} />
      ) : null}
      <Text
        style={[
          healthOSTypography.buttonLabel,
          { color: isSelected ? palette.inkText : palette.softText },
        ]}
      >
        {date.getDate()}
      </Text>
      <View style={styles.indicators}>
        {visibleIndicators.map((indicator, index) =>
          indicator.privacy === "shared" && indicator.initials ? (
            <View
              key={`${indicator.category}-${index}`}
              style={[
                styles.initials,
                { backgroundColor: getCalendarCategoryColor(indicator.category, mode) },
              ]}
            >
              <Text style={styles.initialsText}>{indicator.initials.slice(0, 2)}</Text>
            </View>
          ) : (
            <View
              key={`${indicator.category}-${index}`}
              style={[
                styles.dot,
                {
                  backgroundColor: getCalendarCategoryColor(indicator.category, mode),
                  borderWidth: indicator.privacy === "private" ? 1 : 0,
                },
              ]}
            />
          ),
        )}
        {extraCount ? (
          <Text style={[styles.more, { color: palette.softText }]}>+{extraCount}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: "center",
    borderRadius: healthOSRadius.md,
    borderWidth: healthOSBorderWidth.thin,
    flex: 1,
    gap: healthOSSpacing.xs,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: 2,
    paddingVertical: healthOSSpacing.xs,
  },
  dot: {
    borderColor: "#ffffff",
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  indicators: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    minHeight: 10,
  },
  initials: {
    alignItems: "center",
    borderRadius: 999,
    height: 14,
    justifyContent: "center",
    width: 14,
  },
  initialsText: {
    color: "#ffffff",
    fontSize: 7,
    fontWeight: "800",
  },
  more: {
    fontSize: 8,
    fontWeight: "800",
  },
  todayMarker: {
    borderRadius: 999,
    height: 4,
    position: "absolute",
    top: 4,
    width: 12,
  },
});
