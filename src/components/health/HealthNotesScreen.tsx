import { router } from "expo-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { GeneralHealthActivityDetailSheet } from "@/components/health/GeneralHealthActivityDetailSheet";
import { useGeneralHealthActivity } from "@/components/health/GeneralHealthActivityProvider";
import { HealthScreenContainer } from "@/components/health/HealthScreenContainer";
import { GeneralHealthLogSheet } from "@/components/health/GeneralHealthLogSheet";
import { AppButton, AppCard, AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { createGeneralHealthActivity } from "@/lib/generalHealthActivity";
import type {
  GeneralHealthActivityEntry,
  GeneralHealthLogDraft,
} from "@/lib/generalHealthMockData";
import { useAppTheme } from "@/theme/ThemeProvider";

const ACCENT = "#0f766e";
type HealthNotesState = "error" | "loading" | "ready";
const NOTES_STATE: HealthNotesState = "ready";
const TIME_RANGES = [
  { label: "7D", speech: "7 days", value: 7 },
  { label: "30D", speech: "30 days", value: 30 },
  { label: "90D", speech: "90 days", value: 90 },
  { label: "All", speech: "All notes", value: "all" },
] as const;
const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "General", value: "general" },
  { label: "Symptom", value: "symptom" },
  { label: "Energy", value: "energy" },
  { label: "Sleep", value: "sleep" },
  { label: "Medication", value: "medication" },
  { label: "Appointment", value: "appointment" },
] as const;
const NOTE_GROUP_ORDER = [
  "Today",
  "Yesterday",
  "Earlier this week",
  "Earlier this month",
  "Older",
] as const;

type HealthNoteRange = (typeof TIME_RANGES)[number]["value"];
type HealthNoteCategory = Exclude<
  (typeof CATEGORY_OPTIONS)[number]["value"],
  "all"
>;
type HealthNoteCategoryFilter = HealthNoteCategory | "all";
type HealthNoteGroupLabel = (typeof NOTE_GROUP_ORDER)[number];
type HealthNoteItem = {
  activity: Extract<GeneralHealthActivityEntry, { type: "note" }>;
  category: HealthNoteCategory;
  createdAt: Date;
  details: string;
  id: string;
  profileName: string;
  title: string;
};

export function HealthNotesScreen() {
  const { theme } = useAppTheme();
  const { activities, addActivity, selectedProfileId, selectedProfileName } =
    useGeneralHealthActivity();
  const [openedAt] = useState(() => new Date());
  const [range, setRange] = useState<HealthNoteRange>(30);
  const [category, setCategory] = useState<HealthNoteCategoryFilter>("all");
  const [activeLogType, setActiveLogType] = useState<"note" | null>(null);
  const [selectedNote, setSelectedNote] =
    useState<GeneralHealthActivityEntry | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [savedMessageProfileId, setSavedMessageProfileId] = useState("");

  // TODO: Replace feature-local notes with the approved profile health
  // data layer and final profile privacy permissions.
  // TODO: Apply final note sharing permissions and profile privacy
  // rules through the approved privacy layer.
  const profileNotes = useMemo(
    () => getHealthNotesForProfile(activities, selectedProfileId),
    [activities, selectedProfileId],
  );
  const visibleNotes = useMemo(
    () =>
      filterHealthNotesByCategory(
        filterHealthNotesByRange(profileNotes, range, openedAt),
        category,
      ),
    [category, openedAt, profileNotes, range],
  );
  const noteGroups = useMemo(
    () => groupHealthNotesByDate(visibleNotes, openedAt),
    [openedAt, visibleNotes],
  );
  const selectedVisibleNote =
    selectedNote?.profileId === selectedProfileId ? selectedNote : null;
  const visibleSavedMessage =
    savedMessageProfileId === selectedProfileId ? savedMessage : "";
  const categoryOptions = useMemo(() => {
    const existingCategories = new Set(
      profileNotes.map((note) => note.category),
    );
    return CATEGORY_OPTIONS.filter(
      (option) =>
        option.value === "all" || existingCategories.has(option.value),
    );
  }, [profileNotes]);

  useEffect(() => {
    if (!savedMessage) return;
    const timer = setTimeout(() => setSavedMessage(""), 3200);
    return () => clearTimeout(timer);
  }, [savedMessage]);

  function resetFilters() {
    setRange(30);
    setCategory("all");
  }

  function saveHealthNote(draft: GeneralHealthLogDraft) {
    addActivity(
      createGeneralHealthActivity(
        draft,
        selectedProfileId,
        selectedProfileName,
      ),
    );
    setSavedMessage("Health note saved locally for now.");
    setSavedMessageProfileId(selectedProfileId);
    setActiveLogType(null);
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HealthScreenContainer contentStyle={styles.content} maxWidth={470}>
        <HealthNotesHeader profileName={selectedProfileName} />
        {visibleSavedMessage ? (
          <SavedConfirmation message={visibleSavedMessage} />
        ) : null}
        {NOTES_STATE === "loading" ? <HealthNotesLoadingState /> : null}
        {NOTES_STATE === "error" ? <HealthNotesErrorState /> : null}
        {NOTES_STATE === "ready" ? (
          <>
            {profileNotes.length ? (
              <HealthNotesSummaryCard
                latestNote={profileNotes[0]}
                profileName={selectedProfileName}
                total={profileNotes.length}
              />
            ) : null}
            <HealthNotesFilters
              category={category}
              categoryOptions={categoryOptions}
              range={range}
              setCategory={setCategory}
              setRange={setRange}
            />
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.resultSummary, { color: theme.mutedText }]}
            >
              {getResultSummary(visibleNotes.length, range, category)}
            </Text>
            {profileNotes.length ? (
              visibleNotes.length ? (
                <GroupedHealthNotes
                  groups={noteGroups}
                  onOpen={(note) => setSelectedNote(note.activity)}
                />
              ) : (
                <HealthNotesEmptyState
                  actionLabel="Reset filters"
                  message="Try another time range or category."
                  onAction={resetFilters}
                  title="No matching notes"
                />
              )
            ) : (
              <HealthNotesEmptyState
                actionLabel="Add health note"
                message="Add a note to save useful context, symptoms, energy changes, appointments, or reminders."
                onAction={() => setActiveLogType("note")}
                title="No health notes yet"
              />
            )}
            <AppButton
              accessibilityLabel="Add health note"
              fullWidth
              label="Add health note"
              onPress={() => setActiveLogType("note")}
            />
            <HealthNotesPrivacyNote />
          </>
        ) : null}
      </HealthScreenContainer>
      <GeneralHealthActivityDetailSheet
        activity={selectedVisibleNote}
        onClose={() => setSelectedNote(null)}
      />
      <GeneralHealthLogSheet
        key={activeLogType ?? "closed"}
        logType={activeLogType}
        onCancel={() => setActiveLogType(null)}
        onSave={saveHealthNote}
        profileName={selectedProfileName}
      />
    </View>
  );
}

function HealthNotesHeader({ profileName }: { profileName: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable
          accessibilityHint="Returns to General Health"
          accessibilityLabel="Back to General Health"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.back,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={[styles.backText, { color: theme.text }]}>{"<"}</Text>
        </Pressable>
        <View
          accessibilityLabel={`Active profile, ${profileName}`}
          accessible
          style={[
            styles.profilePill,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View
            style={[styles.profileIcon, { backgroundColor: `${ACCENT}16` }]}
          >
            <AppIcon color={ACCENT} decorative name="profile" size={18} />
          </View>
          <View>
            <Text style={[styles.profileLabel, { color: theme.mutedText }]}>
              ACTIVE PROFILE
            </Text>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {profileName}
            </Text>
          </View>
        </View>
      </View>
      <View>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.text }]}
        >
          Health notes
        </Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>
          Personal notes and saved context
        </Text>
      </View>
    </View>
  );
}

function HealthNotesSummaryCard({
  latestNote,
  profileName,
  total,
}: {
  latestNote: HealthNoteItem;
  profileName: string;
  total: number;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard
      style={[
        styles.summaryCard,
        { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}35` },
      ]}
    >
      <View
        accessible
        accessibilityLabel={`${total} health ${total === 1 ? "note" : "notes"} saved for ${profileName}. Latest note: ${latestNote.title}, saved ${formatAccessibleDateTime(latestNote.createdAt)}.`}
        style={styles.summaryContent}
      >
        <View style={styles.summaryTop}>
          <View>
            <Text style={[styles.summaryEyebrow, { color: ACCENT }]}>
              Health notes
            </Text>
            <Text style={[styles.summaryCount, { color: theme.text }]}>
              {formatSavedNoteCount(total)}
            </Text>
          </View>
          <View
            style={[styles.summaryIcon, { backgroundColor: theme.surface }]}
          >
            <AppIcon color={ACCENT} decorative name="edit" size={22} />
          </View>
        </View>
        <View style={styles.latestBlock}>
          <Text style={[styles.latestLabel, { color: theme.mutedText }]}>
            Latest note
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.latestTitle, { color: theme.text }]}
          >
            {latestNote.title}
          </Text>
          <Text style={[styles.latestTime, { color: theme.mutedText }]}>
            Saved {formatRelativeDateTime(latestNote.createdAt)}
          </Text>
        </View>
        <Text style={[styles.summarySupport, { color: theme.mutedText }]}>
          Notes help you remember useful context over time.
        </Text>
      </View>
    </AppCard>
  );
}

function HealthNotesFilters({
  category,
  categoryOptions,
  range,
  setCategory,
  setRange,
}: {
  category: HealthNoteCategoryFilter;
  categoryOptions: readonly {
    label: string;
    value: HealthNoteCategoryFilter;
  }[];
  range: HealthNoteRange;
  setCategory: (value: HealthNoteCategoryFilter) => void;
  setRange: (value: HealthNoteRange) => void;
}) {
  return (
    <View style={styles.filters}>
      <FilterGroup label="Time range">
        <View style={styles.timeChips}>
          {TIME_RANGES.map((option) => (
            <FilterChip
              key={String(option.value)}
              label={option.label}
              selected={option.value === range}
              accessibilityLabel={`${option.speech}, ${option.value === range ? "selected" : "not selected"}`}
              onPress={() => setRange(option.value)}
            />
          ))}
        </View>
      </FilterGroup>
      <FilterGroup label="Category">
        <ScrollView
          contentContainerStyle={styles.categoryChips}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categoryOptions.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              selected={option.value === category}
              accessibilityLabel={`${option.label} notes filter, ${option.value === category ? "selected" : "not selected"}`}
              onPress={() => setCategory(option.value)}
            />
          ))}
        </ScrollView>
      </FilterGroup>
    </View>
  );
}

function FilterGroup({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterLabel, { color: theme.text }]}>{label}</Text>
      {children}
    </View>
  );
}

function FilterChip({
  accessibilityLabel,
  label,
  onPress,
  selected,
}: {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : null,
        {
          backgroundColor: selected ? theme.primarySoft : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.chipMarker,
          {
            borderColor: selected ? theme.primary : theme.border,
            backgroundColor: selected ? theme.primary : "transparent",
          },
        ]}
      >
        {selected ? (
          <AppIcon
            color="#ffffff"
            decorative
            name="success"
            size={11}
            strokeWidth={3}
          />
        ) : null}
      </View>
      <Text
        style={[
          styles.chipText,
          selected ? styles.chipTextSelected : null,
          { color: selected ? theme.primary : theme.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function GroupedHealthNotes({
  groups,
  onOpen,
}: {
  groups: { entries: HealthNoteItem[]; label: HealthNoteGroupLabel }[];
  onOpen: (note: HealthNoteItem) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.groups}>
      {groups.map((group) => (
        <View key={group.label} style={styles.group}>
          <View style={styles.groupHeading}>
            <Text
              accessibilityRole="header"
              style={[styles.groupLabel, { color: theme.mutedText }]}
            >
              {group.label}
            </Text>
            <Text style={[styles.groupCount, { color: theme.mutedText }]}>
              {group.entries.length}{" "}
              {group.entries.length === 1 ? "note" : "notes"}
            </Text>
          </View>
          <View style={styles.noteStack}>
            {group.entries.map((note) => (
              <HealthNoteCard
                key={note.id}
                note={note}
                onPress={() => onOpen(note)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function HealthNoteCard({
  note,
  onPress,
}: {
  note: HealthNoteItem;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const categoryLabel = formatHealthNoteCategory(note.category);
  return (
    <Pressable
      accessibilityHint="Opens the complete note."
      accessibilityLabel={createHealthNoteAccessibilityLabel(note)}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.noteCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed ? styles.pressedCard : null,
      ]}
    >
      <View style={[styles.noteIcon, { backgroundColor: theme.primarySoft }]}>
        <AppIcon
          color={theme.primary}
          decorative
          name={getHealthNoteCategoryIcon(note.category)}
          size={20}
        />
      </View>
      <View style={styles.noteCopy}>
        <View style={styles.noteHeading}>
          <Text
            numberOfLines={2}
            style={[styles.noteTitle, { color: theme.text }]}
          >
            {note.title}
          </Text>
          <Text style={[styles.chevron, { color: theme.mutedText }]}>
            {">"}
          </Text>
        </View>
        {note.details ? (
          <Text
            numberOfLines={3}
            style={[styles.notePreview, { color: theme.mutedText }]}
          >
            {note.details}
          </Text>
        ) : null}
        <View style={styles.noteMetaRow}>
          <Text style={[styles.noteMeta, { color: theme.mutedText }]}>
            {categoryLabel}
          </Text>
          <Text style={[styles.noteMetaSeparator, { color: theme.mutedText }]}>
            -
          </Text>
          <Text style={[styles.noteMeta, { color: theme.mutedText }]}>
            {formatRelativeDateTime(note.createdAt)}
          </Text>
        </View>
        <View style={styles.noteOwner}>
          <View
            style={[styles.ownerIcon, { backgroundColor: theme.primarySoft }]}
          >
            <AppIcon
              color={theme.primary}
              decorative
              name="profile"
              size={12}
            />
          </View>
          <Text style={[styles.ownerName, { color: theme.text }]}>
            {note.profileName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function HealthNotesEmptyState({
  actionLabel,
  message,
  onAction,
  title,
}: {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.empty, { borderColor: theme.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
        <AppIcon color={theme.primary} decorative name="edit" size={24} />
      </View>
      <Text
        accessibilityRole="header"
        style={[styles.emptyTitle, { color: theme.text }]}
      >
        {title}
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.mutedText }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <AppButton
          accessibilityLabel={
            actionLabel === "Reset filters"
              ? "Reset health note filters"
              : "Add health note"
          }
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
        />
      ) : null}
    </AppCard>
  );
}

function HealthNotesLoadingState() {
  const { theme } = useAppTheme();
  return (
    <View
      accessible
      accessibilityLabel="Loading health notes"
      accessibilityRole="progressbar"
      style={styles.stateStack}
    >
      {[86, 138, 112, 108].map((height) => (
        <View
          key={height}
          style={[
            styles.skeleton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              height,
            },
          ]}
        />
      ))}
    </View>
  );
}

function HealthNotesErrorState() {
  return (
    <HealthNotesEmptyState
      message="Please return to General Health and open notes again."
      title={"We couldn't load health notes"}
    />
  );
}

function HealthNotesPrivacyNote() {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.privacyNote, { borderColor: `${ACCENT}40` }]}>
      <AppIcon color={ACCENT} decorative name="privacy" size={18} />
      <View style={styles.privacyCopy}>
        <Text style={[styles.privacyText, { color: theme.mutedText }]}>
          Health notes are private to the selected profile unless that person
          explicitly shares them.
        </Text>
        <Text style={[styles.privacyText, { color: theme.mutedText }]}>
          Notes help store personal context and are not medical findings or
          diagnoses.
        </Text>
      </View>
    </View>
  );
}

function SavedConfirmation({ message }: { message: string }) {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      accessible
      accessibilityLabel={message}
      style={[
        styles.savedConfirmation,
        { backgroundColor: `${ACCENT}12`, borderColor: `${ACCENT}35` },
      ]}
    >
      <AppIcon color={ACCENT} decorative name="save" size={18} />
      <Text style={[styles.savedConfirmationText, { color: theme.text }]}>
        {message}
      </Text>
    </View>
  );
}

function getHealthNotesForProfile(
  entries: GeneralHealthActivityEntry[],
  profileId: string,
) {
  return entries
    .filter(
      (entry): entry is Extract<GeneralHealthActivityEntry, { type: "note" }> =>
        entry.profileId === profileId && entry.type === "note",
    )
    .map(normalizeHealthNote)
    .filter((note): note is HealthNoteItem => Boolean(note))
    .sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
}

function normalizeHealthNote(
  entry: Extract<GeneralHealthActivityEntry, { type: "note" }>,
): HealthNoteItem | null {
  const createdAt = new Date(entry.createdAt);
  if (!Number.isFinite(createdAt.getTime())) return null;
  if (!entry.id.trim() || !entry.profileId.trim() || !entry.profileName.trim())
    return null;
  const title =
    typeof entry.details.noteTitle === "string" &&
    entry.details.noteTitle.trim()
      ? entry.details.noteTitle.trim()
      : typeof entry.summary === "string" &&
          entry.summary.trim() &&
          entry.summary.trim() !== "Health note"
        ? entry.summary.trim()
        : "";
  if (!title) return null;

  // TODO: Normalise imported legacy note categories through the final health data migration.
  const category = normalizeHealthNoteCategory(entry.details.category);
  const details =
    typeof entry.details.details === "string"
      ? entry.details.details.trim()
      : "";
  return {
    activity: entry,
    category,
    createdAt,
    details,
    id: entry.id,
    profileName: entry.profileName.trim(),
    title,
  };
}

function filterHealthNotesByRange(
  notes: HealthNoteItem[],
  range: HealthNoteRange,
  referenceDate: Date,
) {
  if (range === "all") return notes;
  const cutoff = new Date(
    referenceDate.getTime() - range * 24 * 60 * 60 * 1000,
  );
  return notes.filter((note) => note.createdAt >= cutoff);
}

function filterHealthNotesByCategory(
  notes: HealthNoteItem[],
  category: HealthNoteCategoryFilter,
) {
  if (category === "all") return notes;
  return notes.filter((note) => note.category === category);
}

function groupHealthNotesByDate(notes: HealthNoteItem[], referenceDate: Date) {
  const grouped = new Map<HealthNoteGroupLabel, HealthNoteItem[]>();
  notes.forEach((note) => {
    const label = getHealthNoteGroupLabel(note.createdAt, referenceDate);
    grouped.set(label, [...(grouped.get(label) ?? []), note]);
  });
  return NOTE_GROUP_ORDER.filter((label) => grouped.has(label)).map(
    (label) => ({ entries: grouped.get(label) ?? [], label }),
  );
}

function getHealthNoteGroupLabel(date: Date, now: Date): HealthNoteGroupLabel {
  if (isSameCalendarDay(date, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) return "Yesterday";
  if (date >= startOfWeek(now) && date < now) return "Earlier this week";
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  )
    return "Earlier this month";
  return "Older";
}

function normalizeHealthNoteCategory(value?: string): HealthNoteCategory {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === "symptom" ||
    normalized === "energy" ||
    normalized === "sleep" ||
    normalized === "medication" ||
    normalized === "appointment" ||
    normalized === "general"
  ) {
    return normalized;
  }
  return "general";
}

function formatHealthNoteCategory(category: HealthNoteCategory) {
  return (
    CATEGORY_OPTIONS.find((option) => option.value === category)?.label ??
    "General"
  );
}

function getHealthNoteCategoryIcon(category: HealthNoteCategory): AppIconName {
  const icons: Record<HealthNoteCategory, AppIconName> = {
    appointment: "calendar_timeline",
    energy: "ai_assistant",
    general: "edit",
    medication: "medication",
    sleep: "sleep",
    symptom: "vitals",
  };
  return icons[category];
}

function createHealthNoteAccessibilityLabel(note: HealthNoteItem) {
  return `${formatHealthNoteCategory(note.category)} health note. ${note.title}. Saved ${formatAccessibleDateTime(note.createdAt)}. Profile: ${note.profileName}.`;
}

function getResultSummary(
  count: number,
  range: HealthNoteRange,
  category: HealthNoteCategoryFilter,
) {
  const rangeLabel = range === "all" ? "" : ` in the last ${range} days`;
  const categoryLabel =
    category === "all" ? "" : `${formatHealthNoteCategory(category)} `;
  if (!count) return `No ${categoryLabel}notes${rangeLabel}`;
  return `${count} ${categoryLabel}${count === 1 ? "note" : "notes"}${rangeLabel}`;
}

function formatSavedNoteCount(count: number) {
  return `${count} saved ${count === 1 ? "note" : "notes"}`;
}

function formatRelativeDateTime(date: Date) {
  return `${formatRelativeDay(date)} at ${formatTime(date)}`;
}

function formatAccessibleDateTime(date: Date) {
  return `${formatRelativeDay(date)} at ${formatTime(date)}`;
}

function formatRelativeDay(date: Date) {
  const now = new Date();
  if (isSameCalendarDay(date, now)) return "today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) return "yesterday";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

const styles = StyleSheet.create({
  back: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backText: { fontSize: 22, fontWeight: "900", lineHeight: 24 },
  categoryChips: { gap: 9, paddingRight: 18 },
  chevron: { fontSize: 22, fontWeight: "900", lineHeight: 24, marginLeft: 8 },
  chip: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  chipMarker: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  chipSelected: { borderWidth: 2 },
  chipTextSelected: { fontWeight: "900" },
  chipText: { fontSize: 13, fontWeight: "900" },
  content: { gap: 22 },
  empty: { alignItems: "center", borderWidth: 1, gap: 10, padding: 22 },
  emptyIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  emptyMessage: { lineHeight: 20, maxWidth: 320, textAlign: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900", textAlign: "center" },
  filterGroup: { gap: 9 },
  filterLabel: { fontSize: 14, fontWeight: "900" },
  filters: { gap: 16 },
  group: { gap: 10 },
  groupCount: { fontSize: 12, fontWeight: "800" },
  groupHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  groupLabel: { fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  groups: { gap: 22 },
  header: { gap: 18 },
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  latestBlock: { gap: 4 },
  latestLabel: { fontSize: 12, fontWeight: "900" },
  latestTime: { fontSize: 12, fontWeight: "800", lineHeight: 18 },
  latestTitle: { fontSize: 17, fontWeight: "900", lineHeight: 23 },
  noteCard: {
    alignItems: "flex-start",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 15,
  },
  noteCopy: { flex: 1, gap: 8, minWidth: 0 },
  noteHeading: { alignItems: "flex-start", flexDirection: "row" },
  noteIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  noteMeta: { fontSize: 12, fontWeight: "800", lineHeight: 18 },
  noteMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  noteMetaSeparator: { fontSize: 12, fontWeight: "800" },
  noteOwner: { alignItems: "center", flexDirection: "row", gap: 7 },
  notePreview: { fontSize: 13, lineHeight: 20 },
  noteStack: { gap: 12 },
  noteTitle: { flex: 1, fontSize: 15, fontWeight: "900", lineHeight: 21 },
  ownerIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  ownerName: { fontSize: 12, fontWeight: "900" },
  pressed: { opacity: 0.74 },
  pressedCard: { opacity: 0.78, transform: [{ scale: 0.995 }] },
  privacyCopy: { flex: 1, gap: 5 },
  privacyNote: {
    alignItems: "flex-start",
    borderLeftWidth: 3,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  privacyText: { fontSize: 12, lineHeight: 19 },
  profileIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  profileLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  profileName: { fontSize: 13, fontWeight: "900" },
  profilePill: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 44,
    paddingHorizontal: 11,
  },
  resultSummary: { fontSize: 13, fontWeight: "800" },
  savedConfirmation: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  savedConfirmationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  screen: { flex: 1 },
  skeleton: { borderRadius: 20, borderWidth: 1 },
  stateStack: { gap: 12 },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 5 },
  summaryCard: { borderRadius: 26, borderWidth: 1, padding: 19 },
  summaryContent: { gap: 16 },
  summaryCount: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
    marginTop: 4,
  },
  summaryEyebrow: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  summaryIcon: {
    alignItems: "center",
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  summarySupport: { fontSize: 13, lineHeight: 20 },
  summaryTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  title: { fontSize: 28, fontWeight: "900", lineHeight: 34 },
});
