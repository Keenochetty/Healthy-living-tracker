import { Href, router, useFocusEffect } from "expo-router";
import { Bell, CalendarClock, Plus } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { AddReminderSheet } from "@/components/calendar/AddReminderSheet";
import { DayTimeline } from "@/components/calendar/DayTimeline";
import { ReminderTypeChip } from "@/components/calendar/ReminderTypeChip";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard, AppChip } from "@/components/ui";
import { CORE_MODULE_KEYS } from "@/constants/modules";
import { cancelReminderNotification } from "@/lib/notifications";
import {
  completeReminder,
  formatDateLabel,
  formatReminderTime,
  getRemindersByDate,
  getTodayReminders,
  getUpcomingReminders,
  skipReminder
} from "@/lib/reminderStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import { getCalendarHaloOverlaysForDateRange, getWomensHealthSettings } from "@/lib/womensHealthStorage";
import type { AppModuleKey } from "@/types/app";
import type { AppReminder } from "@/types/reminders";
import type { CalendarHaloOverlay } from "@/types/womensHealth";

const DATE_WINDOW_DAYS = 7;

export default function CalendarScreen() {
  const [enabledModules, setEnabledModules] = useState<AppModuleKey[]>(CORE_MODULE_KEYS);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedReminders, setSelectedReminders] = useState<AppReminder[]>([]);
  const [todayReminders, setTodayReminders] = useState<AppReminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<AppReminder[]>([]);
  const [womensOverlays, setWomensOverlays] = useState<CalendarHaloOverlay[]>([]);
  const [womensOverlayEnabled, setWomensOverlayEnabled] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const nextReminder = upcomingReminders[0];
  const dates = useMemo(
    () =>
      Array.from({ length: DATE_WINDOW_DAYS }, (_, index) => {
        const date = new Date();

        date.setDate(date.getDate() + index);
        date.setHours(0, 0, 0, 0);

        return date;
      }),
    []
  );

  const loadCalendar = useCallback(async () => {
    const overlayStart = dates[0] ?? selectedDate;
    const overlayEnd = dates[dates.length - 1] ?? selectedDate;
    const [preferences, remindersForDate, remindersToday, upcoming, womensSettings, overlays] =
      await Promise.all([
        getUserPreferences(),
        getRemindersByDate(selectedDate),
        getTodayReminders(),
        getUpcomingReminders(),
        getWomensHealthSettings(),
        getCalendarHaloOverlaysForDateRange(overlayStart, overlayEnd)
      ]);

    setEnabledModules(preferences.enabledModules);
    setSelectedReminders(remindersForDate);
    setTodayReminders(remindersToday);
    setUpcomingReminders(upcoming);
    setWomensOverlayEnabled(Boolean(womensSettings.trackingEnabled && womensSettings.overlayEnabled));
    setWomensOverlays(womensSettings.trackingEnabled && womensSettings.overlayEnabled ? overlays : []);
  }, [dates, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadCalendar();
    }, [loadCalendar])
  );

  async function handleComplete(reminder: AppReminder) {
    await completeReminder(reminder.id);
    await cancelReminderNotification(reminder.notificationId);
    await loadCalendar();
  }

  async function handleSkip(reminder: AppReminder) {
    await skipReminder(reminder.id);
    await cancelReminderNotification(reminder.notificationId);
    await loadCalendar();
  }

  return (
    <AppMainLayout subtitle="Daily planning" title="Calendar">
      <AppCard backgroundColor="#8b5cf6">
        <View style={{ alignItems: "center", flexDirection: "row", gap: 14 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: 18,
              height: 54,
              justifyContent: "center",
              width: 54
            }}
          >
            <CalendarClock color="#ffffff" size={26} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#ede9fe", fontWeight: "800" }}>
              Today plan
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "900", marginTop: 5 }}>
              {todayReminders.length} reminder{todayReminders.length === 1 ? "" : "s"}
            </Text>
            <Text style={{ color: "#ede9fe", lineHeight: 20, marginTop: 5 }}>
              {nextReminder
                ? `Next: ${nextReminder.title} at ${formatReminderTime(nextReminder.dueAt)}`
                : "Your day is clear for now."}
            </Text>
          </View>
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <AppChip label="Meetings" selected variant="primary" />
        <AppChip label="Medication" variant="muted" />
        <AppChip label="Doctor" variant="muted" />
        {womensOverlayEnabled ? <AppChip label="Women Health private overlay" variant="private" /> : null}
        {enabledModules.includes("child_baby") ? <AppChip label="Baby" variant="muted" /> : null}
        {enabledModules.includes("elder_care") ? <AppChip label="Elder" variant="muted" /> : null}
        {enabledModules.includes("caregiver") ? <AppChip label="Caregiver" variant="muted" /> : null}
        {enabledModules.includes("fitness") ? <AppChip label="Fitness" variant="muted" /> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 10, paddingRight: 20 }}>
          {dates.map((date) => {
            const selected =
              date.toDateString() === selectedDate.toDateString();

            const dateKey = toDateKey(date);
            const dateOverlays = womensOverlays.filter((overlay) => overlay.date === dateKey);

            return (
              <TouchableOpacity
                accessibilityLabel={`${formatDateLabel(date)}. ${dateOverlays.length ? `${dateOverlays.length} private Women Health overlay indicators` : "No private Women Health overlay"}`}
                activeOpacity={0.85}
                key={date.toISOString()}
                onPress={() => setSelectedDate(date)}
                style={{
                  backgroundColor: selected ? "#7c3aed" : "#ffffff",
                  borderColor: dateOverlays.length ? "#f9a8d4" : "transparent",
                  borderWidth: dateOverlays.length ? 1 : 0,
                  borderRadius: 18,
                  minWidth: 92,
                  overflow: "hidden",
                  padding: 13,
                  position: "relative"
                }}
              >
                {dateOverlays.slice(0, 2).map((overlay, index) => (
                  <View
                    key={overlay.id}
                    pointerEvents="none"
                    style={{
                      borderColor: overlay.color,
                      borderRadius: 999,
                      borderWidth: 2,
                      height: 58 - index * 10,
                      opacity: selected ? 0.9 : 0.55,
                      position: "absolute",
                      right: 7 + index * 5,
                      top: 7 + index * 5,
                      width: 58 - index * 10
                    }}
                  />
                ))}
                {dateOverlays.length > 1 ? (
                  <View
                    style={{
                      alignItems: "center",
                      backgroundColor: "#fff7ed",
                      borderRadius: 999,
                      height: 18,
                      justifyContent: "center",
                      position: "absolute",
                      right: 6,
                      top: 6,
                      width: 18
                    }}
                  >
                    <Text style={{ color: "#831843", fontSize: 8, fontWeight: "900" }}>{dateOverlays.length > 2 ? "+" : "WH"}</Text>
                  </View>
                ) : null}
                <Text
                  style={{
                    color: selected ? "#ede9fe" : "#64748b",
                    fontSize: 12,
                    fontWeight: "800"
                  }}
                >
                  {date.toDateString() === new Date().toDateString()
                    ? "Today"
                    : formatDateLabel(date).split(",")[0]}
                </Text>
                <Text
                  style={{
                    color: selected ? "#ffffff" : "#0f172a",
                    fontSize: 17,
                    fontWeight: "900",
                    marginTop: 4
                  }}
                >
                  {formatDateLabel(date).replace(",", "")}
                </Text>
                {dateOverlays.length ? (
                  <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
                    {dateOverlays.slice(0, 4).map((overlay) => (
                      <View key={`${overlay.id}-dot`} style={{ backgroundColor: overlay.color, borderRadius: 999, height: 6, width: 6 }} />
                    ))}
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <DayTimeline
        date={selectedDate}
        onComplete={handleComplete}
        onOpen={(reminder) => router.push(`/reminders/${reminder.id}` as Href)}
        onSkip={handleSkip}
        reminders={selectedReminders}
      />

      {womensOverlayEnabled ? (
        <WomensHealthDateSummary
          date={selectedDate}
          overlays={womensOverlays.filter((overlay) => overlay.date === toDateKey(selectedDate))}
        />
      ) : null}

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>
          Upcoming reminders
        </Text>
        {upcomingReminders.slice(0, 4).map((reminder) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={reminder.id}
            onPress={() => router.push(`/reminders/${reminder.id}` as Href)}
            style={{
              alignItems: "center",
              backgroundColor: "#ffffff",
              borderRadius: 22,
              flexDirection: "row",
              gap: 12,
              padding: 14
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: "#f5f3ff",
                borderRadius: 16,
                height: 44,
                justifyContent: "center",
                width: 54
              }}
            >
              <Text style={{ color: "#7c3aed", fontSize: 12, fontWeight: "900" }}>
                {formatReminderTime(reminder.dueAt)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>
                {reminder.title}
              </Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>{reminder.status}</Text>
            </View>
            <ReminderTypeChip type={reminder.type} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSheetVisible(true)}
        style={{
          alignItems: "center",
          backgroundColor: "#7c3aed",
          borderRadius: 20,
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          minHeight: 56
        }}
      >
        <Plus color="#ffffff" size={20} />
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
          Add reminder
        </Text>
      </TouchableOpacity>

      <AppCard backgroundColor="#f8fafc">
        <View style={{ alignItems: "flex-start", flexDirection: "row", gap: 10 }}>
          <Bell color="#7c3aed" size={19} />
          <Text style={{ color: "#475569", flex: 1, lineHeight: 20 }}>
            Local reminders are for planning support. Medication alerts will not give dose
            advice and should follow your healthcare professional instructions.
          </Text>
        </View>
      </AppCard>

      <AddReminderSheet
        enabledModules={enabledModules}
        onClose={() => setSheetVisible(false)}
        onSaved={loadCalendar}
        visible={sheetVisible}
      />
    </AppMainLayout>
  );
}

function WomensHealthDateSummary({ date, overlays }: { date: Date; overlays: CalendarHaloOverlay[] }) {
  return (
    <AppCard backgroundColor="#fdf2f8">
      <Text style={{ color: "#be185d", fontSize: 12, fontWeight: "900", textTransform: "uppercase" }}>Private overlay</Text>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900", marginTop: 5 }}>Women Health on {formatDateLabel(date)}</Text>
      {overlays.length ? (
        <View style={{ gap: 8, marginTop: 12 }}>
          {overlays.map((overlay) => (
            <View key={overlay.id} style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
              <View style={{ backgroundColor: overlay.color, borderRadius: 999, height: 8, width: 8 }} />
              <Text style={{ color: "#475569", flex: 1, fontWeight: "800" }}>{overlay.label}</Text>
              {overlay.isShared ? <Text style={{ color: "#7c3aed", fontSize: 12, fontWeight: "900" }}>Shared</Text> : null}
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 8 }}>No private Women Health overlay for this date.</Text>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/cycle?tab=log` as Href)}
          style={{ backgroundColor: "#be185d", borderRadius: 999, minHeight: 42, paddingHorizontal: 14, paddingVertical: 10 }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Quick log</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/cycle?tab=calendar` as Href)}
          style={{ backgroundColor: "#ffffff", borderColor: "#fbcfe8", borderRadius: 999, borderWidth: 1, minHeight: 42, paddingHorizontal: 14, paddingVertical: 10 }}
        >
          <Text style={{ color: "#be185d", fontWeight: "900" }}>Open Women Health</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
