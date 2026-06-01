import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, QuickActionButton, StatusPill } from "@/components/ui";
import {
  calendarApprovalStatusLabels,
  calendarColorSoftTokens,
  calendarColorTokens,
  calendarEventTypeLabels,
  calendarSourceLabels
} from "@/constants/calendar";
import { privacyLevelLabels } from "@/constants/permissions";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { formatCalendarTime, isSensitiveCalendarEvent } from "@/lib/calendar";
import type { CalendarEvent } from "@/types/calendar";

type CalendarEventCardProps = {
  event: CalendarEvent;
  onOpen?: (event: CalendarEvent) => void;
};

export function CalendarEventCard({ event, onOpen }: CalendarEventCardProps) {
  const sensitive = isSensitiveCalendarEvent(event);

  return (
    <Pressable accessibilityRole="button" onPress={() => onOpen?.(event)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.colorRail, { backgroundColor: calendarColorTokens[event.colour] }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={[styles.iconShell, { backgroundColor: calendarColorSoftTokens[event.colour] }]}>
            <AppIcon color={calendarColorTokens[event.colour]} name={event.icon} size={22} />
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.time}>
              {event.allDay ? "All day" : `${formatCalendarTime(event.startTime)}${event.endTime ? ` - ${formatCalendarTime(event.endTime)}` : ""}`}
            </Text>
          </View>
          {event.requiresApproval ? <StatusPill label={calendarApprovalStatusLabels[event.approvalStatus]} tone="warning" /> : null}
        </View>

        <Text style={styles.description}>{sensitive ? event.safePreview : event.description ?? event.safePreview}</Text>

        <View style={styles.badges}>
          <StatusPill label={privacyLevelLabels[event.privacyLevel]} tone={sensitive ? "warning" : "default"} />
          <StatusPill label={calendarSourceLabels[event.eventSource]} tone={event.eventSource === "ai" ? "ai" : "default"} />
          <StatusPill label={calendarEventTypeLabels[event.eventType]} tone={event.colour === "red" ? "emergency" : event.colour === "green" ? "success" : "default"} />
        </View>

        <View style={styles.links}>
          {event.circleName ? <Text style={styles.linkText}>Circle: {event.circleName}</Text> : null}
          {event.careProfileName ? <Text style={styles.linkText}>Care profile: {event.careProfileName}</Text> : null}
          {event.profileName ? <Text style={styles.linkText}>Profile: {event.profileName}</Text> : null}
          {event.location ? <Text style={styles.linkText}>Location: {event.location}</Text> : null}
        </View>

        <QuickActionButton label="Open" onPress={() => onOpen?.(event)} toneColor={calendarColorTokens[event.colour]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  body: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  card: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden"
  },
  colorRail: {
    width: 6
  },
  description: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  iconShell: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  links: {
    gap: spacing.xs
  },
  linkText: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }]
  },
  time: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 180
  }
});
