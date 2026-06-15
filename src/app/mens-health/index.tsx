import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import type React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppSection } from "@/components/ui";
import {
  createMensHealthCheckIn,
  createMensHealthQuestion,
  createMensHealthReminder,
  createMensHealthSymptomLog,
  enableMensHealth,
  getMensHealthCheckInsByRange,
  getMensHealthMedicationReviewSummary,
  getMensHealthQuestions,
  getMensHealthReminderHistory,
  getMensHealthReportSummary,
  getMensHealthSettings,
  getMensHealthSupplementReviewSummary,
  getMensHealthSymptomsByDate,
  getMensHealthWorkoutNutritionSummary,
  getTrustedMensHealthLearnCards,
  markMensHealthQuestionAnswered,
  markMensHealthQuestionAsked,
  markMensHealthReminderCompleted,
  updateMensHealthSettings,
} from "@/lib/mensHealthStorage";
import type {
  MensHealthCheckIn,
  MensHealthLearnCard,
  MensHealthQuestion,
  MensHealthReminder,
  MensHealthReminderType,
  MensHealthReportSummary,
  MensHealthSettings,
  MensHealthSymptomKey,
  MensHealthSymptomLog,
} from "@/types/mensHealth";

type MensTab =
  | "today"
  | "checkins"
  | "symptoms"
  | "fertility"
  | "sexual"
  | "prostate"
  | "wellness"
  | "reports"
  | "learn"
  | "privacy";

const TABS: Array<{ key: MensTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "checkins", label: "Check-ins" },
  { key: "symptoms", label: "Symptoms" },
  { key: "fertility", label: "Fertility" },
  { key: "sexual", label: "Sexual Health" },
  { key: "prostate", label: "Prostate / Testicular" },
  { key: "wellness", label: "Wellness" },
  { key: "reports", label: "Reports" },
  { key: "learn", label: "Learn" },
  { key: "privacy", label: "Privacy" },
];

const SYMPTOMS: Array<{ key: MensHealthSymptomKey; label: string }> = [
  { key: "testicular_lump_note", label: "Testicular lump/note" },
  { key: "testicular_pain", label: "Testicular pain/discomfort" },
  { key: "groin_pain", label: "Groin pain" },
  { key: "urinary_frequency", label: "Urinary frequency" },
  { key: "burning_urination", label: "Burning urination" },
  { key: "weak_stream", label: "Weak urine stream" },
  { key: "blood_in_urine_note", label: "Blood in urine note" },
  { key: "pelvic_pain", label: "Pelvic pain" },
  { key: "erectile_difficulty_note", label: "Erectile difficulty note" },
  { key: "low_libido_note", label: "Low libido note" },
  { key: "fatigue", label: "Fatigue" },
  { key: "mood_stress", label: "Mood/stress" },
  { key: "sleep_issue", label: "Sleep issue" },
  { key: "body_changes", label: "Hair/skin/body changes" },
  { key: "other", label: "Other" },
];

const QUESTION_CATEGORIES: MensHealthQuestion["category"][] = [
  "symptoms",
  "fertility",
  "sexual_health",
  "prostate",
  "testicular_health",
  "medication",
  "supplements",
  "mental_wellness",
  "workout_nutrition",
  "other",
];

const TODAY = new Date().toISOString().slice(0, 10);
const FOOTER =
  "Men’s Health tracking is for organization and education only. It is not medical advice and does not replace a doctor, clinic, pharmacist, urologist, fertility specialist, therapist, or healthcare professional.";
const SYMPTOM_FOOTER =
  "If you notice symptoms that worry you, speak to a healthcare professional. If symptoms feel urgent or severe, seek urgent care.";
const FERTILITY_FOOTER =
  "Fertility information is for tracking and preparation only. Male fertility concerns should be discussed with a healthcare professional or fertility specialist.";
const PROSTATE_FOOTER =
  "Prostate screening decisions should be discussed with a healthcare professional, considering possible benefits and harms.";

export default function MensHealthScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<MensTab>(toTab(params.tab));
  const [settings, setSettings] = useState<MensHealthSettings | null>(null);
  const [checkIns, setCheckIns] = useState<MensHealthCheckIn[]>([]);
  const [symptoms, setSymptoms] = useState<MensHealthSymptomLog[]>([]);
  const [reminders, setReminders] = useState<MensHealthReminder[]>([]);
  const [questions, setQuestions] = useState<MensHealthQuestion[]>([]);
  const [learnCards, setLearnCards] = useState<MensHealthLearnCard[]>([]);
  const [connections, setConnections] = useState({
    medication: "",
    nutritionWorkout: "",
    supplements: "",
  });
  const [renderedAtMs, setRenderedAtMs] = useState(0);

  const latestCheckIn = useMemo(() => checkIns[0], [checkIns]);

  const load = useCallback(async () => {
    const [
      nextSettings,
      nextCheckIns,
      nextSymptoms,
      nextReminders,
      nextQuestions,
      nextLearn,
      medication,
      supplements,
      nutritionWorkout,
    ] = await Promise.all([
      getMensHealthSettings(),
      getMensHealthCheckInsByRange(addDays(new Date(), -30), new Date()),
      getMensHealthSymptomsByDate(TODAY),
      getMensHealthReminderHistory(),
      getMensHealthQuestions(),
      getTrustedMensHealthLearnCards(),
      getMensHealthMedicationReviewSummary(),
      getMensHealthSupplementReviewSummary(),
      getMensHealthWorkoutNutritionSummary(),
    ]);
    setSettings(nextSettings);
    setCheckIns(nextCheckIns);
    setSymptoms(nextSymptoms);
    setReminders(nextReminders);
    setQuestions(nextQuestions);
    setLearnCards(nextLearn);
    setConnections({ medication, nutritionWorkout, supplements });
    setRenderedAtMs(Date.now());
  }, []);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve()
        .then(load)
        .catch(() => undefined);
    }, [load]),
  );

  if (!settings || settings.status === "disabled") {
    return (
      <AppMainLayout subtitle="Private optional realm" title="Men’s Health">
        <AppCard backgroundColor="#eef2ff">
          <Text style={styles.title}>
            Men’s Health is private and optional.
          </Text>
          <Text style={styles.muted}>
            Enable it if you want to track symptoms, fertility notes, wellness
            check-ins, private reminders, and trusted health information.
          </Text>
        </AppCard>
        <AppButton
          onPress={async () => {
            await enableMensHealth();
            await load();
          }}
          title="Enable Men’s Health"
        />
        <Footer text={FOOTER} />
      </AppMainLayout>
    );
  }

  return (
    <AppMainLayout subtitle="Private by default" title="Men’s Health">
      <AppCard backgroundColor="#eff6ff">
        <Text style={{ color: "#1d4ed8", fontSize: 12, fontWeight: "900" }}>
          {settings.defaultPrivacy === "private"
            ? "Private"
            : "Shared selected"}
        </Text>
        <Text style={styles.hero}>Men’s Health</Text>
        <Text style={styles.muted}>
          Check-ins, symptoms, reminders, fertility notes, doctor questions and
          trusted education.
        </Text>
      </AppCard>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -4 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {TABS.map((tab) => (
          <Chip
            key={tab.key}
            label={tab.label}
            onPress={() => setActiveTab(tab.key)}
            selected={activeTab === tab.key}
          />
        ))}
      </ScrollView>

      {activeTab === "today" ? (
        <TodayTab
          checkIn={latestCheckIn}
          connections={connections}
          nowMs={renderedAtMs}
          questions={questions}
          reminders={reminders}
          setActiveTab={setActiveTab}
          settings={settings}
          symptoms={symptoms}
        />
      ) : null}
      {activeTab === "checkins" ? (
        <CheckInsTab checkIns={checkIns} onChange={load} />
      ) : null}
      {activeTab === "symptoms" ? (
        <SymptomsTab onChange={load} symptoms={symptoms} />
      ) : null}
      {activeTab === "fertility" ? (
        <FertilityTab
          checkIns={checkIns}
          onChange={load}
          questions={questions}
        />
      ) : null}
      {activeTab === "sexual" ? (
        <SexualHealthTab
          checkIns={checkIns}
          onChange={load}
          questions={questions}
        />
      ) : null}
      {activeTab === "prostate" ? (
        <ProstateTesticularTab
          onChange={load}
          reminders={reminders}
          settings={settings}
        />
      ) : null}
      {activeTab === "wellness" ? (
        <WellnessTab connections={connections} />
      ) : null}
      {activeTab === "reports" ? <ReportsTab /> : null}
      {activeTab === "learn" ? <LearnTab cards={learnCards} /> : null}
      {activeTab === "privacy" ? (
        <PrivacyTab onChange={load} settings={settings} />
      ) : null}
      <Footer text={FOOTER} />
    </AppMainLayout>
  );
}

function TodayTab({
  checkIn,
  connections,
  nowMs,
  questions,
  reminders,
  setActiveTab,
  settings,
  symptoms,
}: {
  checkIn?: MensHealthCheckIn;
  connections: {
    medication: string;
    nutritionWorkout: string;
    supplements: string;
  };
  nowMs: number;
  questions: MensHealthQuestion[];
  reminders: MensHealthReminder[];
  setActiveTab: (tab: MensTab) => void;
  settings: MensHealthSettings;
  symptoms: MensHealthSymptomLog[];
}) {
  const nextReminder = reminders.find(
    (item) =>
      item.status === "upcoming" &&
      new Date(item.scheduledAt).getTime() >= nowMs,
  );
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Today"
        subtitle="Neutral private summary based on your logs."
      />
      <View style={styles.grid}>
        <Metric
          label="Private check-in"
          value={checkIn ? "Logged" : "Not logged"}
        />
        <Metric
          label="Energy"
          value={checkIn?.energy ? formatValue(checkIn.energy) : "No note"}
        />
        <Metric label="Symptoms today" value={`${symptoms.length}`} />
        <Metric label="Questions saved" value={`${questions.length}`} />
      </View>
      <AppCard>
        <Text style={styles.title}>Next reminder</Text>
        <Text style={styles.muted}>
          {nextReminder?.title ??
            (settings.testicularCheckReminderEnabled
              ? "Monthly testicular check enabled"
              : "No private reminder")}
        </Text>
      </AppCard>
      <AppCard>
        <Text style={styles.title}>Medication / supplement review</Text>
        <Text style={styles.muted}>
          Some medications and supplements can affect sexual health, mood,
          energy, or fertility. If you notice concerns, speak to a healthcare
          professional.
        </Text>
        <Text style={styles.small}>
          {connections.medication} • {connections.supplements}
        </Text>
      </AppCard>
      <AppCard>
        <Text style={styles.title}>Workout / nutrition connection</Text>
        <Text style={styles.muted}>
          Workout and nutrition logs may help you understand energy and recovery
          patterns.
        </Text>
        <Text style={styles.small}>{connections.nutritionWorkout}</Text>
      </AppCard>
      <View style={styles.quickActions}>
        <AppButton
          onPress={() => setActiveTab("checkins")}
          title="Add check-in"
          variant="secondary"
        />
        <AppButton
          onPress={() => setActiveTab("symptoms")}
          title="Log symptom"
          variant="secondary"
        />
        <AppButton
          onPress={() => setActiveTab("prostate")}
          title="Reminders"
          variant="secondary"
        />
      </View>
    </View>
  );
}

function CheckInsTab({
  checkIns,
  onChange,
}: {
  checkIns: MensHealthCheckIn[];
  onChange: () => void;
}) {
  const [energy, setEnergy] =
    useState<NonNullable<MensHealthCheckIn["energy"]>>("good");
  const [stress, setStress] =
    useState<NonNullable<MensHealthCheckIn["stress"]>>("moderate");
  const [sleepQuality, setSleepQuality] =
    useState<NonNullable<MensHealthCheckIn["sleepQuality"]>>("okay");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [painDiscomfortNote, setPainDiscomfortNote] = useState("");
  const [urinaryNote, setUrinaryNote] = useState("");
  const [workoutRecoveryNote, setWorkoutRecoveryNote] = useState("");

  async function save() {
    await createMensHealthCheckIn({
      energy,
      loggedAt: new Date().toISOString(),
      mood,
      notes,
      painDiscomfortNote,
      sleepQuality,
      stress,
      urinaryNote,
      workoutRecoveryNote,
    });
    setNotes("");
    onChange();
  }

  return (
    <LogSection
      empty={
        !checkIns.length
          ? "Add a private check-in when you are ready."
          : undefined
      }
      footer={FOOTER}
      title="Private check-ins"
    >
      <OptionRow
        current={energy}
        onSelect={(value) => setEnergy(value as typeof energy)}
        options={["very_low", "low", "okay", "good", "great"]}
      />
      <OptionRow
        current={stress}
        onSelect={(value) => setStress(value as typeof stress)}
        options={["low", "moderate", "high"]}
      />
      <OptionRow
        current={sleepQuality}
        onSelect={(value) => setSleepQuality(value as typeof sleepQuality)}
        options={["poor", "okay", "good", "great"]}
      />
      <TextInput
        onChangeText={setMood}
        placeholder="Mood optional"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={mood}
      />
      <TextInput
        onChangeText={setPainDiscomfortNote}
        placeholder="Pain/discomfort note optional"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={painDiscomfortNote}
      />
      <TextInput
        onChangeText={setUrinaryNote}
        placeholder="Urinary note optional"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={urinaryNote}
      />
      <TextInput
        onChangeText={setWorkoutRecoveryNote}
        placeholder="Workout recovery note optional"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={workoutRecoveryNote}
      />
      <TextInput
        onChangeText={setNotes}
        placeholder="Notes optional"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={notes}
      />
      <AppButton onPress={save} title="Save check-in" />
      <List
        items={checkIns
          .slice(0, 5)
          .map(
            (item) =>
              `${formatDate(item.loggedAt)} - Energy ${formatValue(item.energy ?? "not_added")}`,
          )}
      />
    </LogSection>
  );
}

function SymptomsTab({
  onChange,
  symptoms,
}: {
  onChange: () => void;
  symptoms: MensHealthSymptomLog[];
}) {
  const [symptomKey, setSymptomKey] = useState<MensHealthSymptomKey>("fatigue");
  const [severity, setSeverity] =
    useState<NonNullable<MensHealthSymptomLog["severity"]>>("mild");
  const [notes, setNotes] = useState("");
  async function save() {
    await createMensHealthSymptomLog({
      loggedAt: new Date().toISOString(),
      notes,
      severity,
      symptomKey,
    });
    setNotes("");
    onChange();
  }
  return (
    <LogSection
      footer={SYMPTOM_FOOTER}
      empty={
        !symptoms.length
          ? "Symptom notes will appear here when you add them."
          : undefined
      }
      title="Symptoms"
    >
      <OptionRow
        current={symptomKey}
        onSelect={(value) => setSymptomKey(value as MensHealthSymptomKey)}
        options={SYMPTOMS.map((item) => item.key)}
      />
      <OptionRow
        current={severity}
        onSelect={(value) => setSeverity(value as typeof severity)}
        options={["mild", "moderate", "severe"]}
      />
      <TextInput
        onChangeText={setNotes}
        placeholder="Notes optional"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={notes}
      />
      <AppButton onPress={save} title="Save symptom note" />
      <List
        items={symptoms.map(
          (item) =>
            `${formatValue(item.symptomKey)} - ${formatValue(item.severity ?? "not_set")}`,
        )}
      />
    </LogSection>
  );
}

function FertilityTab({
  checkIns,
  onChange,
  questions,
}: {
  checkIns: MensHealthCheckIn[];
  onChange: () => void;
  questions: MensHealthQuestion[];
}) {
  const [fertilityNote, setFertilityNote] = useState("");
  const [question, setQuestion] = useState("");
  async function saveNote() {
    await createMensHealthCheckIn({
      fertilityNote,
      loggedAt: new Date().toISOString(),
    });
    setFertilityNote("");
    onChange();
  }
  async function saveQuestion() {
    if (!question.trim()) return;
    await createMensHealthQuestion({ category: "fertility", question });
    setQuestion("");
    onChange();
  }
  return (
    <LogSection
      footer={FERTILITY_FOOTER}
      empty={
        !checkIns.some((item) => item.fertilityNote)
          ? "Fertility notes are private and optional."
          : undefined
      }
      title="Fertility planning"
    >
      <TextInput
        multiline
        onChangeText={setFertilityNote}
        placeholder="Fertility note, appointment, lifestyle note, medication/supplement note, or lab link note"
        placeholderTextColor="#94a3b8"
        style={[styles.input, { minHeight: 90 }]}
        value={fertilityNote}
      />
      <AppButton onPress={saveNote} title="Save fertility note" />
      <TextInput
        onChangeText={setQuestion}
        placeholder="Question for doctor/fertility specialist"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={question}
      />
      <AppButton
        onPress={saveQuestion}
        title="Save question"
        variant="secondary"
      />
      <List
        items={questions
          .filter((item) => item.category === "fertility")
          .map((item) => item.question)}
      />
    </LogSection>
  );
}

function SexualHealthTab({
  checkIns,
  onChange,
  questions,
}: {
  checkIns: MensHealthCheckIn[];
  onChange: () => void;
  questions: MensHealthQuestion[];
}) {
  const [libidoNote, setLibidoNote] = useState("");
  const [sexualHealthNote, setSexualHealthNote] = useState("");
  const [question, setQuestion] = useState("");
  async function saveNote() {
    await createMensHealthCheckIn({
      libidoNote,
      loggedAt: new Date().toISOString(),
      sexualHealthNote,
    });
    setLibidoNote("");
    setSexualHealthNote("");
    onChange();
  }
  async function saveQuestion() {
    if (!question.trim()) return;
    await createMensHealthQuestion({ category: "sexual_health", question });
    setQuestion("");
    onChange();
  }
  return (
    <LogSection
      footer="Sexual health notes are private by default and for preparing respectful conversations with a healthcare professional. This app does not diagnose."
      empty={
        !checkIns.some((item) => item.sexualHealthNote || item.libidoNote)
          ? "Private sexual health notes will appear here when added."
          : undefined
      }
      title="Sexual health notes"
    >
      <TextInput
        onChangeText={setLibidoNote}
        placeholder="Libido note optional/private"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={libidoNote}
      />
      <TextInput
        multiline
        onChangeText={setSexualHealthNote}
        placeholder="Erectile difficulty, ejaculation, pain/discomfort, STI reminder, partner discussion, or doctor question note"
        placeholderTextColor="#94a3b8"
        style={[styles.input, { minHeight: 90 }]}
        value={sexualHealthNote}
      />
      <AppButton onPress={saveNote} title="Save private note" />
      <TextInput
        onChangeText={setQuestion}
        placeholder="Doctor question"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={question}
      />
      <AppButton
        onPress={saveQuestion}
        title="Save question"
        variant="secondary"
      />
      <List
        items={questions
          .filter((item) => item.category === "sexual_health")
          .map((item) => item.question)}
      />
    </LogSection>
  );
}

function ProstateTesticularTab({
  onChange,
  reminders,
  settings,
}: {
  onChange: () => void;
  reminders: MensHealthReminder[];
  settings: MensHealthSettings;
}) {
  async function createReminder(type: MensHealthReminderType) {
    const title =
      type === "testicular_check"
        ? "Monthly testicular check"
        : "Prostate discussion reminder";
    await createMensHealthReminder({
      reminderType: type,
      repeatFrequency: type === "testicular_check" ? "monthly" : "none",
      scheduledAt: nextMorningIso(),
      title,
    });
    await updateMensHealthSettings(
      type === "testicular_check"
        ? { testicularCheckReminderEnabled: true }
        : { prostateDiscussionReminderEnabled: true },
    );
    onChange();
  }
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Prostate / Testicular"
        subtitle="Private reminders and doctor discussion preparation."
      />
      <AppCard>
        <Text style={styles.title}>Testicular check reminder</Text>
        <Text style={styles.muted}>
          Regular checks can help you notice changes. If you find a lump,
          swelling, pain, or something unusual, speak to a healthcare
          professional.
        </Text>
        <AppButton
          onPress={() => createReminder("testicular_check")}
          title={
            settings.testicularCheckReminderEnabled
              ? "Reminder enabled"
              : "Enable monthly reminder"
          }
        />
      </AppCard>
      <AppCard>
        <Text style={styles.title}>Prostate discussion reminder</Text>
        <Text style={styles.muted}>{PROSTATE_FOOTER}</Text>
        <AppButton
          onPress={() => createReminder("prostate_discussion")}
          title={
            settings.prostateDiscussionReminderEnabled
              ? "Discussion reminder enabled"
              : "Add discussion reminder"
          }
          variant="secondary"
        />
      </AppCard>
      <List
        items={reminders
          .filter(
            (item) =>
              item.reminderType === "testicular_check" ||
              item.reminderType === "prostate_discussion",
          )
          .map((item) => `${item.title} - ${formatDate(item.scheduledAt)}`)}
      />
      <Footer text={PROSTATE_FOOTER} />
    </View>
  );
}

function WellnessTab({
  connections,
}: {
  connections: {
    medication: string;
    nutritionWorkout: string;
    supplements: string;
  };
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Wellness connection"
        subtitle="Gentle pattern notes only."
      />
      <AppCard>
        <Text style={styles.muted}>
          Sleep and stress logs can help you discuss patterns with a healthcare
          professional.
        </Text>
      </AppCard>
      <AppCard>
        <Text style={styles.muted}>
          Workout and nutrition logs may help you understand energy and recovery
          patterns.
        </Text>
        <Text style={styles.small}>{connections.nutritionWorkout}</Text>
      </AppCard>
      <AppCard>
        <Text style={styles.muted}>
          Medication and supplement notes can be useful to review with a
          pharmacist or doctor.
        </Text>
        <Text style={styles.small}>
          {connections.medication} • {connections.supplements}
        </Text>
      </AppCard>
    </View>
  );
}

function ReportsTab() {
  const [range, setRange] = useState<MensHealthReportSummary["range"]>("today");
  const [summary, setSummary] = useState<MensHealthReportSummary | null>(null);
  useFocusEffect(
    useCallback(() => {
      getMensHealthReportSummary(range).then(setSummary);
    }, [range]),
  );
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Reports"
        subtitle="Based on your logs, for discussion with a healthcare professional."
      />
      <OptionRow
        current={range}
        onSelect={(value) =>
          setRange(value as MensHealthReportSummary["range"])
        }
        options={["today", "7_days", "30_days"]}
      />
      {!summary || (!summary.checkInCount && !summary.symptomCount) ? (
        <AppCard>
          <Text style={styles.muted}>
            Reports will appear after you add check-ins or logs.
          </Text>
        </AppCard>
      ) : null}
      <View style={styles.grid}>
        <Metric label="Check-ins" value={`${summary?.checkInCount ?? 0}`} />
        <Metric label="Symptoms" value={`${summary?.symptomCount ?? 0}`} />
        <Metric
          label="Fertility notes"
          value={`${summary?.fertilityNoteCount ?? 0}`}
        />
        <Metric label="Questions" value={`${summary?.questionCount ?? 0}`} />
      </View>
    </View>
  );
}

function LearnTab({ cards }: { cards: MensHealthLearnCard[] }) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection title="Learn" subtitle="Trusted source-backed education." />
      {cards.map((card) => (
        <AppCard key={card.id}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.muted}>{card.summary}</Text>
          <Text style={styles.small}>
            {card.sourceOrganization} • {card.sourceUrl}
          </Text>
          <Text style={styles.small}>
            Reviewer/author: {card.authorOrReviewer ?? card.sourceOrganization}{" "}
            • Last checked: {card.lastCheckedAt}
          </Text>
          <Text style={styles.warning}>{card.disclaimer}</Text>
        </AppCard>
      ))}
    </View>
  );
}

function PrivacyTab({
  onChange,
  settings,
}: {
  onChange: () => void;
  settings: MensHealthSettings;
}) {
  const [privacy, setPrivacy] = useState(settings.defaultPrivacy);
  const [fertility, setFertility] = useState(settings.fertilityTrackingEnabled);
  const [sexual, setSexual] = useState(settings.sexualHealthNotesEnabled);
  async function save() {
    await updateMensHealthSettings({
      defaultPrivacy: privacy,
      fertilityTrackingEnabled: fertility,
      sexualHealthNotesEnabled: sexual,
    });
    onChange();
  }
  return (
    <View style={{ gap: 12 }}>
      <AppSection title="Privacy" subtitle="Share nothing by default." />
      <OptionRow
        current={privacy}
        onSelect={(value) => setPrivacy(value as typeof privacy)}
        options={["private", "shared_selected"]}
      />
      <Toggle
        label="Fertility tracking enabled"
        onPress={() => setFertility(!fertility)}
        value={fertility}
      />
      <Toggle
        label="Sexual health notes enabled"
        onPress={() => setSexual(!sexual)}
        value={sexual}
      />
      <AppCard backgroundColor="#fff7ed">
        <Text style={styles.warning}>
          Sexual health notes require separate extra confirmation before
          sharing. Caregivers cannot see Men’s Health unless explicitly
          selected.
        </Text>
      </AppCard>
      <AppButton onPress={save} title="Save privacy settings" />
    </View>
  );
}

function LogSection({
  children,
  empty,
  footer,
  title,
}: {
  children: React.ReactNode;
  empty?: string;
  footer: string;
  title: string;
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection title={title} />
      {empty ? (
        <AppCard>
          <Text style={styles.muted}>{empty}</Text>
        </AppCard>
      ) : null}
      <AppCard>
        <View style={{ gap: 12 }}>{children}</View>
      </AppCard>
      <Footer text={footer} />
    </View>
  );
}

function Toggle({
  label,
  onPress,
  value,
}: {
  label: string;
  onPress: () => void;
  value: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.toggle}
    >
      <Text style={styles.bold}>{label}</Text>
      <Text style={styles.small}>{value ? "Enabled" : "Disabled"}</Text>
    </TouchableOpacity>
  );
}

function OptionRow({
  current,
  onSelect,
  options,
}: {
  current: string;
  onSelect: (value: string) => void;
  options: string[];
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => (
        <Chip
          key={option}
          label={formatValue(option)}
          onPress={() => onSelect(option)}
          selected={current === option}
        />
      ))}
    </View>
  );
}

function Chip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: selected ? "#1d4ed8" : "#ffffff",
        borderColor: "#dbeafe",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 13,
        paddingVertical: 9,
      }}
    >
      <Text
        style={{ color: selected ? "#ffffff" : "#475569", fontWeight: "900" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={{ flexBasis: "47%", flexGrow: 1 }}>
      <Text style={styles.small}>{label}</Text>
      <Text style={styles.metric}>{value}</Text>
    </AppCard>
  );
}

function List({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={{ gap: 8 }}>
      {items.slice(0, 6).map((item, index) => (
        <View key={`${item}-${index}`} style={styles.listItem}>
          <Text style={styles.muted}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Footer({ text }: { text: string }) {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={styles.warning}>{text}</Text>
    </AppCard>
  );
}

function toTab(value?: string): MensTab {
  return TABS.some((tab) => tab.key === value) ? (value as MensTab) : "today";
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function nextMorningIso() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(9, 0, 0, 0);
  return next.toISOString();
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = {
  bold: { color: "#0f172a", fontWeight: "900" as const },
  grid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 10 },
  hero: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "900" as const,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#dbeafe",
    borderRadius: 16,
    borderWidth: 1,
    color: "#0f172a",
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  listItem: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 10 },
  metric: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "900" as const,
    marginTop: 4,
  },
  muted: { color: "#64748b", lineHeight: 21 },
  quickActions: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  small: { color: "#64748b", fontSize: 12, lineHeight: 18, marginTop: 6 },
  title: { color: "#0f172a", fontSize: 20, fontWeight: "900" as const },
  toggle: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 },
  warning: { color: "#9a3412", lineHeight: 20 },
};
