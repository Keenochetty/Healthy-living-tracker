import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  DateWheelPicker,
  ManualEntryToggle,
  PresetChipGroup,
  QuickLogBottomSheet,
  QuickNoteField,
  QuickSaveButton,
  TimeWheelPicker
} from "@/components/fitness/QuickWorkoutInputs";
import { MedicationSupplementSafetyDashboard } from "@/components/medication/MedicationSupplementSafetyDashboard";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import { getSafetyStatusLabel } from "@/lib/medicationSafetyStorage";
import {
  archiveMedication,
  archiveSupplement,
  calculateTodayMedicationSchedule,
  calculateTodaySupplementSchedule,
  createHealthDocument,
  createHealthSchedule,
  createMedication,
  createMedicationSupplementNote,
  createSupplement,
  FOOD_TIMING_OPTIONS,
  getDoseLogsByItem,
  getHealthDocumentsByItem,
  getMedicationAdherenceSummary,
  getMedicationById,
  getMedications,
  getNotesByDate,
  getNotesByItem,
  getSchedulesByItem,
  getSupplementAdherenceSummary,
  getSupplementById,
  getSupplements,
  markDoseSkipped,
  markDoseTaken,
  MEDICATION_FORM_OPTIONS,
  SCHEDULE_TIMING_OPTIONS,
  snoozeDoseReminder,
  SUPPLEMENT_FORM_OPTIONS
} from "@/lib/medicationSupplementStorage";
import type {
  AdherenceSummary,
  DoseLog,
  FoodTiming,
  HealthDocument,
  HealthSchedule,
  HealthScheduleReminder,
  Medication,
  MedicationForm,
  MedicationSupplementNote,
  ScheduleTiming,
  Supplement,
  SupplementForm
} from "@/types/medication";

type ItemType = "medication" | "supplement";
type RealmTab =
  | "today"
  | "schedule"
  | "items"
  | "logs"
  | "refills"
  | "ingredients"
  | "safety"
  | "records"
  | "reports"
  | "learn"
  | "settings";
type SheetMode = "item" | "schedule" | "action" | "note" | "document" | null;

const MEDICATION_TABS: Array<{ key: RealmTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "schedule", label: "Schedule" },
  { key: "items", label: "Medications" },
  { key: "logs", label: "Dose Logs" },
  { key: "refills", label: "Refills" },
  { key: "safety", label: "Safety Review" },
  { key: "records", label: "Records" },
  { key: "reports", label: "Reports" },
  { key: "learn", label: "Learn" },
  { key: "settings", label: "Settings" }
];

const SUPPLEMENT_TABS: Array<{ key: RealmTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "schedule", label: "Schedule" },
  { key: "items", label: "Supplements" },
  { key: "logs", label: "Logs" },
  { key: "ingredients", label: "Ingredients" },
  { key: "safety", label: "Safety Review" },
  { key: "records", label: "Records" },
  { key: "reports", label: "Reports" },
  { key: "learn", label: "Learn" },
  { key: "settings", label: "Settings" }
];

const SNOOZE_OPTIONS = [
  { label: "10 min", minutes: 10 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "Tomorrow", minutes: 1440 }
];

const MEDICATION_FOOTER =
  "Medication tracking is for organization only. Always follow your prescription label or healthcare professional’s instructions.";
const SUPPLEMENT_FOOTER =
  "Supplement tracking is for organization only. Speak to a healthcare professional if you take medication, are pregnant, have a medical condition, or are unsure.";
const BABY_MEDICINE_FOOTER =
  "Always follow the medicine label or healthcare professional’s instructions. This app does not calculate or recommend doses.";
const CONTRACEPTION_FOOTER =
  "Contraception tracking helps you organize reminders, dates, and notes. Always follow your product leaflet, prescription label, clinic guidance, or healthcare professional’s advice.";
const FOOD_TIMING_FOOTER =
  "Some medicines or supplements may have food timing instructions. Always follow your product label, prescription label, or healthcare professional’s guidance.";

type RealmData = {
  adherence: AdherenceSummary;
  documents: HealthDocument[];
  items: Array<Medication | Supplement>;
  logs: DoseLog[];
  notes: MedicationSupplementNote[];
  reminders: HealthScheduleReminder[];
  schedules: HealthSchedule[];
};

const EMPTY_ADHERENCE: AdherenceSummary = { missed: 0, skipped: 0, taken: 0, total: 0 };

export function MedicationSupplementRealm({ itemType }: { itemType: ItemType }) {
  const [activeTab, setActiveTab] = useState<RealmTab>("today");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<HealthScheduleReminder | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [toast, setToast] = useState("");
  const [data, setData] = useState<RealmData>({
    adherence: EMPTY_ADHERENCE,
    documents: [],
    items: [],
    logs: [],
    notes: [],
    reminders: [],
    schedules: []
  });

  const tabs = itemType === "medication" ? MEDICATION_TABS : SUPPLEMENT_TABS;
  const selectedItem = data.items.find((item) => item.id === selectedItemId) ?? data.items[0] ?? null;
  const accent = getAccentColor(itemType);

  const loadRealm = useCallback(async () => {
    const [items, notes, todaySummary, adherence] = await Promise.all([
      itemType === "medication" ? getMedications() : getSupplements(),
      getNotesByDate(new Date(), itemType),
      itemType === "medication" ? calculateTodayMedicationSchedule() : calculateTodaySupplementSchedule(),
      itemType === "medication" ? getMedicationAdherenceSummary() : getSupplementAdherenceSummary()
    ]);
    const schedules = (await Promise.all(items.map((item) => getSchedulesByItem(itemType, item.id)))).flat();
    const logs = (await Promise.all(items.map((item) => getDoseLogsByItem(itemType, item.id)))).flat();
    const documents = (await Promise.all(items.map((item) => getHealthDocumentsByItem(itemType, item.id)))).flat();

    setData({ adherence, documents, items, logs, notes, reminders: todaySummary.reminders, schedules });
    setSelectedItemId((current) => current ?? items[0]?.id ?? null);
  }, [itemType]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve().then(loadRealm).catch(() => undefined);
    }, [loadRealm])
  );

  async function afterSaved(message: string) {
    setToast(message);
    setSheetMode(null);
    setSelectedReminder(null);
    await loadRealm();
  }

  return (
    <View style={styles.stack}>
      <Hero itemType={itemType} data={data} onAdd={() => setSheetMode("item")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {tabs.map((tab) => <Chip key={tab.key} label={tab.label} onPress={() => setActiveTab(tab.key)} selected={activeTab === tab.key} tint={accent} />)}
      </ScrollView>
      {toast ? <SuccessToast message={toast} onDismiss={() => setToast("")} /> : null}

      {activeTab === "today" ? <TodayTab data={data} itemType={itemType} onAction={(reminder) => { setSelectedReminder(reminder); setSheetMode("action"); }} onSheet={setSheetMode} /> : null}
      {activeTab === "schedule" ? <ScheduleTab data={data} itemType={itemType} onAction={(reminder) => { setSelectedReminder(reminder); setSheetMode("action"); }} onSheet={setSheetMode} /> : null}
      {activeTab === "items" ? <ItemsTab data={data} itemType={itemType} onSelect={setSelectedItemId} onSheet={setSheetMode} selectedItemId={selectedItemId} /> : null}
      {activeTab === "logs" ? <LogsTab data={data} itemType={itemType} /> : null}
      {activeTab === "refills" ? <RefillsTab data={data} onSheet={setSheetMode} /> : null}
      {activeTab === "ingredients" ? <IngredientsTab data={data} /> : null}
      {activeTab === "safety" ? <SafetyTab item={selectedItem} itemType={itemType} /> : null}
      {activeTab === "records" ? <RecordsTab data={data} itemType={itemType} onSheet={setSheetMode} /> : null}
      {activeTab === "reports" ? <ReportsTab data={data} itemType={itemType} onTab={setActiveTab} /> : null}
      {activeTab === "learn" ? <LearnTab itemType={itemType} /> : null}
      {activeTab === "settings" ? <SettingsTab itemType={itemType} /> : null}

      <Footer text={itemType === "medication" ? MEDICATION_FOOTER : SUPPLEMENT_FOOTER} />

      <ItemSheet itemType={itemType} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "item"} />
      <ScheduleSheet item={selectedItem} itemType={itemType} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "schedule"} />
      <ActionSheet itemType={itemType} onClose={() => setSheetMode(null)} onSaved={afterSaved} reminder={selectedReminder} visible={sheetMode === "action"} />
      <NoteSheet item={selectedItem} itemType={itemType} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "note"} />
      <DocumentSheet item={selectedItem} itemType={itemType} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "document"} />
    </View>
  );
}

export function MedicationSupplementDetail({ itemId, itemType }: { itemId: string; itemType: ItemType }) {
  const [item, setItem] = useState<Medication | Supplement | null>(null);
  const [schedules, setSchedules] = useState<HealthSchedule[]>([]);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [notes, setNotes] = useState<MedicationSupplementNote[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [adherence, setAdherence] = useState<AdherenceSummary>(EMPTY_ADHERENCE);

  const loadDetail = useCallback(async () => {
    const nextItem = itemType === "medication" ? await getMedicationById(itemId) : await getSupplementById(itemId);
    const [nextSchedules, nextDocuments, nextNotes, nextLogs, nextAdherence] = await Promise.all([
      getSchedulesByItem(itemType, itemId),
      getHealthDocumentsByItem(itemType, itemId),
      getNotesByItem(itemType, itemId),
      getDoseLogsByItem(itemType, itemId),
      itemType === "medication" ? getMedicationAdherenceSummary(itemId) : getSupplementAdherenceSummary(itemId)
    ]);

    setItem(nextItem);
    setSchedules(nextSchedules);
    setDocuments(nextDocuments);
    setNotes(nextNotes);
    setLogs(nextLogs);
    setAdherence(nextAdherence);
  }, [itemId, itemType]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve().then(loadDetail).catch(() => undefined);
    }, [loadDetail])
  );

  if (!item) {
    return <PremiumEmptyState message="This item may have been removed." title="Item unavailable" />;
  }

  return (
    <View style={styles.stack}>
      <AppCard style={[styles.heroCard, { borderColor: getAccentColor(itemType) }]}>
        <Text style={styles.kicker}>{itemType === "medication" ? "Medication detail" : "Supplement detail"}</Text>
        <Text style={styles.heroTitle}>{item.name}</Text>
        <Text style={styles.heroBody}>{itemType === "medication" ? "Dose as written on your label or by your healthcare professional." : "Serving as written on your label or by your healthcare professional."}</Text>
      </AppCard>
      <View style={styles.metricGrid}>
        <MetricCard label="Form" value={formatValue(item.form)} />
        <MetricCard label="Strength / serving" value={item.strength ?? getServingText(item)} />
        <MetricCard label="Schedules" value={`${schedules.length}`} />
        <MetricCard label="Documents" value={`${documents.length}`} />
      </View>
      <SafetyReviewCards itemType={itemType} item={item} />
      <ReportsSummary adherence={adherence} itemType={itemType} logs={logs} />
      <DocumentPreview documents={documents} itemType={itemType} />
      <List items={notes.slice(0, 5).map((note) => `${formatDate(note.loggedAt)} - ${note.note}`)} empty="Notes will appear here." />
      <AppButton
        onPress={async () => {
          if (itemType === "medication") await archiveMedication(item.id);
          else await archiveSupplement(item.id);
          router.replace(`/${itemType === "medication" ? "medication" : "supplements"}` as Href);
        }}
        title="Pause / Archive"
      />
      <Footer text={itemType === "medication" ? MEDICATION_FOOTER : SUPPLEMENT_FOOTER} />
    </View>
  );
}

function Hero({ data, itemType, onAdd }: { data: RealmData; itemType: ItemType; onAdd: () => void }) {
  const dueCount = data.reminders.filter((reminder) => reminder.status === "due").length;
  const takenCount = data.reminders.filter((reminder) => reminder.status === "taken").length;
  const next = data.reminders.find((reminder) => reminder.status === "due" || reminder.status === "upcoming");
  return (
    <AppCard style={[styles.heroCard, { borderColor: getAccentColor(itemType) }]}>
      <Text style={[styles.kicker, { color: getAccentColor(itemType) }]}>{itemType === "medication" ? "Medication today" : "Supplements today"}</Text>
      <Text style={styles.heroTitle}>{dueCount} due · {takenCount} completed</Text>
      <Text style={styles.heroBody}>{next ? `Next: ${next.itemName} ${next.scheduledAt ? `at ${formatTime(next.scheduledAt)}` : ""}` : "No reminders due right now."}</Text>
      <View style={styles.actionRow}>
        <AppButton onPress={onAdd} title={itemType === "medication" ? "Add Medication" : "Add Supplement"} />
      </View>
    </AppCard>
  );
}

function TodayTab({ data, itemType, onAction, onSheet }: { data: RealmData; itemType: ItemType; onAction: (reminder: HealthScheduleReminder) => void; onSheet: (mode: SheetMode) => void }) {
  const next = data.reminders.find((reminder) => reminder.status === "due" || reminder.status === "upcoming");
  return (
    <View style={styles.stack}>
      <NextCard itemType={itemType} reminder={next} onAction={onAction} />
      <QuickActions itemType={itemType} onSheet={onSheet} />
      <ScheduleTimeline itemType={itemType} onAction={onAction} reminders={data.reminders} />
      <SafetyReviewCards itemType={itemType} />
      {itemType === "medication" ? <RefillPreview data={data} onSheet={onSheet} /> : <IngredientsPreview data={data} />}
      <DocumentPreview documents={data.documents} itemType={itemType} onSheet={onSheet} />
      <ReportsSummary adherence={data.adherence} itemType={itemType} logs={data.logs} />
    </View>
  );
}

function NextCard({ itemType, onAction, reminder }: { itemType: ItemType; onAction: (reminder: HealthScheduleReminder) => void; reminder?: HealthScheduleReminder }) {
  return (
    <AppCard style={styles.darkCard}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.darkTitle}>{itemType === "medication" ? "Next dose" : "Next supplement"}</Text>
          <Text style={styles.darkMuted}>{reminder ? `${reminder.itemName} · ${formatReminderStatus(reminder)}` : "No reminder due right now."}</Text>
        </View>
        <PrivacyBadge />
      </View>
      {reminder ? <View style={styles.actionRow}><GhostButton label="Action" onPress={() => onAction(reminder)} /></View> : null}
    </AppCard>
  );
}

function QuickActions({ itemType, onSheet }: { itemType: ItemType; onSheet: (mode: SheetMode) => void }) {
  const actions = [
    { icon: "success", label: "Mark Taken", mode: "action" as SheetMode },
    { icon: "snooze", label: "Snooze", mode: "action" as SheetMode },
    { icon: "edit", label: "Add Note", mode: "note" as SheetMode },
    { icon: "reminder", label: "View Schedule", mode: "schedule" as SheetMode },
    { icon: "add", label: itemType === "medication" ? "Add Medication" : "Add Supplement", mode: "item" as SheetMode },
    { icon: "records", label: itemType === "medication" ? "Add Label / Prescription" : "Add Label", mode: "document" as SheetMode }
  ];
  return (
    <View style={styles.quickGrid}>
      {actions.map((action) => (
        <Pressable accessibilityLabel={action.label} accessibilityRole="button" key={action.label} onPress={() => onSheet(action.mode)} style={styles.quickAction}>
          <AppIcon color={getAccentColor(itemType)} decorative name={action.icon as never} size={22} />
          <Text style={styles.quickText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ScheduleTab({ data, itemType, onAction, onSheet }: { data: RealmData; itemType: ItemType; onAction: (reminder: HealthScheduleReminder) => void; onSheet: (mode: SheetMode) => void }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Schedule" subtitle="Gentle reminder timeline with quick actions." />
      <View style={styles.actionRow}><AppButton onPress={() => onSheet("schedule")} title="Add reminder" /></View>
      <ScheduleTimeline itemType={itemType} onAction={onAction} reminders={data.reminders} />
      <ScheduleList itemType={itemType} items={data.items} schedules={data.schedules} />
      <Footer text={FOOD_TIMING_FOOTER} />
    </View>
  );
}

function ItemsTab({ data, itemType, onSelect, onSheet, selectedItemId }: { data: RealmData; itemType: ItemType; onSelect: (id: string) => void; onSheet: (mode: SheetMode) => void; selectedItemId: string | null }) {
  return (
    <View style={styles.stack}>
      <AppSection title={itemType === "medication" ? "Medications" : "Supplements"} subtitle="Private item list with schedules, status, labels, and detail links." />
      {!data.items.length ? (
        <PremiumEmptyState
          button={itemType === "medication" ? "Add medication" : "Add supplement"}
          message={itemType === "medication" ? "Add medication reminders, labels, prescriptions, and notes when you are ready." : "Track supplements, reminders, labels, and review notes."}
          onPress={() => onSheet("item")}
          title={itemType === "medication" ? "No medications added" : "No supplements added"}
        />
      ) : null}
      {data.items.map((item) => (
        <ItemCard
          documents={data.documents.filter((document) => document.relatedId === item.id)}
          item={item}
          itemType={itemType}
          key={item.id}
          onPress={() => {
            onSelect(item.id);
            router.push(`/${itemType === "medication" ? "medication" : "supplements"}/${item.id}` as Href);
          }}
          schedule={data.schedules.find((schedule) => schedule.itemId === item.id)}
          selected={selectedItemId === item.id}
        />
      ))}
    </View>
  );
}

function LogsTab({ data, itemType }: { data: RealmData; itemType: ItemType }) {
  return (
    <View style={styles.stack}>
      <AppSection title={itemType === "medication" ? "Dose Logs" : "Supplement Logs"} subtitle="Taken, skipped, missed, and snoozed history." />
      <View style={styles.metricGrid}>
        <MetricCard label="Taken" value={`${data.logs.filter((log) => log.status === "taken").length}`} />
        <MetricCard label="Skipped" value={`${data.logs.filter((log) => log.status === "skipped").length}`} />
        <MetricCard label="Snoozed" value={`${data.logs.filter((log) => log.status === "snoozed").length}`} />
        <MetricCard label="Missed" value={`${data.logs.filter((log) => log.status === "missed").length}`} />
      </View>
      <List items={data.logs.slice(0, 12).map((log) => `${formatDate(log.takenAt ?? log.scheduledAt ?? log.createdAt)} · ${formatValue(log.status)}${log.notes ? ` · ${log.notes}` : ""}`)} empty="Logs will appear here." />
    </View>
  );
}

function RefillsTab({ data, onSheet }: { data: RealmData; onSheet: (mode: SheetMode) => void }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Refills" subtitle="Prescription, label, pharmacy, and renewal reminders." />
      <RefillPreview data={data} onSheet={onSheet} />
      <PremiumEmptyState button="Add document" message="Add a prescription, pharmacy note, or label for reference." onPress={() => onSheet("document")} title="No refill dates entered" />
    </View>
  );
}

function IngredientsTab({ data }: { data: RealmData }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Ingredients" subtitle="Ingredient notes are user-entered and for review only." />
      <IngredientsPreview data={data} />
      <SafetyReviewCards itemType="supplement" />
    </View>
  );
}

function SafetyTab({ item, itemType }: { item: Medication | Supplement | null; itemType: ItemType }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Safety Review" subtitle="Cautious prompts only. No safe or unsafe decisions." />
      <SafetyReviewCards itemType={itemType} item={item ?? undefined} />
      <MedicationSupplementSafetyDashboard item={item} itemType={itemType} onChange={() => undefined} />
      <Footer text={CONTRACEPTION_FOOTER} />
      <Footer text={BABY_MEDICINE_FOOTER} />
    </View>
  );
}

function RecordsTab({ data, itemType, onSheet }: { data: RealmData; itemType: ItemType; onSheet: (mode: SheetMode) => void }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Records" subtitle={itemType === "medication" ? "Labels, prescriptions, pharmacy notes, and documents." : "Labels, photos, supplement notes, and documents."} />
      <DocumentPreview documents={data.documents} itemType={itemType} onSheet={onSheet} />
      <View style={styles.recordGrid}>
        {["Prescription", "Label photo", "Doctor note", "Pharmacy note", "Lab result", "Supplement label"].map((label) => <RecordTypeCard key={label} label={label} />)}
      </View>
      <Footer text="Records organize documents only. This app does not interpret documents." />
    </View>
  );
}

function ReportsTab({ data, itemType, onTab }: { data: RealmData; itemType: ItemType; onTab: (tab: RealmTab) => void }) {
  if (!data.logs.length) {
    return <PremiumEmptyState button="View schedule" message="Mark items taken, skipped, or snoozed to see trends." onPress={() => onTab("schedule")} title="Reports will appear here" />;
  }
  return (
    <View style={styles.stack}>
      <AppSection title="Reports" subtitle="Adherence and reminder history only. No health outcome interpretation." />
      <ReportsSummary adherence={data.adherence} itemType={itemType} logs={data.logs} />
      <ChartCard title="Weekly adherence" values={["taken", "skipped", "missed", "snoozed"].map((status) => data.logs.filter((log) => log.status === status).length / Math.max(1, data.logs.length))} />
      <ChartCard title="Reminder history" values={data.logs.slice(0, 8).map((log) => log.status === "taken" ? 1 : log.status === "skipped" ? 0.5 : 0.25)} />
      <SafetyReviewCards itemType={itemType} />
    </View>
  );
}

function LearnTab({ itemType }: { itemType: ItemType }) {
  const cards = itemType === "medication"
    ? [
        ["Medication tracking", "Use reminders and logs to organize what you take. Follow your prescription label or healthcare professional instructions.", "App education"],
        ["Reading product labels", "Save labels and questions so you can discuss details with a pharmacist, doctor, nurse, clinic, or healthcare professional.", "App education"],
        ["Pharmacy questions", "Prepare questions about timing, labels, refills, and what to confirm professionally.", "App education"]
      ]
    : [
        ["Supplement caution", "Supplement tracking is for organization only. Discuss supplement use if you take medication, are pregnant, or are unsure.", "App education"],
        ["Duplicate ingredients", "Ingredient lists may overlap. Review labels with a healthcare professional if concerned.", "App education"],
        ["Label notes", "Save supplement labels and serving text as written. This app does not claim benefits.", "App education"]
      ];
  return (
    <View style={styles.stack}>
      <AppSection title="Learn" subtitle="Short source-ready cards with safe wording." />
      {cards.map(([title, summary, source]) => <LearnCard key={title} source={source} summary={summary} title={title} />)}
    </View>
  );
}

function SettingsTab({ itemType }: { itemType: ItemType }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Settings" subtitle="Private by default." />
      <AppCard style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>{itemType === "medication" ? "Medication" : "Supplement"} privacy</Text>
        <Text style={styles.privacyBody}>Items, schedules, logs, records, and notes stay private unless you explicitly share selected details.</Text>
      </AppCard>
    </View>
  );
}

function ScheduleTimeline({ itemType, onAction, reminders }: { itemType: ItemType; onAction: (reminder: HealthScheduleReminder) => void; reminders: HealthScheduleReminder[] }) {
  if (!reminders.length) {
    return <PremiumEmptyState message="Add a schedule if you want reminders." title="No reminders set" />;
  }
  return (
    <View style={styles.timeline}>
      {reminders.map((reminder, index) => <ReminderCard itemType={itemType} key={`${reminder.scheduleId ?? index}-${reminder.itemId}-${reminder.scheduledAt}`} onAction={onAction} reminder={reminder} />)}
    </View>
  );
}

function ReminderCard({ itemType, onAction, reminder }: { itemType: ItemType; onAction: (reminder: HealthScheduleReminder) => void; reminder: HealthScheduleReminder }) {
  return (
    <Pressable accessibilityLabel={`${reminder.itemName}. ${formatReminderStatus(reminder)}`} accessibilityRole="button" onPress={() => onAction(reminder)} style={styles.reminderCard}>
      <View style={[styles.timelineIcon, { backgroundColor: `${getAccentColor(itemType)}22` }]}><AppIcon color={getAccentColor(itemType)} decorative name={itemType === "medication" ? "medication" : "nutrition"} size={22} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.reminderTitle}>{reminder.itemName}</Text>
        <Text style={styles.reminderMeta}>{reminder.scheduledAt ? formatTime(reminder.scheduledAt) : "As needed"} · {formatReminderStatus(reminder)}</Text>
      </View>
      <PrivacyBadge />
    </Pressable>
  );
}

function ItemCard({ documents, item, itemType, onPress, schedule, selected }: { documents: HealthDocument[]; item: Medication | Supplement; itemType: ItemType; onPress: () => void; schedule?: HealthSchedule; selected?: boolean }) {
  const supplement = item as Supplement;
  return (
    <Pressable onPress={onPress} style={[styles.itemCard, selected ? { borderColor: getAccentColor(itemType) } : null]}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemMeta}>{formatValue(item.form)} · {schedule ? formatTiming(schedule.timing) : "No schedule set"}</Text>
          {itemType === "supplement" && supplement.mainIngredient ? <Text style={styles.itemMeta}>Ingredient: {supplement.mainIngredient}</Text> : null}
        </View>
        <AppIcon color="#94a3b8" decorative name="records" size={18} />
      </View>
      <View style={styles.badgeRow}>
        <StatusBadge label={getSafetyStatusLabel(item.safetyStatus)} />
        <StatusBadge label="Private" />
        {documents.length ? <StatusBadge label="Label linked" /> : null}
      </View>
    </Pressable>
  );
}

function ScheduleList({ itemType, items, schedules }: { itemType: ItemType; items: Array<Medication | Supplement>; schedules: HealthSchedule[] }) {
  const rows = schedules.map((schedule) => {
    const item = items.find((candidate) => candidate.id === schedule.itemId);
    return `${item?.name ?? (itemType === "medication" ? "Medication" : "Supplement")} · ${formatTiming(schedule.timing)} · ${schedule.times.join(", ") || "As needed"} · ${formatFoodTiming(schedule.foodTiming)}`;
  });
  return <List empty="Schedule rows will appear here." items={rows} />;
}

function SafetyReviewCards({ item, itemType }: { item?: Medication | Supplement; itemType: ItemType }) {
  const cards = [
    "Review with a healthcare professional",
    "Check your label or leaflet",
    "This may need professional confirmation",
    "Based on your entered items"
  ];
  return (
    <View style={styles.stack}>
      {cards.map((title) => <CautionCard key={title} text={title} />)}
      {item?.notes ? <CautionCard text="Item notes are user-entered. Confirm important timing or review questions with a healthcare professional." /> : null}
      {itemType === "supplement" ? <CautionCard text="Ingredient lists may overlap. Review labels with a healthcare professional if concerned." /> : null}
    </View>
  );
}

function RefillPreview({ data, onSheet }: { data: RealmData; onSheet: (mode: SheetMode) => void }) {
  return (
    <AppCard style={styles.darkCard}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.darkTitle}>Refill / prescription</Text>
          <Text style={styles.darkMuted}>Save labels, prescriptions, pharmacy notes, and renewal reminders.</Text>
        </View>
        <GhostButton label="Add label" onPress={() => onSheet("document")} />
      </View>
      <MetricCard label="Linked records" value={`${data.documents.length}`} />
    </AppCard>
  );
}

function IngredientsPreview({ data }: { data: RealmData }) {
  const ingredients = data.items.map((item) => (item as Supplement).mainIngredient).filter(Boolean);
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>Ingredient review</Text>
      <Text style={styles.darkMuted}>{ingredients.length ? ingredients.join(", ") : "Add ingredients from the label when you are ready."}</Text>
      <CautionCard text="This may need professional confirmation. Check your product label or ask a healthcare professional." />
    </AppCard>
  );
}

function DocumentPreview({ documents, itemType, onSheet }: { documents: HealthDocument[]; itemType: ItemType; onSheet?: (mode: SheetMode) => void }) {
  return (
    <AppCard style={styles.darkCard}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.darkTitle}>{itemType === "medication" ? "Labels / prescriptions" : "Labels / documents"}</Text>
          <Text style={styles.darkMuted}>{documents.length ? `${documents.length} linked` : "No labels or prescriptions linked."}</Text>
        </View>
        {onSheet ? <GhostButton label="Add document" onPress={() => onSheet("document")} /> : null}
      </View>
      <View style={styles.recordGrid}>
        {(documents.length ? documents.slice(0, 4) : [{ id: "placeholder", title: "Add a photo, prescription, or note for reference." } as HealthDocument]).map((document) => (
          <RecordTypeCard key={document.id} label={document.title} />
        ))}
      </View>
    </AppCard>
  );
}

function ReportsSummary({ adherence, itemType, logs }: { adherence: AdherenceSummary; itemType: ItemType; logs: DoseLog[] }) {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{itemType === "medication" ? "Medication reports" : "Supplement reports"}</Text>
      <View style={styles.metricGrid}>
        <MetricCard label="Taken" value={`${adherence.taken}`} />
        <MetricCard label="Skipped" value={`${adherence.skipped}`} />
        <MetricCard label="Missed" value={`${adherence.missed}`} />
        <MetricCard label="Total logs" value={`${logs.length || adherence.total}`} />
      </View>
    </AppCard>
  );
}

function ItemSheet({ itemType, onClose, onSaved, visible }: SheetProps & { itemType: ItemType }) {
  const [name, setName] = useState(itemType === "medication" ? "Medication name" : "Supplement name");
  const [form, setForm] = useState<string>(itemType === "medication" ? "tablet" : "capsule");
  const [strength, setStrength] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [notes, setNotes] = useState("");

  async function save() {
    if (itemType === "medication") {
      await createMedication({ form: form as MedicationForm, name, notes, strength });
    } else {
      await createSupplement({ form: form as SupplementForm, mainIngredient: ingredient, name, notes, strength });
    }
    await onSaved(itemType === "medication" ? "Medication added" : "Supplement added");
  }

  const options = itemType === "medication" ? MEDICATION_FORM_OPTIONS : SUPPLEMENT_FORM_OPTIONS;
  return (
    <QuickLogBottomSheet onClose={onClose} title={itemType === "medication" ? "Add medication" : "Add supplement"} visible={visible}>
      <TextInput onChangeText={setName} placeholder="Name" placeholderTextColor="#94a3b8" style={styles.darkInput} value={name} />
      <ChipRow options={options.map((option) => ({ key: option.key, label: option.label }))} selected={form} onSelect={setForm} tint={getAccentColor(itemType)} />
      <TextInput onChangeText={setStrength} placeholder={itemType === "medication" ? "Dose as written on your label or by your healthcare professional" : "Serving text as written on the label"} placeholderTextColor="#94a3b8" style={styles.darkInput} value={strength} />
      {itemType === "supplement" ? <TextInput onChangeText={setIngredient} placeholder="Main ingredient optional" placeholderTextColor="#94a3b8" style={styles.darkInput} value={ingredient} /> : null}
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <QuickSaveButton onPress={save} title={itemType === "medication" ? "Save medication" : "Save supplement"} />
    </QuickLogBottomSheet>
  );
}

function ScheduleSheet({ item, itemType, onClose, onSaved, visible }: SheetProps & { item: Medication | Supplement | null; itemType: ItemType }) {
  const [timing, setTiming] = useState<ScheduleTiming>("once_daily");
  const [time, setTime] = useState("08:00");
  const [foodTiming, setFoodTiming] = useState<FoodTiming>("none");
  const [customInstructions, setCustomInstructions] = useState("");
  const [manual, setManual] = useState(false);
  const [manualTime, setManualTime] = useState("08:00");

  async function save() {
    if (!item) return;
    await createHealthSchedule({ customInstructions, foodTiming, itemId: item.id, itemType, reminderEnabled: true, timing, times: [manual ? manualTime : time] });
    await onSaved("Schedule saved");
  }

  return (
    <QuickLogBottomSheet onClose={onClose} title="Add reminder" visible={visible}>
      {!item ? <Text style={styles.sheetText}>Add an item first.</Text> : <Text style={styles.sheetText}>Reminder for {item.name}</Text>}
      <ChipRow options={SCHEDULE_TIMING_OPTIONS.map((option) => ({ key: option.key, label: option.label }))} selected={timing} onSelect={(value) => setTiming(value as ScheduleTiming)} tint={getAccentColor(itemType)} />
      <ManualEntryToggle enabled={manual} onToggle={() => setManual((current) => !current)} />
      {manual ? <TextInput onChangeText={setManualTime} placeholder="Time, e.g. 08:00" placeholderTextColor="#94a3b8" style={styles.darkInput} value={manualTime} /> : <TimeWheelPicker onChange={(minutes) => setTime(minutesToTime(minutes))} valueMinutes={timeToMinutes(time)} />}
      <ChipRow options={FOOD_TIMING_OPTIONS.map((option) => ({ key: option.key, label: option.label }))} selected={foodTiming} onSelect={(value) => setFoodTiming(value as FoodTiming)} tint={getAccentColor(itemType)} />
      <QuickNoteField onChangeText={setCustomInstructions} value={customInstructions} />
      <Footer text={FOOD_TIMING_FOOTER} />
      <QuickSaveButton onPress={save} title="Save reminder" />
    </QuickLogBottomSheet>
  );
}

function ActionSheet({ itemType, onClose, onSaved, reminder, visible }: SheetProps & { itemType: ItemType; reminder: HealthScheduleReminder | null }) {
  const [statusAction, setStatusAction] = useState<"taken" | "skipped" | "snoozed" | "note">("taken");
  const [snoozeMinutes, setSnoozeMinutes] = useState(10);
  const [time, setTime] = useState(new Date().toISOString().slice(11, 16));
  const [notes, setNotes] = useState("");

  async function save() {
    if (!reminder) return;
    const input = { itemId: reminder.itemId, itemType, notes, scheduleId: reminder.scheduleId, scheduledAt: reminder.scheduledAt };
    if (statusAction === "taken") await markDoseTaken(input);
    if (statusAction === "skipped") await markDoseSkipped(input);
    if (statusAction === "snoozed") await snoozeDoseReminder({ ...input, notes: [notes, `Snoozed for ${snoozeMinutes} minutes`].filter(Boolean).join(". ") });
    if (statusAction === "note") await createMedicationSupplementNote({ loggedAt: new Date().toISOString(), note: notes || "Reminder note", relatedId: reminder.itemId, relatedType: itemType });
    await onSaved(statusAction === "snoozed" ? "Reminder snoozed" : statusAction === "skipped" ? "Marked skipped" : statusAction === "note" ? "Note saved" : "Marked taken");
  }

  return (
    <QuickLogBottomSheet onClose={onClose} title={itemType === "medication" ? "Dose action" : "Supplement action"} visible={visible}>
      {reminder ? <Text style={styles.sheetText}>{reminder.itemName} · {formatReminderStatus(reminder)}</Text> : <Text style={styles.sheetText}>Select a reminder first.</Text>}
      <ChipRow options={["taken", "skipped", "snoozed", "note"].map((item) => ({ key: item, label: item === "note" ? "Add Note" : formatValue(item) }))} selected={statusAction} onSelect={(value) => setStatusAction(value as typeof statusAction)} tint={getAccentColor(itemType)} />
      {statusAction === "taken" ? <TimeWheelPicker onChange={(minutes) => setTime(minutesToTime(minutes))} valueMinutes={timeToMinutes(time)} /> : null}
      {statusAction === "snoozed" ? <ChipRow options={SNOOZE_OPTIONS.map((option) => ({ key: String(option.minutes), label: option.label }))} selected={String(snoozeMinutes)} onSelect={(value) => setSnoozeMinutes(Number(value))} tint={getAccentColor(itemType)} /> : null}
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <QuickSaveButton onPress={save} title="Confirm" />
    </QuickLogBottomSheet>
  );
}

function NoteSheet({ item, itemType, onClose, onSaved, visible }: SheetProps & { item: Medication | Supplement | null; itemType: ItemType }) {
  const [note, setNote] = useState("");
  async function save() {
    await createMedicationSupplementNote({ loggedAt: new Date().toISOString(), note, relatedId: item?.id, relatedType: item?.id ? itemType : "general" });
    await onSaved("Note saved");
  }
  return (
    <QuickLogBottomSheet onClose={onClose} title="Add note" visible={visible}>
      <QuickNoteField onChangeText={setNote} value={note} />
      <QuickSaveButton onPress={save} title="Save note" />
    </QuickLogBottomSheet>
  );
}

function DocumentSheet({ item, itemType, onClose, onSaved, visible }: SheetProps & { item: Medication | Supplement | null; itemType: ItemType }) {
  const [title, setTitle] = useState(itemType === "medication" ? "Prescription label" : "Supplement label");
  const [noteText, setNoteText] = useState("");
  async function save() {
    await createHealthDocument({ noteText, relatedId: item?.id, relatedType: itemType, title });
    await onSaved("Document note linked");
  }
  return (
    <QuickLogBottomSheet onClose={onClose} title={itemType === "medication" ? "Add label / prescription" : "Add label"} visible={visible}>
      <TextInput onChangeText={setTitle} placeholder="Document title" placeholderTextColor="#94a3b8" style={styles.darkInput} value={title} />
      <QuickNoteField onChangeText={setNoteText} value={noteText} />
      <Footer text="Document support is for organization only. This app does not interpret labels or prescriptions." />
      <QuickSaveButton onPress={save} title="Save document note" />
    </QuickLogBottomSheet>
  );
}

type SheetProps = {
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  visible: boolean;
};

function ChipRow({ onSelect, options, selected, tint }: { onSelect: (value: string) => void; options: Array<{ key: string; label: string }>; selected: string; tint: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map((option) => <Chip key={option.key} label={option.label} onPress={() => onSelect(option.key)} selected={selected === option.key} tint={tint} />)}
    </ScrollView>
  );
}

function Chip({ label, onPress, selected, tint }: { label: string; onPress: () => void; selected?: boolean; tint: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected ? { backgroundColor: tint, borderColor: tint } : null]}>
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </AppCard>
  );
}

function ChartCard({ title, values }: { title: string; values: number[] }) {
  const normalized = values.length ? values : [0.1, 0.15, 0.12];
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{title}</Text>
      <View style={styles.barRow}>
        {normalized.map((value, index) => <View key={`${title}-${index}`} style={styles.barTrack}><View style={[styles.barFill, { height: `${Math.max(8, Math.min(100, value * 100))}%` }]} /></View>)}
      </View>
      <Text style={styles.darkMuted}>Chart summary is based on marked reminders only.</Text>
    </AppCard>
  );
}

function LearnCard({ source, summary, title }: { source: string; summary: string; title: string }) {
  return (
    <AppCard style={styles.learnCard}>
      <Text style={styles.learnSource}>{source} · Last checked 2026-06-05</Text>
      <Text style={styles.learnTitle}>{title}</Text>
      <Text style={styles.learnBody}>{summary}</Text>
      <Text style={styles.learnBody}>Education and organization only. Speak to a healthcare professional if unsure.</Text>
    </AppCard>
  );
}

function RecordTypeCard({ label }: { label: string }) {
  return (
    <AppCard style={styles.recordCard}>
      <AppIcon color="#94a3b8" decorative name="records" size={20} />
      <Text style={styles.recordText}>{label}</Text>
    </AppCard>
  );
}

function StatusBadge({ label }: { label: string }) {
  return <View style={styles.statusBadge}><Text style={styles.statusBadgeText}>{label}</Text></View>;
}

function PrivacyBadge() {
  return <View accessibilityLabel="Privacy status: private by default" style={styles.privacyBadge}><Text style={styles.privacyBadgeText}>Private</Text></View>;
}

function CautionCard({ text }: { text: string }) {
  return <AppCard style={styles.cautionCard}><Text style={styles.cautionText}>{text}</Text></AppCard>;
}

function PremiumEmptyState({ button, message, onPress, title }: { button?: string; message: string; onPress?: () => void; title: string }) {
  return (
    <AppCard style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{message}</Text>
      {button && onPress ? <View style={styles.actionRow}><AppButton onPress={onPress} title={button} /></View> : null}
    </AppCard>
  );
}

function List({ empty, items }: { empty: string; items: string[] }) {
  if (!items.length) return <Text style={styles.darkMuted}>{empty}</Text>;
  return <View style={styles.list}>{items.map((item) => <Text key={item} style={styles.listItem}>{item}</Text>)}</View>;
}

function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.ghostButton}><Text style={styles.ghostText}>{label}</Text></Pressable>;
}

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <Pressable onPress={onDismiss} style={styles.successToast}><AppIcon color="#10201d" decorative name="success" size={18} /><Text style={styles.successText}>{message}</Text></Pressable>;
}

function Footer({ text }: { text: string }) {
  return <AppCard style={styles.footerCard}><Text style={styles.footerText}>{text}</Text></AppCard>;
}

function formatReminderStatus(reminder: HealthScheduleReminder) {
  if (reminder.status === "due") return "Due now";
  if (reminder.status === "taken") return "Taken";
  if (reminder.status === "skipped") return "Skipped";
  if (reminder.status === "snoozed") return "Snoozed";
  if (reminder.status === "missed") return "Not marked yet";
  return "Upcoming";
}

function formatTiming(timing: ScheduleTiming) {
  return timing.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFoodTiming(foodTiming: FoodTiming) {
  return foodTiming === "none" ? "No food timing note" : formatValue(foodTiming);
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string) {
  return value ? value.slice(0, 10) : "Not dated";
}

function formatTime(value?: string) {
  if (!value) return "As needed";
  return value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return (Number.isFinite(hours) ? hours : 8) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60) % 24;
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getServingText(item: Medication | Supplement) {
  const supplement = item as Supplement;
  if (supplement.servingAmount && supplement.servingUnit) return `${supplement.servingAmount} ${supplement.servingUnit}`;
  return item.strength ?? "As entered";
}

function getAccentColor(itemType: ItemType) {
  return itemType === "medication" ? "#7c3aed" : "#14b8a6";
}

const styles = StyleSheet.create({
  actionRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  barFill: { backgroundColor: "#a78bfa", borderRadius: 999, bottom: 0, position: "absolute", width: "100%" },
  barRow: { alignItems: "flex-end", flexDirection: "row", gap: 8, height: 92, marginTop: 14 },
  barTrack: { backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 999, flex: 1, height: "100%", overflow: "hidden" },
  cautionCard: { backgroundColor: "#fffbeb", borderColor: "#fcd34d", borderWidth: 1 },
  cautionText: { color: "#92400e", lineHeight: 20 },
  chip: { backgroundColor: "rgba(15,23,42,0.08)", borderColor: "rgba(15,23,42,0.12)", borderRadius: 999, borderWidth: 1, minHeight: 42, paddingHorizontal: 14, paddingVertical: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingRight: 16 },
  chipText: { color: "#475569", fontWeight: "900" },
  chipTextSelected: { color: "#ffffff" },
  darkCard: { backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1 },
  darkInput: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.14)", borderRadius: 16, borderWidth: 1, color: "#f8fafc", minHeight: 48, paddingHorizontal: 14, paddingVertical: 10 },
  darkMuted: { color: "#cbd5e1", lineHeight: 21, marginTop: 6 },
  darkTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "900" },
  emptyBody: { color: "#64748b", lineHeight: 21, marginTop: 6 },
  emptyCard: { backgroundColor: "#fff7ed", borderColor: "#fed7aa", borderWidth: 1 },
  emptyTitle: { color: "#0f172a", fontSize: 20, fontWeight: "900" },
  footerCard: { backgroundColor: "#fff7ed", borderColor: "#fed7aa", borderWidth: 1 },
  footerText: { color: "#9a3412", lineHeight: 20 },
  ghostButton: { alignItems: "center", borderColor: "rgba(255,255,255,0.18)", borderRadius: 999, borderWidth: 1, minHeight: 42, paddingHorizontal: 14, paddingVertical: 10 },
  ghostText: { color: "#f8fafc", fontWeight: "900" },
  heroBody: { color: "#dbeafe", lineHeight: 22, marginTop: 8 },
  heroCard: { backgroundColor: "#111827", borderWidth: 1 },
  heroTitle: { color: "#ffffff", fontSize: 29, fontWeight: "900", marginTop: 6 },
  itemCard: { backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: 24, borderWidth: 1, padding: 16 },
  itemMeta: { color: "#64748b", lineHeight: 20, marginTop: 5 },
  itemTitle: { color: "#0f172a", fontSize: 20, fontWeight: "900" },
  kicker: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  learnBody: { color: "#475569", lineHeight: 21, marginTop: 7 },
  learnCard: { backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderWidth: 1 },
  learnSource: { color: "#7c3aed", fontSize: 12, fontWeight: "900" },
  learnTitle: { color: "#0f172a", fontSize: 20, fontWeight: "900", marginTop: 6 },
  list: { gap: 8 },
  listItem: { backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.10)", borderRadius: 16, borderWidth: 1, color: "#e2e8f0", lineHeight: 20, padding: 12 },
  metricCard: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1, flexBasis: "47%", flexGrow: 1 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  metricLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "900" },
  metricValue: { color: "#f8fafc", fontSize: 16, fontWeight: "900", marginTop: 6 },
  privacyBadge: { backgroundColor: "#f8fafc", borderColor: "#cbd5e1", borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  privacyBadgeText: { color: "#475569", fontSize: 12, fontWeight: "900" },
  privacyBody: { color: "#475569", lineHeight: 20, marginTop: 4 },
  privacyCard: { backgroundColor: "#f8fafc", borderColor: "#e2e8f0", borderWidth: 1 },
  privacyTitle: { color: "#0f172a", fontSize: 18, fontWeight: "900" },
  quickAction: { alignItems: "center", backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.12)", borderRadius: 24, borderWidth: 1, flexBasis: "30%", flexGrow: 1, gap: 8, justifyContent: "center", minHeight: 94, minWidth: 96, padding: 10 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickText: { color: "#f8fafc", fontSize: 12, fontWeight: "900", textAlign: "center" },
  recordCard: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1, flexBasis: "30%", flexGrow: 1, gap: 8, minHeight: 96 },
  recordGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  recordText: { color: "#e2e8f0", fontSize: 12, fontWeight: "900", textAlign: "center" },
  reminderCard: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: 22, borderWidth: 1, flexDirection: "row", gap: 12, padding: 14 },
  reminderMeta: { color: "#64748b", marginTop: 4 },
  reminderTitle: { color: "#0f172a", fontSize: 16, fontWeight: "900" },
  sectionHeaderRow: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  sheetText: { color: "#cbd5e1", lineHeight: 21 },
  stack: { gap: 14 },
  statusBadge: { backgroundColor: "#f1f5f9", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusBadgeText: { color: "#475569", fontSize: 12, fontWeight: "900" },
  successText: { color: "#10201d", fontWeight: "900" },
  successToast: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#a7f3d0", borderRadius: 999, flexDirection: "row", gap: 8, minHeight: 44, paddingHorizontal: 14 },
  tabRow: { gap: 8, paddingRight: 16 },
  timeline: { gap: 10 },
  timelineIcon: { alignItems: "center", borderRadius: 16, height: 46, justifyContent: "center", width: 46 }
});
