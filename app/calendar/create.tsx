import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, AppIcon, AppScreen, QuickActionButton, StatusPill, WidgetCard } from "@/components/ui";
import { calendarEventTypeLabels, calendarEventTypes, calendarSourceLabels } from "@/constants/calendar";
import { PRIVACY_LEVELS } from "@/constants/permissions";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { getDefaultEventPrivacy, getEventColour, getEventIcon, getSafeEventPreview, smartRouteEvent } from "@/lib/calendar";
import { useProfileContext } from "@/lib/profile-context";
import type { CalendarEventSource, CalendarEventType } from "@/types/calendar";
import type { PrivacyLevel } from "@/types/permissions";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

const timeSlots = Array.from({ length: 24 * 4 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minutes = (index % 4) * 15;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const compactPrivacyLabels = {
  caregiver_shared: "Caregiver",
  circle_shared: "Circle",
  emergency_only: "Emergency",
  partner_shared: "Partner",
  private: "Private"
} as const satisfies Record<PrivacyLevel, string>;

export default function CreateCalendarEventScreen() {
  const { date } = useLocalSearchParams();
  const { profile } = useProfileContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [timeTarget, setTimeTarget] = useState<"start" | "end" | null>(null);
  const [eventTypeMenuOpen, setEventTypeMenuOpen] = useState(false);
  const [eventType, setEventType] = useState<CalendarEventType>("family");
  const [source, setSource] = useState<CalendarEventSource>("profile_owner");
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>("circle_shared");
  const selectedDate = typeof date === "string" ? date : new Date().toISOString().slice(0, 10);
  const sourceLabel = profile?.display_name || profile?.full_name || "Your account";
  const routePreview = smartRouteEvent({ description, eventSource: source, eventType, text: title });
  const eventPreview = {
    description,
    isSensitive: routePreview.isSensitive,
    privacyLevel,
    safePreview: routePreview.isSensitive ? "Sensitive event details hidden" : description || "Event details will appear here."
  };
  const previewColour = getEventColour(eventType, source, privacyLevel);

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<QuickActionButton label="Back" onPress={() => openRoute("/tabs/calendar")} toneColor={colors.text.muted} />}
          eyebrow="Calendar"
          subtitle="Add event placeholder. Persistence, sync, approval workflow, and smart routing are future integrations."
          title="Add event"
        />

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label="Placeholder" tone="ai" />}
          subtitle="Events must later link to a circle, personal profile, or care profile."
          title="Event details"
        >
          <View style={styles.form}>
            <TextInput onChangeText={setTitle} placeholder="Title" placeholderTextColor={colors.text.muted} style={styles.input} value={title} />
            <TextInput
              multiline
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor={colors.text.muted}
              style={[styles.input, styles.textArea]}
              value={description}
            />
            <View style={styles.timeRow}>
              <Pressable accessibilityRole="button" onPress={() => setTimeTarget("start")} style={({ pressed }) => [styles.timeButton, pressed && styles.pressed]}>
                <Text style={styles.timeLabel}>Start</Text>
                <Text style={styles.timeValue}>{selectedDate} · {startTime}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setTimeTarget("end")} style={({ pressed }) => [styles.timeButton, pressed && styles.pressed]}>
                <Text style={styles.timeLabel}>End</Text>
                <Text style={styles.timeValue}>{selectedDate} · {endTime}</Text>
              </Pressable>
            </View>
            <QuickActionButton
              icon={<AppIcon color={colors.status.ai} name="ai" size={18} />}
              label="Apply smart routing placeholder"
              onPress={() => {
                setEventType(routePreview.eventType);
                setSource(routePreview.eventSource);
                setPrivacyLevel(getDefaultEventPrivacy(routePreview.eventType));
              }}
              toneColor={colors.status.ai}
            />

            <Text style={styles.groupTitle}>Event type</Text>
            <Pressable accessibilityRole="button" onPress={() => setEventTypeMenuOpen(true)} style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}>
              <Text style={styles.selectText}>{calendarEventTypeLabels[eventType]}</Text>
              <AppIcon color={colors.text.muted} name="chevron" size={18} />
            </Pressable>

            <Text style={styles.groupTitle}>Source</Text>
            <View style={styles.readOnlySource}>
              <View style={styles.sourceAvatar}>
                <Text style={styles.sourceInitial}>{sourceLabel.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.sourceCopy}>
                <Text style={styles.previewTitle}>{sourceLabel}</Text>
                <Text style={styles.previewText}>Saved as {calendarSourceLabels[source]}</Text>
              </View>
            </View>

            <Text style={styles.groupTitle}>Privacy</Text>
            <View style={styles.pillGrid}>
              {PRIVACY_LEVELS.map((level) => (
                <QuickActionButton
                  key={level}
                  icon={privacyLevel === level ? <AppIcon color={colors.status.success} name="lock" size={18} /> : undefined}
                  label={compactPrivacyLabels[level]}
                  onPress={() => setPrivacyLevel(level)}
                  toneColor={privacyLevel === level ? colors.status.success : colors.text.muted}
                />
              ))}
            </View>

            <View style={styles.preview}>
              <Text style={styles.previewTitle}>{title.trim() || "New event"}</Text>
              <Text style={styles.previewText}>{getSafeEventPreview(eventPreview)}</Text>
              <View style={styles.pillGrid}>
                <StatusPill label={calendarEventTypeLabels[eventType]} />
                <StatusPill label={calendarSourceLabels[source]} tone={source === "ai" ? "ai" : "default"} />
                <StatusPill label={compactPrivacyLabels[privacyLevel]} tone={privacyLevel === "private" ? "warning" : "default"} />
                <StatusPill label={getEventIcon(eventType)} tone={previewColour === "purple" ? "ai" : "default"} />
              </View>
            </View>

            <QuickActionButton
              icon={<AppIcon color={colors.brand.primary} name="calendar" size={20} variant="filled" />}
              label="Save placeholder"
              onPress={() => openRoute("/tabs/calendar")}
              toneColor={colors.brand.primary}
            />
          </View>
        </WidgetCard>

        <Modal transparent visible={Boolean(timeTarget)} animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={() => setTimeTarget(null)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{timeTarget === "start" ? "Start time" : "End time"}</Text>
              <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
                {timeSlots.map((slot) => (
                  <Pressable
                    accessibilityRole="button"
                    key={slot}
                    onPress={() => {
                      if (timeTarget === "start") {
                        setStartTime(slot);
                      } else {
                        setEndTime(slot);
                      }
                      setTimeTarget(null);
                    }}
                    style={({ pressed }) => [styles.timeOption, pressed && styles.pressed]}
                  >
                    <Text style={styles.timeOptionText}>{slot}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        <Modal transparent visible={eventTypeMenuOpen} animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={() => setEventTypeMenuOpen(false)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Event type</Text>
              <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
                {calendarEventTypes.map((type) => (
                  <Pressable
                    accessibilityRole="button"
                    key={type}
                    onPress={() => {
                      setEventType(type);
                      setEventTypeMenuOpen(false);
                    }}
                    style={({ pressed }) => [styles.timeOption, pressed && styles.pressed]}
                  >
                    <Text style={styles.timeOptionText}>{calendarEventTypeLabels[type]}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  },
  groupTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  input: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 52,
    padding: spacing.md
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl
  },
  modalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: "78%",
    maxWidth: 380,
    padding: spacing.xl,
    width: "100%"
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900"
  },
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }]
  },
  preview: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  previewText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22
  },
  previewTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  readOnlySource: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1
  },
  selectButton: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    padding: spacing.md
  },
  selectText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800"
  },
  sourceAvatar: {
    alignItems: "center",
    backgroundColor: colors.brand.primarySoft,
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  sourceCopy: {
    flex: 1,
    gap: spacing.xs
  },
  sourceInitial: {
    color: colors.brand.primary,
    fontSize: 17,
    fontWeight: "900"
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top"
  },
  timeButton: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 64,
    minWidth: 140,
    padding: spacing.md
  },
  timeLabel: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  timeOption: {
    borderBottomColor: colors.border.soft,
    borderBottomWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: spacing.sm
  },
  timeOptionText: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center"
  },
  timePicker: {
    maxHeight: 320
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  timeValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  }
});
