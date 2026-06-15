import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CalendarEventCard } from "@/components/calendar/CalendarEventCard";
import {
  AppHeader,
  AppScreen,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import {
  calendarApprovalStatusLabels,
  calendarEventTypeLabels,
  calendarSourceLabels,
} from "@/constants/calendar";
import { privacyLevelLabels } from "@/constants/permissions";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import {
  canViewerSeeEventDetails,
  getCalendarSmartRoutePlaceholder,
  getMockCalendarEvents,
  getSafeEventPreview,
} from "@/lib/calendar";
import { listMyCirclesFromContext } from "@/lib/circles";
import { useProfileContext } from "@/lib/profile-context";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function CalendarEventDetailScreen() {
  const { eventId } = useLocalSearchParams();
  const { families, profile } = useProfileContext();
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const events = useMemo(
    () =>
      getMockCalendarEvents(circles, {
        id: profile?.id,
        name: profile?.display_name || profile?.full_name || "Personal profile",
      }),
    [circles, profile],
  );
  const event = events.find((item) => item.id === eventId) ?? null;

  if (!event) {
    return (
      <View style={styles.root}>
        <AppScreen>
          <AppHeader
            action={
              <QuickActionButton
                label="Back"
                onPress={() => openRoute("/tabs/calendar")}
                toneColor={colors.brand.primary}
              />
            }
            eyebrow="Calendar"
            subtitle="This placeholder event is not available in the current calendar data."
            title="Event not found"
          />
        </AppScreen>
      </View>
    );
  }

  const canSeeDetails = canViewerSeeEventDetails(event, [
    "view_calendar",
    "view_emergency_info",
  ]);
  const route = getCalendarSmartRoutePlaceholder(event.eventType);

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <QuickActionButton
              label="Calendar"
              onPress={() => openRoute("/tabs/calendar")}
              toneColor={colors.brand.primary}
            />
          }
          eyebrow="Calendar Event"
          subtitle="Placeholder detail screen for linked circle, profile, privacy, source, and approval metadata."
          title={event.title}
        />

        <CalendarEventCard event={event} />

        <WidgetCard
          accentColor={colors.brand.primary}
          action={
            <StatusPill
              label={privacyLevelLabels[event.privacyLevel]}
              tone={event.privacyLevel === "private" ? "warning" : "default"}
            />
          }
          subtitle="Sensitive event details are hidden from cards and previews unless the viewer has permission."
          title="Privacy"
        >
          <Text style={styles.detailText}>
            {canSeeDetails
              ? (event.description ?? "No event details added.")
              : getSafeEventPreview(event)}
          </Text>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={
            <StatusPill
              label={calendarApprovalStatusLabels[event.approvalStatus]}
              tone={event.requiresApproval ? "warning" : "success"}
            />
          }
          subtitle="Approval workflow and sync state are placeholders for now."
          title="Event metadata"
        >
          <View style={styles.badges}>
            <StatusPill label={calendarEventTypeLabels[event.eventType]} />
            <StatusPill
              label={calendarSourceLabels[event.eventSource]}
              tone={event.eventSource === "ai" ? "ai" : "default"}
            />
            {event.circleName ? (
              <StatusPill label={event.circleName} tone="success" />
            ) : null}
            {event.careProfileName ? (
              <StatusPill label={event.careProfileName} tone="ai" />
            ) : null}
          </View>
          <Text style={styles.muted}>Smart route placeholder: {route}</Text>
        </WidgetCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  detailText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
});
