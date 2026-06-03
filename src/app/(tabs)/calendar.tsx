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
import type { AppModuleKey } from "@/types/app";
import type { AppReminder } from "@/types/reminders";

const DATE_WINDOW_DAYS = 7;

export default function CalendarScreen() {
  const [enabledModules, setEnabledModules] = useState<AppModuleKey[]>(CORE_MODULE_KEYS);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedReminders, setSelectedReminders] = useState<AppReminder[]>([]);
  const [todayReminders, setTodayReminders] = useState<AppReminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<AppReminder[]>([]);
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
    const [preferences, remindersForDate, remindersToday, upcoming] =
      await Promise.all([
        getUserPreferences(),
        getRemindersByDate(selectedDate),
        getTodayReminders(),
        getUpcomingReminders()
      ]);

    setEnabledModules(preferences.enabledModules);
    setSelectedReminders(remindersForDate);
    setTodayReminders(remindersToday);
    setUpcomingReminders(upcoming);
  }, [selectedDate]);

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
        {enabledModules.includes("pregnancy_cycle") ? <AppChip label="Women" variant="private" /> : null}
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

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                key={date.toISOString()}
                onPress={() => setSelectedDate(date)}
                style={{
                  backgroundColor: selected ? "#7c3aed" : "#ffffff",
                  borderRadius: 18,
                  minWidth: 92,
                  padding: 13
                }}
              >
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
