import { Href, router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Bell,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Plus,
  X,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  CALENDAR_COLLAPSE_DISTANCE,
  CALENDAR_COLLAPSED_HEIGHT,
  CALENDAR_EXPANDED_HEIGHT,
  CollapsibleCalendarTransform,
} from "@/components/calendar/CollapsibleCalendarTransform";
import { DayTimeline } from "@/components/calendar/DayTimeline";
import { ReminderTypeChip } from "@/components/calendar/ReminderTypeChip";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { CORE_MODULE_KEYS } from "@/constants/modules";
import { lightImpact, successImpact } from "@/lib/haptics";
import { cancelReminderNotification } from "@/lib/notifications";
import {
  completeReminder,
  createReminder,
  formatDateLabel,
  formatReminderTime,
  getReminders,
  skipReminder,
} from "@/lib/reminderStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import { getFitnessCalendarReminders } from "@/services/fitnessPlanActivationService";
import {
  markWorkoutCompleted,
  markWorkoutSkipped,
} from "@/services/fitnessHistoryService";
import { useAppTheme } from "@/theme/ThemeProvider";
import { healthRealmAccents } from "@/theme/designSystem";
import {
  getCalendarHaloOverlaysForDateRange,
  getWomensHealthSettings,
} from "@/lib/womensHealthStorage";
import type { AppModuleKey } from "@/types/app";
import type {
  AppReminder,
  ReminderStatus,
  ReminderType,
} from "@/types/reminders";
import type { CalendarHaloOverlay } from "@/types/womensHealth";

type SchedulerCategoryKey =
  | "personal"
  | "work"
  | "family"
  | "health"
  | "medication"
  | "supplement"
  | "workout"
  | "food"
  | "baby"
  | "records"
  | "custom";

type CalendarDay = {
  date: Date;
  inCurrentMonth: boolean;
  key: string;
  overlays: CalendarHaloOverlay[];
  reminders: AppReminder[];
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CALENDAR_LAYER_GAP = 4;
const NOTEBOOK_LAYER_GAP = CALENDAR_LAYER_GAP;
const DEFAULT_CALENDAR_CHROME_HEIGHT = 100;
const AGENDA_PINNED_HEADER_OFFSET = 76;
const QUICK_ACTION_ORDER_KEY = "calendar_quick_action_order_v1";
const DEFAULT_QUICK_ACTION_ORDER = [
  "water",
  "workout",
  "note",
  "medication",
  "baby",
  "cycle",
  "food",
];

const SCHEDULER_CATEGORIES: Array<{
  key: SchedulerCategoryKey;
  label: string;
  reminderType: ReminderType;
}> = [
  { key: "personal", label: "Personal", reminderType: "personal" },
  { key: "work", label: "Work", reminderType: "work" },
  { key: "family", label: "Family", reminderType: "family" },
  { key: "health", label: "Health", reminderType: "doctor_visit" },
  { key: "medication", label: "Medication", reminderType: "medication" },
  { key: "supplement", label: "Supplement", reminderType: "custom" },
  { key: "workout", label: "Workout", reminderType: "fitness" },
  { key: "food", label: "Food / Water", reminderType: "food" },
  { key: "baby", label: "Baby", reminderType: "child_baby" },
  { key: "records", label: "Records", reminderType: "custom" },
  { key: "custom", label: "Custom", reminderType: "custom" },
];

const TYPE_ACCENTS: Record<
  ReminderType,
  { color: string; icon: string; label: string }
> = {
  caregiver: {
    color: healthRealmAccents.family,
    icon: "caregiver",
    label: "Caregiver",
  },
  child_baby: {
    color: healthRealmAccents.baby,
    icon: "baby_child",
    label: "Baby",
  },
  custom: {
    color: healthRealmAccents.records,
    icon: "calendar",
    label: "Event",
  },
  doctor_visit: {
    color: healthRealmAccents.health,
    icon: "health",
    label: "Health",
  },
  elder_care: {
    color: healthRealmAccents.health,
    icon: "elder_care",
    label: "Elder",
  },
  family: { color: healthRealmAccents.family, icon: "family", label: "Family" },
  fitness: {
    color: healthRealmAccents.fitness,
    icon: "fitness",
    label: "Workout",
  },
  food: {
    color: healthRealmAccents.food,
    icon: "water",
    label: "Food / Water",
  },
  medication: {
    color: healthRealmAccents.meds,
    icon: "medication",
    label: "Medication",
  },
  personal: {
    color: healthRealmAccents.records,
    icon: "calendar",
    label: "Personal",
  },
  work: { color: healthRealmAccents.fitness, icon: "calendar", label: "Work" },
};

export default function CalendarScreen() {
  const { theme, themeKey } = useAppTheme();
  const isDarkTheme =
    themeKey === "calm_dark" || themeKey === "premium_dark_health";
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [enabledModules, setEnabledModules] =
    useState<AppModuleKey[]>(CORE_MODULE_KEYS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarChromeHeight, setCalendarChromeHeight] = useState(
    DEFAULT_CALENDAR_CHROME_HEIGHT,
  );
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allReminders, setAllReminders] = useState<AppReminder[]>([]);
  const [womensOverlays, setWomensOverlays] = useState<CalendarHaloOverlay[]>(
    [],
  );
  const [womensOverlayEnabled, setWomensOverlayEnabled] = useState(false);
  const [schedulerDate, setSchedulerDate] = useState(new Date());
  const [schedulerVisible, setSchedulerVisible] = useState(false);
  const [quickActionDate, setQuickActionDate] = useState(new Date());
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [scrollY] = useState(() => new Animated.Value(0));
  const agendaScrollRef = useRef<ScrollView>(null);
  const agendaScrollOffsetRef = useRef(0);
  const notebookDragStartRef = useRef(0);
  const notebookDragValueRef = useRef(0);
  const notebookOpenRef = useRef(false);
  const hasLoadedCalendarRef = useRef(false);
  const calendarLoadRequestRef = useRef(0);
  const setNotebookPosition = useCallback(
    (open: boolean) => {
      if (!open) {
        notebookOpenRef.current = false;
        setNotebookOpen(false);
        agendaScrollRef.current?.scrollTo({ animated: false, y: 0 });
      }

      Animated.spring(scrollY, {
        damping: 24,
        mass: 0.8,
        stiffness: 180,
        toValue: open ? CALENDAR_COLLAPSE_DISTANCE : 0,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && open) {
          notebookOpenRef.current = true;
          setNotebookOpen(true);
        }
      });
    },
    [scrollY],
  );
  const notebookPanResponder = useMemo(() => {
    function settleNotebook(velocityY = 0) {
      const shouldOpen =
        velocityY < -0.35 ||
        (velocityY <= 0.35 &&
          notebookDragValueRef.current > CALENDAR_COLLAPSE_DISTANCE * 0.45);

      setNotebookPosition(shouldOpen);
    }

    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        Math.abs(gestureState.dy) > 6 &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        (!notebookOpenRef.current ||
          (gestureState.dy > 0 && agendaScrollOffsetRef.current <= 0)),
      onPanResponderGrant: () => {
        scrollY.stopAnimation((value) => {
          notebookDragStartRef.current = value;
          notebookDragValueRef.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const nextValue = Math.min(
          CALENDAR_COLLAPSE_DISTANCE,
          Math.max(0, notebookDragStartRef.current - gestureState.dy),
        );

        notebookDragValueRef.current = nextValue;
        scrollY.setValue(nextValue);
      },
      onPanResponderRelease: (_, gestureState) =>
        settleNotebook(gestureState.vy),
      onPanResponderTerminate: () => settleNotebook(),
    });
  }, [scrollY, setNotebookPosition]);
  const monthStart = useMemo(
    () => startOfMonth(calendarMonth),
    [calendarMonth],
  );
  const monthEnd = useMemo(() => endOfMonth(calendarMonth), [calendarMonth]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, { month: "long" }).format(
        calendarMonth,
      ),
    [calendarMonth],
  );
  const yearLabel = calendarMonth.getFullYear();

  const visibleDays = useMemo(
    () =>
      buildMonthDays(
        monthStart,
        allReminders,
        womensOverlayEnabled ? womensOverlays : [],
      ),
    [allReminders, monthStart, womensOverlayEnabled, womensOverlays],
  );
  const weekDays = useMemo(
    () =>
      buildWeekDays(
        selectedDate,
        allReminders,
        womensOverlayEnabled ? womensOverlays : [],
      ),
    [allReminders, selectedDate, womensOverlayEnabled, womensOverlays],
  );
  const selectedOverlays = womensOverlayEnabled
    ? womensOverlays.filter(
        (overlay) => overlay.date === toDateKey(selectedDate),
      )
    : [];
  const selectedReminders = useMemo(
    () =>
      allReminders.filter((reminder) =>
        isSameDay(new Date(reminder.dueAt), selectedDate),
      ),
    [allReminders, selectedDate],
  );
  const expandedAgendaTop =
    calendarChromeHeight +
    CALENDAR_LAYER_GAP +
    CALENDAR_EXPANDED_HEIGHT +
    NOTEBOOK_LAYER_GAP;
  const collapsedAgendaTop =
    calendarChromeHeight +
    CALENDAR_LAYER_GAP +
    CALENDAR_COLLAPSED_HEIGHT +
    NOTEBOOK_LAYER_GAP;
  const agendaTop = scrollY.interpolate({
    extrapolate: "clamp",
    inputRange: [0, CALENDAR_COLLAPSE_DISTANCE],
    outputRange: [expandedAgendaTop, collapsedAgendaTop],
  });

  const loadCalendar = useCallback(
    async (showLoading = false) => {
      const requestId = calendarLoadRequestRef.current + 1;
      calendarLoadRequestRef.current = requestId;

      if (showLoading) {
        setIsLoading(true);
      }

      const [
        preferences,
        reminders,
        fitnessCalendarReminders,
        womensSettings,
        overlays,
      ] = await Promise.all([
        getUserPreferences(),
        getReminders(),
        getFitnessCalendarReminders(),
        getWomensHealthSettings(),
        getCalendarHaloOverlaysForDateRange(
          addDays(monthStart, -7),
          addDays(monthEnd, 7),
        ),
      ]);

      const canShowWomensOverlay = Boolean(
        womensSettings.trackingEnabled && womensSettings.overlayEnabled,
      );

      if (requestId !== calendarLoadRequestRef.current) {
        return;
      }

      setEnabledModules(preferences.enabledModules);
      setAllReminders(
        filterVisibleReminders(
          [...reminders, ...fitnessCalendarReminders],
          preferences.enabledModules,
        ),
      );
      setWomensOverlayEnabled(canShowWomensOverlay);
      setWomensOverlays(canShowWomensOverlay ? overlays : []);
      hasLoadedCalendarRef.current = true;
      setIsLoading(false);
    },
    [monthEnd, monthStart],
  );

  useFocusEffect(
    useCallback(() => {
      loadCalendar(!hasLoadedCalendarRef.current).catch(() =>
        setIsLoading(false),
      );
    }, [loadCalendar]),
  );

  async function handleComplete(reminder: AppReminder) {
    const calendarEventId =
      typeof reminder.metadata?.calendarEventId === "string"
        ? reminder.metadata.calendarEventId
        : undefined;
    if (calendarEventId && reminder.type === "fitness") {
      await markWorkoutCompleted({
        description: reminder.notes,
        relatedCalendarEventId: calendarEventId,
        title: reminder.title,
      });
    }
    await completeReminder(reminder.id);
    await cancelReminderNotification(reminder.notificationId);
    await loadCalendar();
  }

  async function handleSkip(reminder: AppReminder) {
    const calendarEventId =
      typeof reminder.metadata?.calendarEventId === "string"
        ? reminder.metadata.calendarEventId
        : undefined;
    if (calendarEventId && reminder.type === "fitness") {
      await markWorkoutSkipped({
        description: reminder.notes,
        relatedCalendarEventId: calendarEventId,
        title: reminder.title,
      });
    }
    await skipReminder(reminder.id);
    await cancelReminderNotification(reminder.notificationId);
    await loadCalendar();
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    setCalendarMonth(startOfMonth(date));
    lightImpact();
  }

  function changeCalendarMonth(months: number) {
    const nextMonth = addMonths(calendarMonth, months);
    const nextDate = clampDateToMonth(selectedDate, nextMonth);

    setSelectedDate(nextDate);
    setCalendarMonth(startOfMonth(nextDate));
  }

  function selectCalendarMonth(year: number, month: number) {
    const nextMonth = new Date(year, month, 1, 12);
    const nextDate = clampDateToMonth(selectedDate, nextMonth);

    setSelectedDate(nextDate);
    setCalendarMonth(startOfMonth(nextDate));
    setMonthPickerVisible(false);
  }

  function openScheduler(date = selectedDate) {
    setSchedulerDate(buildSchedulerInitialDate(date));
    setSchedulerVisible(true);
  }

  function openQuickActions(date: Date) {
    setSelectedDate(date);
    setCalendarMonth(startOfMonth(date));
    setQuickActionDate(date);
    setQuickActionsVisible(true);
    lightImpact();
  }

  async function handleSchedulerSaved() {
    successImpact();
    setSuccessMessage("Event saved");
    await loadCalendar();
  }

  return (
    <AppMainLayout
      safeBottom={false}
      screenStyle={{
        ...styles.calendarScreenFrame,
        backgroundColor: theme.background,
      }}
      scroll={false}
      subtitle="Plan your day"
      title="Calendar"
    >
      <View
        style={[styles.calendarViewport, { backgroundColor: theme.background }]}
      >
        <View
          {...notebookPanResponder.panHandlers}
          style={[
            styles.pinnedCalendarArea,
            { backgroundColor: theme.background },
          ]}
        >
          <View
            onLayout={(event) => {
              const nextHeight = Math.round(event.nativeEvent.layout.height);

              if (nextHeight !== calendarChromeHeight) {
                setCalendarChromeHeight(nextHeight);
              }
            }}
            style={styles.calendarChrome}
          >
            <CalendarHeader
              monthLabel={monthLabel}
              onAdd={() => openScheduler(selectedDate ?? new Date())}
              onFilter={() => setFilterVisible(true)}
              onNext={() => changeCalendarMonth(1)}
              onOpenMonthPicker={() => setMonthPickerVisible(true)}
              onPrevious={() => changeCalendarMonth(-1)}
              yearLabel={yearLabel}
            />

            {successMessage ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSuccessMessage("")}
                style={styles.successToast}
              >
                <AppIcon color="#10201d" decorative name="success" size={18} />
                <Text style={styles.successToastText}>{successMessage}</Text>
              </Pressable>
            ) : null}
          </View>

          {isLoading ? <CalendarSkeleton /> : null}

          {!isLoading ? (
            <CollapsibleCalendarTransform
              collapsed={notebookOpen}
              collapsedWeek={
                <WeekStrip
                  days={weekDays}
                  onLongPress={openQuickActions}
                  onSelect={selectDate}
                  selectedDate={selectedDate}
                />
              }
              expandedMonth={
                <MonthGrid
                  days={visibleDays}
                  onLongPress={openQuickActions}
                  onSelect={selectDate}
                  selectedDate={selectedDate}
                />
              }
              scrollY={scrollY}
            />
          ) : null}
        </View>

        <Animated.View
          {...notebookPanResponder.panHandlers}
          style={[
            styles.agendaViewport,
            {
              backgroundColor: "transparent",
              top: agendaTop,
            },
          ]}
        >
          <View
            style={[
              styles.agendaPinnedHeader,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.background,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.agendaDateRow}>
                <View
                  style={[
                    styles.agendaDateDot,
                    { backgroundColor: theme.primary },
                  ]}
                />
                <Text style={[styles.panelTitle, { color: theme.text }]}>
                  {formatAgendaDate(selectedDate, notebookOpen)}
                </Text>
              </View>
              <Text style={[styles.panelKicker, { color: theme.mutedText }]}>
                {selectedReminders.length
                  ? `${selectedReminders.length} item${selectedReminders.length === 1 ? "" : "s"} planned`
                  : "Nothing planned"}
              </Text>
            </View>
            <View style={styles.agendaHeaderActions}>
              <IconButton
                label="Add event"
                muted
                onPress={() => openScheduler(selectedDate)}
                small
              >
                <Plus color="#6ee7c8" size={17} />
              </IconButton>
              <IconButton
                label={notebookOpen ? "Close notebook" : "Open notebook"}
                muted
                onPress={() => setNotebookPosition(!notebookOpenRef.current)}
                small
              >
                {notebookOpen ? (
                  <ChevronDown color="#e2e8f0" size={17} />
                ) : (
                  <ChevronUp color="#e2e8f0" size={17} />
                )}
              </IconButton>
            </View>
          </View>

          <Animated.ScrollView
            contentContainerStyle={styles.agendaScrollContent}
            onScroll={(event) => {
              agendaScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            ref={agendaScrollRef}
            scrollEnabled={notebookOpen}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={styles.agendaScroll}
          >
            {!isLoading ? (
              <>
                <SelectedDayPanel
                  compact={notebookOpen}
                  light={!isDarkTheme}
                  onAdd={() => openScheduler(selectedDate)}
                  onComplete={handleComplete}
                  onSkip={handleSkip}
                  overlays={selectedOverlays}
                  reminders={selectedReminders}
                  selectedDate={selectedDate}
                />
              </>
            ) : null}

            <AppCard
              style={[
                styles.privacyNote,
                !isDarkTheme ? styles.privacyNoteLight : null,
              ]}
            >
              <View style={styles.privacyIcon}>
                <Bell color="#c4b5fd" size={17} />
              </View>
              <View style={styles.privacyCopy}>
                <Text
                  style={[
                    styles.privacyTitle,
                    !isDarkTheme ? styles.privacyTitleLight : null,
                  ]}
                >
                  Private overlay
                </Text>
                <Text
                  style={[
                    styles.privacyText,
                    !isDarkTheme ? styles.privacyTextLight : null,
                  ]}
                >
                  {notebookOpen
                    ? "Private overlay hidden unless enabled."
                    : "Sensitive details only appear when enabled and shared."}
                </Text>
              </View>
            </AppCard>
          </Animated.ScrollView>
        </Animated.View>
      </View>

      <SchedulerSheet
        enabledModules={enabledModules}
        initialDate={schedulerDate}
        onClose={() => setSchedulerVisible(false)}
        onSaved={handleSchedulerSaved}
        visible={schedulerVisible}
      />

      <QuickActionSheet
        date={quickActionDate}
        enabledModules={enabledModules}
        onAddEvent={() => {
          setQuickActionsVisible(false);
          openScheduler(quickActionDate);
        }}
        onClose={() => setQuickActionsVisible(false)}
        visible={quickActionsVisible}
        womensOverlayEnabled={womensOverlayEnabled}
      />

      <FilterSheet
        enabledModules={enabledModules}
        onClose={() => setFilterVisible(false)}
        visible={filterVisible}
        womensOverlayEnabled={womensOverlayEnabled}
      />

      <MonthPickerSheet
        currentMonth={calendarMonth}
        onClose={() => setMonthPickerVisible(false)}
        onSelect={selectCalendarMonth}
        visible={monthPickerVisible}
      />
    </AppMainLayout>
  );
}

function CalendarHeader({
  monthLabel,
  onAdd,
  onFilter,
  onNext,
  onOpenMonthPicker,
  onPrevious,
  yearLabel,
}: {
  monthLabel: string;
  onAdd: () => void;
  onFilter: () => void;
  onNext: () => void;
  onOpenMonthPicker: () => void;
  onPrevious: () => void;
  yearLabel: number;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard
      style={[
        styles.headerCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerTop}>
        <View style={styles.monthSelector}>
          <IconButton label="Previous month" small muted onPress={onPrevious}>
            <ChevronLeft color={theme.mutedText} size={17} />
          </IconButton>
          <Pressable
            accessibilityHint="Open month and year picker"
            accessibilityLabel={`${monthLabel} ${yearLabel}`}
            accessibilityRole="button"
            onPress={onOpenMonthPicker}
            style={({ pressed }) => [
              styles.monthSelectorButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={[styles.monthTitle, { color: theme.text }]}>
              {monthLabel} {yearLabel}
            </Text>
          </Pressable>
          <IconButton label="Next month" small muted onPress={onNext}>
            <ChevronRight color={theme.mutedText} size={17} />
          </IconButton>
        </View>
        <View style={styles.headerActions}>
          <IconButton label="Filter calendar" muted onPress={onFilter}>
            <Filter color={theme.mutedText} size={18} />
          </IconButton>
          <IconButton label="Add event" onPress={onAdd}>
            <Plus color="#ffffff" size={19} />
          </IconButton>
        </View>
      </View>
    </AppCard>
  );
}

function MonthGrid({
  days,
  onLongPress,
  onSelect,
  selectedDate,
}: {
  days: CalendarDay[];
  onLongPress: (date: Date) => void;
  onSelect: (date: Date) => void;
  selectedDate: Date;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard
      style={[
        styles.monthCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.weekHeader}>
        {DAY_NAMES.map((day) => (
          <Text
            key={day}
            style={[styles.weekHeaderText, { color: theme.mutedText }]}
          >
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.monthGrid}>
        {days.map((day) => (
          <DayCell
            day={day}
            key={day.key}
            onLongPress={() => onLongPress(day.date)}
            onPress={() => onSelect(day.date)}
            selected={isSameDay(day.date, selectedDate)}
          />
        ))}
      </View>
    </AppCard>
  );
}

function DayCell({
  day,
  onLongPress,
  onPress,
  selected,
}: {
  day: CalendarDay;
  onLongPress: () => void;
  onPress: () => void;
  selected: boolean;
}) {
  const { theme } = useAppTheme();
  const isToday = isSameDay(day.date, new Date());
  const topIndicators = day.reminders.slice(0, 4);
  const overlay = day.overlays[0];
  const eventCount = day.reminders.length + day.overlays.length;
  const labelParts = [
    new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "long",
      weekday: "long",
    }).format(day.date),
    selected ? "selected" : "",
    isToday ? "today" : "",
    `${eventCount} ${eventCount === 1 ? "event" : "events"}`,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityHint="Long press to add to this day"
      accessibilityLabel={labelParts.join(", ")}
      accessibilityRole="button"
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCell,
        {
          backgroundColor: theme.surfaceSoft ?? theme.background,
          borderColor: theme.border,
        },
        !day.inCurrentMonth ? styles.dayCellMuted : null,
        isToday
          ? { backgroundColor: theme.primary, borderColor: theme.primary }
          : null,
        selected ? { borderColor: theme.primary, borderWidth: 2 } : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {overlay ? (
        <View
          pointerEvents="none"
          style={[styles.halo, { borderColor: getOverlayColor(overlay) }]}
        />
      ) : null}
      <Text
        style={[
          styles.dayNumber,
          { color: isToday ? "#ffffff" : theme.text },
          !day.inCurrentMonth ? styles.dayNumberMuted : null,
          selected && !isToday ? { color: theme.primary } : null,
        ]}
      >
        {day.date.getDate()}
      </Text>
      <View style={styles.dayIndicators}>
        {topIndicators.map((reminder) => {
          const accent = TYPE_ACCENTS[reminder.type];

          return (
            <View
              key={reminder.id}
              style={[styles.dayDot, { backgroundColor: accent.color }]}
            />
          );
        })}
        {day.reminders.length > 4 ? (
          <Text style={styles.moreText}>+{day.reminders.length - 4}</Text>
        ) : null}
      </View>
      {overlay ? (
        <View
          style={[
            styles.overlayMark,
            { backgroundColor: getOverlayColor(overlay) },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

function WeekStrip({
  days,
  onLongPress,
  onSelect,
  selectedDate,
}: {
  days: CalendarDay[];
  onLongPress: (date: Date) => void;
  onSelect: (date: Date) => void;
  selectedDate: Date;
}) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.weekStrip,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      {days.map((day) => {
        const selected = isSameDay(day.date, selectedDate);
        const today = isSameDay(day.date, new Date());

        return (
          <Pressable
            accessibilityHint="Long press to add to this day"
            accessibilityLabel={`${new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", weekday: "long" }).format(day.date)}, ${
              selected ? "selected" : "not selected"
            }, ${day.reminders.length} ${day.reminders.length === 1 ? "event" : "events"}`}
            accessibilityRole="button"
            key={day.key}
            onLongPress={() => onLongPress(day.date)}
            onPress={() => onSelect(day.date)}
            style={({ pressed }) => [
              styles.weekDay,
              { backgroundColor: theme.surface, borderColor: theme.border },
              today
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : null,
              selected ? { borderColor: theme.primary, borderWidth: 2 } : null,
              pressed ? styles.pressed : null,
            ]}
          >
            {today ? (
              <View
                style={[
                  styles.weekTodayMarker,
                  selected ? styles.weekTodayMarkerSelected : null,
                ]}
              />
            ) : null}
            <Text
              style={[
                styles.weekDayLabel,
                { color: today ? "#ffffff" : theme.mutedText },
                selected && !today ? { color: theme.primary } : null,
              ]}
            >
              {DAY_NAMES[day.date.getDay()]}
            </Text>
            <Text
              style={[
                styles.weekDayNumber,
                { color: today ? "#ffffff" : theme.text },
                selected && !today ? { color: theme.primary } : null,
              ]}
            >
              {day.date.getDate()}
            </Text>
            <View style={styles.weekDots}>
              {day.reminders.slice(0, 3).map((reminder) => (
                <View
                  key={reminder.id}
                  style={[
                    styles.dayDot,
                    { backgroundColor: TYPE_ACCENTS[reminder.type].color },
                  ]}
                />
              ))}
              {day.overlays.slice(0, 1).map((overlay) => (
                <View
                  key={overlay.id}
                  style={[
                    styles.dayDot,
                    { backgroundColor: getOverlayColor(overlay) },
                  ]}
                />
              ))}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function SelectedDayPanel({
  compact,
  light,
  onAdd,
  onComplete,
  onSkip,
  overlays,
  reminders,
  selectedDate,
}: {
  compact: boolean;
  light: boolean;
  onAdd: () => void;
  onComplete: (reminder: AppReminder) => void;
  onSkip: (reminder: AppReminder) => void;
  overlays: CalendarHaloOverlay[];
  reminders: AppReminder[];
  selectedDate: Date;
}) {
  return (
    <View style={styles.selectedPanel}>
      <View
        style={[styles.agendaSheet, light ? styles.agendaSheetLight : null]}
      >
        <View style={styles.agendaSheetBody}>
          <View style={styles.agendaInnerContent}>
            {overlays.length ? (
              <View
                style={[
                  styles.privateOverlay,
                  light ? styles.privateOverlayLight : null,
                ]}
              >
                <View style={styles.privateOverlayHeader}>
                  <View style={styles.privateOverlayIcon}>
                    <Bell color="#c4b5fd" size={15} />
                  </View>
                  <View style={styles.privateOverlayCopy}>
                    <Text
                      style={[
                        styles.privateOverlayTitle,
                        light ? styles.privateOverlayTitleLight : null,
                      ]}
                    >
                      Private overlay
                    </Text>
                    <Text
                      style={[
                        styles.privateOverlayText,
                        light ? styles.privateOverlayTextLight : null,
                      ]}
                    >
                      Visible under your current privacy settings.
                    </Text>
                  </View>
                </View>
                <View style={styles.overlayList}>
                  {overlays.slice(0, 4).map((overlay) => (
                    <View key={overlay.id} style={styles.overlayPill}>
                      <View
                        style={[
                          styles.dayDot,
                          { backgroundColor: getOverlayColor(overlay) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.overlayText,
                          light ? styles.overlayTextLight : null,
                        ]}
                      >
                        {getOverlayLabel(overlay)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {reminders.length ? (
              <DayTimeline
                date={selectedDate}
                onComplete={onComplete}
                onOpen={(reminder) =>
                  router.push(`/reminders/${reminder.id}` as Href)
                }
                onSkip={onSkip}
                reminders={reminders}
                showSummary={false}
                variant={light ? "notebook-light" : "notebook"}
              />
            ) : (
              <EmptyState
                actionLabel={compact ? undefined : "Add event"}
                compact={compact}
                light={light}
                onAction={compact ? undefined : onAdd}
                text={
                  compact
                    ? "Long press a day or tap + to add something."
                    : "Add an event, reminder, workout, or health note when you are ready."
                }
                title="Nothing planned"
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function TodayAgenda({
  onAddReminder,
  onComplete,
  onOpen,
  onSkip,
  reminders,
}: {
  onAddReminder: () => void;
  onComplete: (reminder: AppReminder) => void;
  onOpen: (reminder: AppReminder) => void;
  onSkip: (reminder: AppReminder) => void;
  reminders: AppReminder[];
}) {
  const due = reminders.filter((reminder) => reminder.status === "pending");
  const completed = reminders.filter(
    (reminder) => reminder.status === "completed",
  );

  return (
    <View style={styles.stack}>
      <AppCard style={styles.todayHero}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.panelKicker}>Today</Text>
            <Text style={styles.panelTitle}>{formatFullDate(new Date())}</Text>
            <Text style={styles.darkMuted}>
              Plan your day from your life calendar and health timeline.
            </Text>
          </View>
          <CalendarClock color="#6ee7c8" size={32} />
        </View>
      </AppCard>
      {reminders.length ? (
        <DayTimeline
          date={new Date()}
          onComplete={onComplete}
          onOpen={onOpen}
          onSkip={onSkip}
          reminders={reminders}
        />
      ) : (
        <EmptyState
          actionLabel="Add event"
          onAction={onAddReminder}
          text="Add an event when you are ready."
          title="Today's timeline"
        />
      )}
      <View style={styles.metricGrid}>
        <MetricCard label="Due" value={`${due.length}`} />
        <MetricCard label="Completed" value={`${completed.length}`} />
        <MetricCard
          label="Upcoming"
          value={`${reminders.filter((item) => new Date(item.dueAt).getTime() > Date.now()).length}`}
        />
      </View>
    </View>
  );
}

function TimelineView({
  onOpen,
  reminders,
}: {
  onOpen: (reminder: AppReminder) => void;
  reminders: AppReminder[];
}) {
  const grouped = groupByDate(reminders);
  const dateKeys = Object.keys(grouped).sort();

  if (!dateKeys.length) {
    return (
      <EmptyState
        text="Plan future events and review health history from one calendar."
        title="Your month is open"
      />
    );
  }

  return (
    <View style={styles.stack}>
      <AppSection
        subtitle="Past and future items grouped by day."
        title="Timeline"
      />
      {dateKeys.map((dateKey) => (
        <View key={dateKey} style={styles.timelineGroup}>
          <Text style={styles.timelineDate}>{formatDateKey(dateKey)}</Text>
          {grouped[dateKey].map((reminder) => (
            <TimelineRow
              key={reminder.id}
              onOpen={() => onOpen(reminder)}
              reminder={reminder}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function ReminderGroups({
  onAddReminder,
  onComplete,
  onOpen,
  onSkip,
  reminders,
}: {
  onAddReminder: () => void;
  onComplete: (reminder: AppReminder) => void;
  onOpen: (reminder: AppReminder) => void;
  onSkip: (reminder: AppReminder) => void;
  reminders: AppReminder[];
}) {
  const now = Date.now();
  const dueNow = reminders.filter(
    (reminder) =>
      reminder.status === "pending" &&
      new Date(reminder.dueAt).getTime() <= now,
  );
  const upcoming = reminders.filter(
    (reminder) =>
      reminder.status === "pending" && new Date(reminder.dueAt).getTime() > now,
  );
  const completed = reminders.filter(
    (reminder) => reminder.status === "completed",
  );
  const snoozedOrMissed = reminders.filter(
    (reminder) =>
      reminder.status === "skipped" || reminder.status === "cancelled",
  );

  return (
    <View style={styles.stack}>
      <ReminderSection
        onComplete={onComplete}
        onOpen={onOpen}
        onSkip={onSkip}
        reminders={dueNow}
        title="Due now"
      />
      <ReminderSection
        onComplete={onComplete}
        onOpen={onOpen}
        onSkip={onSkip}
        reminders={upcoming.slice(0, 12)}
        title="Upcoming"
      />
      <ReminderSection
        onComplete={onComplete}
        onOpen={onOpen}
        onSkip={onSkip}
        reminders={completed.slice(0, 8)}
        title="Completed"
      />
      <ReminderSection
        onComplete={onComplete}
        onOpen={onOpen}
        onSkip={onSkip}
        reminders={snoozedOrMissed.slice(0, 8)}
        title="Snoozed / missed"
      />
      {!reminders.length ? (
        <EmptyState
          actionLabel="Add event"
          onAction={onAddReminder}
          text="Add an event when you are ready."
          title="Nothing planned"
        />
      ) : null}
    </View>
  );
}

function ReminderSection({
  onComplete,
  onOpen,
  onSkip,
  reminders,
  title,
}: {
  onComplete: (reminder: AppReminder) => void;
  onOpen: (reminder: AppReminder) => void;
  onSkip: (reminder: AppReminder) => void;
  reminders: AppReminder[];
  title: string;
}) {
  if (!reminders.length) {
    return null;
  }

  return (
    <View style={styles.stack}>
      <Text style={styles.groupTitle}>{title}</Text>
      {reminders.map((reminder) => (
        <ReminderRow
          key={reminder.id}
          onComplete={() => onComplete(reminder)}
          onOpen={() => onOpen(reminder)}
          onSkip={() => onSkip(reminder)}
          reminder={reminder}
        />
      ))}
    </View>
  );
}

function QuickActionSheet({
  date,
  enabledModules,
  onAddEvent,
  onClose,
  visible,
  womensOverlayEnabled,
}: {
  date: Date;
  enabledModules: AppModuleKey[];
  onAddEvent: () => void;
  onClose: () => void;
  visible: boolean;
  womensOverlayEnabled: boolean;
}) {
  const [placeholderText, setPlaceholderText] = useState("");
  const [actionOrder, setActionOrder] = useState(DEFAULT_QUICK_ACTION_ORDER);
  const [reorderingActionKey, setReorderingActionKey] = useState<string | null>(
    null,
  );
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [carouselViewportWidth, setCarouselViewportWidth] = useState(0);
  const [carouselContentWidth, setCarouselContentWidth] = useState(0);
  const canUsePersonalHealth = enabledModules.includes("personal_health");
  const canUseBaby = enabledModules.includes("child_baby");
  const canUseFitness = enabledModules.includes("fitness");
  const canUseFood = enabledModules.includes("food");
  const actionDateLabel = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
  const actions: Array<{
    key: string;
    icon: AppIconName;
    label: string;
    onPress: () => void;
    visible: boolean;
  }> = [
    {
      key: "event",
      icon: "calendar",
      label: "Event",
      onPress: onAddEvent,
      visible: true,
    },
    {
      key: "water",
      icon: "water",
      label: "Water",
      onPress: () => setPlaceholderText("This quick log will open here soon."),
      visible: canUseFood,
    },
    {
      key: "workout",
      icon: "fitness",
      label: "Workout",
      onPress: () => setPlaceholderText("This quick log will open here soon."),
      visible: canUseFitness,
    },
    {
      key: "note",
      icon: "documents",
      label: "Note",
      onPress: () => setPlaceholderText("This quick log will open here soon."),
      visible: true,
    },
    {
      key: "medication",
      icon: "medication",
      label: "Medication",
      onPress: () => setPlaceholderText("This quick log will open here soon."),
      visible: canUsePersonalHealth,
    },
    {
      key: "baby",
      icon: "child_baby",
      label: "Baby",
      onPress: () => setPlaceholderText("This quick log will open here soon."),
      visible: canUseBaby,
    },
    {
      key: "cycle",
      icon: "pregnancy_cycle",
      label: "Cycle",
      onPress: () => setPlaceholderText("This quick log will open here soon."),
      visible:
        womensOverlayEnabled && enabledModules.includes("pregnancy_cycle"),
    },
    {
      key: "food",
      icon: "food",
      label: "Food",
      onPress: () => setPlaceholderText("This quick log will open here soon."),
      visible: canUseFood,
    },
  ];

  useEffect(() => {
    if (!visible) {
      setPlaceholderText("");
      setReorderingActionKey(null);
    }
  }, [visible]);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(QUICK_ACTION_ORDER_KEY)
      .then((storedOrder) => {
        if (!active || !storedOrder) return;

        const parsedOrder = JSON.parse(storedOrder) as string[];
        const validOrder = parsedOrder.filter((key) =>
          DEFAULT_QUICK_ACTION_ORDER.includes(key),
        );

        if (validOrder.length === DEFAULT_QUICK_ACTION_ORDER.length) {
          setActionOrder(validOrder);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const visibleActionKeys = new Set(
    actions.filter((action) => action.visible).map((action) => action.key),
  );
  const orderedActions = [
    actions[0],
    ...actionOrder
      .map((key) => actions.find((action) => action.key === key))
      .filter((action): action is (typeof actions)[number] =>
        Boolean(action?.visible),
      ),
  ];

  function moveAction(key: string, direction: -1 | 1) {
    setActionOrder((current) => {
      const next = [...current];
      const currentIndex = next.indexOf(key);
      let targetIndex = currentIndex + direction;

      while (
        targetIndex >= 0 &&
        targetIndex < next.length &&
        !visibleActionKeys.has(next[targetIndex])
      ) {
        targetIndex += direction;
      }

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= next.length) {
        return current;
      }

      [next[currentIndex], next[targetIndex]] = [
        next[targetIndex],
        next[currentIndex],
      ];
      AsyncStorage.setItem(QUICK_ACTION_ORDER_KEY, JSON.stringify(next)).catch(
        () => undefined,
      );
      return next;
    });
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.dayActionOverlay}>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.schedulerBackdrop}
        />
        <View style={styles.dayActionPopup}>
          <View style={[styles.sectionHeaderRow, styles.dayActionHeader]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.schedulerKicker}>Day actions</Text>
              <Text style={styles.quickSheetTitle}>{actionDateLabel}</Text>
              <Text style={styles.dayActionHint}>
                Hold and drag an option left or right to reorder it. Event stays
                first.
              </Text>
            </View>
            <IconButton label="Close quick actions" muted onPress={onClose}>
              <X color="#cbd5e1" size={18} />
            </IconButton>
          </View>

          <View style={styles.dayActionCarouselFrame}>
            <ScrollView
              contentContainerStyle={styles.dayActionCarousel}
              decelerationRate="fast"
              horizontal
              nestedScrollEnabled
              onContentSizeChange={(width) => setCarouselContentWidth(width)}
              onLayout={(event) =>
                setCarouselViewportWidth(event.nativeEvent.layout.width)
              }
              onScroll={(event) =>
                setCarouselOffset(event.nativeEvent.contentOffset.x)
              }
              scrollEnabled={!reorderingActionKey}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={112}
              style={styles.dayActionCarouselScroll}
            >
              {orderedActions.map((action) => (
                <ReorderableQuickAction
                  action={action}
                  fixed={action.key === "event"}
                  key={action.label}
                  onMove={(direction) => moveAction(action.key, direction)}
                  onReorderEnd={() => setReorderingActionKey(null)}
                  onReorderStart={() => setReorderingActionKey(action.key)}
                />
              ))}
            </ScrollView>
            {carouselOffset > 4 ? <CarouselEdgeShade side="left" /> : null}
            {carouselOffset + carouselViewportWidth <
            carouselContentWidth - 4 ? (
              <CarouselEdgeShade side="right" />
            ) : null}
          </View>

          {placeholderText ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setPlaceholderText("")}
              style={[
                styles.quickSheetPlaceholder,
                styles.dayActionPlaceholder,
              ]}
            >
              <Text style={styles.quickSheetPlaceholderText}>
                {placeholderText}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function ReorderableQuickAction({
  action,
  fixed,
  onMove,
  onReorderEnd,
  onReorderStart,
}: {
  action: { icon: AppIconName; label: string; onPress: () => void };
  fixed: boolean;
  onMove: (direction: -1 | 1) => void;
  onReorderEnd: () => void;
  onReorderStart: () => void;
}) {
  const [reordering, setReordering] = useState(false);
  const reorderingRef = useRef(false);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          reorderingRef.current && Math.abs(gestureState.dx) > 10,
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          reorderingRef.current && Math.abs(gestureState.dx) > 10,
        onPanResponderRelease: (_, gestureState) => {
          if (Math.abs(gestureState.dx) > 30) {
            onMove(gestureState.dx > 0 ? 1 : -1);
          }
          reorderingRef.current = false;
          setReordering(false);
          onReorderEnd();
        },
        onPanResponderTerminate: () => {
          reorderingRef.current = false;
          setReordering(false);
          onReorderEnd();
        },
      }),
    [onMove, onReorderEnd],
  );

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.quickSheetActionFrame,
        reordering ? styles.quickSheetActionReordering : null,
      ]}
    >
      <Pressable
        accessibilityHint={
          fixed
            ? "Event always stays first"
            : "Long press, then drag left or right to reorder"
        }
        accessibilityLabel={action.label}
        accessibilityRole="button"
        onLongPress={
          fixed
            ? undefined
            : () => {
                lightImpact();
                reorderingRef.current = true;
                setReordering(true);
                onReorderStart();
              }
        }
        onPress={() => {
          if (reordering) {
            reorderingRef.current = false;
            setReordering(false);
            onReorderEnd();
            return;
          }
          action.onPress();
        }}
        style={({ pressed }) => [
          styles.quickSheetAction,
          pressed && !reordering ? styles.pressed : null,
        ]}
      >
        <View style={styles.quickSheetIcon}>
          <AppIcon
            color="#10201d"
            decorative
            name={action.icon}
            size={22}
            strokeWidth={2.4}
          />
        </View>
        <Text style={styles.quickSheetActionText}>{action.label}</Text>
        <Text style={styles.quickSheetActionMeta}>
          {fixed
            ? "Stays first"
            : reordering
              ? "Drag left or right"
              : "Hold + drag"}
        </Text>
      </Pressable>
    </View>
  );
}

function CarouselEdgeShade({ side }: { side: "left" | "right" }) {
  const opacities =
    side === "left" ? [0.42, 0.22, 0.08, 0] : [0, 0.08, 0.22, 0.42];

  return (
    <View
      pointerEvents="none"
      style={[
        styles.carouselEdgeShade,
        side === "left"
          ? styles.carouselEdgeShadeLeft
          : styles.carouselEdgeShadeRight,
      ]}
    >
      {opacities.map((opacity, index) => (
        <View
          key={`${side}-${index}`}
          style={{ backgroundColor: `rgba(15,23,42,${opacity})`, flex: 1 }}
        />
      ))}
    </View>
  );
}

function FilterSheet({
  enabledModules,
  onClose,
  visible,
  womensOverlayEnabled,
}: {
  enabledModules: AppModuleKey[];
  onClose: () => void;
  visible: boolean;
  womensOverlayEnabled: boolean;
}) {
  const categories = [
    { label: "Personal", visible: true },
    { label: "Family", visible: true },
    { label: "Health", visible: true },
    { label: "Workout", visible: enabledModules.includes("fitness") },
    {
      label: "Medication",
      visible: enabledModules.includes("personal_health"),
    },
    { label: "Baby", visible: enabledModules.includes("child_baby") },
    { label: "Records", visible: true },
    {
      label: "Women's Health",
      visible:
        womensOverlayEnabled && enabledModules.includes("pregnancy_cycle"),
    },
  ].filter((category) => category.visible);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.quickSheetOverlay}>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.schedulerBackdrop}
        />
        <View style={styles.quickSheet}>
          <View style={styles.schedulerHandle} />
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.schedulerKicker}>Based on allowed data</Text>
              <Text style={styles.quickSheetTitle}>Filter calendar</Text>
            </View>
            <IconButton label="Close filters" muted onPress={onClose}>
              <X color="#cbd5e1" size={18} />
            </IconButton>
          </View>
          <View style={styles.filterGrid}>
            {categories.map((category) => (
              <Pressable
                accessibilityLabel={category.label}
                accessibilityRole="button"
                key={category.label}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.filterChip,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.filterChipText}>{category.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MonthPickerSheet({
  currentMonth,
  onClose,
  onSelect,
  visible,
}: {
  currentMonth: Date;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
  visible: boolean;
}) {
  const [draftYear, setDraftYear] = useState(currentMonth.getFullYear());
  const currentMonthIndex = currentMonth.getMonth();
  const months = Array.from({ length: 12 }, (_, month) => ({
    label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(
      new Date(draftYear, month, 1, 12),
    ),
    month,
  }));

  useEffect(() => {
    if (visible) {
      setDraftYear(currentMonth.getFullYear());
    }
  }, [currentMonth, visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.quickSheetOverlay}>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.schedulerBackdrop}
        />
        <View style={styles.quickSheet}>
          <View style={styles.schedulerHandle} />
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.schedulerKicker}>Jump calendar</Text>
              <Text style={styles.quickSheetTitle}>{draftYear}</Text>
            </View>
            <IconButton label="Close month picker" muted onPress={onClose}>
              <X color="#cbd5e1" size={18} />
            </IconButton>
          </View>

          <View style={styles.yearJumpRow}>
            <MonthJumpButton
              label="-10"
              onPress={() => setDraftYear((year) => year - 10)}
            />
            <MonthJumpButton
              label="-1"
              onPress={() => setDraftYear((year) => year - 1)}
            />
            <MonthJumpButton
              label="This year"
              onPress={() => setDraftYear(new Date().getFullYear())}
            />
            <MonthJumpButton
              label="+1"
              onPress={() => setDraftYear((year) => year + 1)}
            />
            <MonthJumpButton
              label="+10"
              onPress={() => setDraftYear((year) => year + 10)}
            />
          </View>

          <View style={styles.monthGridPicker}>
            {months.map((month) => {
              const selected =
                draftYear === currentMonth.getFullYear() &&
                month.month === currentMonthIndex;

              return (
                <Pressable
                  accessibilityLabel={`${month.label} ${draftYear}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={month.month}
                  onPress={() => onSelect(draftYear, month.month)}
                  style={({ pressed }) => [
                    styles.monthPickerCell,
                    selected ? styles.monthPickerCellSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthPickerCellText,
                      selected ? styles.monthPickerCellTextSelected : null,
                    ]}
                  >
                    {month.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MonthJumpButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.monthJumpButton}
    >
      <Text style={styles.monthJumpButtonText}>{label}</Text>
    </Pressable>
  );
}

function ReminderRow({
  onComplete,
  onOpen,
  onSkip,
  reminder,
}: {
  onComplete: () => void;
  onOpen: () => void;
  onSkip: () => void;
  reminder: AppReminder;
}) {
  const accent = TYPE_ACCENTS[reminder.type];

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        styles.reminderRow,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.typeIcon,
          { backgroundColor: accentSoftColor(accent.color, 0.14) },
        ]}
      >
        <AppIcon
          color={accent.color}
          decorative
          name={accent.icon as never}
          size={19}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.reminderTitle}>{reminder.title}</Text>
        <Text style={styles.reminderMeta}>
          {formatReminderTime(reminder.dueAt)} - {accent.label}
        </Text>
      </View>
      <View style={styles.rowActions}>
        {reminder.status === "pending" ? (
          <SmallAction label="Done" onPress={onComplete} />
        ) : null}
        {reminder.status === "pending" ? (
          <SmallAction label="Later" onPress={onSkip} />
        ) : null}
        <ReminderTypeChip type={reminder.type} />
      </View>
    </Pressable>
  );
}

function TimelineRow({
  onOpen,
  reminder,
}: {
  onOpen: () => void;
  reminder: AppReminder;
}) {
  const accent = TYPE_ACCENTS[reminder.type];

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        styles.timelineRow,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.timelineIcon,
          { backgroundColor: accentSoftColor(accent.color, 0.13) },
        ]}
      >
        <AppIcon
          color={accent.color}
          decorative
          name={accent.icon as never}
          size={18}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.reminderTitle}>{reminder.title}</Text>
        <Text style={styles.reminderMeta}>
          {formatReminderTime(reminder.dueAt)} - {accent.label}
        </Text>
      </View>
      <Text style={styles.statusText}>{formatStatus(reminder.status)}</Text>
    </Pressable>
  );
}

function EmptyState({
  actionLabel,
  compact = false,
  light = false,
  onAction,
  text,
  title,
}: {
  actionLabel?: string;
  compact?: boolean;
  light?: boolean;
  onAction?: () => void;
  text: string;
  title: string;
}) {
  return (
    <AppCard
      style={[
        styles.emptyCard,
        compact ? styles.emptyCardCompact : null,
        light ? styles.emptyCardLight : null,
      ]}
    >
      <Text
        style={[
          styles.emptyTitle,
          compact ? styles.emptyTitleCompact : null,
          light ? styles.emptyTitleLight : null,
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.emptyText,
          compact ? styles.emptyTextCompact : null,
          light ? styles.emptyTextLight : null,
        ]}
      >
        {text}
      </Text>
      {actionLabel && onAction ? (
        <View style={{ marginTop: 14 }}>
          <HeaderPill label={actionLabel} light={light} onPress={onAction} />
        </View>
      ) : null}
    </AppCard>
  );
}

function CalendarSkeleton() {
  return (
    <AppCard style={styles.monthCard}>
      <View style={styles.weekHeader}>
        {DAY_NAMES.map((day) => (
          <View key={day} style={styles.skeletonLabel} />
        ))}
      </View>
      <View style={styles.monthGrid}>
        {Array.from({ length: 35 }, (_, index) => (
          <View key={index} style={styles.skeletonCell} />
        ))}
      </View>
    </AppCard>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function HeaderPill({
  compact = false,
  label,
  light = false,
  onPress,
}: {
  compact?: boolean;
  label: string;
  light?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerPill,
        compact ? styles.headerPillCompact : null,
        light ? styles.headerPillLight : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.headerPillText,
          light ? styles.headerPillTextLight : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function IconButton({
  children,
  label,
  muted = false,
  onPress,
  small = false,
}: {
  children: ReactNode;
  label: string;
  muted?: boolean;
  onPress: () => void;
  small?: boolean;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: theme.primary },
        small ? styles.iconButtonSmall : null,
        muted
          ? {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
            }
          : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {children}
    </Pressable>
  );
}

function SmallAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.smallAction}
    >
      <Text style={styles.smallActionText}>{label}</Text>
    </Pressable>
  );
}

function buildDateOptions(anchorDate: Date) {
  const today = startOfDay(new Date());
  const anchor = startOfDay(anchorDate);
  const start = addDays(anchor, -2);

  return Array.from({ length: 8 }, (_, index) => {
    const date = addDays(start, index);
    const isToday = isSameDay(date, today);

    return {
      date,
      key: toDateKey(date),
      label: isToday
        ? "Today"
        : new Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "short",
            weekday: "short",
          }).format(date),
    };
  });
}

function buildSchedulerInitialDate(date: Date) {
  const next = new Date(date);
  const now = new Date();

  if (isSameDay(next, now)) {
    const nextHour =
      now.getMinutes() === 0 ? now.getHours() + 1 : now.getHours() + 1;
    next.setHours(Math.min(23, nextHour), 0, 0, 0);
    return next;
  }

  next.setHours(9, 0, 0, 0);
  return next;
}

function withTime(date: Date, hour: number, minute: number) {
  const next = new Date(date);

  next.setHours(hour, minute, 0, 0);
  return next;
}

function roundMinute(minute: number) {
  return Math.min(55, Math.round(minute / 5) * 5);
}

function formatTimeParts(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function SchedulerSheet({
  enabledModules,
  initialDate,
  onClose,
  onSaved,
  visible,
}: {
  enabledModules: AppModuleKey[];
  initialDate: Date;
  onClose: () => void;
  onSaved: () => Promise<void>;
  visible: boolean;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(initialDate);
  const [startHour, setStartHour] = useState(() => initialDate.getHours());
  const [startMinute, setStartMinute] = useState(() =>
    roundMinute(initialDate.getMinutes()),
  );
  const [endEnabled, setEndEnabled] = useState(false);
  const [endHour, setEndHour] = useState(() =>
    Math.min(23, initialDate.getHours() + 1),
  );
  const [endMinute, setEndMinute] = useState(() =>
    roundMinute(initialDate.getMinutes()),
  );
  const [categoryKey, setCategoryKey] =
    useState<SchedulerCategoryKey>("personal");
  const [repeatLabel, setRepeatLabel] = useState("Does not repeat");
  const [alertLabel, setAlertLabel] = useState("No alert");
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const availableCategories = SCHEDULER_CATEGORIES.filter((category) => {
    if (category.key === "baby") return enabledModules.includes("child_baby");
    if (category.key === "workout") return enabledModules.includes("fitness");
    if (category.key === "food") return enabledModules.includes("food");
    return true;
  });
  const selectedCategory =
    availableCategories.find((category) => category.key === categoryKey) ??
    availableCategories[0];
  const dateOptions = buildDateOptions(initialDate);
  const startDate = withTime(date, startHour, startMinute);
  const endDate = withTime(date, endHour, endMinute);

  const resetForm = useCallback(() => {
    setTitle("");
    setNotes("");
    setDate(initialDate);
    setStartHour(initialDate.getHours());
    setStartMinute(roundMinute(initialDate.getMinutes()));
    setEndEnabled(false);
    setEndHour(Math.min(23, initialDate.getHours() + 1));
    setEndMinute(roundMinute(initialDate.getMinutes()));
    setCategoryKey("personal");
    setRepeatLabel("Does not repeat");
    setAlertLabel("No alert");
    setActivePicker(null);
    setErrorMessage("");
  }, [initialDate]);

  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [resetForm, visible]);

  async function saveEvent() {
    setErrorMessage("");

    if (!selectedCategory || Number.isNaN(startDate.getTime())) {
      setErrorMessage("Choose a valid time.");
      return;
    }

    if (endEnabled && endDate.getTime() <= startDate.getTime()) {
      setErrorMessage("End time should be after start time.");
      return;
    }

    setIsSaving(true);

    try {
      await createReminder({
        dueAt: startDate.toISOString(),
        metadata: {
          category: selectedCategory.key,
          endAt: endEnabled ? endDate.toISOString() : null,
          repeat: repeatLabel,
          alert: alertLabel,
        },
        notes: notes.trim() || undefined,
        notify: false,
        priority:
          selectedCategory.key === "medication" ? "important" : "normal",
        title: title.trim() || "Reminder",
        type: selectedCategory.reminderType,
      });
      resetForm();
      onClose();
      await onSaved();
    } catch {
      setErrorMessage("Could not save this event. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function applyPreset(preset: "now" | "morning" | "afternoon" | "evening") {
    const now = new Date();

    if (preset === "now") {
      setDate(now);
      setStartHour(now.getHours());
      setStartMinute(roundMinute(now.getMinutes()));
      setEndHour(Math.min(23, now.getHours() + 1));
      setEndMinute(roundMinute(now.getMinutes()));
      return;
    }

    const next = preset === "morning" ? 8 : preset === "afternoon" ? 13 : 18;
    setStartHour(next);
    setStartMinute(0);
    setEndHour(Math.min(23, next + 1));
    setEndMinute(0);
  }

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.schedulerOverlay}
      >
        <Pressable style={styles.schedulerBackdrop} onPress={onClose} />
        <View style={styles.schedulerSheet}>
          <View style={styles.schedulerHandle} />
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.schedulerKicker}>Plan your day</Text>
              <Text style={styles.schedulerTitle}>Add event</Text>
            </View>
            <IconButton label="Close scheduler" muted onPress={onClose}>
              <Text style={styles.closeText}>X</Text>
            </IconButton>
          </View>

          <ScrollView
            contentContainerStyle={styles.schedulerContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Event title</Text>
              <TextInput
                accessibilityLabel="Event title"
                onChangeText={setTitle}
                placeholder="Reminder"
                placeholderTextColor="#94a3b8"
                style={styles.schedulerInput}
                value={title}
              />
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}
              >
                {dateOptions.map((option) => (
                  <SchedulerChip
                    key={option.key}
                    label={option.label}
                    onPress={() => setDate(option.date)}
                    selected={isSameDay(date, option.date)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.timeGrid}>
              <Pressable
                accessibilityLabel="Start time"
                accessibilityRole="button"
                onPress={() => setActivePicker("start")}
                style={styles.timeCard}
              >
                <Text style={styles.fieldLabel}>Start time</Text>
                <Text style={styles.timeValue}>
                  {formatTimeParts(startHour, startMinute)}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="End time optional"
                accessibilityRole="button"
                onPress={() => {
                  setEndEnabled(true);
                  setActivePicker("end");
                }}
                style={styles.timeCard}
              >
                <Text style={styles.fieldLabel}>End time</Text>
                <Text style={styles.timeValue}>
                  {endEnabled ? formatTimeParts(endHour, endMinute) : "Add end"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.chipRow}>
              {(["now", "morning", "afternoon", "evening"] as const).map(
                (preset) => (
                  <SchedulerChip
                    key={preset}
                    label={
                      preset === "now"
                        ? "Now"
                        : preset[0].toUpperCase() + preset.slice(1)
                    }
                    onPress={() => applyPreset(preset)}
                    selected={false}
                  />
                ),
              )}
            </View>

            {activePicker ? (
              <TimePickerPanel
                hour={activePicker === "start" ? startHour : endHour}
                minute={activePicker === "start" ? startMinute : endMinute}
                onCancel={() => setActivePicker(null)}
                onConfirm={(hour, minute) => {
                  if (activePicker === "start") {
                    setStartHour(hour);
                    setStartMinute(minute);
                    if (
                      !endEnabled ||
                      withTime(date, endHour, endMinute).getTime() <=
                        withTime(date, hour, minute).getTime()
                    ) {
                      setEndHour(Math.min(23, hour + 1));
                      setEndMinute(minute);
                    }
                  } else {
                    setEndHour(hour);
                    setEndMinute(minute);
                    setEndEnabled(true);
                  }
                  setActivePicker(null);
                }}
                title={
                  activePicker === "start"
                    ? "Choose start time"
                    : "Choose end time"
                }
              />
            ) : null}

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}
              >
                {availableCategories.map((category) => (
                  <SchedulerChip
                    key={category.key}
                    label={category.label}
                    onPress={() => setCategoryKey(category.key)}
                    selected={categoryKey === category.key}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Repeat</Text>
              <View style={styles.chipRow}>
                {["Does not repeat", "Daily", "Weekly"].map((option) => (
                  <SchedulerChip
                    key={option}
                    label={option}
                    onPress={() => setRepeatLabel(option)}
                    selected={repeatLabel === option}
                  />
                ))}
              </View>
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Reminder alert</Text>
              <View style={styles.chipRow}>
                {["No alert", "At time", "10 min before", "1 hour before"].map(
                  (option) => (
                    <SchedulerChip
                      key={option}
                      label={option}
                      onPress={() => setAlertLabel(option)}
                      selected={alertLabel === option}
                    />
                  ),
                )}
              </View>
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                accessibilityLabel="Event notes"
                multiline
                onChangeText={setNotes}
                placeholder="Notes optional"
                placeholderTextColor="#94a3b8"
                style={[styles.schedulerInput, styles.notesInput]}
                value={notes}
              />
            </View>

            {errorMessage ? (
              <Text style={styles.schedulerError}>{errorMessage}</Text>
            ) : null}
          </ScrollView>

          <View style={styles.schedulerFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={saveEvent}
              style={[
                styles.saveButton,
                isSaving ? styles.saveButtonDisabled : null,
              ]}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save event"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TimePickerPanel({
  hour,
  minute,
  onCancel,
  onConfirm,
  title,
}: {
  hour: number;
  minute: number;
  onCancel: () => void;
  onConfirm: (hour: number, minute: number) => void;
  title: string;
}) {
  const [draftHour, setDraftHour] = useState(hour);
  const [draftMinute, setDraftMinute] = useState(minute);
  const hours = Array.from({ length: 24 }, (_, index) => index);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <View style={styles.timePickerPanel}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.timePickerTitle}>{title}</Text>
        <Text style={styles.timePickerValue}>
          {formatTimeParts(draftHour, draftMinute)}
        </Text>
      </View>
      <View style={styles.timePickerColumns}>
        <ScrollView
          contentContainerStyle={styles.timeColumn}
          style={styles.timeColumnScroll}
        >
          {hours.map((nextHour) => (
            <SchedulerChip
              key={nextHour}
              label={String(nextHour).padStart(2, "0")}
              onPress={() => setDraftHour(nextHour)}
              selected={draftHour === nextHour}
            />
          ))}
        </ScrollView>
        <ScrollView
          contentContainerStyle={styles.timeColumn}
          style={styles.timeColumnScroll}
        >
          {minutes.map((nextMinute) => (
            <SchedulerChip
              key={nextMinute}
              label={String(nextMinute).padStart(2, "0")}
              onPress={() => setDraftMinute(nextMinute)}
              selected={draftMinute === nextMinute}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.timePickerActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onConfirm(draftHour, draftMinute)}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Confirm time</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SchedulerChip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.schedulerChip,
        selected ? styles.schedulerChipSelected : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.schedulerChipText,
          selected ? styles.schedulerChipTextSelected : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function buildMonthDays(
  monthStart: Date,
  reminders: AppReminder[],
  overlays: CalendarHaloOverlay[],
) {
  const firstVisible = startOfDay(addDays(monthStart, -monthStart.getDay()));

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstVisible, index);
    const key = toDateKey(date);

    return {
      date,
      inCurrentMonth: date.getMonth() === monthStart.getMonth(),
      key,
      overlays: overlays.filter((overlay) => overlay.date === key),
      reminders: reminders.filter((reminder) =>
        isSameDay(new Date(reminder.dueAt), date),
      ),
    };
  });
}

function buildWeekDays(
  selectedDate: Date,
  reminders: AppReminder[],
  overlays: CalendarHaloOverlay[],
) {
  const weekStart = startOfDay(addDays(selectedDate, -selectedDate.getDay()));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = toDateKey(date);

    return {
      date,
      inCurrentMonth: true,
      key,
      overlays: overlays.filter((overlay) => overlay.date === key),
      reminders: reminders.filter((reminder) =>
        isSameDay(new Date(reminder.dueAt), date),
      ),
    };
  });
}

function filterVisibleReminders(
  reminders: AppReminder[],
  enabledModules: AppModuleKey[],
) {
  return reminders.filter((reminder) => {
    if (reminder.type === "child_baby")
      return enabledModules.includes("child_baby");
    if (reminder.type === "elder_care")
      return enabledModules.includes("elder_care");
    if (reminder.type === "caregiver")
      return enabledModules.includes("caregiver");
    if (reminder.type === "fitness") return enabledModules.includes("fitness");
    if (reminder.type === "food") return enabledModules.includes("food");
    return true;
  });
}

function groupByDate(reminders: AppReminder[]) {
  return reminders.reduce<Record<string, AppReminder[]>>((groups, reminder) => {
    const key = toDateKey(new Date(reminder.dueAt));

    return {
      ...groups,
      [key]: [...(groups[key] ?? []), reminder],
    };
  }, {});
}

function getOverlayColor(overlay: CalendarHaloOverlay) {
  const label = overlay.label.toLowerCase();

  if (label.includes("logged") || label.includes("period")) return "#fb7f9f";
  if (label.includes("fertile")) return "#c4b5fd";
  if (label.includes("ovulation")) return "#f8b84e";
  if (label.includes("contraception")) return "#6ee7c8";
  if (label.includes("caution")) return "#fbbf24";
  return overlay.color || "#f9a8d4";
}

function getOverlayLabel(overlay: CalendarHaloOverlay) {
  const label = overlay.label.toLowerCase();

  if (label.includes("contraception")) return "Contraception note";
  if (label.includes("ovulation")) return "Ovulation estimate";
  if (label.includes("fertile")) return "Fertile estimate";
  if (label.includes("predicted")) return "Predicted period";
  if (label.includes("period")) return "Period tracking";
  if (label.includes("caution")) return "Caution note";
  return "Private overlay";
}

function formatStatus(status: ReminderStatus) {
  if (status === "completed") return "Completed";
  if (status === "skipped") return "Later";
  if (status === "cancelled") return "Cancelled";
  return "Planned";
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(date);
}

function formatAgendaDate(date: Date, compact: boolean) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: compact ? "short" : "long",
    weekday: compact ? "short" : "long",
    year: compact ? undefined : "numeric",
  }).format(date);
}

function accentSoftColor(color: string, opacity: number) {
  const hsl = color.replace("hsl(", "").replace(")", "");
  return color.startsWith("hsl(") ? `hsla(${hsl}, ${opacity})` : color;
}

function formatDateKey(dateKey: string) {
  return formatDateLabel(new Date(`${dateKey}T12:00:00`));
}

function startOfDay(date: Date) {
  const next = new Date(date);

  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);

  next.setDate(date.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 12);
}

function clampDateToMonth(date: Date, month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const day = Math.min(date.getDate(), getDaysInMonth(year, monthIndex));

  return new Date(year, monthIndex, day, 12);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(left: Date, right: Date) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  agendaScrollContent: {
    gap: 8,
    paddingBottom: 210,
    paddingTop: AGENDA_PINNED_HEADER_OFFSET,
  },
  agendaScroll: {
    flex: 1,
  },
  agendaViewport: {
    backgroundColor: "transparent",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 2,
  },
  agendaPinnedHeader: {
    alignItems: "flex-start",
    backgroundColor: "#080f1d",
    borderBottomColor: "transparent",
    borderBottomWidth: 1,
    borderColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    elevation: 8,
    flexDirection: "row",
    minHeight: AGENDA_PINNED_HEADER_OFFSET,
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    position: "absolute",
    left: 0,
    right: 0,
    shadowColor: "#020617",
    shadowOffset: { height: -8, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    top: 0,
    zIndex: 3,
  },
  agendaDateDot: {
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    height: 5,
    marginTop: 8,
    width: 5,
  },
  agendaDateRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 9,
  },
  agendaHeaderActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  agendaInnerContent: {
    gap: 12,
    paddingBottom: 14,
    paddingTop: 2,
  },
  agendaSheet: {
    backgroundColor: "rgba(16,26,45,0.96)",
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomWidth: 1,
    gap: 0,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  agendaSheetLight: {
    backgroundColor: "#fffaf4",
    borderBottomColor: "rgba(15,23,42,0.08)",
  },
  agendaSheetBody: {
    position: "relative",
  },
  calendarScreenFrame: {
    flex: 1,
    paddingBottom: 0,
  },
  calendarChrome: {
    gap: CALENDAR_LAYER_GAP,
  },
  calendarViewport: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 720,
    position: "relative",
    width: "100%",
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  cancelButtonText: {
    color: "#e2e8f0",
    fontWeight: "900",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipScroll: {
    gap: 8,
    paddingRight: 18,
  },
  closeText: {
    color: "#cbd5e1",
    fontWeight: "900",
  },
  dayCell: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: "13.05%",
    flexGrow: 1,
    height: 50,
    justifyContent: "space-between",
    overflow: "hidden",
    paddingHorizontal: 5,
    paddingVertical: 6,
    position: "relative",
  },
  dayCellMuted: {
    opacity: 0.34,
  },
  dayCellSelected: {
    backgroundColor: "#fff7ed",
    borderColor: "#fef3c7",
  },
  dayCellToday: {
    borderColor: "#6ee7c8",
  },
  dayDot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  dayIndicators: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    justifyContent: "center",
    minHeight: 8,
  },
  dayNumber: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  dayNumberMuted: {
    color: "#64748b",
  },
  dayNumberSelected: {
    color: "#10201d",
  },
  darkMuted: {
    color: "#cbd5e1",
    lineHeight: 21,
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  emptyCardCompact: {
    borderRadius: 14,
    padding: 11,
  },
  emptyCardLight: {
    backgroundColor: "#ffffff",
    borderColor: "rgba(15,23,42,0.10)",
  },
  emptyText: {
    color: "#cbd5e1",
    lineHeight: 19,
    marginTop: 4,
  },
  emptyTextCompact: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  emptyTextLight: {
    color: "#64748b",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
  },
  emptyTitleCompact: {
    fontSize: 14,
  },
  emptyTitleLight: {
    color: "#0f172a",
  },
  groupTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
  },
  filterChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  filterChipText: {
    color: "#e2e8f0",
    fontWeight: "900",
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  halo: {
    borderRadius: 14,
    borderWidth: 2,
    bottom: 4,
    left: 4,
    opacity: 0.5,
    position: "absolute",
    right: 4,
    top: 4,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  headerCard: {
    backgroundColor: "#0f172a",
    borderColor: "rgba(110,231,200,0.18)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
  },
  headerCopy: {
    color: "#64748b",
    lineHeight: 21,
    marginTop: 14,
  },
  headerPill: {
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 14,
  },
  headerPillCompact: {
    minHeight: 36,
    paddingHorizontal: 12,
  },
  headerPillLight: {
    backgroundColor: "#ede9fe",
  },
  headerPillText: {
    color: "#f8fafc",
    fontWeight: "900",
  },
  headerPillTextLight: {
    color: "#6d28d9",
  },
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
  },
  fieldCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 9,
    padding: 13,
  },
  fieldLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#ff6f61",
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  iconButtonMuted: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
  },
  iconButtonSmall: {
    height: 32,
    width: 32,
  },
  metricCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: "30%",
    padding: 14,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "900",
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 4,
  },
  monthCard: {
    backgroundColor: "#0f172a",
    borderColor: "rgba(255,255,255,0.10)",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 18,
  },
  monthControl: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  monthSelector: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "flex-start",
    minWidth: 176,
  },
  monthSelectorButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    maxWidth: 190,
    minHeight: 32,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  monthGridPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  monthJumpButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  monthJumpButtonText: {
    color: "#e2e8f0",
    fontWeight: "900",
  },
  monthPickerCell: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    minHeight: 48,
    justifyContent: "center",
    padding: 10,
  },
  monthPickerCellSelected: {
    backgroundColor: "#fff7ed",
    borderColor: "#fef3c7",
  },
  monthPickerCellText: {
    color: "#e2e8f0",
    fontWeight: "900",
  },
  monthPickerCellTextSelected: {
    color: "#10201d",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 12,
  },
  monthTitle: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  moreText: {
    color: "#94a3b8",
    fontSize: 8,
    fontWeight: "900",
  },
  overlayList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  overlayMark: {
    borderRadius: 999,
    height: 5,
    position: "absolute",
    right: 7,
    top: 7,
    width: 5,
  },
  overlayPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  overlayText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "900",
  },
  overlayTextLight: {
    color: "#475569",
  },
  notesInput: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  panelKicker: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 5,
    paddingLeft: 14,
    textTransform: "uppercase",
  },
  panelTitle: {
    color: "#f8fafc",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  privacyNote: {
    alignItems: "flex-start",
    backgroundColor: "rgba(15,23,42,0.94)",
    borderColor: "rgba(196,181,253,0.20)",
    borderRadius: 16,
    borderWidth: 1,
    elevation: 0,
    flexDirection: "row",
    gap: 10,
    padding: 12,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  privacyNoteLight: {
    backgroundColor: "#ffffff",
    borderColor: "rgba(139,92,246,0.18)",
  },
  privacyCopy: {
    flex: 1,
    gap: 3,
  },
  privacyIcon: {
    alignItems: "center",
    backgroundColor: "rgba(196,181,253,0.12)",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  pinnedCalendarArea: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    gap: 4,
    zIndex: 3,
  },
  privacyText: {
    color: "#94a3b8",
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  privacyTextLight: {
    color: "#64748b",
  },
  privacyTitle: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "900",
  },
  privacyTitleLight: {
    color: "#334155",
  },
  privateOverlay: {
    backgroundColor: "rgba(196,181,253,0.08)",
    borderColor: "rgba(196,181,253,0.20)",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  privateOverlayLight: {
    backgroundColor: "rgba(139,92,246,0.06)",
    borderColor: "rgba(139,92,246,0.16)",
  },
  privateOverlayCopy: {
    flex: 1,
    gap: 2,
  },
  privateOverlayHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  privateOverlayIcon: {
    alignItems: "center",
    backgroundColor: "rgba(196,181,253,0.12)",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  privateOverlayText: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 15,
  },
  privateOverlayTextLight: {
    color: "#64748b",
  },
  privateOverlayTitle: {
    color: "#ddd6fe",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  privateOverlayTitleLight: {
    color: "#6d28d9",
  },
  quickSheet: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderColor: "rgba(255,255,255,0.14)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    paddingBottom: 28,
  },
  quickSheetAction: {
    alignItems: "center",
    gap: 8,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  quickSheetActionFrame: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    flexShrink: 0,
    height: 132,
    overflow: "hidden",
    width: 102,
  },
  quickSheetActionMeta: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
  },
  quickSheetActionReordering: {
    backgroundColor: "rgba(110,231,200,0.14)",
    borderColor: "#6ee7c8",
    transform: [{ scale: 1.03 }],
  },
  quickSheetActionText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
    textAlign: "center",
  },
  quickSheetIcon: {
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  quickSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 92,
  },
  quickSheetPlaceholder: {
    backgroundColor: "rgba(110,231,200,0.12)",
    borderColor: "rgba(110,231,200,0.24)",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  quickSheetPlaceholderText: {
    color: "#dbeafe",
    fontWeight: "800",
    lineHeight: 20,
  },
  quickSheetTitle: {
    color: "#f8fafc",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 3,
  },
  dayActionCarousel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingLeft: 20,
    paddingRight: 30,
    paddingVertical: 2,
  },
  dayActionCarouselFrame: {
    height: 138,
    position: "relative",
  },
  dayActionCarouselScroll: {
    height: 138,
  },
  dayActionHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  dayActionHint: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  dayActionOverlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 14,
  },
  dayActionPopup: {
    backgroundColor: "#0f172a",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    minHeight: 260,
    maxWidth: 520,
    overflow: "hidden",
    paddingBottom: 14,
    width: "100%",
  },
  carouselEdgeShade: {
    bottom: 0,
    flexDirection: "row",
    position: "absolute",
    top: 0,
    width: 18,
  },
  carouselEdgeShadeLeft: {
    left: 0,
  },
  carouselEdgeShadeRight: {
    right: 0,
  },
  dayActionPlaceholder: {
    marginHorizontal: 18,
  },
  reminderMeta: {
    color: "#94a3b8",
    marginTop: 4,
  },
  reminderRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  reminderTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
  },
  rowActions: {
    alignItems: "flex-end",
    gap: 7,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#6ee7c8",
    borderRadius: 18,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  saveButtonDisabled: {
    opacity: 0.62,
  },
  saveButtonText: {
    color: "#10201d",
    fontWeight: "900",
  },
  schedulerBackdrop: {
    backgroundColor: "rgba(2,6,23,0.52)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  schedulerChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  schedulerChipSelected: {
    backgroundColor: "#fff7ed",
    borderColor: "#fef3c7",
  },
  schedulerChipText: {
    color: "#e2e8f0",
    fontWeight: "900",
  },
  schedulerChipTextSelected: {
    color: "#10201d",
  },
  schedulerContent: {
    gap: 14,
    paddingBottom: 24,
  },
  schedulerError: {
    color: "#fbbf24",
    fontWeight: "900",
    lineHeight: 20,
  },
  schedulerFooter: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderTopColor: "rgba(255,255,255,0.10)",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingBottom: 4,
    paddingTop: 12,
  },
  schedulerHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    height: 5,
    marginBottom: 12,
    width: 44,
  },
  schedulerInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    color: "#f8fafc",
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  schedulerKicker: {
    color: "#6ee7c8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  schedulerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  schedulerSheet: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderColor: "rgba(255,255,255,0.14)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    gap: 12,
    maxHeight: "92%",
    padding: 18,
    paddingBottom: 24,
  },
  schedulerTitle: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 3,
  },
  sectionHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  selectedPanel: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: "hidden",
    shadowColor: "#020617",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { height: 6, width: 0 },
    elevation: 4,
  },
  skeletonCell: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    flexBasis: "13.05%",
    flexGrow: 1,
    height: 74,
  },
  skeletonLabel: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    height: 12,
    width: 28,
  },
  smallAction: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallActionText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "900",
  },
  stack: {
    gap: 14,
  },
  successToast: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  successToastText: {
    color: "#10201d",
    fontWeight: "900",
  },
  statusText: {
    color: "#6ee7c8",
    fontSize: 12,
    fontWeight: "900",
  },
  timelineDate: {
    color: "#6ee7c8",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  timelineGroup: {
    gap: 9,
  },
  timelineIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  timelineRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  timeCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minHeight: 86,
    padding: 14,
  },
  timeColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 6,
  },
  timeColumnScroll: {
    maxHeight: 156,
  },
  timeGrid: {
    flexDirection: "row",
    gap: 10,
  },
  timePickerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  timePickerColumns: {
    gap: 10,
    marginTop: 12,
  },
  timePickerPanel: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(110,231,200,0.24)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
  },
  timePickerTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  timePickerValue: {
    color: "#6ee7c8",
    fontSize: 18,
    fontWeight: "900",
  },
  timeValue: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "900",
  },
  todayHero: {
    backgroundColor: "#0f172a",
    borderColor: "rgba(110,231,200,0.24)",
    borderWidth: 1,
  },
  typeIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  weekDay: {
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
    minHeight: 60,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  weekDayToday: {
    borderColor: "rgba(110,231,200,0.55)",
  },
  weekDayLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },
  weekDayNumber: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },
  weekDaySelected: {
    backgroundColor: "#fff7ed",
    borderColor: "#fef3c7",
  },
  weekDayTextSelected: {
    color: "#10201d",
  },
  weekTodayMarker: {
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    height: 4,
    position: "absolute",
    top: 5,
    width: 12,
  },
  weekTodayMarkerSelected: {
    backgroundColor: "#0f766e",
  },
  weekDots: {
    flexDirection: "row",
    gap: 3,
    justifyContent: "center",
    marginTop: 7,
    minHeight: 6,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekHeaderText: {
    color: "#94a3b8",
    flex: 1,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
  },
  weekStrip: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: CALENDAR_COLLAPSED_HEIGHT,
    paddingBottom: 8,
    paddingTop: 4,
    width: "100%",
  },
  yearText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "800",
  },
  yearJumpRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
