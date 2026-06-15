import {
  Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppChip, AppSection } from "@/components/ui";
import {
  cancelHealthReminder,
  completeHealthReminder,
  createHealthReminder,
  deleteHealthReminder,
  getCalendarDaySummaries,
  getHealthReminders,
  getNextHealthReminder,
  getOverdueReminders,
  reconcileReminderStateOnForeground,
  getRemindersForDate,
  skipHealthReminder,
  snoozeHealthReminder,
  updateHealthReminder,
} from "@/services/reminders/reminderEngine";
import {
  getReminderNotificationStatus,
  registerNotificationListeners,
} from "@/services/reminders/notificationService";
import {
  getTimelineEventsByDateRange,
  getTodayTimelineSummary,
} from "@/services/timeline/healthTimelineService";
import { getCalendarHaloOverlaysForDateRange } from "@/lib/womensHealthStorage";
import { generatePregnancyCalendarEvents } from "@/lib/pregnancyStorage";
import type {
  CalendarDaySummary,
  HealthEventType,
  HealthReminder,
  HealthTimelineEvent,
  RepeatFrequency,
  TodayTimelineSummary,
} from "@/types/healthTimeline";
import type { CalendarHaloOverlay } from "@/types/womensHealth";

type CalendarTab =
  | "today"
  | "week"
  | "month"
  | "timeline"
  | "reminders"
  | "add";
type DaySection = "Overdue" | "Morning" | "Afternoon" | "Evening" | "All Day";

const TABS: Array<{ key: CalendarTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "timeline", label: "Timeline" },
  { key: "reminders", label: "Reminders" },
  { key: "add", label: "Add" },
];

const EVENT_TYPES: Array<{ key: HealthEventType; label: string }> = [
  { key: "medication", label: "Medication" },
  { key: "supplement", label: "Supplement" },
  { key: "workout", label: "Workout" },
  { key: "water", label: "Water" },
  { key: "meal", label: "Meal" },
  { key: "doctor_visit", label: "Doctor Visit" },
  { key: "vaccine", label: "Vaccine" },
  { key: "prescription_refill", label: "Prescription Refill" },
  { key: "lab_review", label: "Lab Review" },
  { key: "biometric_log", label: "Biometric Log" },
  { key: "health_note", label: "Health Note" },
  { key: "womens_health", label: "Women’s Health" },
  { key: "contraception", label: "Contraception" },
  { key: "pregnancy", label: "Pregnancy" },
  { key: "baby_child", label: "Baby / Child" },
  { key: "mens_health", label: "Men's Health" },
  { key: "custom", label: "Custom" },
];

const REPEAT_OPTIONS: Array<{ key: RepeatFrequency; label: string }> = [
  { key: "none", label: "No repeat" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "custom", label: "Custom" },
];

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

export default function HealthCalendarScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<CalendarTab>(
    params.tab === "add" ? "add" : "today",
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayReminders, setDayReminders] = useState<HealthReminder[]>([]);
  const [allReminders, setAllReminders] = useState<HealthReminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<HealthReminder[]>(
    [],
  );
  const [nextReminder, setNextReminder] = useState<HealthReminder | null>(null);
  const [weekSummaries, setWeekSummaries] = useState<CalendarDaySummary[]>([]);
  const [monthSummaries, setMonthSummaries] = useState<CalendarDaySummary[]>(
    [],
  );
  const [timelineEvents, setTimelineEvents] = useState<HealthTimelineEvent[]>(
    [],
  );
  const [haloOverlays, setHaloOverlays] = useState<CalendarHaloOverlay[]>([]);
  const [todayTimelineSummary, setTodayTimelineSummary] =
    useState<TodayTimelineSummary | null>(null);
  const [notificationStatus, setNotificationStatus] =
    useState("not_configured");
  const [editingReminder, setEditingReminder] = useState<HealthReminder | null>(
    null,
  );

  const loadCalendar = useCallback(async () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = addDays(weekStart, 6);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const timelineStart = addDays(new Date(), -30);

    const [
      nextDayReminders,
      nextAllReminders,
      nextOverdue,
      nextReminderValue,
      nextWeekSummaries,
      nextMonthSummaries,
      nextTimelineEvents,
      nextTodayTimelineSummary,
      nextNotificationStatus,
      nextHaloOverlays,
    ] = await Promise.all([
      getRemindersForDate(selectedDate),
      getHealthReminders(),
      getOverdueReminders(),
      getNextHealthReminder(),
      getCalendarDaySummaries(weekStart, weekEnd),
      getCalendarDaySummaries(monthStart, monthEnd),
      getTimelineEventsByDateRange(
        startOfDay(timelineStart),
        endOfDay(new Date()),
      ),
      getTodayTimelineSummary(),
      getReminderNotificationStatus(),
      Promise.all([
        getCalendarHaloOverlaysForDateRange(monthStart, monthEnd),
        generatePregnancyCalendarEvents(monthStart, monthEnd),
      ]).then(([women, pregnancy]) => [
        ...women,
        ...pregnancy.map((overlay) => ({
          color: overlay.color,
          date: overlay.date,
          id: overlay.id,
          isShared: overlay.isShared,
          label: overlay.label,
          profileAvatarLabel: overlay.profileAvatarLabel,
          profileId: overlay.profileId,
          profileName: "Pregnancy",
          relatedId: overlay.relatedId,
          type: "symptom_logged" as const,
        })),
      ]),
    ]);

    setDayReminders(nextDayReminders);
    setAllReminders(nextAllReminders);
    setOverdueReminders(nextOverdue);
    setNextReminder(nextReminderValue);
    setWeekSummaries(nextWeekSummaries);
    setMonthSummaries(nextMonthSummaries);
    setTimelineEvents(nextTimelineEvents);
    setHaloOverlays(nextHaloOverlays);
    setTodayTimelineSummary(nextTodayTimelineSummary);
    setNotificationStatus(nextNotificationStatus);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve()
        .then(registerNotificationListeners)
        .then(reconcileReminderStateOnForeground)
        .then(loadCalendar)
        .catch(() => undefined);
    }, [loadCalendar]),
  );

  const groupedReminders = useMemo(
    () => groupReminders(dayReminders, overdueReminders),
    [dayReminders, overdueReminders],
  );

  async function runReminderAction(action: () => Promise<unknown>) {
    await action();
    await loadCalendar();
  }

  return (
    <AppMainLayout subtitle="Calendar / Timeline" title="Health">
      <AppCard backgroundColor="#f8fafc">
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Calendar / Timeline
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Organize health reminders and review your logged health activity in
          one private view.
        </Text>
        <Text
          style={{
            color: "#64748b",
            fontSize: 12,
            lineHeight: 18,
            marginTop: 8,
          }}
        >
          Reminders and timelines help organize your health information. They do
          not replace medical advice or instructions from a healthcare
          professional.
        </Text>
        <View style={{ marginTop: 12 }}>
          <AppButton
            onPress={() => router.push("/settings/notifications" as Href)}
            title="Reminder Settings"
            variant="secondary"
          />
        </View>
      </AppCard>

      <OverviewStrip
        nextReminder={nextReminder}
        notificationStatus={notificationStatus}
        overdueCount={overdueReminders.length}
        timelineSummary={todayTimelineSummary}
        todayCount={dayReminders.length}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -4 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              backgroundColor: activeTab === tab.key ? "#0f172a" : "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: 999,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                color: activeTab === tab.key ? "#ffffff" : "#475569",
                fontWeight: "900",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === "today" ? (
        <TodayTab
          groupedReminders={groupedReminders}
          onAction={runReminderAction}
          onAdd={() => setActiveTab("add")}
          onEdit={(reminder) => {
            setEditingReminder(reminder);
            setActiveTab("add");
          }}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      ) : null}

      {activeTab === "week" ? (
        <WeekTab
          onAction={runReminderAction}
          reminders={dayReminders}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          summaries={weekSummaries}
          overlays={haloOverlays}
        />
      ) : null}

      {activeTab === "month" ? (
        <MonthTab
          onSelectDate={setSelectedDate}
          reminders={dayReminders}
          selectedDate={selectedDate}
          summaries={monthSummaries}
          overlays={haloOverlays}
        />
      ) : null}

      {activeTab === "timeline" ? (
        <TimelineTab events={timelineEvents} />
      ) : null}

      {activeTab === "reminders" ? (
        <RemindersTab
          onAction={runReminderAction}
          onEdit={(reminder) => {
            setEditingReminder(reminder);
            setActiveTab("add");
          }}
          reminders={allReminders}
        />
      ) : null}

      {activeTab === "add" ? (
        <AddReminderTab
          editingReminder={editingReminder}
          onCancelEdit={() => setEditingReminder(null)}
          onSaved={async () => {
            setEditingReminder(null);
            await loadCalendar();
            setActiveTab("today");
          }}
        />
      ) : null}
    </AppMainLayout>
  );
}

function OverviewStrip({
  nextReminder,
  notificationStatus,
  overdueCount,
  timelineSummary,
  todayCount,
}: {
  nextReminder: HealthReminder | null;
  notificationStatus: string;
  overdueCount: number;
  timelineSummary: TodayTimelineSummary | null;
  todayCount: number;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      <MetricCard label="Today" value={`${todayCount}`} />
      <MetricCard label="Due" value={`${overdueCount}`} />
      <MetricCard label="Next" value={nextReminder?.title ?? "None"} />
      <MetricCard
        label="Timeline"
        value={`${timelineSummary?.totalEvents ?? 0}`}
      />
      <AppCard backgroundColor="#f8fafc">
        <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>
          Notifications
        </Text>
        <Text
          style={{
            color: "#0f172a",
            fontSize: 18,
            fontWeight: "900",
            marginTop: 4,
          }}
        >
          {formatValue(notificationStatus)}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 6 }}>
          In-app reminders work even when notification delivery is not
          configured.
        </Text>
      </AppCard>
    </View>
  );
}

function TodayTab({
  groupedReminders,
  onAction,
  onAdd,
  onEdit,
  selectedDate,
  setSelectedDate,
}: {
  groupedReminders: Record<DaySection, HealthReminder[]>;
  onAction: (action: () => Promise<unknown>) => Promise<void>;
  onAdd: () => void;
  onEdit: (reminder: HealthReminder) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection title="Today Agenda" subtitle={formatDate(selectedDate)}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <SmallButton
            label="Previous"
            onPress={() => setSelectedDate(addDays(selectedDate, -1))}
          />
          <SmallButton
            label="Today"
            onPress={() => setSelectedDate(new Date())}
          />
          <SmallButton
            label="Next"
            onPress={() => setSelectedDate(addDays(selectedDate, 1))}
          />
        </View>
      </AppSection>

      {(
        [
          "Overdue",
          "Morning",
          "Afternoon",
          "Evening",
          "All Day",
        ] as DaySection[]
      ).map((section) => (
        <ReminderSection
          key={section}
          onAction={onAction}
          onEdit={onEdit}
          reminders={groupedReminders[section]}
          title={section}
        />
      ))}

      <AppButton onPress={onAdd} title="Add Reminder" />
    </View>
  );
}

function WeekTab({
  onAction,
  overlays,
  reminders,
  selectedDate,
  setSelectedDate,
  summaries,
}: {
  onAction: (action: () => Promise<unknown>) => Promise<void>;
  overlays: CalendarHaloOverlay[];
  reminders: HealthReminder[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  summaries: CalendarDaySummary[];
}) {
  return (
    <View style={{ gap: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -4 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {summaries.map((summary) => {
          const dayOverlays = overlays.filter(
            (overlay) => overlay.date === summary.date,
          );

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              key={summary.date}
              onPress={() =>
                setSelectedDate(new Date(`${summary.date}T12:00:00`))
              }
              style={{
                backgroundColor:
                  toDateKey(selectedDate) === summary.date
                    ? "#0f172a"
                    : "#ffffff",
                borderColor: dayOverlays[0]?.color ?? "#e2e8f0",
                borderRadius: 18,
                borderWidth: dayOverlays.length ? 2 : 1,
                minWidth: 82,
                padding: 12,
              }}
            >
              <Text
                style={{
                  color:
                    toDateKey(selectedDate) === summary.date
                      ? "#ffffff"
                      : "#475569",
                  fontWeight: "900",
                }}
              >
                {shortDate(summary.date)}
              </Text>
              <Text
                style={{
                  color: summary.missedCount ? "#f97316" : "#94a3b8",
                  marginTop: 6,
                }}
              >
                {"•".repeat(Math.min(summary.reminderCount, 4)) || "No items"}
              </Text>
              <HaloDots overlays={dayOverlays} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ReminderSection
        onAction={onAction}
        onEdit={() => undefined}
        reminders={reminders}
        title={formatDate(selectedDate)}
      />
      <SelectedOverlaySummary
        overlays={overlays.filter(
          (overlay) => overlay.date === toDateKey(selectedDate),
        )}
      />
    </View>
  );
}

function MonthTab({
  onSelectDate,
  overlays,
  reminders,
  selectedDate,
  summaries,
}: {
  onSelectDate: (date: Date) => void;
  overlays: CalendarHaloOverlay[];
  reminders: HealthReminder[];
  selectedDate: Date;
  summaries: CalendarDaySummary[];
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection title="Month" subtitle={monthLabel(selectedDate)} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {summaries.map((summary) => {
          const dayOverlays = overlays.filter(
            (overlay) => overlay.date === summary.date,
          );

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              key={summary.date}
              onPress={() => onSelectDate(new Date(`${summary.date}T12:00:00`))}
              style={{
                backgroundColor:
                  toDateKey(selectedDate) === summary.date
                    ? "#ede9fe"
                    : "#ffffff",
                borderColor:
                  dayOverlays[0]?.color ??
                  (summary.reminderCount ? "#c4b5fd" : "#e2e8f0"),
                borderRadius: 14,
                borderWidth: dayOverlays.length ? 2 : 1,
                minHeight: 58,
                padding: 8,
                width: "13.6%",
              }}
            >
              <Text
                style={{
                  color: "#0f172a",
                  fontWeight: "900",
                  textAlign: "center",
                }}
              >
                {new Date(`${summary.date}T12:00:00`).getDate()}
              </Text>
              <Text
                style={{
                  color: summary.missedCount ? "#f97316" : "#94a3b8",
                  textAlign: "center",
                }}
              >
                {summary.reminderCount ? "•" : ""}
              </Text>
              <HaloDots centered overlays={dayOverlays} />
            </TouchableOpacity>
          );
        })}
      </View>
      <ReminderSection
        onAction={async () => undefined}
        onEdit={() => undefined}
        reminders={reminders}
        title={formatDate(selectedDate)}
      />
      <SelectedOverlaySummary
        overlays={overlays.filter(
          (overlay) => overlay.date === toDateKey(selectedDate),
        )}
      />
    </View>
  );
}

function HaloDots({
  centered,
  overlays,
}: {
  centered?: boolean;
  overlays: CalendarHaloOverlay[];
}) {
  if (!overlays.length) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: centered ? "center" : "flex-start",
        marginTop: 5,
      }}
    >
      {overlays.slice(0, 2).map((overlay) => (
        <View
          key={overlay.id}
          style={{
            backgroundColor: overlay.color,
            borderRadius: 999,
            height: 7,
            marginRight: 3,
            width: 7,
          }}
        />
      ))}
      {overlays.length > 2 ? (
        <Text style={{ color: "#64748b", fontSize: 10 }}>
          +{overlays.length - 2}
        </Text>
      ) : null}
    </View>
  );
}

function SelectedOverlaySummary({
  overlays,
}: {
  overlays: CalendarHaloOverlay[];
}) {
  if (!overlays.length) return null;

  return (
    <AppCard backgroundColor="#fdf2f8">
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
        Women’s Health overlays
      </Text>
      {overlays.map((overlay) => (
        <Text
          key={overlay.id}
          style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}
        >
          {overlay.label} - {formatValue(overlay.type)}
        </Text>
      ))}
    </AppCard>
  );
}

function TimelineTab({ events }: { events: HealthTimelineEvent[] }) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Timeline"
        subtitle="Recent health logs and records from local data."
      />
      {events.length ? (
        events.map((event) => (
          <AppCard key={event.id}>
            <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>
              {formatDateTime(event.eventAt)} - {formatValue(event.type)}
            </Text>
            <Text
              style={{
                color: "#0f172a",
                fontSize: 18,
                fontWeight: "900",
                marginTop: 6,
              }}
            >
              {event.title}
            </Text>
            {event.description ? (
              <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
                {event.description}
              </Text>
            ) : null}
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Log health activity to build your timeline.
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function RemindersTab({
  onAction,
  onEdit,
  reminders,
}: {
  onAction: (action: () => Promise<unknown>) => Promise<void>;
  onEdit: (reminder: HealthReminder) => void;
  reminders: HealthReminder[];
}) {
  const groups = {
    due: reminders.filter(
      (reminder) => reminder.status === "due" || reminder.status === "missed",
    ),
    upcoming: reminders.filter(
      (reminder) =>
        reminder.status === "upcoming" || reminder.status === "snoozed",
    ),
    completed: reminders.filter((reminder) => reminder.status === "completed"),
    skipped: reminders.filter(
      (reminder) =>
        reminder.status === "skipped" || reminder.status === "cancelled",
    ),
  };

  return (
    <View style={{ gap: 12 }}>
      <ReminderSection
        onAction={onAction}
        onEdit={onEdit}
        reminders={groups.due}
        title="Due"
      />
      <ReminderSection
        onAction={onAction}
        onEdit={onEdit}
        reminders={groups.upcoming}
        title="Upcoming"
      />
      <ReminderSection
        onAction={onAction}
        onEdit={onEdit}
        reminders={groups.completed}
        title="Completed"
      />
      <ReminderSection
        onAction={onAction}
        onEdit={onEdit}
        reminders={groups.skipped}
        title="Skipped / Cancelled"
      />
    </View>
  );
}

function AddReminderTab({
  editingReminder,
  onCancelEdit,
  onSaved,
}: {
  editingReminder: HealthReminder | null;
  onCancelEdit: () => void;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState(editingReminder?.title ?? "");
  const [type, setType] = useState<HealthEventType>(
    editingReminder?.type ?? "custom",
  );
  const [date, setDate] = useState(
    editingReminder?.dueAt.slice(0, 10) ?? toDateKey(new Date()),
  );
  const [time, setTime] = useState(
    editingReminder ? timeFromIso(editingReminder.dueAt) : "09:00",
  );
  const [allDay, setAllDay] = useState(Boolean(editingReminder?.allDay));
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>(
    editingReminder?.repeatFrequency ?? "none",
  );
  const [notes, setNotes] = useState(editingReminder?.notes ?? "");
  const [notificationEnabled, setNotificationEnabled] = useState(
    Boolean(editingReminder?.notificationEnabled),
  );

  async function saveReminder() {
    if (!title.trim()) {
      return;
    }

    const dueAt = allDay ? `${date}T09:00:00.000Z` : localIso(date, time);

    if (editingReminder) {
      const updated = await updateHealthReminder(editingReminder.id, {
        allDay,
        dueAt,
        notes,
        notificationEnabled,
        repeatFrequency,
        title,
        type,
      });

      if (!updated) {
        await createHealthReminder({
          allDay,
          dueAt,
          notes,
          notificationEnabled,
          repeatFrequency,
          title,
          type,
        });
      }
    } else {
      await createHealthReminder({
        allDay,
        dueAt,
        notes,
        notificationEnabled,
        repeatFrequency,
        title,
        type,
      });
    }

    await onSaved();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title={editingReminder ? "Edit Reminder" : "Add Reminder"}
        subtitle="Create private in-app reminders. Notification delivery is prepared for later."
      />
      <AppCard>
        <View style={{ gap: 12 }}>
          <TextInput
            onChangeText={setTitle}
            placeholder="Reminder title"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={title}
          />
          <ChipGroup
            current={type}
            options={EVENT_TYPES}
            onSelect={(value) => setType(value as HealthEventType)}
          />
          <TextInput
            onChangeText={setDate}
            placeholder="Date YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={date}
          />
          {!allDay ? (
            <TextInput
              onChangeText={setTime}
              placeholder="Time HH:MM"
              placeholderTextColor="#94a3b8"
              style={INPUT_STYLE}
              value={time}
            />
          ) : null}
          <ToggleRow label="All day" onChange={setAllDay} value={allDay} />
          <ToggleRow
            label="Prepare notification"
            onChange={setNotificationEnabled}
            value={notificationEnabled}
          />
          <ChipGroup
            current={repeatFrequency}
            options={REPEAT_OPTIONS}
            onSelect={(value) => setRepeatFrequency(value as RepeatFrequency)}
          />
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="Notes optional"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 90, paddingTop: 13 }}
            value={notes}
          />
          <AppButton
            onPress={saveReminder}
            title={editingReminder ? "Save Changes" : "Save Reminder"}
          />
          {editingReminder ? (
            <AppButton
              onPress={onCancelEdit}
              title="Cancel Edit"
              variant="secondary"
            />
          ) : null}
        </View>
      </AppCard>
    </View>
  );
}

function ReminderSection({
  onAction,
  onEdit,
  reminders,
  title,
}: {
  onAction: (action: () => Promise<unknown>) => Promise<void>;
  onEdit: (reminder: HealthReminder) => void;
  reminders: HealthReminder[];
  title: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
        {title}
      </Text>
      {reminders.length ? (
        reminders.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            onAction={onAction}
            onEdit={onEdit}
            reminder={reminder}
          />
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            No items in this section.
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function ReminderCard({
  onAction,
  onEdit,
  reminder,
}: {
  onAction: (action: () => Promise<unknown>) => Promise<void>;
  onEdit: (reminder: HealthReminder) => void;
  reminder: HealthReminder;
}) {
  return (
    <AppCard
      backgroundColor={reminder.status === "missed" ? "#fff7ed" : "#ffffff"}
    >
      <View style={{ gap: 10 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>
              {formatDateTime(reminder.snoozedUntil ?? reminder.dueAt)} -{" "}
              {formatValue(reminder.status)}
            </Text>
            <Text
              style={{
                color: "#0f172a",
                fontSize: 18,
                fontWeight: "900",
                marginTop: 5,
              }}
            >
              {reminder.title}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {formatValue(reminder.type)}
            </Text>
          </View>
          <AppChip label={formatValue(reminder.source)} variant="muted" />
        </View>
        {reminder.notes ? (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {reminder.notes}
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <SmallButton
            label="Done"
            onPress={() => onAction(() => completeHealthReminder(reminder.id))}
          />
          <SmallButton
            label="Skip"
            onPress={() => onAction(() => skipHealthReminder(reminder.id))}
          />
          <SmallButton
            label="Snooze"
            onPress={() =>
              onAction(() => snoozeHealthReminder(reminder.id, 30))
            }
          />
          <SmallButton label="Edit" onPress={() => onEdit(reminder)} />
          <SmallButton
            label="Cancel"
            onPress={() => onAction(() => cancelHealthReminder(reminder.id))}
          />
          <SmallButton
            label="Delete"
            onPress={() =>
              onAction(async () => {
                const deleted = await deleteHealthReminder(reminder.id);
                if (!deleted) {
                  await cancelHealthReminder(reminder.id);
                }
              })
            }
          />
          <SmallButton
            label="View"
            onPress={() => openRelatedRealm(reminder)}
          />
        </View>
      </View>
    </AppCard>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderRadius: 18,
        borderWidth: 1,
        flexGrow: 1,
        minWidth: "45%",
        padding: 14,
      }}
    >
      <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>
        {label}
      </Text>
      <Text
        numberOfLines={2}
        style={{
          color: "#0f172a",
          fontSize: 20,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function SmallButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: "#f8fafc",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text style={{ color: "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function ChipGroup({
  current,
  onSelect,
  options,
}: {
  current: string;
  onSelect: (key: string) => void;
  options: Array<{ key: string; label: string }>;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => (
        <TouchableOpacity
          activeOpacity={0.85}
          key={option.key}
          onPress={() => onSelect(option.key)}
          style={{
            backgroundColor: current === option.key ? "#0f172a" : "#f8fafc",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 9,
          }}
        >
          <Text
            style={{
              color: current === option.key ? "#ffffff" : "#475569",
              fontWeight: "900",
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ToggleRow({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
      }}
    >
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      <Switch onValueChange={onChange} value={value} />
    </View>
  );
}

function groupReminders(
  dayReminders: HealthReminder[],
  overdueReminders: HealthReminder[],
) {
  const groups: Record<DaySection, HealthReminder[]> = {
    "All Day": [],
    Afternoon: [],
    Evening: [],
    Morning: [],
    Overdue: overdueReminders,
  };

  dayReminders.forEach((reminder) => {
    if (reminder.status === "missed") {
      groups.Overdue.push(reminder);
      return;
    }

    if (reminder.allDay) {
      groups["All Day"].push(reminder);
      return;
    }

    const hour = new Date(reminder.snoozedUntil ?? reminder.dueAt).getHours();

    if (hour < 12) groups.Morning.push(reminder);
    else if (hour < 17) groups.Afternoon.push(reminder);
    else groups.Evening.push(reminder);
  });

  groups.Overdue = uniqueReminders(groups.Overdue);

  return groups;
}

function uniqueReminders(reminders: HealthReminder[]) {
  const seen = new Set<string>();

  return reminders.filter((reminder) => {
    const key = reminder.sourceId
      ? `${reminder.source}:${reminder.sourceId}`
      : reminder.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function openRelatedRealm(reminder: HealthReminder) {
  switch (reminder.type) {
    case "medication":
      router.push("/medication" as Href);
      break;
    case "supplement":
      router.push("/supplements" as Href);
      break;
    case "workout":
      router.push("/fitness" as Href);
      break;
    case "water":
    case "meal":
      router.push({
        pathname: "/food",
        params: reminder.type === "water" ? { tab: "water" } : undefined,
      } as Href);
      break;
    case "doctor_visit":
    case "vaccine":
    case "prescription_refill":
    case "lab_review":
    case "record":
      router.push("/records" as Href);
      break;
    case "biometric_log":
      router.push("/biometrics" as Href);
      break;
    case "womens_health":
    case "contraception":
      router.push("/cycle" as Href);
      break;
    case "pregnancy":
      router.push("/pregnancy" as Href);
      break;
    case "baby_child":
      router.push("/baby-child" as Href);
      break;
    case "mens_health":
      router.push("/mens-health" as Href);
      break;
    default:
      router.push("/health-calendar" as Href);
  }
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function localIso(dateKey: string, timeValue: string) {
  const [hours = "9", minutes = "0"] = timeValue.split(":");
  const date = new Date(`${dateKey}T12:00:00`);
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toISOString();
}

function timeFromIso(value: string) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    weekday: "short",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function shortDate(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    weekday: "short",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
