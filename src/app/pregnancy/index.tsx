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
import { AppButton, AppCard, AppSection } from "@/components/ui";
import {
  calculatePregnancyWeekSummary,
  createPregnancyAppointment,
  createPregnancyQuestion,
  createPregnancySharePermission,
  createPregnancySymptomLog,
  deletePregnancyAppointment,
  deletePregnancySymptomLog,
  enablePregnancyMode,
  endPregnancyMode,
  generatePregnancyCalendarEvents,
  getPregnancyAppointments,
  getPregnancyMedicationReviewSummary,
  getPregnancyNutritionSummary,
  getPregnancyProfile,
  getPregnancyQuestions,
  getPregnancyRecordsSummary,
  getPregnancySupplementReviewSummary,
  getPregnancySymptomsByRange,
  getPregnancyWorkoutSummary,
  getTrustedPregnancyLearnCards,
  markPregnancyQuestionAnswered,
  markPregnancyQuestionAsked,
  updatePregnancyProfile,
} from "@/lib/pregnancyStorage";
import type {
  PregnancyAppointment,
  PregnancyAppointmentType,
  PregnancyCalendarOverlay,
  PregnancyDateBasis,
  PregnancyProfile,
  PregnancyQuestion,
  PregnancySymptomLog,
  PregnancyTrustedLearnCard,
  PregnancyWeekSummary,
} from "@/types/pregnancy";

type PregnancyTab =
  | "today"
  | "calendar"
  | "appointments"
  | "symptoms"
  | "questions"
  | "connections"
  | "reports"
  | "learn"
  | "privacy";

const TABS: Array<{ key: PregnancyTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "calendar", label: "Calendar" },
  { key: "appointments", label: "Appointments" },
  { key: "symptoms", label: "Symptoms" },
  { key: "questions", label: "Questions" },
  { key: "connections", label: "Connections" },
  { key: "reports", label: "Reports" },
  { key: "learn", label: "Learn" },
  { key: "privacy", label: "Privacy" },
];

const APPOINTMENT_TYPES: Array<{
  key: PregnancyAppointmentType;
  label: string;
}> = [
  { key: "first_appointment", label: "First appointment" },
  { key: "routine_checkup", label: "Routine check-up" },
  { key: "scan_ultrasound", label: "Scan / ultrasound" },
  { key: "blood_test_lab", label: "Blood test / lab" },
  { key: "midwife", label: "Midwife" },
  { key: "doctor", label: "Doctor" },
  { key: "specialist", label: "Specialist" },
  { key: "other", label: "Other" },
];

const SYMPTOMS = [
  "Nausea",
  "Vomiting",
  "Fatigue",
  "Headache",
  "Cramps",
  "Back pain",
  "Mood changes",
  "Sleep changes",
  "Heartburn",
  "Swelling",
  "Dizziness",
  "Appetite changes",
  "Bleeding/spotting note",
  "Other",
];

const QUESTION_CATEGORIES: Array<{
  key: PregnancyQuestion["category"];
  label: string;
}> = [
  { key: "symptoms", label: "Symptoms" },
  { key: "medication", label: "Medication" },
  { key: "supplements", label: "Supplements" },
  { key: "nutrition", label: "Food / Nutrition" },
  { key: "exercise", label: "Exercise" },
  { key: "baby_development", label: "Baby development" },
  { key: "appointments", label: "Appointments" },
  { key: "birth_plan", label: "Birth plan later" },
  { key: "other", label: "Other" },
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

const FOOTER =
  "Pregnancy tracking is for organization and education only. It is not medical advice and does not replace a doctor, midwife, nurse, clinic, pharmacist, or healthcare professional.";
const DATE_FOOTER =
  "Pregnancy week and due date are estimates based on the dates you enter. Confirm pregnancy dating with your healthcare professional.";
const MEDS_FOOTER =
  "Medication and supplement use during pregnancy should be confirmed with a healthcare professional.";
const SYMPTOM_FOOTER =
  "If you are worried about symptoms or feel something is urgent, contact your healthcare professional, clinic, or emergency services.";

export default function PregnancyScreen() {
  const params = useLocalSearchParams<{
    tab?: string;
    positiveTest?: string;
  }>();
  const [activeTab, setActiveTab] = useState<PregnancyTab>(toTab(params.tab));
  const [profile, setProfile] = useState<PregnancyProfile | null>(null);
  const [week, setWeek] = useState<PregnancyWeekSummary | null>(null);
  const [todayKey] = useState(() => toDateKey(new Date()));
  const [renderedAtMs] = useState(() => Date.now());
  const [appointments, setAppointments] = useState<PregnancyAppointment[]>([]);
  const [symptoms, setSymptoms] = useState<PregnancySymptomLog[]>([]);
  const [questions, setQuestions] = useState<PregnancyQuestion[]>([]);
  const [learnCards, setLearnCards] = useState<PregnancyTrustedLearnCard[]>([]);
  const [overlays, setOverlays] = useState<PregnancyCalendarOverlay[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [connectionSummaries, setConnectionSummaries] = useState({
    medication: "",
    nutrition: "",
    records: "",
    supplements: "",
    workout: "",
  });

  const loadPregnancy = useCallback(async () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const nextProfile = await getPregnancyProfile();
    const [
      nextWeek,
      nextAppointments,
      nextSymptoms,
      nextQuestions,
      nextLearnCards,
      nextOverlays,
      medication,
      supplements,
      nutrition,
      workout,
      records,
    ] = await Promise.all([
      calculatePregnancyWeekSummary(nextProfile ?? undefined),
      getPregnancyAppointments(),
      getPregnancySymptomsByRange(addDays(new Date(), -60), new Date()),
      getPregnancyQuestions(),
      getTrustedPregnancyLearnCards(),
      generatePregnancyCalendarEvents(monthStart, monthEnd),
      getPregnancyMedicationReviewSummary(),
      getPregnancySupplementReviewSummary(),
      getPregnancyNutritionSummary(),
      getPregnancyWorkoutSummary(),
      getPregnancyRecordsSummary(),
    ]);

    setProfile(nextProfile);
    setWeek(nextWeek);
    setAppointments(nextAppointments);
    setSymptoms(nextSymptoms);
    setQuestions(nextQuestions);
    setLearnCards(nextLearnCards);
    setOverlays(nextOverlays);
    setConnectionSummaries({
      medication,
      nutrition,
      records,
      supplements,
      workout,
    });
  }, [calendarDate]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve()
        .then(loadPregnancy)
        .catch(() => undefined);
    }, [loadPregnancy]),
  );

  if (!profile || profile.status === "disabled" || profile.status === "ended") {
    return (
      <AppMainLayout subtitle="Private optional realm" title="Pregnancy Mode">
        {params.positiveTest ? (
          <AppCard backgroundColor="#fff7ed">
            <Text style={{ color: "#9a3412", fontSize: 18, fontWeight: "900" }}>
              Pregnancy test note
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 22, marginTop: 8 }}>
              You logged a positive pregnancy test. Consider confirming with a
              healthcare professional or clinic.
            </Text>
          </AppCard>
        ) : null}
        <ActivationCard
          onEnable={async (input) => {
            await enablePregnancyMode(input);
            await loadPregnancy();
          }}
        />
        <FooterCard />
      </AppMainLayout>
    );
  }

  return (
    <AppMainLayout subtitle="Private tracker" title="Pregnancy Mode">
      <AppCard backgroundColor="#fdf2f8">
        <Text style={{ color: "#be185d", fontSize: 12, fontWeight: "900" }}>
          {profile.privacy === "shared_selected"
            ? "Shared selected"
            : "Private"}
        </Text>
        <Text
          style={{
            color: "#0f172a",
            fontSize: 22,
            fontWeight: "900",
            marginTop: 5,
          }}
        >
          Pregnancy Mode
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Estimated week tracking, appointments, symptoms, questions and trusted
          education. No diagnosis or medical interpretation.
        </Text>
      </AppCard>

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
              backgroundColor: activeTab === tab.key ? "#a21caf" : "#ffffff",
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
          appointments={appointments}
          nowMs={renderedAtMs}
          questions={questions}
          setActiveTab={setActiveTab}
          symptoms={symptoms}
          todayKey={todayKey}
          week={week}
        />
      ) : null}
      {activeTab === "calendar" ? (
        <CalendarTab
          calendarDate={calendarDate}
          overlays={overlays}
          setCalendarDate={setCalendarDate}
          week={week}
        />
      ) : null}
      {activeTab === "appointments" ? (
        <AppointmentsTab appointments={appointments} onChange={loadPregnancy} />
      ) : null}
      {activeTab === "symptoms" ? (
        <SymptomsTab onChange={loadPregnancy} symptoms={symptoms} />
      ) : null}
      {activeTab === "questions" ? (
        <QuestionsTab onChange={loadPregnancy} questions={questions} />
      ) : null}
      {activeTab === "connections" ? (
        <ConnectionsTab summaries={connectionSummaries} />
      ) : null}
      {activeTab === "reports" ? (
        <ReportsTab
          appointments={appointments}
          questions={questions}
          symptoms={symptoms}
        />
      ) : null}
      {activeTab === "learn" ? <LearnTab cards={learnCards} /> : null}
      {activeTab === "privacy" ? (
        <PrivacyTab onChange={loadPregnancy} profile={profile} />
      ) : null}
      <FooterCard />
    </AppMainLayout>
  );
}

function ActivationCard({
  onEnable,
}: {
  onEnable: (input: Partial<PregnancyProfile>) => Promise<void>;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [dateBasis, setDateBasis] =
    useState<PregnancyDateBasis>("estimated_due_date");
  const [lastMenstrualPeriodDate, setLastMenstrualPeriodDate] = useState("");
  const [estimatedDueDate, setEstimatedDueDate] = useState("");
  const [conceptionDate, setConceptionDate] = useState("");
  const [ivfDate, setIvfDate] = useState("");
  const [providerName, setProviderName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [shareWithPartner, setShareWithPartner] = useState(false);

  return (
    <AppCard backgroundColor="#fdf2f8">
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
          Enable Pregnancy Mode
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 22 }}>
          Pregnancy Mode is private and optional. It helps you track pregnancy
          weeks, appointments, symptoms, notes, and trusted educational content.
        </Text>
        <ToggleRow
          label="Pregnancy confirmed by user"
          onChange={setConfirmed}
          value={confirmed}
        />
        <ChipGroup
          current={dateBasis}
          options={[
            { key: "estimated_due_date", label: "Due date" },
            { key: "last_menstrual_period", label: "Last period" },
            { key: "conception_date", label: "Conception" },
            { key: "ivf_date", label: "IVF" },
            { key: "manual", label: "Manual" },
          ]}
          onSelect={(value) => setDateBasis(value as PregnancyDateBasis)}
        />
        <TextInput
          onChangeText={setEstimatedDueDate}
          placeholder="Estimated due date YYYY-MM-DD optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={estimatedDueDate}
        />
        <TextInput
          onChangeText={setLastMenstrualPeriodDate}
          placeholder="Last menstrual period YYYY-MM-DD optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={lastMenstrualPeriodDate}
        />
        <TextInput
          onChangeText={setConceptionDate}
          placeholder="Conception date YYYY-MM-DD optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={conceptionDate}
        />
        <TextInput
          onChangeText={setIvfDate}
          placeholder="IVF date YYYY-MM-DD optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={ivfDate}
        />
        <TextInput
          onChangeText={setProviderName}
          placeholder="Healthcare provider optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={providerName}
        />
        <TextInput
          onChangeText={setClinicName}
          placeholder="Clinic optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={clinicName}
        />
        <ToggleRow
          label="Share selected summary with partner"
          onChange={setShareWithPartner}
          value={shareWithPartner}
        />
        <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
          {DATE_FOOTER}
        </Text>
        <AppButton
          onPress={() =>
            onEnable({
              activatedAt: new Date().toISOString(),
              clinicName,
              conceptionDate: conceptionDate || undefined,
              dateBasis,
              estimatedDueDate: estimatedDueDate || undefined,
              ivfDate: ivfDate || undefined,
              lastMenstrualPeriodDate: lastMenstrualPeriodDate || undefined,
              pregnancyType: "prefer_not_to_say",
              privacy: shareWithPartner ? "shared_selected" : "private",
              providerName,
              status: confirmed ? "active" : "active",
            })
          }
          title="Enable Pregnancy Mode"
        />
      </View>
    </AppCard>
  );
}

function TodayTab({
  appointments,
  nowMs,
  questions,
  setActiveTab,
  symptoms,
  todayKey,
  week,
}: {
  appointments: PregnancyAppointment[];
  nowMs: number;
  questions: PregnancyQuestion[];
  setActiveTab: (tab: PregnancyTab) => void;
  symptoms: PregnancySymptomLog[];
  todayKey: string;
  week: PregnancyWeekSummary | null;
}) {
  const nextAppointment = appointments.find(
    (appointment) => new Date(appointment.scheduledAt).getTime() >= nowMs,
  );
  const todaySymptoms = symptoms.filter(
    (symptom) => symptom.loggedAt.slice(0, 10) === todayKey,
  );

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Today"
        subtitle="Estimated pregnancy overview based on your entered dates."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <MetricCard
          label="Week"
          value={
            week?.weekNumber
              ? `Week ${week.weekNumber} + ${week.dayNumber}`
              : "Add dates"
          }
        />
        <MetricCard
          label="Trimester"
          value={formatValue(week?.trimester ?? "unknown")}
        />
        <MetricCard
          label="Due date"
          value={week?.estimatedDueDate ?? "No due date"}
        />
        <MetricCard
          label="Days left"
          value={
            week?.daysUntilDueDate !== undefined
              ? `${week.daysUntilDueDate}`
              : "Estimate"
          }
        />
      </View>
      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Baby development summary
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Week-by-week development notes are educational only. Use Learn cards
          and write questions for your doctor, midwife, nurse, or clinic.
        </Text>
      </AppCard>
      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Next appointment
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          {nextAppointment
            ? `${nextAppointment.title}: ${formatDateTime(nextAppointment.scheduledAt)}`
            : "No pregnancy appointments added yet."}
        </Text>
        <SmallButton
          label="Add appointment"
          onPress={() => setActiveTab("appointments")}
        />
      </AppCard>
      <AppCard backgroundColor="#fff7ed">
        <Text style={{ color: "#9a3412", fontWeight: "900" }}>
          Review medication and supplements
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          During pregnancy, medication and supplement use should be confirmed
          with a healthcare professional. This app can help you list what you
          take and save questions.
        </Text>
      </AppCard>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <MetricCard
          label="Symptoms today"
          value={todaySymptoms.length ? `${todaySymptoms.length}` : "None"}
        />
        <MetricCard
          label="Questions"
          value={
            questions.filter((question) => question.status !== "answered")
              .length
              ? `${questions.filter((question) => question.status !== "answered").length} open`
              : "None"
          }
        />
      </View>
      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Nutrition / hydration support
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Pregnancy nutrition needs vary. Speak to your healthcare professional
          or dietitian if unsure.
        </Text>
      </AppCard>
    </View>
  );
}

function CalendarTab({
  calendarDate,
  overlays,
  setCalendarDate,
  week,
}: {
  calendarDate: Date;
  overlays: PregnancyCalendarOverlay[];
  setCalendarDate: (date: Date) => void;
  week: PregnancyWeekSummary | null;
}) {
  const days = useMemo(
    () => eachDate(startOfMonth(calendarDate), endOfMonth(calendarDate)),
    [calendarDate],
  );
  const selected = toDateKey(calendarDate);
  const selectedOverlays = overlays.filter(
    (overlay) => overlay.date === selected,
  );

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Pregnancy Calendar"
        subtitle="Private compact calendar with pregnancy overlays."
      />
      <AppCard backgroundColor="#fdf2f8">
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Week progress
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          {week?.weekNumber
            ? `Estimated week ${week.weekNumber} + ${week.dayNumber} days.`
            : "Add an estimated due date or last period date to calculate pregnancy week."}
        </Text>
      </AppCard>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <SmallButton
          label="Previous"
          onPress={() =>
            setCalendarDate(
              new Date(
                calendarDate.getFullYear(),
                calendarDate.getMonth() - 1,
                1,
              ),
            )
          }
        />
        <SmallButton
          label={monthLabel(calendarDate)}
          onPress={() => setCalendarDate(new Date())}
        />
        <SmallButton
          label="Next"
          onPress={() =>
            setCalendarDate(
              new Date(
                calendarDate.getFullYear(),
                calendarDate.getMonth() + 1,
                1,
              ),
            )
          }
        />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {days.map((date) => {
          const dateKey = toDateKey(date);
          const dayOverlays = overlays.filter(
            (overlay) => overlay.date === dateKey,
          );
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              key={dateKey}
              onPress={() => setCalendarDate(date)}
              style={{
                backgroundColor: selected === dateKey ? "#fdf2f8" : "#ffffff",
                borderColor: dayOverlays[0]?.color ?? "#e2e8f0",
                borderRadius: 14,
                borderWidth: dayOverlays.length ? 2 : 1,
                minHeight: 62,
                padding: 7,
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
                {date.getDate()}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 6,
                }}
              >
                {dayOverlays.slice(0, 2).map((overlay) => (
                  <View
                    key={overlay.id}
                    style={{
                      backgroundColor: overlay.color,
                      borderRadius: 999,
                      height: 7,
                      marginHorizontal: 1,
                      width: 7,
                    }}
                  />
                ))}
                {dayOverlays.length > 2 ? (
                  <Text style={{ color: "#64748b", fontSize: 10 }}>
                    +{dayOverlays.length - 2}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          {selected}
        </Text>
        {selectedOverlays.length ? (
          selectedOverlays.map((overlay) => (
            <Text
              key={overlay.id}
              style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}
            >
              {overlay.label} - {formatValue(overlay.type)}
            </Text>
          ))
        ) : (
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            No pregnancy calendar item for this day.
          </Text>
        )}
      </AppCard>
    </View>
  );
}

function AppointmentsTab({
  appointments,
  onChange,
}: {
  appointments: PregnancyAppointment[];
  onChange: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [appointmentType, setAppointmentType] =
    useState<PregnancyAppointmentType>("routine_checkup");
  const [scheduledAt, setScheduledAt] = useState(
    `${toDateKey(new Date())}T10:00:00`,
  );
  const [provider, setProvider] = useState("");
  const [location, setLocation] = useState("");
  const [questionsToAsk, setQuestionsToAsk] = useState("");
  const [notes, setNotes] = useState("");

  async function saveAppointment() {
    if (!title.trim()) return;
    await createPregnancyAppointment({
      appointmentType,
      location,
      notes,
      provider,
      questionsToAsk,
      scheduledAt,
      title,
    });
    setTitle("");
    setNotes("");
    setQuestionsToAsk("");
    await onChange();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Appointments"
        subtitle="Create private pregnancy appointment cards."
      />
      <AppCard>
        <View style={{ gap: 12 }}>
          <TextInput
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={title}
          />
          <ChipGroup
            current={appointmentType}
            options={APPOINTMENT_TYPES}
            onSelect={(value) =>
              setAppointmentType(value as PregnancyAppointmentType)
            }
          />
          <TextInput
            onChangeText={setScheduledAt}
            placeholder="Date/time ISO"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={scheduledAt}
          />
          <TextInput
            onChangeText={setProvider}
            placeholder="Provider / clinic"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={provider}
          />
          <TextInput
            onChangeText={setLocation}
            placeholder="Location"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={location}
          />
          <TextInput
            multiline
            onChangeText={setQuestionsToAsk}
            placeholder="Questions to ask"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 82, paddingTop: 12 }}
            value={questionsToAsk}
          />
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="Notes or instructions received"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 82, paddingTop: 12 }}
            value={notes}
          />
          <AppButton onPress={saveAppointment} title="Save Appointment" />
        </View>
      </AppCard>
      {appointments.length ? (
        appointments.map((appointment) => (
          <AppCard key={appointment.id}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {appointment.title}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 5 }}>
              {formatDateTime(appointment.scheduledAt)} -{" "}
              {formatValue(appointment.appointmentType)}
            </Text>
            {appointment.questionsToAsk ? (
              <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 5 }}>
                Questions: {appointment.questionsToAsk}
              </Text>
            ) : null}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <SmallButton
                label="Open records"
                onPress={() => router.push("/records" as Href)}
              />
              <SmallButton
                label="Delete"
                onPress={() =>
                  deletePregnancyAppointment(appointment.id).then(onChange)
                }
              />
            </View>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            No pregnancy appointments added yet.
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function SymptomsTab({
  onChange,
  symptoms,
}: {
  onChange: () => Promise<void>;
  symptoms: PregnancySymptomLog[];
}) {
  const [symptomKey, setSymptomKey] = useState("Nausea");
  const [severity, setSeverity] =
    useState<PregnancySymptomLog["severity"]>("mild");
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString());
  const [notes, setNotes] = useState("");

  async function saveSymptom() {
    await createPregnancySymptomLog({ loggedAt, notes, severity, symptomKey });
    setNotes("");
    await onChange();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Symptoms"
        subtitle="Track notes without interpretation."
      />
      <AppCard>
        <View style={{ gap: 12 }}>
          <ChipGroup
            current={symptomKey}
            options={SYMPTOMS.map((symptom) => ({
              key: symptom,
              label: symptom,
            }))}
            onSelect={setSymptomKey}
          />
          <ChipGroup
            current={severity ?? ""}
            options={[
              { key: "mild", label: "Mild" },
              { key: "moderate", label: "Moderate" },
              { key: "severe", label: "Severe" },
            ]}
            onSelect={(value) =>
              setSeverity(value as PregnancySymptomLog["severity"])
            }
          />
          <TextInput
            onChangeText={setLoggedAt}
            placeholder="Date/time ISO"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={loggedAt}
          />
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="Notes"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 82, paddingTop: 12 }}
            value={notes}
          />
          <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
            {SYMPTOM_FOOTER}
          </Text>
          <AppButton onPress={saveSymptom} title="Save Symptom" />
        </View>
      </AppCard>
      {symptoms.length ? (
        symptoms.slice(0, 10).map((symptom) => (
          <AppCard key={symptom.id}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {symptom.symptomKey}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 5 }}>
              {formatDateTime(symptom.loggedAt)} -{" "}
              {formatValue(symptom.severity ?? "logged")}
            </Text>
            {symptom.notes ? (
              <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 5 }}>
                {symptom.notes}
              </Text>
            ) : null}
            <SmallButton
              label="Delete"
              onPress={() =>
                deletePregnancySymptomLog(symptom.id).then(onChange)
              }
            />
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            No symptoms logged yet.
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function QuestionsTab({
  onChange,
  questions,
}: {
  onChange: () => Promise<void>;
  questions: PregnancyQuestion[];
}) {
  const [question, setQuestion] = useState("");
  const [category, setCategory] =
    useState<PregnancyQuestion["category"]>("symptoms");
  const [answerNotes, setAnswerNotes] = useState("");

  async function saveQuestion() {
    if (!question.trim()) return;
    await createPregnancyQuestion({ answerNotes, category, question });
    setQuestion("");
    setAnswerNotes("");
    await onChange();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Questions"
        subtitle="Save questions you want to ask your doctor, midwife, nurse, or clinic."
      />
      <AppCard>
        <View style={{ gap: 12 }}>
          <TextInput
            multiline
            onChangeText={setQuestion}
            placeholder="Question"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 82, paddingTop: 12 }}
            value={question}
          />
          <ChipGroup
            current={category}
            options={QUESTION_CATEGORIES}
            onSelect={(value) =>
              setCategory(value as PregnancyQuestion["category"])
            }
          />
          <TextInput
            multiline
            onChangeText={setAnswerNotes}
            placeholder="Answer / notes optional"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 82, paddingTop: 12 }}
            value={answerNotes}
          />
          <AppButton onPress={saveQuestion} title="Save Question" />
        </View>
      </AppCard>
      {questions.length ? (
        questions.map((item) => (
          <AppCard key={item.id}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {item.question}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 5 }}>
              {formatValue(item.category)} - {formatValue(item.status)}
            </Text>
            {item.answerNotes ? (
              <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 5 }}>
                {item.answerNotes}
              </Text>
            ) : null}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <SmallButton
                label="Mark asked"
                onPress={() =>
                  markPregnancyQuestionAsked(item.id).then(onChange)
                }
              />
              <SmallButton
                label="Mark answered"
                onPress={() =>
                  markPregnancyQuestionAnswered(item.id, item.answerNotes).then(
                    onChange,
                  )
                }
              />
            </View>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Save questions you want to ask your doctor, midwife, nurse, or
            clinic.
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function ConnectionsTab({
  summaries,
}: {
  summaries: Record<
    "medication" | "nutrition" | "records" | "supplements" | "workout",
    string
  >;
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Connections"
        subtitle="Pregnancy Mode can organize links to other health realms."
      />
      <ConnectionCard
        button="Open Medication"
        footer={MEDS_FOOTER}
        route="/medication"
        title="Review medication and supplements"
        value={`${summaries.medication}. ${summaries.supplements}.`}
      />
      <ConnectionCard
        button="Open Nutrition"
        footer="Pregnancy nutrition needs vary. Speak to your healthcare professional or dietitian if unsure."
        route="/food"
        title="Food / Nutrition"
        value={summaries.nutrition}
      />
      <ConnectionCard
        button="Open Workout"
        footer="Check with your healthcare professional about activity during pregnancy, especially if you have symptoms or medical concerns."
        route="/fitness"
        title="Workout"
        value={summaries.workout}
      />
      <ConnectionCard
        button="Open Records"
        footer="Add scans, lab results, prescriptions, or clinic notes for reference. The app does not interpret results."
        route="/records"
        title="Records"
        value={summaries.records}
      />
    </View>
  );
}

function ConnectionCard({
  button,
  footer,
  route,
  title,
  value,
}: {
  button: string;
  footer: string;
  route: Href;
  title: string;
  value: string;
}) {
  return (
    <AppCard>
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
        {title}
      </Text>
      <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
        {value}
      </Text>
      <Text
        style={{ color: "#64748b", fontSize: 12, lineHeight: 18, marginTop: 8 }}
      >
        {footer}
      </Text>
      <SmallButton label={button} onPress={() => router.push(route)} />
    </AppCard>
  );
}

function ReportsTab({
  appointments,
  questions,
  symptoms,
}: {
  appointments: PregnancyAppointment[];
  questions: PregnancyQuestion[];
  symptoms: PregnancySymptomLog[];
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Reports"
        subtitle="Based on your logs, for discussion with your healthcare professional."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <MetricCard label="Appointments" value={`${appointments.length}`} />
        <MetricCard label="Symptoms" value={`${symptoms.length}`} />
        <MetricCard label="Questions" value={`${questions.length}`} />
        <MetricCard
          label="Asked"
          value={`${questions.filter((question) => question.status === "asked").length}`}
        />
      </View>
      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Calendar overview
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          {appointments[0]
            ? `Latest appointment: ${appointments[0].title}.`
            : "No pregnancy appointments added yet."}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          {symptoms[0]
            ? `Latest symptom note: ${symptoms[0].symptomKey}.`
            : "No symptom timeline yet."}
        </Text>
      </AppCard>
    </View>
  );
}

function LearnTab({ cards }: { cards: PregnancyTrustedLearnCard[] }) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Learn"
        subtitle="Trusted source-backed education. No app-made medical instructions."
      />
      {cards.map((card) => (
        <AppCard key={card.id}>
          <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
            {card.title}
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            {card.summary}
          </Text>
          <Text style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>
            {card.sourceName} - last checked {card.lastCheckedAt}
          </Text>
          <Text style={{ color: "#a21caf", fontSize: 12, marginTop: 4 }}>
            {card.url}
          </Text>
          <Text
            style={{
              color: "#64748b",
              fontSize: 12,
              lineHeight: 18,
              marginTop: 8,
            }}
          >
            {card.disclaimer}
          </Text>
        </AppCard>
      ))}
    </View>
  );
}

function PrivacyTab({
  onChange,
  profile,
}: {
  onChange: () => Promise<void>;
  profile: PregnancyProfile;
}) {
  const [shareWeek, setShareWeek] = useState(
    profile.privacy === "shared_selected",
  );

  async function saveSharing(value: boolean) {
    setShareWeek(value);
    await updatePregnancyProfile({
      privacy: value ? "shared_selected" : "private",
    });
    if (value) {
      await createPregnancySharePermission({
        category: "pregnancy_week",
        ownerProfileId: profile.profileId,
        permissionLevel: "view",
      });
      await createPregnancySharePermission({
        category: "due_date",
        ownerProfileId: profile.profileId,
        permissionLevel: "view",
      });
    }
    await onChange();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Privacy"
        subtitle="Pregnancy Mode is private by default."
      />
      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Sharing controls
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Partner, family, and caregivers cannot see Pregnancy Mode unless you
          explicitly share selected categories.
        </Text>
        <ToggleRow
          label="Share pregnancy week and due date with selected people"
          onChange={saveSharing}
          value={shareWeek}
        />
      </AppCard>
      <AppButton
        onPress={() => endPregnancyMode().then(onChange)}
        title="End Pregnancy Mode"
        variant="secondary"
      />
    </View>
  );
}

function FooterCard() {
  return (
    <AppCard backgroundColor="#f8fafc">
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
        Safety note
      </Text>
      <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
        {FOOTER}
      </Text>
      <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
        {DATE_FOOTER}
      </Text>
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
            backgroundColor: current === option.key ? "#a21caf" : "#f8fafc",
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
  onChange: (value: boolean) => void | Promise<void>;
  value: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
        padding: 12,
      }}
    >
      <Text style={{ color: "#0f172a", flex: 1, fontWeight: "900" }}>
        {label}
      </Text>
      <Switch onValueChange={onChange} value={value} />
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
        alignSelf: "flex-start",
        backgroundColor: "#f8fafc",
        borderRadius: 999,
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text style={{ color: "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function toTab(value?: string): PregnancyTab {
  return TABS.some((tab) => tab.key === value)
    ? (value as PregnancyTab)
    : "today";
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function eachDate(startDate: Date, endDate: Date) {
  const days: Date[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(12, 0, 0, 0);
  while (cursor.getTime() <= endDate.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
