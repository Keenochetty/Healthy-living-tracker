import { Href, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BabyBottomSheet } from "@/components/baby-child/BabyBottomSheet";
import { BabyGrowthSection } from "@/components/baby-child/BabyGrowthSection";
import { BabyHealthSection } from "@/components/baby-child/BabyHealthSection";
import { BabyMilestonesSection } from "@/components/baby-child/BabyMilestonesSection";
import { BabyOverview } from "@/components/baby-child/BabyOverview";
import { BabyProfileSummary } from "@/components/baby-child/BabyProfileSummary";
import { BabyRealmOverviewSections } from "@/components/baby-child/BabyRealmOverviewSections";
import type { BabyQuickLogMode } from "@/components/baby-child/BabyQuickLogGrid";
import {
  DateWheelPicker,
  ManualEntryToggle,
  NumberWheelPicker,
  PresetChipGroup,
  QuickNoteField,
  QuickSaveButton,
  TimeWheelPicker
} from "@/components/fitness/QuickWorkoutInputs";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { FloatingAssistantButton, FloatingBottomNav } from "@/components/navigation";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import {
  calculateBabySleepSummary,
  calculateFeedingSummary,
  calculateGrowthTrend,
  createBabyChildProfile,
  createBabyDiaperLog,
  createBabyFeedingLog,
  createBabyGrowthLog,
  createBabyMedicineLog,
  createBabyMilestoneLog,
  createBabySleepLog,
  createBabySolidFoodLog,
  createBabyVaccineRecord,
  getAllergenWatchSummary,
  getBabyCareSummary,
  getBabyChildProfiles,
  getBabyDiaperLogsByDate,
  getBabyEventsForChildByDate,
  getBabyFeedingLogsByDate,
  getBabyGrowthLogs,
  getBabyMedicineLogs,
  getBabyMilestoneLogs,
  getBabyReportSummary,
  getBabySleepLogsByDate,
  getBabySolidFoodLogs,
  getBabyVaccineRecords,
  getMilestoneChecklistByAge,
  getTrustedBabyLearnCards,
  transitionPregnancyToBabyProfile,
  updateBabyChildProfile
} from "@/lib/babyChildStorage";
import type {
  BabyCalendarEvent,
  BabyChildProfile,
  BabyFeedingLog,
  BabyFeedingType,
  BabyLearnCard,
  BabyMedicineLog,
  BabyReportSummary,
  BabySolidFoodLog,
  ChildMilestone,
  DiaperLog,
  DiaperType,
  GrowthMeasurement,
  MilestoneCategory,
  MilestoneStatus,
  VaccinationRecord
} from "@/types/child";

type BabyTab = "overview" | "growth" | "milestones" | "health" | "more";

type SheetMode = BabyQuickLogMode | null;

const TABS: Array<{ key: BabyTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "growth", label: "Growth" },
  { key: "milestones", label: "Milestones" },
  { key: "health", label: "Health" },
  { key: "more", label: "More" }
];

const FEEDING_TYPES: BabyFeedingType[] = ["breastfeeding", "bottle_formula", "bottle_breast_milk", "mixed", "pumping", "solids", "other"];
const DIAPER_TYPES: DiaperType[] = ["wet", "dirty", "mixed", "dry", "other"];
const FOOD_CATEGORIES = ["Fruit", "Vegetables", "Grains", "Protein", "Dairy", "Allergen foods", "Other"];
const ALLERGENS = ["Egg", "Milk", "Peanut", "Tree nuts", "Wheat", "Soy", "Fish", "Shellfish", "Sesame", "Other"];
const TODAY = getLocalDateKey(new Date());

const BABY_FOOTER =
  "Baby and child tracking is for organization and education only. It is not medical advice and does not replace a pediatrician, doctor, nurse, clinic, or healthcare professional.";
const FEEDING_FOOTER =
  "Feeding needs vary by baby. If you are concerned about feeding, weight gain, hydration, or reactions, speak to a pediatrician, clinic, nurse, or healthcare professional.";
const DIAPER_FOOTER =
  "If you are concerned about diapers, feeding, fever, or hydration, contact your pediatrician or clinic.";
const GROWTH_FOOTER =
  "Growth charts are tracking tools. A pediatrician or healthcare professional should interpret growth concerns.";
const MILESTONE_FOOTER =
  "Every child develops differently. If you are concerned about development, speak to a pediatrician or healthcare professional.";
const MEDICINE_FOOTER =
  "Always follow the medicine label or healthcare professional's instructions. This app does not calculate or recommend doses.";

type BabyRealmData = {
  careSummary: Awaited<ReturnType<typeof getBabyCareSummary>> | null;
  diaperLogs: DiaperLog[];
  events: BabyCalendarEvent[];
  feedingLogs: BabyFeedingLog[];
  growthLogs: GrowthMeasurement[];
  learnCards: BabyLearnCard[];
  medicineLogs: BabyMedicineLog[];
  milestoneChecklist: Awaited<ReturnType<typeof getMilestoneChecklistByAge>>;
  milestoneLogs: ChildMilestone[];
  report: BabyReportSummary | null;
  sleepLogs: Awaited<ReturnType<typeof getBabySleepLogsByDate>>;
  solidsLogs: BabySolidFoodLog[];
  vaccineRecords: VaccinationRecord[];
};

const EMPTY_DATA: BabyRealmData = {
  careSummary: null,
  diaperLogs: [],
  events: [],
  feedingLogs: [],
  growthLogs: [],
  learnCards: [],
  medicineLogs: [],
  milestoneChecklist: [],
  milestoneLogs: [],
  report: null,
  sleepLogs: [],
  solidsLogs: [],
  vaccineRecords: []
};

export default function BabyChildRealm() {
  const params = useLocalSearchParams<{ childId?: string; fromPregnancy?: string; tab?: string }>();
  const [activeTab, setActiveTab] = useState<BabyTab>(toTab(params.tab));
  const [profiles, setProfiles] = useState<BabyChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(asParam(params.childId));
  const [data, setData] = useState<BabyRealmData>(EMPTY_DATA);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isCaregiverView] = useState(false);
  const loadRequestRef = useRef(0);
  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedChildId) ?? profiles[0],
    [profiles, selectedChildId]
  );

  const loadRealm = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    setIsLoading(true);
    setLoadError("");
    const nextProfiles = await getBabyChildProfiles();
    const nextSelectedId = selectedChildId ?? asParam(params.childId) ?? nextProfiles[0]?.id;
    const selected = nextProfiles.find((profile) => profile.id === nextSelectedId) ?? nextProfiles[0];
    if (requestId !== loadRequestRef.current) return;
    setProfiles(nextProfiles);
    setSelectedChildId(selected?.id);

    if (!selected) {
      const learnCards = await getTrustedBabyLearnCards();
      if (requestId !== loadRequestRef.current) return;
      setData({ ...EMPTY_DATA, learnCards });
      setIsLoading(false);
      return;
    }

    const ageMonths = getAgeMonths(selected.dateOfBirth);
    const [
      careSummary,
      feedingLogs,
      sleepLogs,
      diaperLogs,
      growthLogs,
      milestoneLogs,
      milestoneChecklist,
      solidsLogs,
      medicineLogs,
      vaccineRecords,
      report,
      learnCards,
      events
    ] = await Promise.all([
      getBabyCareSummary(selected.id),
      getBabyFeedingLogsByDate(selected.id, TODAY),
      getBabySleepLogsByDate(selected.id, TODAY),
      getBabyDiaperLogsByDate(selected.id, TODAY),
      getBabyGrowthLogs(selected.id),
      getBabyMilestoneLogs(selected.id),
      getMilestoneChecklistByAge(selected.id, ageMonths || 2),
      getBabySolidFoodLogs(selected.id),
      getBabyMedicineLogs(selected.id),
      getBabyVaccineRecords(selected.id),
      getBabyReportSummary(selected.id, "today"),
      getTrustedBabyLearnCards(),
      getBabyEventsForChildByDate(selected.id, TODAY)
    ]);

    if (requestId !== loadRequestRef.current) return;
    setData({
      careSummary,
      diaperLogs,
      events: enrichBabyEvents(events, feedingLogs, sleepLogs, diaperLogs, medicineLogs),
      feedingLogs,
      growthLogs,
      learnCards,
      medicineLogs,
      milestoneChecklist,
      milestoneLogs,
      report,
      sleepLogs,
      solidsLogs,
      vaccineRecords
    });
    setIsLoading(false);
  }, [params.childId, selectedChildId]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve().then(loadRealm).catch(() => {
        setLoadError("Could not load Baby Care right now.");
        setIsLoading(false);
      });
    }, [loadRealm])
  );

  async function afterSaved(message: string) {
    setToast(message);
    setSheetMode(null);
    await loadRealm();
  }

  function selectProfile(id: string) {
    if (id === selectedChildId) return;
    loadRequestRef.current += 1;
    setSheetMode(null);
    setToast("");
    setLoadError("");
    setData(EMPTY_DATA);
    setIsLoading(true);
    setSelectedChildId(id);
  }

  if (isLoading && !selectedProfile) {
    return (
      <>
        <AppMainLayout subtitle="Private baby care tracker" title="Baby / Child">
          <BabyLoadingState />
        </AppMainLayout>
        <BabyChildNavOverlay />
      </>
    );
  }

  if (!selectedProfile) {
    return (
      <>
        <AppMainLayout subtitle="Private parent/guardian setup" title="Baby / Child">
          <SetupState
            fromPregnancy={params.fromPregnancy === "1"}
            onCreated={async (profile) => {
              setSelectedChildId(profile.id);
              await loadRealm();
            }}
          />
          <Footer text={BABY_FOOTER} />
        </AppMainLayout>
        <BabyChildNavOverlay />
      </>
    );
  }

  return (
    <>
      <AppMainLayout showHeader={false}>
        <BabyProfileSummary
          isCaregiverView={isCaregiverView}
          onSelectProfile={selectProfile}
          profile={selectedProfile}
          profiles={profiles}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {TABS.map((tab) => (
            <Chip key={tab.key} label={tab.label} onPress={() => setActiveTab(tab.key)} selected={activeTab === tab.key} />
          ))}
        </ScrollView>

        {toast ? <SuccessToast message={toast} onDismiss={() => setToast("")} /> : null}
        {isCaregiverView ? (
          <AppCard style={styles.caregiverCard}>
            <Text style={styles.caregiverText}>You are viewing assigned care information.</Text>
          </AppCard>
        ) : null}

        {activeTab === "overview" ? (
          <>
            <BabyOverview
              care={{
                diaperCount: data.diaperLogs.length,
                dirtyDiaperCount: data.diaperLogs.filter((log) => log.diaperType === "dirty" || log.diaperType === "mixed").length,
                feedCount: data.careSummary?.feeding.count ?? 0,
                feedTotalMl: data.careSummary?.feeding.totalAmountMl ?? 0,
                growthLatest: data.careSummary?.growth?.weight ? `${data.careSummary.growth.weight} kg` : undefined,
                lastDiaper: data.careSummary?.diaper,
                lastFeed: data.careSummary?.feeding.latest ? {
                  amountMl: data.careSummary.feeding.latest.finishedAmountMl,
                  loggedAt: data.careSummary.feeding.latest.loggedAt
                } : undefined,
                lastSleep: data.careSummary?.sleep.latest ? {
                  durationMinutes: data.careSummary.sleep.latest.durationMinutes,
                  loggedAt: data.careSummary.sleep.latest.loggedAt
                } : undefined,
                medicineDueCount: data.careSummary?.medicineDueCount ?? 0,
                nextReminder: getNextReminder(data),
                sleepBlockCount: data.sleepLogs.length,
                sleepMinutes: data.careSummary?.sleep.totalMinutes ?? 0,
                wetDiaperCount: data.diaperLogs.filter((log) => log.diaperType === "wet" || log.diaperType === "mixed").length,
              }}
              childProfileId={selectedProfile.id}
              error={loadError}
              events={data.events}
              isLoading={isLoading}
              onRetry={loadRealm}
              onSheet={setSheetMode}
            />
            <BabyRealmOverviewSections
              growthLogs={data.growthLogs}
              milestones={data.milestoneLogs}
              nextReminder={getNextReminder(data)}
              onAddGrowth={() => setSheetMode("growth")}
              onAddVaccine={() => setSheetMode("vaccine")}
              onOpenGrowth={() => setActiveTab("growth")}
              onOpenHealth={() => setActiveTab("health")}
              onOpenMilestones={() => setActiveTab("milestones")}
              onOpenRecords={() => router.push("/records" as Href)}
              vaccines={data.vaccineRecords}
            />
          </>
        ) : null}
        {activeTab === "growth" ? <GrowthTab data={data} onSheet={setSheetMode} /> : null}
        {activeTab === "milestones" ? <MilestonesTab data={data} onSaved={afterSaved} profile={selectedProfile} /> : null}
        {activeTab === "health" ? (
          <BabyHealthSection
            onAddVaccine={() => setSheetMode("vaccine")}
            onMedicine={() => setSheetMode("medicine")}
            onRecords={() => router.push("/records" as Href)}
            onSchedule={() => router.push("/health-calendar" as Href)}
            vaccineRecords={data.vaccineRecords}
          />
        ) : null}
        {activeTab === "more" ? (
          <View style={styles.stack}>
            <FeedingTab data={data} onSheet={setSheetMode} />
            <SleepTab data={data} onSheet={setSheetMode} />
            <DiapersTab data={data} onSheet={setSheetMode} />
            <SolidsTab data={data} onSheet={setSheetMode} />
            <ReportsTab data={data} />
            <LearnTab cards={data.learnCards} />
            <SettingsTab key={selectedProfile.id} onSaved={afterSaved} profile={selectedProfile} />
          </View>
        ) : null}

        {activeTab !== "overview" ? <Footer text={BABY_FOOTER} /> : null}

        <FeedSheet key={`${selectedProfile.id}-feed-${sheetMode === "feed"}`} childId={selectedProfile.id} childName={selectedProfile.displayName} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "feed"} />
        <SleepSheet key={`${selectedProfile.id}-sleep-${sheetMode === "sleep"}`} childId={selectedProfile.id} childName={selectedProfile.displayName} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "sleep"} />
        <DiaperSheet key={`${selectedProfile.id}-diaper-${sheetMode === "diaper"}`} childId={selectedProfile.id} childName={selectedProfile.displayName} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "diaper"} />
        <GrowthSheet key={`${selectedProfile.id}-growth-${sheetMode === "growth"}`} childId={selectedProfile.id} childName={selectedProfile.displayName} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "growth"} />
        <SolidFoodSheet key={`${selectedProfile.id}-solid-${sheetMode === "solid"}`} childId={selectedProfile.id} childName={selectedProfile.displayName} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "solid"} />
        <MedicineSheet key={`${selectedProfile.id}-medicine-${sheetMode === "medicine"}`} childId={selectedProfile.id} childName={selectedProfile.displayName} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "medicine"} />
        <VaccineSheet key={`${selectedProfile.id}-vaccine-${sheetMode === "vaccine"}`} childId={selectedProfile.id} childName={selectedProfile.displayName} onClose={() => setSheetMode(null)} onSaved={afterSaved} visible={sheetMode === "vaccine"} />
        <NoteSheet key={`${selectedProfile.id}-note-${sheetMode === "note"}`} childName={selectedProfile.displayName} onClose={() => setSheetMode(null)} onSaved={afterSaved} profile={selectedProfile} visible={sheetMode === "note"} />
      </AppMainLayout>
      <BabyChildNavOverlay />
    </>
  );
}

function FeedingTab({ data, onSheet }: { data: BabyRealmData; onSheet: (mode: SheetMode) => void }) {
  return (
    <SectionFrame
      button="Log feed"
      empty={!data.feedingLogs.length ? { message: "Log the first feed when you are ready.", title: "Start feeding tracking" } : undefined}
      footer={FEEDING_FOOTER}
      onPress={() => onSheet("feed")}
      subtitle="Bottle, breastfeeding, pumping, solids and notes."
      title="Feeding"
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Last feed" value={data.careSummary?.feeding.latest ? formatAgo(data.careSummary.feeding.latest.loggedAt) : "Start today"} />
        <MetricCard label="Feed count" value={`${data.careSummary?.feeding.count ?? 0}`} />
        <MetricCard label="Bottle total" value={`${data.careSummary?.feeding.totalAmountMl ?? 0} ml`} />
        <MetricCard label="Notes" value={data.feedingLogs.some((log) => log.notes) ? "Added" : "Optional"} />
      </View>
      <List items={data.feedingLogs.map((log) => `${formatValue(log.feedingType ?? log.feedType)} - ${log.finishedAmountMl ?? log.durationMinutes ?? ""}${log.finishedAmountMl ? " ml" : " min"} - ${formatAgo(log.loggedAt)}`)} />
    </SectionFrame>
  );
}

function SleepTab({ data, onSheet }: { data: BabyRealmData; onSheet: (mode: SheetMode) => void }) {
  return (
    <SectionFrame
      button="Log sleep"
      empty={!data.sleepLogs.length ? { message: "Add naps or night sleep when it helps.", title: "Start sleep tracking" } : undefined}
      footer="Sleep logs are for organization only. They do not diagnose sleep issues or provide rigid schedules."
      onPress={() => onSheet("sleep")}
      subtitle="Naps, night sleep, duration and notes."
      title="Sleep"
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Sleep today" value={formatMinutes(data.careSummary?.sleep.totalMinutes ?? 0)} />
        <MetricCard label="Nap count" value={`${data.careSummary?.sleep.napCount ?? 0}`} />
        <MetricCard label="Last sleep" value={data.careSummary?.sleep.latest ? formatAgo(data.careSummary.sleep.latest.loggedAt) : "Start today"} />
      </View>
      <ChartCard title="Sleep blocks" values={data.sleepLogs.map((log) => Math.min(1, log.durationMinutes / 180))} />
      <List items={data.sleepLogs.map((log) => `${formatValue(log.sleepType ?? "unknown")} - ${formatMinutes(log.durationMinutes)} - ${formatAgo(log.loggedAt)}`)} />
    </SectionFrame>
  );
}

function DiapersTab({ data, onSheet }: { data: BabyRealmData; onSheet: (mode: SheetMode) => void }) {
  return (
    <SectionFrame
      button="Log diaper"
      empty={!data.diaperLogs.length ? { message: "Add wet, dirty, or mixed diaper notes.", title: "Track diapers if helpful" } : undefined}
      footer={DIAPER_FOOTER}
      onPress={() => onSheet("diaper")}
      subtitle="Wet, dirty, mixed, dry and optional notes."
      title="Diapers"
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Last diaper" value={data.careSummary?.diaper ? `${formatValue(data.careSummary.diaper.diaperType)} - ${formatAgo(data.careSummary.diaper.loggedAt)}` : "Start today"} />
        <MetricCard label="Today count" value={`${data.diaperLogs.length}`} />
      </View>
      <ChartCard title="Diaper count" values={DIAPER_TYPES.map((type) => data.diaperLogs.filter((log) => log.diaperType === type).length / Math.max(1, data.diaperLogs.length))} />
      <List items={data.diaperLogs.map((log) => `${formatValue(log.diaperType)} - ${formatAgo(log.loggedAt)}${log.notes ? ` - ${log.notes}` : ""}`)} />
    </SectionFrame>
  );
}

function GrowthTab({ data, onSheet }: { data: BabyRealmData; onSheet: (mode: SheetMode) => void }) {
  return <BabyGrowthSection logs={data.growthLogs} onAdd={() => onSheet("growth")} />;
}

function MilestonesTab({ data, onSaved, profile }: { data: BabyRealmData; onSaved: (message: string) => void; profile: BabyChildProfile }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MilestoneCategory>("social_emotional");
  const [status, setStatus] = useState<MilestoneStatus>("observed");
  const [ageCheckpointMonths, setAgeCheckpointMonths] = useState(getAgeMonths(profile.dateOfBirth) || 2);
  const [notes, setNotes] = useState("");

  async function saveMilestone() {
    if (!title.trim()) return;
    await createBabyMilestoneLog({ ageCheckpointMonths, category, childProfileId: profile.id, notes, status, title });
    setTitle("");
    setNotes("");
    await onSaved("Milestone note saved");
  }

  return (
    <BabyMilestonesSection
      ageCheckpointMonths={ageCheckpointMonths}
      category={category}
      checklist={data.milestoneChecklist}
      logs={data.milestoneLogs}
      notes={notes}
      onAgeChange={setAgeCheckpointMonths}
      onCategoryChange={setCategory}
      onNotesChange={setNotes}
      onSave={saveMilestone}
      onStatusChange={setStatus}
      onTitleChange={setTitle}
      status={status}
      title={title}
    />
  );
}

function SolidsTab({ data, onSheet }: { data: BabyRealmData; onSheet: (mode: SheetMode) => void }) {
  return (
    <SectionFrame
      button="Add food"
      empty={!data.solidsLogs.length ? { message: "Track foods tried, textures, and notes.", title: "Start first foods tracking" } : undefined}
      footer="If you suspect an allergic reaction or your child has severe symptoms, seek urgent medical help. For food introduction questions, speak to a pediatrician or healthcare professional."
      onPress={() => onSheet("solid")}
      subtitle="Foods tried, texture, reaction notes and allergen category."
      title="Solids"
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Foods tried" value={`${data.careSummary?.solids.triedCount ?? 0}`} />
        <MetricCard label="Reaction notes" value={`${data.careSummary?.solids.reactionCount ?? 0}`} />
      </View>
      <SolidsGrid logs={data.solidsLogs} />
      <List items={data.solidsLogs.slice(0, 8).map((log) => `${log.foodName} - ${log.allergenCategory ?? "Food"} - ${formatValue(log.likedStatus ?? "unknown")}`)} />
    </SectionFrame>
  );
}

function MedicineTab({ data, onSheet }: { data: BabyRealmData; onSheet: (mode: SheetMode) => void }) {
  return (
    <SectionFrame
      button="Add medicine log"
      empty={!data.medicineLogs.length ? { message: "Medicine logs will appear here when added from label or healthcare instructions.", title: "Track medicine carefully" } : undefined}
      footer={MEDICINE_FOOTER}
      onPress={() => onSheet("medicine")}
      subtitle="Label instruction notes, status, records, and care details."
      title="Medicine"
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Due" value={`${data.medicineLogs.filter((log) => log.status === "due").length}`} />
        <MetricCard label="Taken" value={`${data.medicineLogs.filter((log) => log.status === "taken").length}`} />
      </View>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Medicine instructions</Text>
        <Text style={styles.darkMuted}>Keep label or healthcare professional instructions with the log. No dose calculation is provided.</Text>
      </AppCard>
      <List items={data.medicineLogs.slice(0, 8).map((log) => `${log.medicineName} - ${formatValue(log.status)}${log.doseInstruction ? ` - ${log.doseInstruction}` : ""}`)} />
    </SectionFrame>
  );
}

function VaccinesTab({ data, onSheet }: { data: BabyRealmData; onSheet: (mode: SheetMode) => void }) {
  return (
    <SectionFrame
      button="Add vaccine record"
      empty={!data.vaccineRecords.length ? { message: "Vaccine records from your clinic card will appear here.", title: "Add vaccine records" } : undefined}
      footer="Use this to record vaccine information from your clinic card or healthcare provider."
      onPress={() => onSheet("vaccine")}
      subtitle="Clinic card details, next date, batch number, and notes."
      title="Vaccines"
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Records" value={`${data.vaccineRecords.length}`} />
        <MetricCard label="Next date" value={data.vaccineRecords.find((record) => record.nextDoseDate)?.nextDoseDate ?? "Set up when ready"} />
      </View>
      <List items={data.vaccineRecords.slice(0, 8).map((record) => `${record.vaccineName} - ${record.dateReceived ?? record.completedDate ?? record.status}`)} />
    </SectionFrame>
  );
}

function RecordsTab({ profile }: { profile: BabyChildProfile }) {
  const recordTypes = ["Birth record", "Clinic card", "Vaccine card", "Doctor note", "Prescription", "Lab result", "Growth chart", "Feeding plan", "Allergy note", "Hospital document", "Other"];
  return (
    <View style={styles.stack}>
      <AppSection title="Records" subtitle="Private documents linked to the Records realm." />
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Baby records for {profile.displayName}</Text>
        <Text style={styles.darkMuted}>Birth records, clinic cards, vaccine cards, prescriptions, lab results, feeding plans, and notes stay private unless shared through Family permissions.</Text>
        <View style={styles.actionRow}><GhostButton label="Add document" onPress={() => router.push("/records" as Href)} /></View>
      </AppCard>
      <View style={styles.recordGrid}>{recordTypes.map((type) => <RecordTypeCard key={type} label={type} />)}</View>
      <Footer text="Records organize documents only. Lab and scan results should be reviewed with a healthcare professional." />
    </View>
  );
}

function ReportsTab({ data }: { data: BabyRealmData }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Reports" subtitle="Compact summaries based on your baby logs." />
      <View style={styles.metricGrid}>
        <MetricCard label="Feeding summary" value={`${data.report?.feedingCount ?? 0} feeds`} />
        <MetricCard label="Sleep summary" value={formatMinutes(data.report?.totalSleepMinutes ?? 0)} />
        <MetricCard label="Diaper summary" value={`${data.report?.diaperCount ?? 0}`} />
        <MetricCard label="Latest weight" value={data.report?.latestWeightKg ? `${data.report.latestWeightKg} kg` : "Start today"} />
        <MetricCard label="Solids tried" value={`${data.report?.solidsTriedCount ?? 0}`} />
        <MetricCard label="Medicine logs" value={`${data.report?.medicineLogsCount ?? 0}`} />
      </View>
      <ChartCard title="Feed timeline" values={data.feedingLogs.map(() => 0.65)} />
      <ChartCard title="Sleep blocks" values={data.sleepLogs.map((log) => Math.min(1, log.durationMinutes / 180))} />
      <ChartCard title="Diaper count" values={DIAPER_TYPES.map((type) => data.diaperLogs.filter((log) => log.diaperType === type).length / Math.max(1, data.diaperLogs.length))} />
      <SolidsGrid logs={data.solidsLogs} />
      <Footer text="Reports are based on your logs and are for discussion with your pediatrician if concerned." />
    </View>
  );
}

function LearnTab({ cards }: { cards: BabyLearnCard[] }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Learn" subtitle="Trusted source-backed educational cards." />
      {cards.map((card) => <LearnCard card={card} key={card.id} />)}
    </View>
  );
}

function SettingsTab({ onSaved, profile }: { onSaved: (message: string) => void; profile: BabyChildProfile }) {
  const [medicalNotes, setMedicalNotes] = useState(profile.medicalNotes ?? "");
  const [privacy, setPrivacy] = useState(profile.privacy ?? "private");

  async function save() {
    await updateBabyChildProfile(profile.id, { medicalNotes, privacy });
    await onSaved("Settings saved");
  }

  return (
    <View style={styles.stack}>
      <AppSection title="Settings" subtitle="Private by default and parent/guardian managed." />
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Privacy</Text>
        <View style={styles.chipRow}>
          <Chip label="Private by default" onPress={() => setPrivacy("private")} selected={privacy === "private"} />
          <Chip label="Shared selected" onPress={() => setPrivacy("shared_selected")} selected={privacy === "shared_selected"} />
        </View>
        <QuickNoteField onChangeText={setMedicalNotes} value={medicalNotes} />
        <QuickSaveButton onPress={save} title="Save settings" />
      </AppCard>
      <AppCard style={styles.caregiverCard}>
        <Text style={styles.caregiverText}>Caregivers only see the care information you allow.</Text>
      </AppCard>
    </View>
  );
}

function SectionFrame({
  button,
  children,
  empty,
  footer,
  onPress,
  subtitle,
  title
}: {
  button: string;
  children: React.ReactNode;
  empty?: { message: string; title: string };
  footer: string;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.stack}>
      <AppSection title={title} subtitle={subtitle} />
      {empty ? <PremiumEmptyState button={button} message={empty.message} onPress={onPress} title={empty.title} /> : null}
      <View style={styles.actionRow}><AppButton onPress={onPress} title={button} /></View>
      {children}
      <Footer text={footer} />
    </View>
  );
}

function FeedSheet({ childId, childName, onClose, onSaved, visible }: SheetProps) {
  const [feedingType, setFeedingType] = useState<BabyFeedingType>("bottle_formula");
  const [side, setSide] = useState<"left" | "right" | "both" | "not_applicable">("not_applicable");
  const [amountMl, setAmountMl] = useState(90);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState("90");
  const [notes, setNotes] = useState("");

  async function save() {
    const isBottle = feedingType === "bottle_formula" || feedingType === "bottle_breast_milk" || feedingType === "pumping";
    await createBabyFeedingLog({
      amountMl: isBottle ? (manualMode ? Number(manualValue) || 0 : amountMl) : undefined,
      childProfileId: childId,
      durationMinutes: isBottle ? undefined : (manualMode ? Number(manualValue) || 0 : durationMinutes),
      feedingType,
      notes,
      side
    });
    await onSaved("Feed logged");
  }

  return (
    <BabyQuickLogSheet childName={childName} onClose={onClose} onSave={save} saveTitle="Save feed" title="Log feed" visible={visible}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{FEEDING_TYPES.map((type) => <Chip key={type} label={formatValue(type)} onPress={() => setFeedingType(type)} selected={feedingType === type} />)}</ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{(["left", "right", "both", "not_applicable"] as const).map((value) => <Chip key={value} label={formatValue(value)} onPress={() => setSide(value)} selected={side === value} />)}</ScrollView>
      <ManualEntryToggle enabled={manualMode} onToggle={() => setManualMode((current) => !current)} />
      {manualMode ? (
        <TextInput keyboardType="numeric" onChangeText={setManualValue} placeholder="Amount ml or minutes" placeholderTextColor="#94a3b8" style={styles.darkInput} value={manualValue} />
      ) : feedingType === "bottle_formula" || feedingType === "bottle_breast_milk" || feedingType === "pumping" ? (
        <>
          <PresetChipGroup onSelect={setAmountMl} presets={[60, 90, 120, 150]} selectedValue={amountMl} suffix="ml" />
          <NumberWheelPicker max={240} min={30} onChange={setAmountMl} step={10} suffix="ml" value={amountMl} />
        </>
      ) : (
        <>
          <PresetChipGroup onSelect={setDurationMinutes} presets={[5, 10, 15, 20, 30]} selectedValue={durationMinutes} suffix="m" />
          <TimeWheelPicker onChange={setDurationMinutes} valueMinutes={durationMinutes} />
        </>
      )}
      <QuickNoteField onChangeText={setNotes} value={notes} />
    </BabyQuickLogSheet>
  );
}

function SleepSheet({ childId, childName, onClose, onSaved, visible }: SheetProps) {
  const [sleepType, setSleepType] = useState<"nap" | "night" | "unknown">("nap");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [notes, setNotes] = useState("");
  async function save() {
    await createBabySleepLog({ childProfileId: childId, durationMinutes, notes, sleepType });
    await onSaved("Sleep logged");
  }
  return (
    <BabyQuickLogSheet childName={childName} onClose={onClose} onSave={save} saveTitle="Save sleep" title="Log sleep" visible={visible}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{(["nap", "night", "unknown"] as const).map((type) => <Chip key={type} label={formatValue(type)} onPress={() => setSleepType(type)} selected={sleepType === type} />)}</ScrollView>
      <PresetChipGroup onSelect={setDurationMinutes} presets={[20, 30, 45, 60, 90, 120]} selectedValue={durationMinutes} suffix="m" />
      <TimeWheelPicker onChange={setDurationMinutes} valueMinutes={durationMinutes} />
      <QuickNoteField onChangeText={setNotes} value={notes} />
    </BabyQuickLogSheet>
  );
}

function DiaperSheet({ childId, childName, onClose, onSaved, visible }: SheetProps) {
  const [diaperType, setDiaperType] = useState<DiaperType>("wet");
  const [color, setColor] = useState("");
  const [texture, setTexture] = useState("");
  const [notes, setNotes] = useState("");
  async function save() {
    await createBabyDiaperLog({ childProfileId: childId, color, diaperType, notes, texture });
    await onSaved("Diaper logged");
  }
  return (
    <BabyQuickLogSheet childName={childName} onClose={onClose} onSave={save} saveTitle="Save diaper" title="Log diaper" visible={visible}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{DIAPER_TYPES.map((type) => <Chip key={type} label={formatValue(type)} onPress={() => setDiaperType(type)} selected={diaperType === type} />)}</ScrollView>
      <TextInput onChangeText={setColor} placeholder="Color optional" placeholderTextColor="#94a3b8" style={styles.darkInput} value={color} />
      <TextInput onChangeText={setTexture} placeholder="Texture optional" placeholderTextColor="#94a3b8" style={styles.darkInput} value={texture} />
      <QuickNoteField onChangeText={setNotes} value={notes} />
    </BabyQuickLogSheet>
  );
}

function GrowthSheet({ childId, childName, onClose, onSaved, visible }: SheetProps) {
  const [weightKg, setWeightKg] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState("");
  const [source, setSource] = useState<"home" | "clinic" | "pediatrician" | "other">("home");
  const [date, setDate] = useState(TODAY);
  const [notes, setNotes] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  async function save() {
    if (!weightKg.trim() && !lengthCm.trim() && !headCircumferenceCm.trim()) {
      setValidationMessage("Add at least one measurement before saving.");
      return;
    }
    setValidationMessage("");
    await createBabyGrowthLog({ childProfileId: childId, headCircumferenceCm: toNumber(headCircumferenceCm), lengthCm: toNumber(lengthCm), measuredAt: `${date}T12:00:00.000Z`, measurementSource: source, notes, weightKg: toNumber(weightKg) });
    await onSaved("Growth measurement saved");
  }
  return (
    <BabyQuickLogSheet childName={childName} onClose={onClose} onSave={save} saveTitle="Save measurement" title="Add growth measurement" visible={visible}>
      <View style={styles.inputGrid}>
        <TextInput keyboardType="decimal-pad" onChangeText={setWeightKg} placeholder="Weight kg" placeholderTextColor="#94a3b8" style={styles.darkInput} value={weightKg} />
        <TextInput keyboardType="decimal-pad" onChangeText={setLengthCm} placeholder="Length cm" placeholderTextColor="#94a3b8" style={styles.darkInput} value={lengthCm} />
        <TextInput keyboardType="decimal-pad" onChangeText={setHeadCircumferenceCm} placeholder="Head cm" placeholderTextColor="#94a3b8" style={styles.darkInput} value={headCircumferenceCm} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{(["home", "clinic", "pediatrician", "other"] as const).map((item) => <Chip key={item} label={formatValue(item)} onPress={() => setSource(item)} selected={source === item} />)}</ScrollView>
      <DateWheelPicker onChange={setDate} value={date} />
      <QuickNoteField onChangeText={setNotes} value={notes} />
      {validationMessage ? <Text style={styles.validationText}>{validationMessage}</Text> : null}
      <Text style={styles.sheetText}>{GROWTH_FOOTER}</Text>
    </BabyQuickLogSheet>
  );
}

function SolidFoodSheet({ childId, childName, onClose, onSaved, visible }: SheetProps) {
  const [foodName, setFoodName] = useState("");
  const [texture, setTexture] = useState("");
  const [category, setCategory] = useState("Fruit");
  const [allergenCategory, setAllergenCategory] = useState("");
  const [likedStatus, setLikedStatus] = useState<"liked" | "neutral" | "disliked" | "unknown">("unknown");
  const [reactionNote, setReactionNote] = useState("");
  const [notes, setNotes] = useState("");
  async function save() {
    if (!foodName.trim()) return;
    await createBabySolidFoodLog({ allergenCategory: allergenCategory || category, childProfileId: childId, foodName, likedStatus, notes, reactionNote, texture, triedAt: new Date().toISOString() });
    await onSaved("Solid food saved");
  }
  return (
    <BabyQuickLogSheet childName={childName} onClose={onClose} onSave={save} saveTitle="Save food" title="Add solid food" visible={visible}>
      <TextInput onChangeText={setFoodName} placeholder="Food tried" placeholderTextColor="#94a3b8" style={styles.darkInput} value={foodName} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{FOOD_CATEGORIES.map((item) => <Chip key={item} label={item} onPress={() => setCategory(item)} selected={category === item} />)}</ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{ALLERGENS.map((item) => <Chip key={item} label={item} onPress={() => setAllergenCategory(item)} selected={allergenCategory === item} />)}</ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{(["liked", "neutral", "disliked", "unknown"] as const).map((item) => <Chip key={item} label={formatValue(item)} onPress={() => setLikedStatus(item)} selected={likedStatus === item} />)}</ScrollView>
      <TextInput onChangeText={setTexture} placeholder="Texture optional" placeholderTextColor="#94a3b8" style={styles.darkInput} value={texture} />
      <TextInput onChangeText={setReactionNote} placeholder="Reaction note optional" placeholderTextColor="#94a3b8" style={styles.darkInput} value={reactionNote} />
      <QuickNoteField onChangeText={setNotes} value={notes} />
    </BabyQuickLogSheet>
  );
}

function MedicineSheet({ childId, childName, onClose, onSaved, visible }: SheetProps) {
  const [medicineName, setMedicineName] = useState("");
  const [doseInstruction, setDoseInstruction] = useState("");
  const [status, setStatus] = useState<BabyMedicineLog["status"]>("noted");
  const [notes, setNotes] = useState("");
  async function save() {
    if (!medicineName.trim()) return;
    await createBabyMedicineLog({ childProfileId: childId, doseInstruction, loggedAt: new Date().toISOString(), medicineName, notes, status });
    await onSaved("Medicine log saved");
  }
  return (
    <BabyQuickLogSheet childName={childName} onClose={onClose} onSave={save} saveTitle="Save medicine log" title="Baby medicine" visible={visible}>
      <TextInput onChangeText={setMedicineName} placeholder="Medicine name" placeholderTextColor="#94a3b8" style={styles.darkInput} value={medicineName} />
      <TextInput onChangeText={setDoseInstruction} placeholder="Label/instruction note" placeholderTextColor="#94a3b8" style={styles.darkInput} value={doseInstruction} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{(["due", "taken", "skipped", "missed", "snoozed", "noted"] as BabyMedicineLog["status"][]).map((item) => <Chip key={item} label={formatValue(item)} onPress={() => setStatus(item)} selected={status === item} />)}</ScrollView>
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <Text style={styles.sheetText}>{MEDICINE_FOOTER}</Text>
    </BabyQuickLogSheet>
  );
}

function VaccineSheet({ childId, childName, onClose, onSaved, visible }: SheetProps) {
  const [vaccineName, setVaccineName] = useState("");
  const [dateReceived, setDateReceived] = useState(TODAY);
  const [doseNumber, setDoseNumber] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [recordSource, setRecordSource] = useState<NonNullable<VaccinationRecord["recordSource"]>>("clinic_card");
  const [routeOrSite, setRouteOrSite] = useState<NonNullable<VaccinationRecord["routeOrSite"]>>("not_sure");
  const [notes, setNotes] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  async function save() {
    if (!vaccineName.trim()) {
      setValidationMessage("Add the vaccine name before saving.");
      return;
    }
    setValidationMessage("");
    await createBabyVaccineRecord({ batchNumber, childId, clinicLocation, dateReceived, doseNumber, notes, recordSource, routeOrSite, status: "completed", vaccineName });
    await onSaved("Vaccine record saved");
  }
  return (
    <BabyQuickLogSheet childName={childName} onClose={onClose} onSave={save} saveTitle="Save vaccine" title="Vaccine record" visible={visible}>
      <TextInput onChangeText={setVaccineName} placeholder="Vaccine name" placeholderTextColor="#94a3b8" style={styles.darkInput} value={vaccineName} />
      <DateWheelPicker onChange={setDateReceived} value={dateReceived} />
      <View style={styles.inputGrid}>
        <TextInput onChangeText={setDoseNumber} placeholder="Dose number" placeholderTextColor="#94a3b8" style={styles.darkInput} value={doseNumber} />
        <TextInput onChangeText={setBatchNumber} placeholder="Batch number" placeholderTextColor="#94a3b8" style={styles.darkInput} value={batchNumber} />
      </View>
      <TextInput onChangeText={setClinicLocation} placeholder="Clinic/location" placeholderTextColor="#94a3b8" style={styles.darkInput} value={clinicLocation} />
      <Text style={styles.sheetText}>Record source</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{(["clinic_card", "healthcare_provider", "parent_note", "unknown"] as const).map((item) => <Chip key={item} label={formatValue(item)} onPress={() => setRecordSource(item)} selected={recordSource === item} />)}</ScrollView>
      <Text style={styles.sheetText}>Route or site, if known</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{(["left_upper_arm", "right_upper_arm", "left_thigh", "right_thigh", "oral", "other", "not_sure"] as const).map((item) => <Chip key={item} label={formatValue(item)} onPress={() => setRouteOrSite(item)} selected={routeOrSite === item} />)}</ScrollView>
      <Text style={styles.sheetText}>Record the site if it appears on the clinic card or was given by your healthcare provider.</Text>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Clinic card or photo</Text>
        <Text style={styles.darkMuted}>Document linking will connect to Baby Records later.</Text>
      </AppCard>
      <QuickNoteField onChangeText={setNotes} value={notes} />
      {validationMessage ? <Text style={styles.validationText}>{validationMessage}</Text> : null}
      <Text style={styles.sheetText}>Use this to record vaccine information from your clinic card or healthcare provider. Vaccine schedules should be confirmed with your clinic, nurse, doctor, pharmacist, or healthcare professional.</Text>
    </BabyQuickLogSheet>
  );
}

function NoteSheet({ childName, onClose, onSaved, profile, visible }: { childName: string; onClose: () => void; onSaved: (message: string) => void; profile: BabyChildProfile; visible: boolean }) {
  const [note, setNote] = useState(profile.medicalNotes ?? "");
  async function save() {
    await updateBabyChildProfile(profile.id, { medicalNotes: note });
    await onSaved("Baby note saved");
  }
  return (
    <BabyQuickLogSheet childName={childName} onClose={onClose} onSave={save} saveTitle="Save note" title="Baby note" visible={visible}>
      <QuickNoteField onChangeText={setNote} value={note} />
    </BabyQuickLogSheet>
  );
}

function BabyQuickLogSheet({
  children,
  childName,
  onClose,
  onSave,
  saveTitle,
  title,
  visible
}: {
  children: React.ReactNode;
  childName: string;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  saveTitle: string;
  title: string;
  visible: boolean;
}) {
  return (
    <BabyBottomSheet
      onClose={onClose}
      onSave={onSave}
      saveTitle={saveTitle}
      subtitle={`${childName} · Now`}
      title={title}
      visible={visible}
    >
      {children}
    </BabyBottomSheet>
  );
}

type SheetProps = {
  childId: string;
  childName: string;
  onClose: () => void;
  onSaved: (message: string) => void;
  visible: boolean;
};

function SetupState({ fromPregnancy, onCreated }: { fromPregnancy?: boolean; onCreated: (profile: BabyChildProfile) => void }) {
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(TODAY);

  async function createProfile() {
    if (!displayName.trim()) return;
    const profile = fromPregnancy
      ? await transitionPregnancyToBabyProfile({ birthDate: dateOfBirth, displayName: displayName.trim(), includeDueDate: true })
      : await createBabyChildProfile({ dateOfBirth, displayName: displayName.trim(), privacy: "private" });
    onCreated(profile as BabyChildProfile);
  }

  return (
    <View style={styles.stack}>
      <AppCard style={styles.heroCard}>
        <BabyAvatar label="Baby setup avatar" name={displayName || "Baby"} />
        <Text style={styles.heroTitle}>Set up Baby Care</Text>
        <Text style={styles.heroSubtitle}>Track feeds, sleep, diapers, growth, milestones, vaccines, and records when you are ready.</Text>
      </AppCard>
      <AppCard style={styles.darkCard}>
        <TextInput onChangeText={setDisplayName} placeholder="Baby or child name" placeholderTextColor="#94a3b8" style={styles.darkInput} value={displayName} />
        <DateWheelPicker onChange={setDateOfBirth} value={dateOfBirth} />
        <AppButton onPress={createProfile} title="Create baby profile" />
      </AppCard>
    </View>
  );
}

function BabyAvatar({ label, name }: { label: string; name: string }) {
  const initials = name.trim().slice(0, 2).toUpperCase() || "BB";
  return (
    <View accessibilityLabel={label} style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function LearnCard({ card }: { card: BabyLearnCard }) {
  const hasSource = Boolean(card.sourceUrl);
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{card.title}</Text>
      <Text style={styles.darkMuted}>{card.summary}</Text>
      <Text style={styles.sourceText}>{hasSource ? card.sourceOrganization : "Trusted source to be added."}</Text>
      <Text style={styles.sourceText}>Last checked: {card.lastCheckedAt}</Text>
      <Text style={styles.sourceText}>{hasSource ? "Open source" : "Source to be added"}</Text>
      <Text style={styles.warningText}>{card.disclaimer}</Text>
    </AppCard>
  );
}

function ChartCard({ title, values }: { title: string; values: number[] }) {
  const bars = values.length ? values : [0.12, 0.2, 0.16, 0.26];
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{title}</Text>
      <View accessibilityLabel={`${title} chart based on logged baby care data`} style={styles.barRow}>
        {bars.map((value, index) => (
          <View key={`${title}-${index}`} style={styles.barTrack}>
            <View style={[styles.barFill, { height: `${Math.max(10, Math.min(100, value * 100))}%` }]} />
          </View>
        ))}
      </View>
    </AppCard>
  );
}

function SolidsGrid({ logs }: { logs: BabySolidFoodLog[] }) {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>Solids tried grid</Text>
      <View style={styles.solidsGrid}>
        {(logs.length ? logs.slice(0, 12).map((log) => log.foodName) : FOOD_CATEGORIES).map((item) => (
          <View key={item} style={styles.solidTile}><Text style={styles.solidText}>{item}</Text></View>
        ))}
      </View>
    </AppCard>
  );
}

function RecordTypeCard({ label }: { label: string }) {
  return (
    <AppCard style={styles.recordCard}>
      <AppIcon color="#6ee7c8" decorative name="records" size={20} />
      <Text style={styles.recordText}>{label}</Text>
    </AppCard>
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

function PremiumEmptyState({ button, message, onPress, title }: { button: string; message: string; onPress: () => void; title: string }) {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{title}</Text>
      <Text style={styles.darkMuted}>{message}</Text>
      <View style={styles.actionRow}><AppButton onPress={onPress} title={button} /></View>
    </AppCard>
  );
}

function List({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.stack}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.listRow}>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Chip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected ? styles.chipSelected : null]}>
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.ghostButton}>
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.successToast}>
      <AppIcon color="#10201d" decorative name="success" size={20} />
      <Text style={styles.successText}>{message}</Text>
    </Pressable>
  );
}

function Footer({ text }: { text: string }) {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={styles.footerText}>{text}</Text>
    </AppCard>
  );
}

function BabyChildNavOverlay() {
  return (
    <>
      <FloatingBottomNav activeRouteName="health" />
      <FloatingAssistantButton />
    </>
  );
}

function toTab(value?: string): BabyTab {
  if (value === "growth") return "growth";
  if (value === "milestones") return "milestones";
  if (value === "medicine" || value === "vaccines" || value === "records" || value === "health") return "health";
  if (value === "feeding" || value === "sleep" || value === "diapers" || value === "solids" || value === "reports" || value === "learn" || value === "settings" || value === "more") return "more";
  return "overview";
}

function asParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getLocalDateKey(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value.trim() ? parsed : undefined;
}

function getAgeMonths(dateOfBirth?: string) {
  if (!dateOfBirth) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 2629800000));
}

function formatAgo(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return hours ? `${hours}h ${remaining}m` : `${remaining}m`;
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getNextReminder(data: BabyRealmData) {
  const medicine = data.medicineLogs.find((log) => log.status === "due");
  if (medicine) return medicine.medicineName;
  const vaccine = data.vaccineRecords.find((record) => record.nextDoseDate || record.scheduledDate);
  return vaccine ? vaccine.vaccineName : undefined;
}

function enrichBabyEvents(
  events: BabyCalendarEvent[],
  feedingLogs: BabyFeedingLog[],
  sleepLogs: BabyRealmData["sleepLogs"],
  diaperLogs: DiaperLog[],
  medicineLogs: BabyMedicineLog[]
) {
  return events.map((event) => {
    if (event.type === "feeding") {
      const log = feedingLogs.find((item) => item.id === event.relatedId);
      if (log) {
        const amount = log.finishedAmountMl ? ` · ${log.finishedAmountMl} ml` : log.durationMinutes ? ` · ${formatMinutes(log.durationMinutes)}` : "";
        return { ...event, label: `${formatValue(log.feedingType ?? log.feedType)}${amount}` };
      }
    }
    if (event.type === "sleep") {
      const log = sleepLogs.find((item) => item.id === event.relatedId);
      if (log) return { ...event, label: `${formatValue(log.sleepType ?? "sleep")} · ${formatMinutes(log.durationMinutes)}` };
    }
    if (event.type === "diaper") {
      const log = diaperLogs.find((item) => item.id === event.relatedId);
      if (log) return { ...event, label: formatValue(log.diaperType) };
    }
    if (event.type === "medicine") {
      const log = medicineLogs.find((item) => item.id === event.relatedId);
      if (log) return { ...event, label: `${log.medicineName} · ${formatValue(log.status)}` };
    }
    return event;
  });
}

function BabyLoadingState() {
  return (
    <View accessibilityLabel="Loading Baby Care" style={styles.stack}>
      {[110, 220, 180].map((height) => <View key={height} style={[styles.loadingCard, { height }]} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  avatar: { alignItems: "center", backgroundColor: "#fef3c7", borderColor: "#6ee7c8", borderRadius: 28, borderWidth: 2, height: 56, justifyContent: "center", width: 56 },
  avatarText: { color: "#0f172a", fontSize: 18, fontWeight: "900" },
  barFill: { backgroundColor: "#6ee7c8", borderRadius: 999, bottom: 0, position: "absolute", width: "100%" },
  barRow: { alignItems: "flex-end", flexDirection: "row", gap: 8, height: 96, marginTop: 14 },
  barTrack: { backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 999, flex: 1, height: "100%", overflow: "hidden" },
  caregiverCard: { backgroundColor: "#ecfeff", borderColor: "#99f6e4", borderWidth: 1 },
  caregiverText: { color: "#0f766e", fontWeight: "900", lineHeight: 20 },
  chip: { backgroundColor: "rgba(15,23,42,0.08)", borderColor: "rgba(15,23,42,0.12)", borderRadius: 999, borderWidth: 1, minHeight: 42, paddingHorizontal: 14, paddingVertical: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chipSelected: { backgroundColor: "#111827", borderColor: "#6ee7c8" },
  chipText: { color: "#475569", fontWeight: "900" },
  chipTextSelected: { color: "#f8fafc" },
  darkCard: { backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1 },
  darkInput: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.14)", borderRadius: 16, borderWidth: 1, color: "#f8fafc", flex: 1, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10 },
  darkMuted: { color: "#cbd5e1", lineHeight: 21, marginTop: 6 },
  darkTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "900" },
  footerText: { color: "#9a3412", lineHeight: 20 },
  ghostButton: { alignItems: "center", borderColor: "rgba(255,255,255,0.18)", borderRadius: 999, borderWidth: 1, minHeight: 42, paddingHorizontal: 14, paddingVertical: 10 },
  ghostText: { color: "#f8fafc", fontWeight: "900" },
  heroCard: { backgroundColor: "#0f172a", borderColor: "#6ee7c8", borderWidth: 1 },
  heroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  heroKicker: { color: "#6ee7c8", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  heroMetric: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 18, flexBasis: "47%", flexGrow: 1, padding: 12 },
  heroMetricLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "900" },
  heroMetricValue: { color: "#f8fafc", fontSize: 16, fontWeight: "900", marginTop: 4 },
  heroSubtitle: { color: "#cbd5e1", lineHeight: 21, marginTop: 6 },
  heroTitle: { color: "#f8fafc", fontSize: 30, fontWeight: "900", marginTop: 8 },
  inputGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  listRow: { backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.10)", borderRadius: 18, borderWidth: 1, padding: 12 },
  listText: { color: "#e2e8f0", lineHeight: 20 },
  loadingCard: { backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 28 },
  metricCard: { backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1, flexBasis: "47%", flexGrow: 1 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "900" },
  metricValue: { color: "#f8fafc", fontSize: 18, fontWeight: "900", marginTop: 6 },
  profileBadge: { color: "#6ee7c8", fontWeight: "900", marginTop: 6 },
  profileCard: { backgroundColor: "#111827", borderColor: "rgba(110,231,200,0.35)", borderWidth: 1 },
  profileMeta: { color: "#cbd5e1", marginTop: 4 },
  profileName: { color: "#f8fafc", fontSize: 28, fontWeight: "900" },
  profileTop: { alignItems: "center", flexDirection: "row", gap: 14 },
  quickAction: { alignItems: "center", backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.12)", borderRadius: 24, borderWidth: 1, flexBasis: "22%", flexGrow: 1, gap: 8, justifyContent: "center", minHeight: 94, minWidth: 88, padding: 10 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickText: { color: "#f8fafc", fontSize: 12, fontWeight: "900", textAlign: "center" },
  promptGrid: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  recordCard: { alignItems: "center", backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1, flexBasis: "30%", flexGrow: 1, gap: 8, minHeight: 100 },
  recordGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  recordText: { color: "#f8fafc", fontSize: 12, fontWeight: "900", textAlign: "center" },
  sectionHeaderRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  sheetText: { color: "#cbd5e1", lineHeight: 21 },
  solidText: { color: "#e2e8f0", fontSize: 12, fontWeight: "900" },
  solidTile: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, flexBasis: "30%", flexGrow: 1, padding: 10 },
  solidsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  sourceText: { color: "#94a3b8", fontSize: 12, lineHeight: 18, marginTop: 6 },
  stack: { gap: 14 },
  successText: { color: "#10201d", fontWeight: "900" },
  successToast: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#6ee7c8", borderRadius: 999, flexDirection: "row", gap: 8, minHeight: 44, paddingHorizontal: 14 },
  tabRow: { gap: 8, paddingRight: 16 },
  validationText: { color: "#f59e0b", fontWeight: "900", lineHeight: 20 },
  warningText: { color: "#fbbf24", lineHeight: 20, marginTop: 8 }
});
