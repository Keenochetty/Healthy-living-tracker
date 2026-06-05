import AsyncStorage from "@react-native-async-storage/async-storage";

import { getPregnancyAppointments as getLegacyPregnancyAppointments, getPregnancyProfile as getLegacyPregnancyProfile, getPregnancySymptomLogs as getLegacyPregnancySymptomLogs } from "@/lib/cycleStorage";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getRecordsOverviewSummary } from "@/lib/healthRecordsStorage";
import { calculateTodayMedicationSchedule, calculateTodaySupplementSchedule } from "@/lib/medicationSupplementStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import type { WidgetKey } from "@/types/app";
import type {
  PregnancyAppointment,
  PregnancyCalendarOverlay,
  PregnancyDateBasis,
  PregnancyEventType,
  PregnancyProfile,
  PregnancyQuestion,
  PregnancySharePermission,
  PregnancySymptomLog,
  PregnancyTrustedLearnCard,
  PregnancyWeekSummary
} from "@/types/pregnancy";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const PREGNANCY_PROFILES_KEY = "family_health_phase15b_pregnancy_profiles";
const PREGNANCY_APPOINTMENTS_KEY = "family_health_phase15b_pregnancy_appointments";
const PREGNANCY_SYMPTOMS_KEY = "family_health_phase15b_pregnancy_symptoms";
const PREGNANCY_QUESTIONS_KEY = "family_health_phase15b_pregnancy_questions";
const PREGNANCY_SHARE_PERMISSIONS_KEY = "family_health_phase15b_pregnancy_share_permissions";

export const PREGNANCY_WIDGET_KEYS = [
  "pregnancy_week",
  "pregnancy_due_date",
  "pregnancy_next_appointment",
  "pregnancy_symptom_log",
  "pregnancy_medication_review",
  "pregnancy_question",
  "pregnancy_record",
  "pregnancy_privacy_status"
] as const satisfies WidgetKey[];

export function isPregnancyWidget(widgetKey: WidgetKey) {
  return PREGNANCY_WIDGET_KEYS.includes(widgetKey as (typeof PREGNANCY_WIDGET_KEYS)[number]);
}

export function getAvailablePregnancyWidgets() {
  return PREGNANCY_WIDGET_KEYS;
}

export async function enablePregnancyMode(input: Partial<PregnancyProfile> = {}) {
  const now = new Date().toISOString();
  const current = await getPregnancyProfile();
  const profile: PregnancyProfile = {
    ...current,
    ...input,
    activatedAt: current?.activatedAt ?? input.activatedAt ?? now,
    createdAt: current?.createdAt ?? now,
    dateBasis: input.dateBasis ?? current?.dateBasis ?? inferDateBasis(input, current),
    id: current?.id ?? createId("pregnancy-profile"),
    privacy: input.privacy ?? current?.privacy ?? "private",
    profileId: input.profileId ?? current?.profileId ?? LOCAL_PROFILE_ID,
    status: "active",
    updatedAt: now,
    userId: LOCAL_USER_ID
  };

  return savePregnancyProfile(profile);
}

export async function disablePregnancyMode() {
  const profile = await getPregnancyProfile();
  if (!profile) return null;
  return savePregnancyProfile({ ...profile, status: "disabled", updatedAt: new Date().toISOString() });
}

export async function endPregnancyMode() {
  const profile = await getPregnancyProfile();
  if (!profile) return null;
  const now = new Date().toISOString();
  return savePregnancyProfile({ ...profile, endedAt: now, status: "ended", updatedAt: now });
}

export async function getPregnancyProfile(profileId = LOCAL_PROFILE_ID): Promise<PregnancyProfile | null> {
  const stored = (await readJsonArray<PregnancyProfile>(PREGNANCY_PROFILES_KEY)).find((item) => item.profileId === profileId);
  if (stored) return stored;

  const legacy = await getLegacyPregnancyProfile().catch(() => null);
  if (!legacy || legacy.status === "not_tracking") return null;

  const now = new Date().toISOString();
  const legacyProfile: PregnancyProfile = {
    activatedAt: legacy.createdAt,
    createdAt: legacy.createdAt,
    dateBasis: legacy.estimatedDueDate ? "estimated_due_date" : legacy.lastPeriodStartDate ? "last_menstrual_period" : "manual",
    estimatedDueDate: legacy.estimatedDueDate,
    id: `legacy-${legacy.id}`,
    lastMenstrualPeriodDate: legacy.lastPeriodStartDate,
    privacy: "private",
    profileId,
    providerName: undefined,
    status: legacy.status === "postpartum" ? "ended" : "active",
    updatedAt: legacy.updatedAt ?? now,
    userId: LOCAL_USER_ID
  };
  return legacyProfile;
}

export async function updatePregnancyProfile(partial: Partial<PregnancyProfile>) {
  const current = await getPregnancyProfile();
  if (!current) return enablePregnancyMode(partial);
  return savePregnancyProfile({ ...current, ...partial, updatedAt: new Date().toISOString() });
}

async function savePregnancyProfile(profile: PregnancyProfile) {
  const profiles = await readJsonArray<PregnancyProfile>(PREGNANCY_PROFILES_KEY);
  await writeJsonArray(PREGNANCY_PROFILES_KEY, [profile, ...profiles.filter((item) => item.profileId !== profile.profileId)]);
  return profile;
}

export function calculateEstimatedDueDateFromLmp(lmpDate?: string) {
  if (!lmpDate) return undefined;
  return toDateKey(addDays(parseDate(lmpDate), 280));
}

export function calculatePregnancyAgeFromDueDate(estimatedDueDate?: string) {
  if (!estimatedDueDate) return null;
  const due = parseDate(estimatedDueDate);
  if (Number.isNaN(due.getTime())) return null;
  const pregnancyStart = addDays(due, -280);
  const today = startOfDay(new Date());
  const ageDays = Math.max(0, Math.floor((today.getTime() - pregnancyStart.getTime()) / 86400000));
  return { dayNumber: ageDays % 7, weekNumber: Math.floor(ageDays / 7) };
}

export function calculateTrimester(weekNumber?: number): PregnancyWeekSummary["trimester"] {
  if (!weekNumber || weekNumber < 1) return "unknown";
  if (weekNumber <= 13) return "first";
  if (weekNumber <= 27) return "second";
  return "third";
}

export async function calculatePregnancyWeekSummary(profile = undefined as PregnancyProfile | undefined): Promise<PregnancyWeekSummary> {
  const pregnancyProfile = profile ?? await getPregnancyProfile();
  const now = new Date().toISOString();

  if (!pregnancyProfile) {
    return {
      generatedAt: now,
      pregnancyProfileId: "none",
      sourceBasis: "manual",
      trimester: "unknown",
      weekNumber: 0,
      dayNumber: 0
    };
  }

  const estimatedDueDate = getEstimatedDueDate(pregnancyProfile);
  const age = calculatePregnancyAgeFromDueDate(estimatedDueDate);
  const daysUntilDueDate = estimatedDueDate
    ? Math.ceil((parseDate(estimatedDueDate).getTime() - startOfDay(new Date()).getTime()) / 86400000)
    : undefined;

  return {
    daysUntilDueDate,
    estimatedDueDate,
    generatedAt: now,
    pregnancyProfileId: pregnancyProfile.id,
    sourceBasis: pregnancyProfile.dateBasis,
    trimester: calculateTrimester(age?.weekNumber),
    weekNumber: age?.weekNumber ?? 0,
    dayNumber: age?.dayNumber ?? 0
  };
}

export async function createPregnancyAppointment(input: Omit<PregnancyAppointment, "createdAt" | "id" | "isPrivate" | "pregnancyProfileId" | "profileId" | "updatedAt" | "userId">) {
  const profile = await ensurePregnancyProfile();
  const now = new Date().toISOString();
  const appointment: PregnancyAppointment = {
    ...input,
    createdAt: now,
    id: createId("pregnancy-appointment"),
    instructionsReceived: clean(input.instructionsReceived),
    isPrivate: true,
    location: clean(input.location),
    notes: clean(input.notes),
    practitioner: clean(input.practitioner),
    pregnancyProfileId: profile.id,
    profileId: profile.profileId,
    provider: clean(input.provider),
    questionsToAsk: clean(input.questionsToAsk),
    relatedDocumentIds: input.relatedDocumentIds?.filter(Boolean),
    title: input.title.trim(),
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const appointments = await readStoredAppointments();
  await writeJsonArray(PREGNANCY_APPOINTMENTS_KEY, [appointment, ...appointments]);
  return appointment;
}

export async function getPregnancyAppointments() {
  const profile = await getPregnancyProfile();
  const [stored, legacy] = await Promise.all([readStoredAppointments(), getLegacyPregnancyAppointments().catch(() => [])]);
  const legacyMapped = legacy.map<PregnancyAppointment>((appointment) => ({
    appointmentType: "other",
    createdAt: appointment.createdAt,
    id: `legacy-${appointment.id}`,
    isPrivate: true,
    notes: appointment.notes,
    pregnancyProfileId: profile?.id ?? appointment.pregnancyProfileId,
    profileId: LOCAL_PROFILE_ID,
    scheduledAt: appointment.appointmentDate,
    title: appointment.title,
    updatedAt: appointment.updatedAt,
    userId: LOCAL_USER_ID
  }));
  const byId = new Map<string, PregnancyAppointment>();
  [...legacyMapped, ...stored].forEach((item) => byId.set(item.id, item));
  return sortByDate(Array.from(byId.values()));
}

export async function updatePregnancyAppointment(id: string, partial: Partial<PregnancyAppointment>) {
  const appointments = await readStoredAppointments();
  const updated = appointments.map((appointment) =>
    appointment.id === id ? { ...appointment, ...partial, isPrivate: true, updatedAt: new Date().toISOString() } : appointment
  );
  await writeJsonArray(PREGNANCY_APPOINTMENTS_KEY, updated);
  return updated.find((appointment) => appointment.id === id) ?? null;
}

export async function deletePregnancyAppointment(id: string) {
  const appointments = await readStoredAppointments();
  await writeJsonArray(PREGNANCY_APPOINTMENTS_KEY, appointments.filter((appointment) => appointment.id !== id));
}

export async function linkPregnancyAppointmentToCalendar(id: string) {
  return updatePregnancyAppointment(id, { notes: "Linked to Calendar / Timeline." });
}

export async function linkPregnancyAppointmentToRecords(id: string, recordIds: string[] = []) {
  return updatePregnancyAppointment(id, { relatedDocumentIds: recordIds });
}

export async function createPregnancySymptomLog(input: Omit<PregnancySymptomLog, "createdAt" | "id" | "pregnancyProfileId" | "profileId" | "updatedAt" | "userId">) {
  const profile = await ensurePregnancyProfile();
  const now = new Date().toISOString();
  const log: PregnancySymptomLog = {
    ...input,
    createdAt: now,
    id: createId("pregnancy-symptom"),
    notes: clean(input.notes),
    pregnancyProfileId: profile.id,
    profileId: profile.profileId,
    symptomKey: input.symptomKey.trim(),
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const logs = await readStoredSymptoms();
  await writeJsonArray(PREGNANCY_SYMPTOMS_KEY, [log, ...logs]);
  return log;
}

export async function getPregnancySymptomsByDate(date: string) {
  return (await getPregnancySymptomsByRange(parseDate(date), parseDate(date))).filter((log) => log.loggedAt.slice(0, 10) === date.slice(0, 10));
}

export async function getPregnancySymptomsByRange(startDate = addDays(new Date(), -30), endDate = new Date()) {
  const profile = await getPregnancyProfile();
  const [stored, legacy] = await Promise.all([readStoredSymptoms(), getLegacyPregnancySymptomLogs().catch(() => [])]);
  const legacyMapped = legacy.map<PregnancySymptomLog>((log) => ({
    createdAt: log.createdAt,
    id: `legacy-${log.id}`,
    loggedAt: log.loggedAt,
    notes: log.notes,
    pregnancyProfileId: profile?.id ?? log.pregnancyProfileId,
    profileId: LOCAL_PROFILE_ID,
    severity: log.severity === "urgent" || log.severity === "strong" ? "severe" : log.severity,
    symptomKey: log.symptom,
    updatedAt: log.createdAt,
    userId: LOCAL_USER_ID
  }));
  const byId = new Map<string, PregnancySymptomLog>();
  [...legacyMapped, ...stored].filter((log) => isWithinRange(log.loggedAt, startDate, endDate)).forEach((log) => byId.set(log.id, log));
  return sortByDate(Array.from(byId.values()));
}

export async function updatePregnancySymptomLog(id: string, partial: Partial<PregnancySymptomLog>) {
  const logs = await readStoredSymptoms();
  const updated = logs.map((log) => log.id === id ? { ...log, ...partial, updatedAt: new Date().toISOString() } : log);
  await writeJsonArray(PREGNANCY_SYMPTOMS_KEY, updated);
  return updated.find((log) => log.id === id) ?? null;
}

export async function deletePregnancySymptomLog(id: string) {
  const logs = await readStoredSymptoms();
  await writeJsonArray(PREGNANCY_SYMPTOMS_KEY, logs.filter((log) => log.id !== id));
}

export async function createPregnancyQuestion(input: Omit<PregnancyQuestion, "createdAt" | "id" | "pregnancyProfileId" | "profileId" | "status" | "updatedAt" | "userId"> & { status?: PregnancyQuestion["status"] }) {
  const profile = await ensurePregnancyProfile();
  const now = new Date().toISOString();
  const question: PregnancyQuestion = {
    ...input,
    answerNotes: clean(input.answerNotes),
    createdAt: now,
    id: createId("pregnancy-question"),
    pregnancyProfileId: profile.id,
    profileId: profile.profileId,
    question: input.question.trim(),
    status: input.status ?? "draft",
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const questions = await readStoredQuestions();
  await writeJsonArray(PREGNANCY_QUESTIONS_KEY, [question, ...questions]);
  return question;
}

export async function getPregnancyQuestions() {
  return sortByDate(await readStoredQuestions());
}

export async function updatePregnancyQuestion(id: string, partial: Partial<PregnancyQuestion>) {
  const questions = await readStoredQuestions();
  const updated = questions.map((question) => question.id === id ? { ...question, ...partial, updatedAt: new Date().toISOString() } : question);
  await writeJsonArray(PREGNANCY_QUESTIONS_KEY, updated);
  return updated.find((question) => question.id === id) ?? null;
}

export async function markPregnancyQuestionAsked(id: string) {
  return updatePregnancyQuestion(id, { status: "asked" });
}

export async function markPregnancyQuestionAnswered(id: string, answerNotes?: string) {
  return updatePregnancyQuestion(id, { answerNotes: clean(answerNotes), status: "answered" });
}

export async function getPregnancyMedicationReviewSummary() {
  const summary = await calculateTodayMedicationSchedule();
  return summary.totalCount ? `${summary.totalCount} medications listed for review` : "No medications listed";
}

export async function getPregnancySupplementReviewSummary() {
  const summary = await calculateTodaySupplementSchedule();
  return summary.totalCount ? `${summary.totalCount} supplements listed for review` : "No supplements listed";
}

export async function getPregnancyNutritionSummary() {
  const summary = await getTodayNutritionSummary();
  return summary.foodLogCount ? `${summary.foodLogCount} meal logs, ${Math.round(summary.waterMl)} ml water` : "No nutrition logs today";
}

export async function getPregnancyWorkoutSummary() {
  const summary = await getTodayFitnessSummary();
  return summary.latestWorkout ? summary.latestWorkout.title : `${summary.activeMinutesToday ?? 0} active minutes logged`;
}

export async function getPregnancyRecordsSummary() {
  const summary = await getRecordsOverviewSummary();
  return summary.recentRecords.length ? `${summary.recentRecords.length} recent records` : "No records added yet";
}

export async function generatePregnancyCalendarEvents(startDate: Date, endDate: Date) {
  const profile = await getPregnancyProfile();
  if (!profile || profile.status !== "active") return [] as PregnancyCalendarOverlay[];
  const [appointments, symptoms, questions, week] = await Promise.all([
    getPregnancyAppointments(),
    getPregnancySymptomsByRange(startDate, endDate),
    getPregnancyQuestions(),
    calculatePregnancyWeekSummary(profile)
  ]);
  const start = toDateKey(startDate);
  const end = toDateKey(endDate);
  const overlays: PregnancyCalendarOverlay[] = [];

  appointments.filter((item) => isDateInRange(item.scheduledAt.slice(0, 10), start, end)).forEach((appointment) => {
    overlays.push(makeOverlay(appointment.scheduledAt.slice(0, 10), appointmentTypeToEvent(appointment.appointmentType), appointment.title, "#a855f7", appointment.id, profile.profileId));
  });
  symptoms.forEach((symptom) => {
    overlays.push(makeOverlay(symptom.loggedAt.slice(0, 10), "symptom", "Pregnancy symptom log", "#f97316", symptom.id, profile.profileId));
  });
  questions.filter((question) => isDateInRange(question.createdAt.slice(0, 10), start, end)).forEach((question) => {
    overlays.push(makeOverlay(question.createdAt.slice(0, 10), "question", "Question note", "#3b82f6", question.id, profile.profileId));
  });
  if (week.estimatedDueDate && isDateInRange(week.estimatedDueDate, start, end)) {
    overlays.push(makeOverlay(week.estimatedDueDate, "due_date", "Estimated due date", "#db2777", profile.id, profile.profileId));
  }

  eachDate(startDate, endDate).forEach((date) => {
    const dateKey = toDateKey(date);
    const age = calculatePregnancyAgeFromDueDate(getEstimatedDueDate(profile));
    if (age && date.getDay() === 1 && isDateInRange(dateKey, start, end)) {
      overlays.push(makeOverlay(dateKey, "weekly_milestone", "Weekly pregnancy milestone", "#c084fc", `week-${dateKey}`, profile.profileId));
    }
  });

  return overlays;
}

export async function getPregnancyOverlaysForViewer(startDate: Date, endDate: Date) {
  return generatePregnancyCalendarEvents(startDate, endDate);
}

export async function filterPregnancyEventsByPermission<T>(items: T[]) {
  const profile = await getPregnancyProfile();
  return profile?.status === "active" ? items : [];
}

export async function createPregnancySharePermission(input: Omit<PregnancySharePermission, "createdAt" | "id" | "updatedAt">) {
  const now = new Date().toISOString();
  const permission: PregnancySharePermission = {
    ...input,
    createdAt: now,
    id: createId("pregnancy-share"),
    updatedAt: now
  };
  const permissions = await readJsonArray<PregnancySharePermission>(PREGNANCY_SHARE_PERMISSIONS_KEY);
  await writeJsonArray(PREGNANCY_SHARE_PERMISSIONS_KEY, [permission, ...permissions.filter((item) => !(item.ownerProfileId === input.ownerProfileId && item.category === input.category))]);
  return permission;
}

export async function updatePregnancySharePermission(id: string, partial: Partial<PregnancySharePermission>) {
  const permissions = await readJsonArray<PregnancySharePermission>(PREGNANCY_SHARE_PERMISSIONS_KEY);
  const updated = permissions.map((permission) => permission.id === id ? { ...permission, ...partial, updatedAt: new Date().toISOString() } : permission);
  await writeJsonArray(PREGNANCY_SHARE_PERMISSIONS_KEY, updated);
  return updated.find((permission) => permission.id === id) ?? null;
}

export async function revokePregnancySharePermission(id: string) {
  const permissions = await readJsonArray<PregnancySharePermission>(PREGNANCY_SHARE_PERMISSIONS_KEY);
  await writeJsonArray(PREGNANCY_SHARE_PERMISSIONS_KEY, permissions.filter((permission) => permission.id !== id));
}

export async function canViewPregnancyCategory(category: PregnancySharePermission["category"]) {
  const profile = await getPregnancyProfile();
  if (!profile) return false;
  if (profile.profileId === LOCAL_PROFILE_ID) return true;
  const permissions = await readJsonArray<PregnancySharePermission>(PREGNANCY_SHARE_PERMISSIONS_KEY);
  return permissions.some((permission) => permission.ownerProfileId === profile.profileId && permission.category === category && permission.permissionLevel !== "none");
}

export async function filterPregnancyDataByPermission<T>(items: T[], category: PregnancySharePermission["category"]) {
  return (await canViewPregnancyCategory(category)) ? items : [];
}

export async function getTrustedPregnancyLearnCards(): Promise<PregnancyTrustedLearnCard[]> {
  const disclaimer = "This card is educational and does not replace advice from a doctor, midwife, nurse, clinic, pharmacist, or healthcare professional.";
  return [
    {
      authorOrReviewer: "ACOG",
      category: "pregnancy_dating",
      disclaimer,
      id: "acog-due-date-lmp",
      lastCheckedAt: "2026-06-04",
      sourceName: "ACOG",
      summary: "Pregnancy dating and estimated due dates are commonly counted from the first day of the last menstrual period. Confirm dating with your healthcare professional.",
      title: "How pregnancy weeks are counted",
      url: "https://www.acog.org/womens-health/faqs/when-pregnancy-goes-past-your-due-date"
    },
    {
      authorOrReviewer: "NHS",
      category: "antenatal_care",
      disclaimer,
      id: "nhs-antenatal-care",
      lastCheckedAt: "2026-06-04",
      sourceName: "NHS",
      summary: "Antenatal care can include appointments, checks, screening tests, and discussions with a midwife or doctor.",
      title: "Antenatal care and appointments",
      url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/"
    },
    {
      authorOrReviewer: "NHS",
      category: "week_by_week",
      disclaimer,
      id: "nhs-pregnancy-journey",
      lastCheckedAt: "2026-06-04",
      sourceName: "NHS",
      summary: "NHS week-by-week content can help you prepare questions about baby development and pregnancy preparation.",
      title: "Pregnancy journey week by week",
      url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/your-nhs-pregnancy-journey/"
    },
    {
      authorOrReviewer: "CDC",
      category: "vaccines",
      disclaimer,
      id: "cdc-pregnancy-vaccines",
      lastCheckedAt: "2026-06-04",
      sourceName: "CDC",
      summary: "Vaccine information should be discussed with a healthcare professional. This app stores questions and reminders only.",
      title: "Vaccines during pregnancy overview",
      url: "https://www.cdc.gov/vaccines-pregnancy/recommended-vaccines/index.html"
    },
    {
      authorOrReviewer: "NICHD",
      category: "trimesters",
      disclaimer,
      id: "nichd-pregnancy-trimesters",
      lastCheckedAt: "2026-06-04",
      sourceName: "NICHD",
      summary: "Pregnancy is often described in trimesters. This app uses trimester labels only as an estimate based on entered dates.",
      title: "Pregnancy and trimesters",
      url: "https://www.nichd.nih.gov/health/topics/factsheets/pregnancy"
    }
  ];
}

export async function saveTrustedPregnancySourceContent(card: PregnancyTrustedLearnCard) {
  return card;
}

export async function calculatePregnancyWidgetValue(widgetKey: WidgetKey) {
  const [profile, week, appointments, symptoms, questions, medReview, recordsSummary] = await Promise.all([
    getPregnancyProfile(),
    calculatePregnancyWeekSummary(),
    getPregnancyAppointments(),
    getPregnancySymptomsByDate(toDateKey(new Date())),
    getPregnancyQuestions(),
    getPregnancyMedicationReviewSummary(),
    getPregnancyRecordsSummary()
  ]);

  switch (widgetKey) {
    case "pregnancy_week":
      return profile?.status === "active" && week.weekNumber ? `Week ${week.weekNumber} + ${week.dayNumber}` : "Set up";
    case "pregnancy_due_date":
      return week.estimatedDueDate ?? "No due date";
    case "pregnancy_next_appointment":
      return appointments.find((item) => new Date(item.scheduledAt).getTime() >= Date.now())?.title ?? "No appointment";
    case "pregnancy_symptom_log":
      return symptoms.length ? `${symptoms.length} today` : "No logs";
    case "pregnancy_medication_review":
      return medReview;
    case "pregnancy_question":
      return questions.filter((question) => question.status !== "answered").length
        ? `${questions.filter((question) => question.status !== "answered").length} open`
        : "No questions";
    case "pregnancy_record":
      return recordsSummary;
    case "pregnancy_privacy_status":
      return profile?.privacy === "shared_selected" ? "Shared selected" : "Private";
    default:
      return "Pregnancy";
  }
}

function getEstimatedDueDate(profile: PregnancyProfile) {
  if (profile.estimatedDueDate) return profile.estimatedDueDate;
  if (profile.dateBasis === "last_menstrual_period" && profile.lastMenstrualPeriodDate) {
    return calculateEstimatedDueDateFromLmp(profile.lastMenstrualPeriodDate);
  }
  if ((profile.dateBasis === "conception_date" || profile.dateBasis === "ivf_date") && (profile.conceptionDate || profile.ivfDate)) {
    return toDateKey(addDays(parseDate(profile.conceptionDate ?? profile.ivfDate ?? ""), 266));
  }
  return undefined;
}

async function ensurePregnancyProfile() {
  return (await getPregnancyProfile()) ?? enablePregnancyMode();
}

function inferDateBasis(input: Partial<PregnancyProfile>, current?: PregnancyProfile | null): PregnancyDateBasis {
  if (input.estimatedDueDate ?? current?.estimatedDueDate) return "estimated_due_date";
  if (input.lastMenstrualPeriodDate ?? current?.lastMenstrualPeriodDate) return "last_menstrual_period";
  if (input.conceptionDate ?? current?.conceptionDate) return "conception_date";
  if (input.ivfDate ?? current?.ivfDate) return "ivf_date";
  return "manual";
}

function appointmentTypeToEvent(type: PregnancyAppointment["appointmentType"]): PregnancyEventType {
  if (type === "scan_ultrasound") return "scan";
  if (type === "blood_test_lab") return "lab";
  return "appointment";
}

function makeOverlay(date: string, type: PregnancyEventType, label: string, color: string, relatedId: string, profileId: string): PregnancyCalendarOverlay {
  return {
    color,
    date,
    id: `pregnancy-${type}-${relatedId}-${date}`,
    isShared: false,
    label,
    profileAvatarLabel: "PG",
    profileId,
    relatedId,
    type
  };
}

function isDateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

function isWithinRange(value: string, startDate: Date, endDate: Date) {
  const time = new Date(value.includes("T") ? value : `${value}T12:00:00`).getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
}

async function readStoredAppointments() {
  return readJsonArray<PregnancyAppointment>(PREGNANCY_APPOINTMENTS_KEY);
}

async function readStoredSymptoms() {
  return readJsonArray<PregnancySymptomLog>(PREGNANCY_SYMPTOMS_KEY);
}

async function readStoredQuestions() {
  return readJsonArray<PregnancyQuestion>(PREGNANCY_QUESTIONS_KEY);
}

function sortByDate<T extends { createdAt: string; loggedAt?: string; scheduledAt?: string; updatedAt?: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    new Date(right.loggedAt ?? right.scheduledAt ?? right.updatedAt ?? right.createdAt).getTime() -
    new Date(left.loggedAt ?? left.scheduledAt ?? left.updatedAt ?? left.createdAt).getTime()
  );
}

function eachDate(startDate: Date, endDate: Date) {
  const days: Date[] = [];
  const cursor = startOfDay(startDate);
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

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  return next;
}

function parseDate(dateKey: string) {
  return new Date(`${dateKey.slice(0, 10)}T12:00:00`);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function clean(value?: string) {
  return value?.trim() || undefined;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJsonArray<T>(key: string) {
  try {
    const stored = await AsyncStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}
