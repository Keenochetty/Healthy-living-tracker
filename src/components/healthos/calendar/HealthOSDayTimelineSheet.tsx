import { Modal, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { formatCalendarDate } from "./calendarVisuals";
import { HealthOSCalendarEventRow } from "./HealthOSCalendarEventRow";
import type { HealthOSCalendarDisplayEvent } from "./HealthOSCalendarTypes";

type HealthOSDayTimelineSheetProps = {
  date: Date;
  events: HealthOSCalendarDisplayEvent[];
  onAddItem: () => void;
  onClose: () => void;
  onEventPress?: (event: HealthOSCalendarDisplayEvent) => void;
  testID?: string;
  visible: boolean;
};

export function HealthOSDayTimelineSheet({
  date,
  events,
  onAddItem,
  onClose,
  onEventPress,
  testID,
  visible,
}: HealthOSDayTimelineSheetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const categories = Array.from(new Set(events.map((event) => event.category)));

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, surfaces.glassPanel]} testID={testID}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                {formatCalendarDate(date)}
              </Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {events.length
                  ? `${events.length} item${events.length === 1 ? "" : "s"} on this day`
                  : "No planned items"}
              </Text>
            </View>
            <HealthOSPill label="Close" onPress={onClose} size="sm" variant="glass" />
          </View>
          {categories.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chips}>
                {categories.map((category) => (
                  <HealthOSPill key={category} label={category} size="sm" variant="glass" />
                ))}
              </View>
            </ScrollView>
          ) : null}
          <ScrollView contentContainerStyle={styles.timeline}>
            {events.length ? (
              events.map((event) => (
                <HealthOSCalendarEventRow
                  event={event}
                  key={event.id}
                  onPress={onEventPress}
                />
              ))
            ) : (
              <HealthOSCard variant="compact">
                <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                  Nothing planned here yet.
                </Text>
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  Add an item or use quick log to route into an existing app area.
                </Text>
              </HealthOSCard>
            )}
          </ScrollView>
          <HealthOSPill label="Add item" onPress={onAddItem} variant="active" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  chips: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.5)",
    borderRadius: 999,
    height: 4,
    width: 44,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: healthOSSpacing.md,
    maxHeight: "82%",
    paddingBottom: healthOSSafeArea.screenBottom + healthOSSpacing.lg,
  },
  timeline: {
    gap: healthOSSpacing.sm,
    paddingBottom: healthOSSpacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
});
