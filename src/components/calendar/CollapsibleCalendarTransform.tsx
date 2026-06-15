import type { ReactNode } from "react";
import { Animated, StyleSheet, View } from "react-native";

type CollapsibleCalendarTransformProps = {
  collapsed: boolean;
  collapsedWeek: ReactNode;
  expandedMonth: ReactNode;
  scrollY: Animated.Value;
};

export const CALENDAR_EXPANDED_HEIGHT = 378;
export const CALENDAR_COLLAPSED_HEIGHT = 96;
export const CALENDAR_COLLAPSE_DISTANCE = CALENDAR_EXPANDED_HEIGHT - CALENDAR_COLLAPSED_HEIGHT;

export function CollapsibleCalendarTransform({
  collapsed,
  collapsedWeek,
  expandedMonth,
  scrollY
}: CollapsibleCalendarTransformProps) {
  const calendarHeight = scrollY.interpolate({
    extrapolate: "clamp",
    inputRange: [0, CALENDAR_COLLAPSE_DISTANCE],
    outputRange: [CALENDAR_EXPANDED_HEIGHT, CALENDAR_COLLAPSED_HEIGHT]
  });
  const monthOpacity = scrollY.interpolate({
    extrapolate: "clamp",
    inputRange: [0, CALENDAR_COLLAPSE_DISTANCE * 0.6],
    outputRange: [1, 0]
  });
  const monthTranslateY = scrollY.interpolate({
    extrapolate: "clamp",
    inputRange: [0, CALENDAR_COLLAPSE_DISTANCE],
    outputRange: [0, -18]
  });
  const weekOpacity = scrollY.interpolate({
    extrapolate: "clamp",
    inputRange: [CALENDAR_COLLAPSE_DISTANCE * 0.35, CALENDAR_COLLAPSE_DISTANCE],
    outputRange: [0, 1]
  });
  const weekTranslateY = scrollY.interpolate({
    extrapolate: "clamp",
    inputRange: [0, CALENDAR_COLLAPSE_DISTANCE],
    outputRange: [12, 0]
  });

  return (
    <Animated.View style={[styles.calendarShell, { height: calendarHeight }]}>
      <Animated.View
        pointerEvents={collapsed ? "none" : "auto"}
        style={[
          styles.calendarLayer,
          {
            opacity: monthOpacity,
            transform: [{ translateY: monthTranslateY }]
          }
        ]}
      >
        {expandedMonth}
      </Animated.View>
      <Animated.View
        pointerEvents={collapsed ? "auto" : "none"}
        style={[
          styles.calendarLayer,
          styles.weekLayer,
          {
            opacity: weekOpacity,
            transform: [{ translateY: weekTranslateY }]
          }
        ]}
      >
        {collapsedWeek}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  calendarLayer: {
    overflow: "hidden"
  },
  calendarShell: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    justifyContent: "flex-start",
    overflow: "hidden"
  },
  weekLayer: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  }
});
