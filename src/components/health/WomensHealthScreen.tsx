import { router } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HealthScreenContainer } from "@/components/health/HealthScreenContainer";
import { AppButton, AppCard, AppFormInput, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { useAppTheme } from "@/theme/ThemeProvider";

const ACCENT = "#be5f7b";
const WARM = "#8f5b3e";
const GOLD = "#b7791f";
const TEAL = "#0f766e";

type WomensHealthScreenState = "ready" | "loading" | "empty" | "error";
type MarkerType = "estimated-fertility" | "estimated-period" | "logged-period";
type FlowSummary = "None" | "Light" | "Medium" | "Heavy" | "Spotting";
type QuickLogType = "flow" | "mood" | "note" | "period" | "symptom";
type CalendarDay = {
  date: number;
  iso: string;
  isSelected?: boolean;
  isToday?: boolean;
  marker?: MarkerType;
};
type QuickAction = {
  accessibilityLabel: string;
  available: boolean;
  description: string;
  icon: AppIconName;
  label: string;
  type: QuickLogType;
};
type WomensHealthPeriodEntry = {
  createdAt: string;
  endDate: string;
  flow?: Exclude<FlowSummary, "None">;
  id: string;
  loggedDates: string[];
  note?: string;
  profileId: string;
  source: "manual";
  startDate: string;
};
type CycleSummary = {
  averageLengthDays: number;
  cycleDay: number;
  dataStatus: string;
  lastLogged: string;
  loggedDayCount: number;
  nextPeriodEstimate: string;
  phase: string;
};
type PreviewEntry = {
  category: string;
  icon: AppIconName;
  id: string;
  note?: string;
  source: string;
  time: string;
  title: string;
};
type ReminderEntry = {
  icon: AppIconName;
  id: string;
  source: string;
  time: string;
  title: string;
};

const SCREEN_STATE: WomensHealthScreenState = "ready";
const FEATURE_ENABLED = true;
const PROFILE = {
  id: "local-profile",
  name: "You",
  privacyStatus: "Sharing is off"
};
const CYCLE = {
  averageLengthDays: 28,
  cycleDay: 12,
  lastLogged: "26 May 2026",
  nextPeriodEstimate: "In 16 days",
  phase: "Follicular"
};
const QUICK_ACTIONS: QuickAction[] = [
  { accessibilityLabel: "Log period day", available: true, description: "Save period dates privately on this device for now.", icon: "pregnancy_cycle", label: "Log period", type: "period" },
  { accessibilityLabel: "Add Women's Health symptom", available: false, description: "Symptom logging will be added in a later step.", icon: "vitals", label: "Add symptom", type: "symptom" },
  { accessibilityLabel: "Add flow entry", available: false, description: "Flow-only logging will be added after period logging.", icon: "water", label: "Add flow", type: "flow" },
  { accessibilityLabel: "Add mood entry", available: false, description: "Mood tracking will be added in a later step.", icon: "ai_assistant", label: "Add mood", type: "mood" },
  { accessibilityLabel: "Add private Women's Health note", available: false, description: "Private notes will be added in a later step.", icon: "edit", label: "Add note", type: "note" }
];
const RECENT_ENTRIES: PreviewEntry[] = [
  { category: "Symptom", icon: "vitals", id: "symptom-cramps", note: "Lower abdomen, short note saved.", source: "Added manually", time: "Today at 08:20", title: "Mild cramps" },
  { category: "Energy", icon: "fitness", id: "energy-lower", source: "Added manually", time: "Yesterday at 18:40", title: "Lower energy" },
  { category: "Note", icon: "edit", id: "note-sleep", note: "Sleep changes after a busy day.", source: "Added manually", time: "7 Jun at 21:15", title: "Sleep changes" }
];
const REMINDERS: ReminderEntry[] = [
  { icon: "pregnancy_cycle", id: "period-estimate", source: "Cycle estimate", time: "In 16 days", title: "Period estimate begins" },
  { icon: "reminder", id: "contraception-reminder", source: "Contraception", time: "20:00 today", title: "Daily pill reminder" },
  { icon: "calendar_timeline", id: "appointment", source: "Appointment", time: "Friday", title: "Women's Health appointment" }
];
const CALENDAR_DAYS: CalendarDay[] = Array.from({ length: 30 }, (_, index) => {
  const date = index + 1;
  const marker = date === 3 || date === 4 ? "logged-period" : date >= 18 && date <= 20 ? "estimated-period" : date >= 11 && date <= 13 ? "estimated-fertility" : undefined;
  return { date, iso: `2026-06-${String(date).padStart(2, "0")}`, isSelected: date === 12, isToday: date === 9, marker };
});
const WEEKDAYS = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" }
] as const;
const FLOW_OPTIONS: readonly FlowSummary[] = ["None", "Light", "Medium", "Heavy", "Spotting"];

export function WomensHealthScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [selectedIso, setSelectedIso] = useState("2026-06-12");
  const [periodEntries, setPeriodEntries] = useState<WomensHealthPeriodEntry[]>([]);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [periodSheetOpen, setPeriodSheetOpen] = useState(false);
  const [placeholderMessage, setPlaceholderMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const compactActions = width < 370;
  const loggedDateSet = useMemo(() => new Set(periodEntries.filter((entry) => entry.profileId === PROFILE.id).flatMap((entry) => entry.loggedDates)), [periodEntries]);
  const calendarDays = useMemo(() => CALENDAR_DAYS.map((day) => loggedDateSet.has(day.iso) ? { ...day, marker: "logged-period" as MarkerType } : day), [loggedDateSet]);
  const selectedDay = useMemo(() => calendarDays.find((day) => day.iso === selectedIso) ?? calendarDays[11], [calendarDays, selectedIso]);
  const cycleSummary = useMemo(() => buildCycleSummary(periodEntries), [periodEntries]);

  function handleQuickAction(type: QuickLogType) {
    setSavedMessage("");
    const action = QUICK_ACTIONS.find((item) => item.type === type);
    if (type === "period") {
      setPlaceholderMessage("");
      setQuickLogOpen(false);
      setPeriodSheetOpen(true);
      return;
    }
    setPlaceholderMessage(`${action?.label ?? "This log type"} will be added in a later Women's Health step.`);
  }

  function savePeriod(draft: Pick<WomensHealthPeriodEntry, "endDate" | "flow" | "loggedDates" | "note" | "startDate">) {
    // TODO: Persist Women's Health period entries through the approved profile data layer.
    const entry: WomensHealthPeriodEntry = {
      ...draft,
      createdAt: new Date().toISOString(),
      id: `period-${Date.now()}`,
      profileId: PROFILE.id,
      source: "manual"
    };
    setPeriodEntries((current) => [entry, ...current]);
    setSelectedIso(draft.startDate);
    setPeriodSheetOpen(false);
    setQuickLogOpen(false);
    setPlaceholderMessage("");
    setSavedMessage("Period dates saved locally for now. They are private to this screen until persistence is added.");
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HealthScreenContainer bottomSpacing={120} contentStyle={styles.content} maxWidth={470}>
        <WomensHealthHeader />
        {SCREEN_STATE === "loading" ? <WomensHealthLoadingState /> : null}
        {SCREEN_STATE === "error" ? <WomensHealthState action="Try again" icon="warning" message="Please try again." title="We couldn't load Women's Health" /> : null}
        {SCREEN_STATE === "empty" ? <WomensHealthState action="Set up Women's Health" icon="pregnancy_cycle" message="Choose what you would like to track, such as cycle dates, symptoms, contraception or personal notes." title="Start your private Women's Health space" /> : null}
        {!FEATURE_ENABLED ? <WomensHealthState action="View profile settings" icon="privacy" message="This optional feature can be enabled from the profile's health settings." title="Women's Health is not enabled for this profile" /> : null}
        {SCREEN_STATE === "ready" && FEATURE_ENABLED ? (
          <>
            {savedMessage ? <InlineStatusMessage tone="success" message={savedMessage} onDismiss={() => setSavedMessage("")} /> : null}
            {placeholderMessage && !quickLogOpen ? <InlineStatusMessage tone="info" message={placeholderMessage} onDismiss={() => setPlaceholderMessage("")} /> : null}
            <CycleSummaryCard summary={cycleSummary} />
            <CompactCalendar days={calendarDays} selectedIso={selectedIso} selectedDay={selectedDay} onSelect={setSelectedIso} />
            <QuickLogActions compact={compactActions} onOpenSelector={() => setQuickLogOpen(true)} onQuickAction={handleQuickAction} />
            <TodayContextCard selectedDay={selectedDay} />
            <RecentSymptomsAndNotes />
            <ContraceptionPreviewCard />
            <UpcomingReminders />
            <PrivacyCard />
            <EducationCard />
            <SafetyNote />
            <WomensHealthQuickLogSheet message={placeholderMessage} onClose={() => setQuickLogOpen(false)} onSelect={handleQuickAction} visible={quickLogOpen} />
            {periodSheetOpen ? <WomensHealthPeriodLogSheet key={`period-${selectedIso}`} onCancel={() => setPeriodSheetOpen(false)} onSave={savePeriod} profileName={PROFILE.name} selectedIso={selectedIso} visible={periodSheetOpen} /> : null}
          </>
        ) : null}
      </HealthScreenContainer>
    </View>
  );
}

function WomensHealthHeader() {
  const { theme } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable accessibilityHint="Returns to the Health overview" accessibilityLabel="Back to Health" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}>
          <Text style={[styles.backText, { color: theme.text }]}>{"<"}</Text>
        </Pressable>
        <View accessibilityLabel={`Active profile, ${PROFILE.name}. ${PROFILE.privacyStatus}.`} accessible style={[styles.profilePill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.profileIcon, { backgroundColor: `${ACCENT}18` }]}>
            <AppIcon color={ACCENT} decorative name="profile" size={17} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileLabel, { color: theme.mutedText }]}>ACTIVE PROFILE</Text>
            <Text numberOfLines={1} style={[styles.profileName, { color: theme.text }]}>{PROFILE.name}</Text>
          </View>
        </View>
      </View>
      <View style={styles.titleBlock}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Women{"'"}s Health</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>Private cycle, symptom and contraception tracking</Text>
        <View accessibilityLabel={`Privacy status, ${PROFILE.privacyStatus}`} accessible style={[styles.privacyPill, { backgroundColor: `${ACCENT}12`, borderColor: `${ACCENT}35` }]}>
          <AppIcon color={ACCENT} decorative name="privacy" size={14} />
          <Text style={[styles.privacyPillText, { color: ACCENT }]}>{PROFILE.privacyStatus}</Text>
        </View>
      </View>
    </View>
  );
}

function CycleSummaryCard({ summary }: { summary: CycleSummary }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.heroCard, { backgroundColor: theme.background === "#0f172a" ? "rgba(67,40,55,0.82)" : "#fff7f4", borderColor: `${ACCENT}35` }]}>
      <View pointerEvents="none" style={styles.heroMotif}>
        <View style={[styles.haloLarge, { borderColor: `${ACCENT}30` }]} />
        <View style={[styles.haloSmall, { borderColor: `${GOLD}35` }]} />
      </View>
      <Text style={[styles.eyebrow, { color: ACCENT }]}>Cycle overview</Text>
      <Text accessibilityLabel={`Cycle overview for ${PROFILE.name}. Cycle day ${summary.cycleDay} of an estimated ${summary.averageLengthDays}-day cycle. Next period estimate ${summary.nextPeriodEstimate.toLowerCase()}.`} style={[styles.heroValue, { color: theme.text }]}>Day {summary.cycleDay} <Text style={styles.heroUnit}>of estimated {summary.averageLengthDays}</Text></Text>
      <View style={styles.heroGrid}>
        <HeroStat label="Next period estimate" value={summary.nextPeriodEstimate} />
        <HeroStat label="Last logged" value={summary.lastLogged} />
      </View>
      <Text style={[styles.heroSupport, { color: theme.mutedText }]}>{summary.dataStatus}</Text>
      {summary.loggedDayCount > 0 ? <Text style={[styles.heroSupport, { color: theme.mutedText }]}>{summary.loggedDayCount} period {summary.loggedDayCount === 1 ? "day" : "days"} saved locally in this session.</Text> : null}
    </AppCard>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.heroStat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statLabel, { color: theme.mutedText }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function CompactCalendar({ days, onSelect, selectedDay, selectedIso }: { days: CalendarDay[]; onSelect: (iso: string) => void; selectedDay: CalendarDay; selectedIso: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.calendarCard, { backgroundColor: theme.surface, borderColor: `${ACCENT}30` }]}>
      <View style={styles.calendarHeader}>
        <View>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>June 2026</Text>
          <Text style={[styles.sectionMeta, { color: theme.mutedText }]}>Private cycle context</Text>
        </View>
        <View accessibilityLabel={`Selected date, ${formatDateSpeech(selectedDay.iso)}`} accessible style={[styles.selectedDateBadge, { backgroundColor: `${ACCENT}12` }]}>
          <Text style={[styles.selectedDateText, { color: ACCENT }]}>Selected {selectedDay.date}</Text>
        </View>
      </View>
      <View accessibilityLabel="June 2026 Women's Health calendar" style={styles.weekdays}>
        {WEEKDAYS.map((day) => <Text key={day.key} style={[styles.weekday, { color: theme.mutedText }]}>{day.label}</Text>)}
      </View>
      <View style={styles.dayGrid}>
        {days.map((day) => <CalendarDayButton day={{ ...day, isSelected: day.iso === selectedIso }} key={day.iso} onPress={() => onSelect(day.iso)} />)}
      </View>
      <CalendarLegend />
    </AppCard>
  );
}

function CalendarDayButton({ day, onPress }: { day: CalendarDay; onPress: () => void }) {
  const { theme } = useAppTheme();
  const markerStyle = getMarkerStyle(day.marker);
  return (
    <Pressable
      accessibilityLabel={getDayAccessibilityLabel(day)}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(day.isSelected) }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCell,
        {
          backgroundColor: day.isSelected ? `${ACCENT}18` : theme.background,
          borderColor: day.isSelected ? ACCENT : theme.border
        },
        pressed ? styles.pressed : null
      ]}
    >
      {day.marker ? <View pointerEvents="none" style={[styles.dayHalo, markerStyle]} /> : null}
      <Text style={[styles.dayNumber, { color: day.isSelected ? ACCENT : theme.text }]}>{day.date}</Text>
      {day.isToday ? <View pointerEvents="none" style={[styles.todayDot, { backgroundColor: TEAL }]} /> : null}
    </Pressable>
  );
}

function CalendarLegend() {
  return (
    <View style={styles.legend}>
      <LegendItem label="Logged period" marker="logged-period" />
      <LegendItem label="Estimated period" marker="estimated-period" />
      <LegendItem label="Estimated fertility" marker="estimated-fertility" />
      <View style={styles.legendItem}>
        <View style={[styles.legendToday, { backgroundColor: TEAL }]} />
        <Text style={styles.legendText}>Today</Text>
      </View>
    </View>
  );
}

function LegendItem({ label, marker }: { label: string; marker: MarkerType }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendMarker, getMarkerStyle(marker)]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function QuickLogActions({ compact, onOpenSelector, onQuickAction }: { compact: boolean; onOpenSelector: () => void; onQuickAction: (type: QuickLogType) => void }) {
  const { theme } = useAppTheme();
  return (
    <AppSection actionAccessibilityHint="Opens all Women's Health quick log choices" actionAccessibilityLabel="Open Women's Health quick log selector" actionLabel="Quick log" onActionPress={onOpenSelector} subtitle="Log period dates now. Other private entries are prepared for later steps." title="Quick log">
      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            accessibilityHint={action.available ? action.description : "This planned quick log action will show a prepared message for now."}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityRole="button"
            key={action.label}
            onPress={() => onQuickAction(action.type)}
            style={({ pressed }) => [styles.quickAction, compact ? styles.quickActionCompact : null, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}
          >
            <View style={[styles.quickIcon, { backgroundColor: `${ACCENT}14` }]}>
              <AppIcon color={ACCENT} decorative name={action.icon} size={18} />
            </View>
            <Text numberOfLines={2} style={[styles.quickText, { color: theme.text }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </AppSection>
  );
}

function TodayContextCard({ selectedDay }: { selectedDay: CalendarDay }) {
  const { theme } = useAppTheme();
  const markerText = selectedDay.marker ? getMarkerLabel(selectedDay.marker) : "No entry yet";
  return (
    <AppCard style={[styles.contextCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.cardKicker, { color: ACCENT }]}>Today</Text>
      <Text style={[styles.cardTitle, { color: theme.text }]}>Cycle day {CYCLE.cycleDay}</Text>
      <Text style={[styles.phaseText, { color: theme.text }]}>Estimated {CYCLE.phase.toLowerCase()} phase</Text>
      <Text style={[styles.cardBody, { color: theme.mutedText }]}>This is based on saved cycle dates and may change when new information is added.</Text>
      <View style={[styles.contextRow, { borderColor: theme.border }]}>
        <Text style={[styles.contextLabel, { color: theme.mutedText }]}>Selected date</Text>
        <Text style={[styles.contextValue, { color: theme.text }]}>{formatDateSpeech(selectedDay.iso)} - {markerText}</Text>
      </View>
    </AppCard>
  );
}

function RecentSymptomsAndNotes() {
  return (
    <AppSection subtitle="User-entered context only, without automatic interpretation." title="Recent symptoms and notes">
      <View style={styles.listStack}>
        {RECENT_ENTRIES.map((entry) => <PreviewRow entry={entry} key={entry.id} />)}
      </View>
    </AppSection>
  );
}

function PreviewRow({ entry }: { entry: PreviewEntry }) {
  const { theme } = useAppTheme();
  return (
    <Pressable accessibilityLabel={`${entry.title}, ${entry.category.toLowerCase()} entry, saved ${entry.time}. ${entry.source}.`} accessibilityRole="button" onPress={() => undefined} style={({ pressed }) => [styles.previewRow, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}>
      <View style={[styles.rowIcon, { backgroundColor: `${ACCENT}12` }]}><AppIcon color={ACCENT} decorative name={entry.icon} size={18} /></View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.text }]}>{entry.title}</Text>
        <Text style={[styles.rowMeta, { color: theme.mutedText }]}>{entry.category} - {entry.time}</Text>
        {entry.note ? <Text numberOfLines={2} style={[styles.rowNote, { color: theme.mutedText }]}>{entry.note}</Text> : null}
        <Text style={[styles.rowSource, { color: ACCENT }]}>{entry.source}</Text>
      </View>
    </Pressable>
  );
}

function ContraceptionPreviewCard() {
  const { theme } = useAppTheme();
  return (
    <AppSection title="Contraception">
      <AppCard style={[styles.secondaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View accessible accessibilityLabel="Daily pill. Next reminder 20:00 today. Last logged 08:05 today." style={styles.contraceptionTop}>
          <View style={[styles.rowIcon, { backgroundColor: `${TEAL}14` }]}><AppIcon color={TEAL} decorative name="reminder" size={19} /></View>
          <View style={styles.rowCopy}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Daily pill</Text>
            <Text style={[styles.cardBody, { color: theme.mutedText }]}>Next reminder: 20:00 today</Text>
            <Text style={[styles.cardBody, { color: theme.mutedText }]}>Last logged: 08:05 today</Text>
          </View>
        </View>
        <Pressable accessibilityHint="Contraception setup and reminder scheduling will be built in a separate controlled brick." accessibilityLabel="View contraception tracking" accessibilityRole="button" onPress={() => undefined}>
          <Text style={[styles.inlineAction, { color: TEAL }]}>View tracking</Text>
        </Pressable>
      </AppCard>
    </AppSection>
  );
}

function UpcomingReminders() {
  return (
    <AppSection title="Upcoming">
      <View style={styles.listStack}>
        {REMINDERS.map((reminder) => <ReminderRow reminder={reminder} key={reminder.id} />)}
      </View>
    </AppSection>
  );
}

function ReminderRow({ reminder }: { reminder: ReminderEntry }) {
  const { theme } = useAppTheme();
  return (
    <View accessibilityLabel={`${reminder.title}. ${reminder.time}. Source: ${reminder.source}.`} accessible style={[styles.reminderRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: `${WARM}12` }]}><AppIcon color={WARM} decorative name={reminder.icon} size={18} /></View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={2} style={[styles.rowTitle, { color: theme.text }]}>{reminder.title}</Text>
        <Text style={[styles.rowMeta, { color: theme.mutedText }]}>{reminder.time} - {reminder.source}</Text>
      </View>
    </View>
  );
}

function PrivacyCard() {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.secondaryCard, { backgroundColor: theme.surface, borderColor: `${ACCENT}30` }]}>
      <View accessible accessibilityLabel={`Privacy. This Women's Health information is private to this profile. Nothing is shared unless permission is explicitly given. ${PROFILE.privacyStatus}.`} style={styles.infoRow}>
        <View style={[styles.infoIcon, { backgroundColor: `${ACCENT}14` }]}><AppIcon color={ACCENT} decorative name="privacy" size={19} /></View>
        <View style={styles.rowCopy}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Privacy</Text>
          <Text style={[styles.cardBody, { color: theme.mutedText }]}>This Women{"'"}s Health information is private to this profile.</Text>
          <Text style={[styles.cardBody, { color: theme.mutedText }]}>Nothing is shared unless permission is explicitly given.</Text>
          <Text style={[styles.statusText, { color: ACCENT }]}>{PROFILE.privacyStatus}</Text>
        </View>
      </View>
    </AppCard>
  );
}

function EducationCard() {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.secondaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.infoRow}>
        <View style={[styles.infoIcon, { backgroundColor: `${GOLD}14` }]}><AppIcon color={GOLD} decorative name="health" size={19} /></View>
        <View style={styles.rowCopy}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Understanding estimates</Text>
          <Text style={[styles.cardBody, { color: theme.mutedText }]}>Cycle and fertility dates are estimates based on the information entered. They can change and should not be used as medical confirmation or contraception advice.</Text>
          <Pressable accessibilityHint="Educational content will be added in a later Women's Health brick." accessibilityLabel="Learn how estimates work" accessibilityRole="button" onPress={() => undefined}>
            <Text style={[styles.inlineAction, { color: GOLD }]}>Learn how estimates work</Text>
          </Pressable>
        </View>
      </View>
    </AppCard>
  );
}

function SafetyNote() {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.safetyNote, { borderColor: `${ACCENT}35` }]}>
      <AppIcon color={ACCENT} decorative name="health" size={18} />
      <Text style={[styles.safetyText, { color: theme.mutedText }]}>This app helps organize information you choose to track. It does not diagnose conditions or replace advice from a doctor, nurse, pharmacist, clinic or other healthcare professional. Cycle and fertility estimates may be inaccurate.</Text>
    </View>
  );
}

function WomensHealthLoadingState() {
  const { theme } = useAppTheme();
  return <View accessible accessibilityLabel="Loading Women's Health" accessibilityRole="progressbar" style={styles.loadingStack}>{[96, 190, 260, 112, 132].map((height) => <View key={height} style={[styles.skeleton, { backgroundColor: theme.surface, borderColor: theme.border, height }]} />)}</View>;
}

function WomensHealthState({ action, icon, message, title }: { action: string; icon: AppIconName; message: string; title: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.stateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.stateIcon, { backgroundColor: `${ACCENT}14` }]}><AppIcon color={ACCENT} decorative name={icon} size={25} /></View>
      <Text accessibilityRole="header" style={[styles.stateTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.stateMessage, { color: theme.mutedText }]}>{message}</Text>
      <AppButton accessibilityHint="This planned setup action will be connected in a later Women's Health brick." accessibilityLabel={action} label={action} onPress={() => undefined} variant="secondary" />
    </AppCard>
  );
}

function InlineStatusMessage({ message, onDismiss, tone }: { message: string; onDismiss: () => void; tone: "info" | "success" }) {
  const { theme } = useAppTheme();
  const color = tone === "success" ? TEAL : ACCENT;
  return (
    <Pressable accessibilityLabel={`${message} Dismiss message.`} accessibilityRole="button" onPress={onDismiss} style={({ pressed }) => [styles.inlineStatus, { backgroundColor: `${color}10`, borderColor: `${color}35` }, pressed ? styles.pressed : null]}>
      <AppIcon color={color} decorative name={tone === "success" ? "checkin" : "health"} size={18} />
      <Text style={[styles.inlineStatusText, { color: theme.text }]}>{message}</Text>
      <Text style={[styles.inlineStatusAction, { color }]}>Dismiss</Text>
    </Pressable>
  );
}

function WomensHealthQuickLogSheet({ message, onClose, onSelect, visible }: { message: string; onClose: () => void; onSelect: (type: QuickLogType) => void; visible: boolean }) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.modal}>
        <Pressable accessibilityLabel="Close quick log selector" accessibilityRole="button" onPress={onClose} style={styles.scrim} />
        <View pointerEvents="box-none" style={styles.keyboard}>
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                maxHeight: height - Math.max(insets.top, 16),
                width: Math.min(width, 480)
              }
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <SheetHeader icon="pregnancy_cycle" profileName={PROFILE.name} subtitle="Choose what to add to this private Women's Health space." title="Quick log" />
            <View style={styles.sheetBody}>
              {message ? <InlineSheetMessage message={message} /> : null}
              <View style={styles.selectorList}>
                {QUICK_ACTIONS.map((action) => (
                  <Pressable
                    accessibilityHint={action.available ? action.description : "This option is prepared but not active yet."}
                    accessibilityLabel={action.accessibilityLabel}
                    accessibilityRole="button"
                    key={action.type}
                    onPress={() => onSelect(action.type)}
                    style={({ pressed }) => [styles.selectorRow, { backgroundColor: theme.background, borderColor: action.available ? `${ACCENT}55` : theme.border }, pressed ? styles.pressed : null]}
                  >
                    <View style={[styles.selectorIcon, { backgroundColor: action.available ? `${ACCENT}14` : theme.surface }]}>
                      <AppIcon color={action.available ? ACCENT : theme.mutedText} decorative name={action.icon} size={19} />
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={[styles.selectorTitle, { color: theme.text }]}>{action.label}</Text>
                      <Text style={[styles.selectorDescription, { color: theme.mutedText }]}>{action.description}</Text>
                    </View>
                    <Text style={[styles.selectorStatus, { color: action.available ? ACCENT : theme.mutedText }]}>{action.available ? "Open" : "Later"}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={[styles.sheetFooter, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
              <Pressable accessibilityLabel="Close quick log selector" accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.cancel, { borderColor: theme.border }, pressed ? styles.pressed : null]}>
                <Text style={[styles.cancelText, { color: theme.text }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WomensHealthPeriodLogSheet({
  onCancel,
  onSave,
  profileName,
  selectedIso,
  visible
}: {
  onCancel: () => void;
  onSave: (draft: Pick<WomensHealthPeriodEntry, "endDate" | "flow" | "loggedDates" | "note" | "startDate">) => void;
  profileName: string;
  selectedIso: string;
  visible: boolean;
}) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const defaultIso = CALENDAR_DAYS.some((day) => day.iso === selectedIso) ? selectedIso : "2026-06-09";
  const [startDate, setStartDate] = useState(defaultIso);
  const [endDate, setEndDate] = useState(defaultIso);
  const [flow, setFlow] = useState<FlowSummary>("None");
  const [note, setNote] = useState("");
  const [dateError, setDateError] = useState("");
  const selectedDates = useMemo(() => getDateRange(startDate, endDate), [endDate, startDate]);

  function cancel() {
    Keyboard.dismiss();
    onCancel();
  }

  function save() {
    Keyboard.dismiss();
    const error = validatePeriodDates(startDate, endDate);
    setDateError(error);
    if (error) return;
    onSave({
      endDate,
      flow: flow === "None" ? undefined : flow,
      loggedDates: selectedDates,
      note: note.trim() || undefined,
      startDate
    });
  }

  return (
    <Modal animationType="slide" onRequestClose={cancel} statusBarTranslucent transparent visible={visible}>
      <View style={styles.modal}>
        <Pressable accessibilityLabel="Cancel period log" accessibilityRole="button" onPress={cancel} style={styles.scrim} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} pointerEvents="box-none" style={styles.keyboard}>
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                maxHeight: height - Math.max(insets.top, 16),
                width: Math.min(width, 480)
              }
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <SheetHeader icon="pregnancy_cycle" profileName={profileName} subtitle="Save the first and last day for this period entry." title="Log period" />
            <ScrollView contentContainerStyle={styles.sheetBody} keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {dateError ? <InlineValidation message={dateError} /> : null}
              <DateChipPicker label="Start date" onSelect={(value) => { setStartDate(value); if (value > endDate) setEndDate(value); setDateError(""); }} selectedIso={startDate} />
              <DateChipPicker label="End date" onSelect={(value) => { setEndDate(value); setDateError(""); }} selectedIso={endDate} />
              <SelectedRangeSummary dates={selectedDates} />
              <ChipSelector label="Flow summary (optional)" onSelect={setFlow} options={FLOW_OPTIONS} selected={flow} />
              <AppFormInput accessibilityLabel="Private period note" helperText="Saved locally in this session only." label="Private note (optional)" multiline onChangeText={setNote} placeholder="Add any context you want to remember" returnKeyType="default" value={note} />
              <View style={[styles.helper, { backgroundColor: `${ACCENT}0D`, borderColor: `${ACCENT}30` }]}>
                <AppIcon color={ACCENT} decorative name="privacy" size={17} />
                <Text style={[styles.helperText, { color: theme.mutedText }]}>This first version saves locally on this screen. Individual day exclusion and editing will be added later.</Text>
              </View>
            </ScrollView>
            <View style={[styles.sheetFooter, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
              <Pressable accessibilityLabel="Cancel period log" accessibilityRole="button" onPress={cancel} style={({ pressed }) => [styles.cancel, { borderColor: theme.border }, pressed ? styles.pressed : null]}>
                <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable accessibilityHint="Validates dates and saves this period entry locally" accessibilityLabel="Save period log" accessibilityRole="button" onPress={save} style={({ pressed }) => [styles.save, { backgroundColor: ACCENT }, pressed ? styles.pressed : null]}>
                <Text style={styles.saveText}>Save period</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function SheetHeader({ icon, profileName, subtitle, title }: { icon: AppIconName; profileName: string; subtitle: string; title: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
      <Text accessibilityRole="header" style={[styles.sheetTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.sheetSubtitle, { color: theme.mutedText }]}>{subtitle}</Text>
      <View accessibilityLabel={`Active profile, ${profileName}, private Women's Health log`} accessible style={[styles.sheetProfile, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}25` }]}>
        <View style={[styles.profileIcon, { backgroundColor: theme.surface }]}>
          <AppIcon color={ACCENT} decorative name={icon} size={17} />
        </View>
        <View style={styles.profileCopy}>
          <Text style={[styles.profileName, { color: theme.text }]}>{profileName}</Text>
          <Text style={[styles.profileLabel, { color: theme.mutedText }]}>Private Women{"'"}s Health log</Text>
        </View>
      </View>
    </View>
  );
}

function InlineSheetMessage({ message }: { message: string }) {
  const { theme } = useAppTheme();
  return (
    <View accessibilityLiveRegion="polite" style={[styles.sheetMessage, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}35` }]}>
      <AppIcon color={ACCENT} decorative name="health" size={17} />
      <Text style={[styles.sheetMessageText, { color: theme.text }]}>{message}</Text>
    </View>
  );
}

function DateChipPicker({ label, onSelect, selectedIso }: { label: string; onSelect: (iso: string) => void; selectedIso: string }) {
  const { theme } = useAppTheme();
  return (
    <FieldGroup label={label}>
      <View style={styles.dateChips}>
        {CALENDAR_DAYS.map((day) => {
          const active = selectedIso === day.iso;
          return (
            <Pressable
              accessibilityLabel={`${label}, ${formatDateSpeech(day.iso)}, ${active ? "selected" : "not selected"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={`${label}-${day.iso}`}
              onPress={() => onSelect(day.iso)}
              style={({ pressed }) => [styles.dateChip, { backgroundColor: active ? `${ACCENT}16` : theme.background, borderColor: active ? ACCENT : theme.border }, pressed ? styles.pressed : null]}
            >
              <Text style={[styles.dateChipText, { color: active ? ACCENT : theme.text }]}>{day.date}</Text>
            </Pressable>
          );
        })}
      </View>
    </FieldGroup>
  );
}

function SelectedRangeSummary({ dates }: { dates: string[] }) {
  const { theme } = useAppTheme();
  return (
    <View accessibilityLabel={`Selected period range, ${dates.length} ${dates.length === 1 ? "day" : "days"}`} accessible style={[styles.rangeSummary, { backgroundColor: `${ACCENT}0D`, borderColor: `${ACCENT}30` }]}>
      <AppIcon color={ACCENT} decorative name="calendar_timeline" size={17} />
      <Text style={[styles.rangeSummaryText, { color: theme.text }]}>{dates.length} {dates.length === 1 ? "day" : "days"} selected</Text>
      <Text style={[styles.rangeSummaryMeta, { color: theme.mutedText }]}>{dates.length ? `${formatDateSpeech(dates[0])} to ${formatDateSpeech(dates[dates.length - 1])}` : "Choose dates"}</Text>
    </View>
  );
}

function ChipSelector<T extends string>({ label, onSelect, options, selected }: { label: string; onSelect: (value: T) => void; options: readonly T[]; selected: T }) {
  const { theme } = useAppTheme();
  return (
    <FieldGroup label={label}>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = selected === option;
          return (
            <Pressable
              accessibilityLabel={`${option}, ${active ? "selected" : "not selected"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [styles.chip, { backgroundColor: active ? `${ACCENT}14` : theme.background, borderColor: active ? ACCENT : theme.border }, pressed ? styles.pressed : null]}
            >
              <Text style={[styles.chipMark, { color: active ? ACCENT : theme.mutedText }]}>{active ? "Selected" : "-"}</Text>
              <Text style={[styles.chipText, { color: active ? ACCENT : theme.text }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </FieldGroup>
  );
}

function FieldGroup({ children, label }: { children: ReactNode; label: string }) {
  const { theme } = useAppTheme();
  return <View style={styles.group}><Text style={[styles.groupLabel, { color: theme.text }]}>{label}</Text>{children}</View>;
}

function InlineValidation({ message }: { message: string }) {
  const { theme } = useAppTheme();
  return <Text accessibilityLiveRegion="polite" style={[styles.validation, { color: theme.warning }]}>{message}</Text>;
}

function getMarkerStyle(marker?: MarkerType) {
  if (marker === "logged-period") return styles.loggedPeriodMarker;
  if (marker === "estimated-period") return styles.estimatedPeriodMarker;
  if (marker === "estimated-fertility") return styles.estimatedFertilityMarker;
  return null;
}

function getMarkerLabel(marker: MarkerType) {
  if (marker === "logged-period") return "Logged period";
  if (marker === "estimated-period") return "Estimated period";
  return "Estimated fertility";
}

function getDayAccessibilityLabel(day: CalendarDay) {
  const parts = [formatDateSpeech(day.iso)];
  if (day.isSelected) parts.push("selected");
  if (day.isToday) parts.push("today");
  if (day.marker) parts.push(`${getMarkerLabel(day.marker).toLowerCase()} day`);
  return parts.join(", ");
}

function formatDateSpeech(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

function buildCycleSummary(entries: WomensHealthPeriodEntry[]): CycleSummary {
  const profileEntries = entries.filter((entry) => entry.profileId === PROFILE.id);
  const loggedDayCount = new Set(profileEntries.flatMap((entry) => entry.loggedDates)).size;
  const latest = profileEntries.reduce<WomensHealthPeriodEntry | undefined>((current, entry) => {
    if (!current) return entry;
    return entry.startDate > current.startDate ? entry : current;
  }, undefined);

  return {
    ...CYCLE,
    dataStatus: loggedDayCount > 0 ? "Based on the period dates saved locally in this session. Estimates have not been recalculated yet." : "Based on the cycle information you have logged.",
    lastLogged: latest ? formatDateShort(latest.startDate) : CYCLE.lastLogged,
    loggedDayCount
  };
}

function formatDateShort(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function getDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate || endDate < startDate) return [];
  const dates: string[] = [];
  const start = Number(startDate.slice(-2));
  const end = Number(endDate.slice(-2));
  for (let date = start; date <= end; date += 1) {
    dates.push(`2026-06-${String(date).padStart(2, "0")}`);
  }
  return dates;
}

function validatePeriodDates(startDate: string, endDate: string) {
  if (!startDate || !endDate) return "Choose a start and end date.";
  if (endDate < startDate) return "End date must be the same day or after the start date.";
  if (!getDateRange(startDate, endDate).length) return "Choose at least one period day.";
  return "";
}

const styles = StyleSheet.create({
  back: { alignItems: "center", borderRadius: 16, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  backText: { fontSize: 22, fontWeight: "900", lineHeight: 24 },
  calendarCard: { borderRadius: 26, borderWidth: 1, gap: 16, padding: 18 },
  calendarHeader: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  cancel: { alignItems: "center", borderRadius: 16, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 52 },
  cancelText: { fontWeight: "900" },
  cardBody: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  cardKicker: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  cardTitle: { fontSize: 17, fontWeight: "900", lineHeight: 23 },
  chip: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 6, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10 },
  chipMark: { fontSize: 13, fontWeight: "900" },
  chipText: { fontSize: 13, fontWeight: "900" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  content: { gap: 24 },
  contextCard: { borderRadius: 24, borderWidth: 1, gap: 8, padding: 17 },
  contextLabel: { fontSize: 12, fontWeight: "800" },
  contextRow: { borderTopWidth: 1, gap: 4, marginTop: 8, paddingTop: 12 },
  contextValue: { fontSize: 13, fontWeight: "900", lineHeight: 19 },
  contraceptionTop: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  dayCell: { alignItems: "center", aspectRatio: 1, borderRadius: 15, borderWidth: 1, flexBasis: "12.5%", flexGrow: 1, justifyContent: "center", maxWidth: "13.6%", minHeight: 38, minWidth: 38 },
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  dayHalo: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0, borderRadius: 15, borderWidth: 2 },
  dayNumber: { fontSize: 13, fontWeight: "900" },
  dateChip: { alignItems: "center", borderRadius: 14, borderWidth: 1, height: 38, justifyContent: "center", width: 38 },
  dateChipText: { fontSize: 13, fontWeight: "900" },
  dateChips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  estimatedFertilityMarker: { borderColor: GOLD, borderStyle: "dotted" },
  estimatedPeriodMarker: { borderColor: ACCENT, borderStyle: "dashed" },
  eyebrow: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  group: { gap: 8 },
  groupLabel: { fontSize: 14, fontWeight: "900" },
  haloLarge: { borderRadius: 90, borderWidth: 2, height: 180, position: "absolute", right: -52, top: -56, width: 180 },
  haloSmall: { borderRadius: 44, borderWidth: 2, height: 88, position: "absolute", right: 62, top: 72, width: 88 },
  handle: { alignSelf: "center", borderRadius: 999, height: 4, marginTop: 10, width: 46 },
  header: { gap: 16 },
  headerTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  helper: { alignItems: "flex-start", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 10, padding: 13 },
  helperText: { flex: 1, fontSize: 12, lineHeight: 19 },
  heroCard: { borderRadius: 28, borderWidth: 1, gap: 15, overflow: "hidden", padding: 21 },
  heroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  heroMotif: { bottom: 0, position: "absolute", right: 0, top: 0, width: 220 },
  heroStat: { borderRadius: 18, borderWidth: 1, flexBasis: "47%", flexGrow: 1, minHeight: 76, padding: 13 },
  heroSupport: { fontSize: 13, lineHeight: 20 },
  heroUnit: { fontSize: 17, fontWeight: "800" },
  heroValue: { fontSize: 34, fontWeight: "900", lineHeight: 41 },
  infoIcon: { alignItems: "center", borderRadius: 15, height: 42, justifyContent: "center", width: 42 },
  infoRow: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  inlineAction: { fontSize: 13, fontWeight: "900", marginTop: 10 },
  inlineStatus: { alignItems: "flex-start", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 10, padding: 14 },
  inlineStatusAction: { fontSize: 12, fontWeight: "900", marginLeft: "auto" },
  inlineStatusText: { flex: 1, fontSize: 13, fontWeight: "800", lineHeight: 19 },
  keyboard: { flex: 1, justifyContent: "flex-end" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingTop: 2 },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 6 },
  legendMarker: { borderRadius: 8, borderWidth: 2, height: 16, width: 16 },
  legendText: { color: "#64748b", fontSize: 12, fontWeight: "800" },
  legendToday: { borderRadius: 999, height: 8, width: 8 },
  listStack: { gap: 11 },
  loadingStack: { gap: 14 },
  loggedPeriodMarker: { borderColor: ACCENT, borderStyle: "solid" },
  modal: { flex: 1, justifyContent: "flex-end" },
  phaseText: { fontSize: 15, fontWeight: "900", lineHeight: 21 },
  pressed: { opacity: 0.75 },
  previewRow: { alignItems: "flex-start", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 88, padding: 14 },
  privacyPill: { alignItems: "center", alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 6, marginTop: 10, paddingHorizontal: 10, paddingVertical: 6 },
  privacyPillText: { fontSize: 12, fontWeight: "900" },
  profileCopy: { minWidth: 0 },
  profileIcon: { alignItems: "center", borderRadius: 12, height: 30, justifyContent: "center", width: 30 },
  profileLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.4 },
  profileName: { fontSize: 13, fontWeight: "900", maxWidth: 128 },
  profilePill: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 44, paddingHorizontal: 11 },
  quickAction: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexBasis: "30%", flexGrow: 1, gap: 8, justifyContent: "center", minHeight: 86, padding: 11 },
  quickActionCompact: { flexBasis: "46%" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickIcon: { alignItems: "center", borderRadius: 13, height: 36, justifyContent: "center", width: 36 },
  quickText: { fontSize: 12, fontWeight: "900", lineHeight: 16, textAlign: "center" },
  rangeSummary: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 13 },
  rangeSummaryMeta: { flexBasis: "100%", fontSize: 12, lineHeight: 18, paddingLeft: 25 },
  rangeSummaryText: { fontSize: 13, fontWeight: "900" },
  reminderRow: { alignItems: "flex-start", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 74, padding: 14 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowIcon: { alignItems: "center", borderRadius: 14, height: 40, justifyContent: "center", width: 40 },
  rowMeta: { fontSize: 12, fontWeight: "800", lineHeight: 18, marginTop: 3 },
  rowNote: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  rowSource: { fontSize: 12, fontWeight: "900", marginTop: 6 },
  rowTitle: { fontSize: 15, fontWeight: "900", lineHeight: 20 },
  safetyNote: { alignItems: "flex-start", borderLeftWidth: 3, flexDirection: "row", gap: 10, paddingHorizontal: 14 },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 19 },
  save: { alignItems: "center", borderRadius: 16, flex: 1.4, justifyContent: "center", minHeight: 52 },
  saveText: { color: "#ffffff", fontWeight: "900" },
  screen: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(15,23,42,0.58)" },
  secondaryCard: { borderRadius: 24, borderWidth: 1, gap: 13, padding: 17 },
  sectionMeta: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  sectionTitle: { fontSize: 19, fontWeight: "900" },
  selectedDateBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  selectedDateText: { fontSize: 12, fontWeight: "900" },
  selectorDescription: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  selectorIcon: { alignItems: "center", borderRadius: 15, height: 42, justifyContent: "center", width: 42 },
  selectorList: { gap: 10 },
  selectorRow: { alignItems: "center", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 74, padding: 13 },
  selectorStatus: { fontSize: 12, fontWeight: "900", marginLeft: "auto" },
  selectorTitle: { fontSize: 15, fontWeight: "900", lineHeight: 20 },
  sheet: { alignSelf: "center", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, overflow: "hidden" },
  sheetBody: { gap: 18, paddingBottom: 24, paddingHorizontal: 20, paddingTop: 20 },
  sheetFooter: { borderTopWidth: 1, flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  sheetHeader: { borderBottomWidth: 1, paddingBottom: 18, paddingHorizontal: 20, paddingTop: 14 },
  sheetMessage: { alignItems: "flex-start", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 10, padding: 13 },
  sheetMessageText: { flex: 1, fontSize: 13, fontWeight: "800", lineHeight: 19 },
  sheetProfile: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 16, minHeight: 58, paddingHorizontal: 12, paddingVertical: 9 },
  sheetSubtitle: { lineHeight: 20, marginTop: 5 },
  sheetTitle: { fontSize: 21, fontWeight: "900" },
  skeleton: { borderRadius: 24, borderWidth: 1 },
  statLabel: { fontSize: 12, fontWeight: "800", lineHeight: 17 },
  statValue: { fontSize: 16, fontWeight: "900", lineHeight: 22, marginTop: 5 },
  stateCard: { alignItems: "center", borderRadius: 26, borderWidth: 1, gap: 12, padding: 22 },
  stateIcon: { alignItems: "center", borderRadius: 20, height: 54, justifyContent: "center", width: 54 },
  stateMessage: { fontSize: 14, lineHeight: 21, maxWidth: 320, textAlign: "center" },
  stateTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  statusText: { fontSize: 12, fontWeight: "900", marginTop: 8 },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 5 },
  title: { fontSize: 28, fontWeight: "900", lineHeight: 34 },
  titleBlock: { alignItems: "flex-start" },
  todayDot: { borderRadius: 999, bottom: 5, height: 5, position: "absolute", width: 5 },
  validation: { fontSize: 12, fontWeight: "800", lineHeight: 18 },
  weekday: { flex: 1, fontSize: 12, fontWeight: "900", textAlign: "center" },
  weekdays: { flexDirection: "row", gap: 5 }
});
