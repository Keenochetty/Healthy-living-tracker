import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { CalendarStrip } from "@/components/calendar/CalendarStrip";
import { DayTimeline } from "@/components/calendar/DayTimeline";
import { EventFilterChips } from "@/components/calendar/EventFilterChips";
import { UpcomingEventsCarousel } from "@/components/calendar/UpcomingEventsCarousel";
import {
  AppHeader,
  AppIcon,
  AppScreen,
  QuickActionButton,
  StatusPill,
  StatusSurface,
  WidgetCard,
} from "@/components/ui";
import {
  calendarColorLabels,
  calendarColorSoftTokens,
  calendarColorTokens,
} from "@/constants/calendar";
import { privacyLevelLabels } from "@/constants/permissions";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import {
  filterEvents,
  getEventCountByDay,
  getMockCalendarEvents,
  getSafeEventPreview,
  groupEventsByDay,
  listEventsForDay,
} from "@/lib/calendar";
import { listMyCirclesFromContext } from "@/lib/circles";
import { useProfileContext } from "@/lib/profile-context";
import type {
  CalendarEvent,
  CalendarFilter,
  CalendarViewMode,
} from "@/types/calendar";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function CalendarScreen() {
  const { families, profile, selectedFamily } = useProfileContext();
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [filter, setFilter] = useState<CalendarFilter>({ key: "all" });
  const [dayMenuDate, setDayMenuDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [eventNote, setEventNote] = useState("");
  const [eventNotes, setEventNotes] = useState<Record<string, string[]>>({});
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
    {
      colors: false,
      privacy: false,
      source: false,
    },
  );
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(
    null,
  );
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const events = useMemo(
    () =>
      getMockCalendarEvents(circles, {
        id: profile?.id,
        name: profile?.display_name || profile?.full_name || "Personal profile",
      }),
    [circles, profile],
  );
  const filteredEvents = useMemo(
    () => filterEvents(events, filter),
    [events, filter],
  );
  const dayEvents = useMemo(
    () => listEventsForDay(filteredEvents, selectedDate),
    [filteredEvents, selectedDate],
  );
  const eventCountByDay = useMemo(
    () => getEventCountByDay(filteredEvents),
    [filteredEvents],
  );
  const eventsByDay = useMemo(
    () => groupEventsByDay(filteredEvents),
    [filteredEvents],
  );
  const careProfiles = circles.flatMap((circle) =>
    circle.careProfiles.map((careProfile) => ({
      ...careProfile,
      circleName: circle.name,
    })),
  );
  const cardColumnStyle = width >= 820 ? styles.halfPanel : undefined;

  function handleOpenEvent(event: CalendarEvent) {
    setSelectedEvent(event);
  }

  function addEventNote() {
    const note = eventNote.trim();

    if (!selectedEvent || !note) {
      return;
    }

    setEventNotes((current) => ({
      ...current,
      [selectedEvent.id]: [...(current[selectedEvent.id] ?? []), note],
    }));
    setEventNote("");
  }

  function openAddEventForDate(date: Date) {
    const dateKey = date.toISOString().slice(0, 10);
    setDayMenuDate(null);
    openRoute(`/calendar/create?date=${dateKey}`);
  }

  function togglePanel(panel: "colors" | "privacy" | "source") {
    setExpandedPanels((current) => ({
      ...current,
      [panel]: !current[panel],
    }));
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <QuickActionButton
              icon={
                <AppIcon
                  color={colors.brand.primary}
                  name="calendar"
                  size={20}
                  variant="filled"
                />
              }
              label="Add event"
              onPress={() => openRoute("/calendar/create")}
              toneColor={colors.brand.primary}
            />
          }
          eyebrow="Calendar"
          subtitle="Circle, profile, and care-profile events with privacy-aware cards and sync placeholders."
          title="Schedule"
        />

        <StatusSurface
          action={
            <StatusPill
              label={`${dayEvents.length} selected`}
              tone={dayEvents.length > 0 ? "success" : "default"}
            />
          }
          description="Tap event pills for safe details. Long press a day or use its menu to add an event."
          icon="calendar"
          title="Planning dashboard"
          tone="connected"
        />

        <View style={styles.compactFilters}>
          <EventFilterChips filter={filter} onChange={setFilter} />
        </View>

        <WidgetCard
          accentColor={colors.brand.primary}
          action={
            <StatusPill
              label={selectedFamily?.name ?? "All circles"}
              tone="success"
            />
          }
          subtitle="Switch between week and month strips, then inspect the selected day timeline."
          title="Calendar view"
        >
          <CalendarStrip
            eventCountByDay={eventCountByDay}
            eventsByDay={eventsByDay}
            mode={viewMode}
            onModeChange={setViewMode}
            onOpenDayMenu={setDayMenuDate}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        </WidgetCard>

        <View style={styles.filterGroup}>
          {circles.map((circle) => (
            <QuickActionButton
              key={circle.id}
              label={circle.name}
              onPress={() => setFilter({ key: "circle", circleId: circle.id })}
              toneColor={
                filter.circleId === circle.id
                  ? colors.brand.primary
                  : colors.text.muted
              }
            />
          ))}
          {careProfiles.map((careProfile) => (
            <QuickActionButton
              key={careProfile.id}
              label={careProfile.displayName}
              onPress={() =>
                setFilter({
                  key: "care_profiles",
                  careProfileId: careProfile.id,
                })
              }
              toneColor={
                filter.careProfileId === careProfile.id
                  ? colors.status.ai
                  : colors.text.muted
              }
            />
          ))}
        </View>

        <View style={styles.twoColumnGrid}>
          <View style={cardColumnStyle}>
            <WidgetCard
              accentColor={colors.status.success}
              action={<StatusPill label="Upcoming" tone="success" />}
              subtitle="Non-critical upcoming events."
              title="Upcoming"
            >
              <UpcomingEventsCarousel
                events={filteredEvents}
                onOpenEvent={handleOpenEvent}
              />
            </WidgetCard>
          </View>

          <View style={cardColumnStyle}>
            <WidgetCard
              accentColor={colors.accent.sky}
              action={<StatusPill label={`${dayEvents.length} today`} />}
              subtitle="Sensitive private events hide details on the card."
              title="Selected day"
            >
              <DayTimeline
                date={selectedDate}
                events={dayEvents}
                onOpenEvent={handleOpenEvent}
              />
            </WidgetCard>
          </View>
        </View>

        <WidgetCard
          accentColor={colors.status.success}
          action={
            <QuickActionButton
              label={expandedPanels.colors ? "Hide" : "Show"}
              onPress={() => togglePanel("colors")}
              toneColor={colors.status.success}
            />
          }
          subtitle="Event colour meanings match the calendar foundation rules."
          title="Event colours"
        >
          {expandedPanels.colors ? (
            <View style={styles.legendGrid}>
              {(
                Object.keys(calendarColorLabels) as Array<
                  keyof typeof calendarColorLabels
                >
              ).map((colorKey) => (
                <View
                  key={colorKey}
                  style={[
                    styles.legendItem,
                    { backgroundColor: calendarColorSoftTokens[colorKey] },
                  ]}
                >
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: calendarColorTokens[colorKey] },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {calendarColorLabels[colorKey]}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.ruleText}>
              Tap Show to expand the colour guide.
            </Text>
          )}
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.system}
          action={
            <QuickActionButton
              label={expandedPanels.privacy ? "Hide" : "Show"}
              onPress={() => togglePanel("privacy")}
              toneColor={colors.status.system}
            />
          }
          subtitle="Google and Apple calendar events are represented without real sync integration."
          title="Privacy and source rules"
        >
          {expandedPanels.privacy ? (
            <View style={styles.ruleList}>
              <Text style={styles.ruleText}>
                Private events remain hidden from summaries unless explicitly
                allowed.
              </Text>
              <Text style={styles.ruleText}>
                Caregiver events require approval when they affect a care
                profile.
              </Text>
              <Text style={styles.ruleText}>
                Women's health events default to{" "}
                {privacyLevelLabels.private.toLowerCase()}.
              </Text>
            </View>
          ) : (
            <Text style={styles.ruleText}>
              Tap Show to view privacy and source notes.
            </Text>
          )}
        </WidgetCard>

        <Modal transparent visible={Boolean(dayMenuDate)} animationType="fade">
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDayMenuDate(null)}
          >
            <View style={styles.dayMenuCard}>
              <Text style={styles.modalTitle}>Day actions</Text>
              <Text style={styles.modalText}>
                {dayMenuDate?.toDateString()}
              </Text>
              <QuickActionButton
                label="Add event"
                onPress={() => dayMenuDate && openAddEventForDate(dayMenuDate)}
                toneColor={colors.brand.primary}
              />
            </View>
          </Pressable>
        </Modal>

        <Modal
          transparent
          visible={Boolean(selectedEvent)}
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedEvent(null)}
          >
            <Pressable style={styles.eventModalCard}>
              {selectedEvent ? (
                <View style={styles.eventModalContent}>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                    <StatusPill
                      label={privacyLevelLabels[selectedEvent.privacyLevel]}
                      tone={
                        selectedEvent.privacyLevel === "private"
                          ? "warning"
                          : "default"
                      }
                    />
                  </View>
                  <Text style={styles.modalText}>
                    {getSafeEventPreview(selectedEvent)}
                  </Text>
                  <View style={styles.legendGrid}>
                    {selectedEvent.circleName ? (
                      <StatusPill
                        label={selectedEvent.circleName}
                        tone="success"
                      />
                    ) : null}
                    {selectedEvent.careProfileName ? (
                      <StatusPill
                        label={selectedEvent.careProfileName}
                        tone="ai"
                      />
                    ) : null}
                    <StatusPill
                      label={selectedEvent.approvalStatus}
                      tone={
                        selectedEvent.requiresApproval ? "warning" : "default"
                      }
                    />
                  </View>
                  <TextInput
                    multiline
                    onChangeText={setEventNote}
                    placeholder="Add an optional note"
                    placeholderTextColor={colors.text.muted}
                    style={styles.noteInput}
                    value={eventNote}
                  />
                  <QuickActionButton
                    label="Add note"
                    onPress={addEventNote}
                    toneColor={colors.brand.primary}
                  />
                  {(eventNotes[selectedEvent.id] ?? []).map((note) => (
                    <View key={note} style={styles.noteRow}>
                      <AppIcon
                        color={colors.status.success}
                        name="note"
                        size={18}
                      />
                      <Text style={styles.ruleText}>{note}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          transparent
          visible={Boolean(placeholderMessage)}
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPlaceholderMessage(null)}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Calendar routing</Text>
              <Text style={styles.modalText}>{placeholderMessage}</Text>
              <QuickActionButton
                label="Close"
                onPress={() => setPlaceholderMessage(null)}
                toneColor={colors.brand.primary}
              />
            </View>
          </Pressable>
        </Modal>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  compactFilters: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.sm,
  },
  dayMenuCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 320,
    padding: spacing.lg,
    width: "100%",
  },
  eventModalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: "82%",
    maxWidth: 460,
    padding: spacing.lg,
    width: "100%",
  },
  eventModalContent: {
    gap: spacing.md,
  },
  filterGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  halfPanel: {
    flex: 1,
    minWidth: 360,
  },
  legendDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  legendItem: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  legendText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.xl,
    width: "100%",
  },
  modalHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
  noteInput: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 15,
    minHeight: 86,
    padding: spacing.md,
    textAlignVertical: "top",
  },
  noteRow: {
    alignItems: "flex-start",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  ruleList: {
    gap: spacing.sm,
  },
  ruleText: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
