import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  calculatePregnancyWeekSummary,
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
} from "@/lib/pregnancyStorage";
import type {
  PregnancyAppointment,
  PregnancyProfile,
  PregnancyTrustedLearnCard,
  PregnancyWeekSummary,
} from "@/types/pregnancy";

import type {
  HealthOSChecklistSection,
  HealthOSPregnancyContentItem,
  HealthOSPregnancyData,
  HealthOSPregnancyPrivacyStatus,
  HealthOSPregnancyStatus,
  HealthOSTrimester,
} from "./HealthOSPregnancyTypes";

const QUICK_LOG_OPTIONS = [
  { key: "symptom", label: "Log symptom" },
  { key: "mood", label: "Log mood" },
  { key: "pain", label: "Log pain" },
  { key: "appointmentNote", label: "Appointment note" },
  { key: "babyMovement", label: "Baby movement note" },
  { key: "note", label: "General note" },
] satisfies HealthOSPregnancyData["quickLogOptions"];

const INITIAL_DATA: HealthOSPregnancyData = {
  afterBirthPlan: makeChecklist("after-birth", "After-birth plan", "Plan home support, visits, appointments, and recovery. Completion is UI-only in this phase.", [
    "Home setup",
    "Feeding support",
    "Recovery support",
    "Sleep shifts",
    "Visitors",
    "Emergency contacts",
    "Baby appointments",
    "Mom appointments",
    "Family help",
    "Transport",
    "Documents",
  ]),
  appointments: [],
  babyGrowth: {
    status: "Weekly baby growth tips will appear when pregnancy content is connected.",
    weekLabel: "No week yet",
  },
  babyProfile: {
    genderStatus: "Unknown / update later is supported in the setup foundation.",
    status: "Baby profile creation routes to the Baby/Child flow when the user confirms.",
  },
  careTeamAccess: {
    roles: ["doctor", "nursingSister", "midwife", "caregiver"],
    status: "Care team access is UI foundation only until invite permissions are wired.",
  },
  contentPreview: [],
  currentTrimester: "unknown",
  dueDate: undefined,
  emptyState: "Start pregnancy mode when you're ready.",
  error: null,
  familyUpdates: {
    count: 0,
    status: "No family updates are shared automatically.",
  },
  hospitalBagChecklist: makeChecklist("hospital-bag", "Hospital bag checklist", "Practical starter planning only. Hospitals can vary, so these are not requirements.", [
    "Mom essentials",
    "Baby essentials",
    "Partner essentials",
    "Documents",
    "Optional comfort items",
    "Feeding items",
    "Going-home outfit",
    "Nappies / diapers",
    "Pacifier if wanted",
    "Chargers",
    "Toiletries",
  ]),
  loading: true,
  momChecklist: makeChecklist("mom", "Mom checklist", "Starter planning categories. Completion is not persisted yet.", [
    "Appointments",
    "Documents",
    "Hospital bag",
    "Birth plan",
    "After-birth care",
    "Feeding plan",
    "Baby essentials",
    "Recovery support",
    "Family support",
  ]),
  motherHealthSummary: {
    appointmentStatus: "No pregnancy appointments added yet.",
    moodCheckIns: 0,
    painCount: 0,
    sleepWaterStatus: "Sleep and water check-ins are not connected yet.",
    status: "Pregnancy health check-ins will appear here when you log them.",
    supplementStatus: "No supplements listed",
    symptomCount: 0,
    weightTrendStatus: "No pregnancy weight trend connected yet.",
  },
  partnerChecklist: makeChecklist("partner", "Partner checklist", "Help prepare support, transport, documents, and after-birth care.", [
    "Appointment support",
    "Hospital bag for partner",
    "Documents and transport",
    "After-birth support plan",
    "Feeding support",
    "Night routine planning",
    "Emergency contacts",
  ]),
  pregnancyStatus: "notStarted",
  privacyStatus: "unknown",
  profile: null,
  progress: {
    accessibleLabel: "No due date yet. Add your due date to build your pregnancy timeline.",
    percent: 0,
    status: "Add your due date to build your pregnancy timeline.",
  },
  questions: [],
  quickLogOptions: QUICK_LOG_OPTIONS,
  setupState: "Start pregnancy mode when you're ready.",
  supplements: {
    medicationSummary: "No medications listed",
    nutritionSummary: "No nutrition logs today",
    recordsSummary: "No records added yet",
    supplementSummary: "No supplements listed",
    workoutSummary: "0 active minutes logged",
  },
  symptoms: [],
  trustedCards: [],
  week: null,
  weekOverview: {
    nextAppointment: "No appointment",
    nextChecklistItem: "Add your due date to see next steps.",
    trimester: "Add due date",
    week: "Add due date",
  },
};

export function useHealthOSPregnancyData() {
  const [data, setData] = useState<HealthOSPregnancyData>(INITIAL_DATA);

  const load = useCallback(async () => {
    setData((current) => ({ ...current, loading: true, error: null }));
    try {
      const profile = await getPregnancyProfile();
      const rangeStart = addDays(new Date(), -90);
      const rangeEnd = new Date();
      const calendarStart = addDays(new Date(), -30);
      const calendarEnd = addDays(new Date(), 180);
      const [
        week,
        appointments,
        symptoms,
        questions,
        trustedCards,
        medicationSummary,
        supplementSummary,
        nutritionSummary,
        workoutSummary,
        recordsSummary,
      ] = await Promise.all([
        calculatePregnancyWeekSummary(profile ?? undefined),
        getPregnancyAppointments(),
        getPregnancySymptomsByRange(rangeStart, rangeEnd),
        getPregnancyQuestions(),
        getTrustedPregnancyLearnCards(),
        getPregnancyMedicationReviewSummary(),
        getPregnancySupplementReviewSummary(),
        getPregnancyNutritionSummary(),
        getPregnancyWorkoutSummary(),
        getPregnancyRecordsSummary(),
        generatePregnancyCalendarEvents(calendarStart, calendarEnd),
      ]);

      setData({
        ...INITIAL_DATA,
        appointments,
        babyProfile: {
          dueDate: week.estimatedDueDate,
          genderStatus: "Unknown / update later is supported in the setup foundation.",
          status: "Baby profile creation routes to the Baby/Child flow when the user confirms.",
        },
        babyGrowth: mapBabyGrowth(week, trustedCards),
        contentPreview: mapTrustedCards(trustedCards),
        currentTrimester: toTrimester(week.trimester),
        currentWeek: week.weekNumber || undefined,
        dueDate: week.estimatedDueDate,
        emptyState: profile?.status === "active" ? null : "Start pregnancy mode when you're ready.",
        familyUpdates: {
          count: 0,
          status: "No family updates are shared automatically. You choose what family can see.",
        },
        loading: false,
        motherHealthSummary: mapMotherHealth(appointments, symptoms, supplementSummary),
        pregnancyStatus: mapPregnancyStatus(profile),
        privacyStatus: mapPrivacyStatus(profile),
        profile,
        progress: mapProgress(week),
        questions,
        setupState: mapSetupState(profile, week),
        supplements: {
          medicationSummary,
          nutritionSummary,
          recordsSummary,
          supplementSummary,
          workoutSummary,
        },
        symptoms,
        trustedCards,
        week,
        weekOverview: mapWeekOverview(week, appointments),
      });
    } catch (error) {
      setData((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Pregnancy data could not be loaded.",
        loading: false,
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { ...data, reload: load };
}

function mapPregnancyStatus(profile: PregnancyProfile | null): HealthOSPregnancyStatus {
  if (!profile) return "notStarted";
  if (profile.status === "active") return "active";
  if (profile.status === "disabled") return "setupNeeded";
  if (profile.status === "ended") return "completed";
  return "unknown";
}

function mapPrivacyStatus(profile: PregnancyProfile | null): HealthOSPregnancyPrivacyStatus {
  if (!profile) return "unknown";
  return profile.privacy === "shared_selected" ? "sharedSelected" : "private";
}

function mapSetupState(profile: PregnancyProfile | null, week: PregnancyWeekSummary) {
  if (!profile) return "Pregnancy tools are ready when you are.";
  if (profile.status === "ended") return "Pregnancy mode is ended. Your history stays private.";
  if (!week.estimatedDueDate) return "Add your due date to build your pregnancy timeline.";
  if (week.weekNumber) return `Week ${week.weekNumber} + ${week.dayNumber} is estimated from your saved dates.`;
  return "Pregnancy mode is active.";
}

function mapProgress(week: PregnancyWeekSummary) {
  if (!week.estimatedDueDate || !week.weekNumber) {
    return {
      accessibleLabel: "No due date yet. Add your due date to build your pregnancy timeline.",
      percent: 0,
      status: "No due date yet",
    };
  }

  const elapsedDays = Math.max(0, week.weekNumber * 7 + week.dayNumber);
  const percent = Math.min(100, Math.round((elapsedDays / 280) * 100));
  const daysRemaining = week.daysUntilDueDate;
  const weeksRemaining = daysRemaining === undefined ? undefined : Math.max(0, Math.ceil(daysRemaining / 7));
  return {
    accessibleLabel: `${percent}% complete. Week ${week.weekNumber} plus ${week.dayNumber}. ${daysRemaining ?? "Unknown"} days remaining.`,
    daysRemaining,
    percent,
    status: `Week ${week.weekNumber} + ${week.dayNumber}`,
    weeksRemaining,
  };
}

function mapWeekOverview(
  week: PregnancyWeekSummary,
  appointments: PregnancyAppointment[],
) {
  const nextAppointment = appointments.find(
    (appointment) => new Date(appointment.scheduledAt).getTime() >= Date.now(),
  );
  return {
    nextAppointment: nextAppointment
      ? `${nextAppointment.title} · ${formatDate(nextAppointment.scheduledAt)}`
      : "No appointment",
    nextChecklistItem: "Review practical planning checklist",
    trimester: week.trimester === "unknown" ? "Add due date" : formatValue(week.trimester),
    week: week.weekNumber ? `Week ${week.weekNumber} + ${week.dayNumber}` : "Add due date",
  };
}

function mapBabyGrowth(
  week: PregnancyWeekSummary,
  trustedCards: PregnancyTrustedLearnCard[],
) {
  const source = trustedCards.find(
    (card) => card.category === "week_by_week" || card.title.toLowerCase().includes("week"),
  );
  return {
    content: source ? mapTrustedCard(source) : undefined,
    status: source
      ? "Source-backed weekly education is available."
      : "Weekly baby growth tips will appear when pregnancy content is connected.",
    weekLabel: week.weekNumber ? `Week ${week.weekNumber}` : "No week yet",
  };
}

function mapMotherHealth(
  appointments: PregnancyAppointment[],
  symptoms: HealthOSPregnancyData["symptoms"],
  supplementStatus: string,
) {
  const painCount = symptoms.filter((symptom) =>
    /pain|cramp|back|headache/i.test(symptom.symptomKey),
  ).length;
  const latestSymptom = symptoms[0];
  const nextAppointment = appointments.find(
    (appointment) => new Date(appointment.scheduledAt).getTime() >= Date.now(),
  );
  return {
    appointmentStatus: nextAppointment
      ? `${nextAppointment.title} · ${formatDate(nextAppointment.scheduledAt)}`
      : "No pregnancy appointments added yet.",
    latestSymptom,
    moodCheckIns: symptoms.filter((symptom) => /mood|anxious|stressed|calm|happy/i.test(symptom.symptomKey)).length,
    painCount,
    sleepWaterStatus: "Sleep and water check-ins are not connected yet.",
    status: symptoms.length
      ? `${symptoms.length} private logs in the last 90 days.`
      : "Pregnancy health check-ins will appear here when you log them.",
    supplementStatus,
    symptomCount: symptoms.length,
    weightTrendStatus: "No pregnancy weight trend connected yet.",
  };
}

function mapTrustedCards(cards: PregnancyTrustedLearnCard[]): HealthOSPregnancyContentItem[] {
  return cards.map(mapTrustedCard);
}

function mapTrustedCard(card: PregnancyTrustedLearnCard): HealthOSPregnancyContentItem {
  return {
    id: card.id,
    publishedAt: card.publishedOrReviewedAt ?? card.lastCheckedAt,
    sourceName: card.sourceName,
    sourceUrl: card.url,
    summary: card.summary,
    title: card.title,
    topic: formatValue(card.category),
  };
}

function makeChecklist(id: string, title: string, description: string, labels: string[]): HealthOSChecklistSection {
  return {
    description,
    id,
    items: labels.map((label) => ({
      completed: false,
      id: `${id}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label,
    })),
    persisted: false,
    title,
  };
}

function toTrimester(value: PregnancyWeekSummary["trimester"]): HealthOSTrimester {
  if (value === "first" || value === "second" || value === "third") return value;
  return "unknown";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
