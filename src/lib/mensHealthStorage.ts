import AsyncStorage from "@react-native-async-storage/async-storage";

import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import {
  calculateTodayMedicationSchedule,
  calculateTodaySupplementSchedule,
} from "@/lib/medicationSupplementStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import type { WidgetKey } from "@/types/app";
import type {
  MensHealthCheckIn,
  MensHealthLearnCard,
  MensHealthQuestion,
  MensHealthReminder,
  MensHealthReminderType,
  MensHealthReportSummary,
  MensHealthSettings,
  MensHealthSharePermission,
  MensHealthSymptomLog,
} from "@/types/mensHealth";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const SETTINGS_KEY = "family_health_phase16_mens_health_settings";
const CHECK_INS_KEY = "family_health_phase16_mens_health_check_ins";
const SYMPTOMS_KEY = "family_health_phase16_mens_health_symptoms";
const REMINDERS_KEY = "family_health_phase16_mens_health_reminders";
const QUESTIONS_KEY = "family_health_phase16_mens_health_questions";
const SHARE_KEY = "family_health_phase16_mens_health_share_permissions";

export const MENS_HEALTH_WIDGET_KEYS = [
  "mens_health_check_in",
  "mens_energy_stress",
  "testicular_check_reminder",
  "prostate_discussion_reminder",
  "fertility_note",
  "mens_doctor_question",
  "mens_private_reminder",
  "mens_health_privacy_status",
] as const satisfies WidgetKey[];

export function isMensHealthWidget(widgetKey: WidgetKey) {
  return MENS_HEALTH_WIDGET_KEYS.includes(
    widgetKey as (typeof MENS_HEALTH_WIDGET_KEYS)[number],
  );
}

export function getAvailableMensHealthWidgets() {
  return MENS_HEALTH_WIDGET_KEYS;
}

export async function enableMensHealth(profileId = LOCAL_PROFILE_ID) {
  const current = await getMensHealthSettings(profileId);
  const now = new Date().toISOString();
  return saveSettings({
    ...current,
    enabledAt: current.enabledAt ?? now,
    status: "enabled",
    updatedAt: now,
  });
}

export async function disableMensHealth(profileId = LOCAL_PROFILE_ID) {
  const current = await getMensHealthSettings(profileId);
  return saveSettings({
    ...current,
    status: "disabled",
    updatedAt: new Date().toISOString(),
  });
}

export async function getMensHealthSettings(
  profileId = LOCAL_PROFILE_ID,
): Promise<MensHealthSettings> {
  const settings = (await readJsonArray<MensHealthSettings>(SETTINGS_KEY)).find(
    (item) => item.profileId === profileId,
  );
  if (settings) return settings;
  const now = new Date().toISOString();
  return {
    checkInFrequency: "weekly",
    createdAt: now,
    defaultPrivacy: "private",
    fertilityTrackingEnabled: false,
    id: createId("mens-health-settings"),
    profileId,
    prostateDiscussionReminderEnabled: false,
    sexualHealthNotesEnabled: false,
    status: "disabled",
    testicularCheckReminderEnabled: false,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
}

export async function updateMensHealthSettings(
  partial: Partial<MensHealthSettings> & { profileId?: string },
) {
  const current = await getMensHealthSettings(
    partial.profileId ?? LOCAL_PROFILE_ID,
  );
  return saveSettings({
    ...current,
    ...partial,
    defaultPrivacy:
      partial.defaultPrivacy ?? current.defaultPrivacy ?? "private",
    profileId: partial.profileId ?? current.profileId,
    updatedAt: new Date().toISOString(),
    userId: LOCAL_USER_ID,
  });
}

export async function getVisibleMensHealthProfilesForViewer() {
  const settings = await readJsonArray<MensHealthSettings>(SETTINGS_KEY);
  return settings.filter(
    (item) => item.status === "enabled" || item.status === "shared_view_only",
  );
}

export async function createMensHealthCheckIn(
  input: Omit<
    MensHealthCheckIn,
    "createdAt" | "id" | "isPrivate" | "profileId" | "updatedAt" | "userId"
  > & { profileId?: string },
) {
  const now = new Date().toISOString();
  const checkIn: MensHealthCheckIn = {
    ...input,
    createdAt: now,
    fertilityNote: clean(input.fertilityNote),
    id: createId("mens-check-in"),
    isPrivate: true,
    libidoNote: clean(input.libidoNote),
    loggedAt: input.loggedAt ?? now,
    notes: clean(input.notes),
    painDiscomfortNote: clean(input.painDiscomfortNote),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    sexualHealthNote: clean(input.sexualHealthNote),
    updatedAt: now,
    urinaryNote: clean(input.urinaryNote),
    userId: LOCAL_USER_ID,
    workoutRecoveryNote: clean(input.workoutRecoveryNote),
  };
  const logs = await readJsonArray<MensHealthCheckIn>(CHECK_INS_KEY);
  await writeJsonArray(CHECK_INS_KEY, [checkIn, ...logs]);
  return checkIn;
}

export async function getMensHealthCheckInsByDate(
  date: string,
  profileId = LOCAL_PROFILE_ID,
) {
  return (
    await getMensHealthCheckInsByRange(
      parseDate(date),
      parseDate(date),
      profileId,
    )
  ).filter((log) => log.loggedAt.slice(0, 10) === date.slice(0, 10));
}

export async function getMensHealthCheckInsByRange(
  startDate: Date,
  endDate: Date,
  profileId = LOCAL_PROFILE_ID,
) {
  return sortByDate(
    (await readJsonArray<MensHealthCheckIn>(CHECK_INS_KEY)).filter(
      (log) =>
        log.profileId === profileId &&
        isWithinRange(log.loggedAt, startDate, endDate),
    ),
  );
}

export async function updateMensHealthCheckIn(
  id: string,
  partial: Partial<MensHealthCheckIn>,
) {
  const logs = await readJsonArray<MensHealthCheckIn>(CHECK_INS_KEY);
  const updated = logs.map((log) =>
    log.id === id
      ? {
          ...log,
          ...partial,
          isPrivate: true,
          updatedAt: new Date().toISOString(),
        }
      : log,
  );
  await writeJsonArray(CHECK_INS_KEY, updated);
  return updated.find((log) => log.id === id) ?? null;
}

export async function deleteMensHealthCheckIn(id: string) {
  const logs = await readJsonArray<MensHealthCheckIn>(CHECK_INS_KEY);
  await writeJsonArray(
    CHECK_INS_KEY,
    logs.filter((log) => log.id !== id),
  );
}

export async function createMensHealthSymptomLog(
  input: Omit<
    MensHealthSymptomLog,
    "createdAt" | "id" | "isPrivate" | "profileId" | "updatedAt" | "userId"
  > & { profileId?: string },
) {
  const now = new Date().toISOString();
  const log: MensHealthSymptomLog = {
    ...input,
    createdAt: now,
    id: createId("mens-symptom"),
    isPrivate: true,
    loggedAt: input.loggedAt ?? now,
    notes: clean(input.notes),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const logs = await readJsonArray<MensHealthSymptomLog>(SYMPTOMS_KEY);
  await writeJsonArray(SYMPTOMS_KEY, [log, ...logs]);
  return log;
}

export async function getMensHealthSymptomsByDate(
  date: string,
  profileId = LOCAL_PROFILE_ID,
) {
  return (
    await getMensHealthSymptomsByRange(
      parseDate(date),
      parseDate(date),
      profileId,
    )
  ).filter((log) => log.loggedAt.slice(0, 10) === date.slice(0, 10));
}

export async function getMensHealthSymptomsByRange(
  startDate: Date,
  endDate: Date,
  profileId = LOCAL_PROFILE_ID,
) {
  return sortByDate(
    (await readJsonArray<MensHealthSymptomLog>(SYMPTOMS_KEY)).filter(
      (log) =>
        log.profileId === profileId &&
        isWithinRange(log.loggedAt, startDate, endDate),
    ),
  );
}

export async function updateMensHealthSymptomLog(
  id: string,
  partial: Partial<MensHealthSymptomLog>,
) {
  const logs = await readJsonArray<MensHealthSymptomLog>(SYMPTOMS_KEY);
  const updated = logs.map((log) =>
    log.id === id
      ? {
          ...log,
          ...partial,
          isPrivate: true,
          updatedAt: new Date().toISOString(),
        }
      : log,
  );
  await writeJsonArray(SYMPTOMS_KEY, updated);
  return updated.find((log) => log.id === id) ?? null;
}

export async function deleteMensHealthSymptomLog(id: string) {
  const logs = await readJsonArray<MensHealthSymptomLog>(SYMPTOMS_KEY);
  await writeJsonArray(
    SYMPTOMS_KEY,
    logs.filter((log) => log.id !== id),
  );
}

export async function createMensHealthReminder(
  input: Omit<
    MensHealthReminder,
    | "createdAt"
    | "id"
    | "isPrivate"
    | "profileId"
    | "status"
    | "updatedAt"
    | "userId"
  > & { profileId?: string; status?: MensHealthReminder["status"] },
) {
  const now = new Date().toISOString();
  const reminder: MensHealthReminder = {
    ...input,
    createdAt: now,
    id: createId("mens-reminder"),
    isPrivate: true,
    notes: clean(input.notes),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    status: input.status ?? "upcoming",
    title: input.title.trim(),
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const reminders = await readJsonArray<MensHealthReminder>(REMINDERS_KEY);
  await writeJsonArray(REMINDERS_KEY, [reminder, ...reminders]);
  return reminder;
}

export async function updateMensHealthReminder(
  id: string,
  partial: Partial<MensHealthReminder>,
) {
  const reminders = await readJsonArray<MensHealthReminder>(REMINDERS_KEY);
  const updated = reminders.map((item) =>
    item.id === id
      ? {
          ...item,
          ...partial,
          isPrivate: true,
          updatedAt: new Date().toISOString(),
        }
      : item,
  );
  await writeJsonArray(REMINDERS_KEY, updated);
  return updated.find((item) => item.id === id) ?? null;
}

export async function deleteMensHealthReminder(id: string) {
  const reminders = await readJsonArray<MensHealthReminder>(REMINDERS_KEY);
  await writeJsonArray(
    REMINDERS_KEY,
    reminders.filter((item) => item.id !== id),
  );
}

export async function getMensHealthRemindersForDate(
  date: string,
  profileId = LOCAL_PROFILE_ID,
) {
  return sortByDate(
    (await readJsonArray<MensHealthReminder>(REMINDERS_KEY)).filter(
      (item) =>
        item.profileId === profileId &&
        item.scheduledAt.slice(0, 10) === date.slice(0, 10),
    ),
    "scheduledAt",
  );
}

export async function getMensHealthRemindersByRange(
  startDate: Date,
  endDate: Date,
  profileId = LOCAL_PROFILE_ID,
) {
  return sortByDate(
    (await readJsonArray<MensHealthReminder>(REMINDERS_KEY)).filter(
      (item) =>
        item.profileId === profileId &&
        isWithinRange(item.scheduledAt, startDate, endDate),
    ),
    "scheduledAt",
  );
}

export async function markMensHealthReminderCompleted(id: string) {
  return updateMensHealthReminder(id, { status: "completed" });
}

export async function snoozeMensHealthReminder(id: string) {
  return updateMensHealthReminder(id, { status: "snoozed" });
}

export async function linkMensHealthReminderToCalendar(id: string) {
  return updateMensHealthReminder(id, {
    notes: "Linked to Calendar / Timeline.",
  });
}

export async function createMensHealthQuestion(
  input: Omit<
    MensHealthQuestion,
    "createdAt" | "id" | "profileId" | "status" | "updatedAt" | "userId"
  > & { profileId?: string; status?: MensHealthQuestion["status"] },
) {
  const now = new Date().toISOString();
  const question: MensHealthQuestion = {
    ...input,
    answerNotes: clean(input.answerNotes),
    createdAt: now,
    id: createId("mens-question"),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    question: input.question.trim(),
    status: input.status ?? "draft",
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const questions = await readJsonArray<MensHealthQuestion>(QUESTIONS_KEY);
  await writeJsonArray(QUESTIONS_KEY, [question, ...questions]);
  return question;
}

export async function getMensHealthQuestions(profileId = LOCAL_PROFILE_ID) {
  return sortByDate(
    (await readJsonArray<MensHealthQuestion>(QUESTIONS_KEY)).filter(
      (item) => item.profileId === profileId,
    ),
    "createdAt",
  );
}

export async function updateMensHealthQuestion(
  id: string,
  partial: Partial<MensHealthQuestion>,
) {
  const questions = await readJsonArray<MensHealthQuestion>(QUESTIONS_KEY);
  const updated = questions.map((item) =>
    item.id === id
      ? { ...item, ...partial, updatedAt: new Date().toISOString() }
      : item,
  );
  await writeJsonArray(QUESTIONS_KEY, updated);
  return updated.find((item) => item.id === id) ?? null;
}

export async function markMensHealthQuestionAsked(id: string) {
  return updateMensHealthQuestion(id, { status: "asked" });
}

export async function markMensHealthQuestionAnswered(
  id: string,
  answerNotes?: string,
) {
  return updateMensHealthQuestion(id, {
    answerNotes: clean(answerNotes),
    status: "answered",
  });
}

export async function getMensHealthReportSummary(
  range: MensHealthReportSummary["range"] = "today",
  profileId = LOCAL_PROFILE_ID,
): Promise<MensHealthReportSummary> {
  const { start, end } = getRange(range);
  const [checkIns, symptoms, reminders, questions] = await Promise.all([
    getMensHealthCheckInsByRange(start, end, profileId),
    getMensHealthSymptomsByRange(start, end, profileId),
    getMensHealthRemindersByRange(start, end, profileId),
    getMensHealthQuestions(profileId),
  ]);
  return {
    checkInCount: checkIns.length,
    fertilityNoteCount: checkIns.filter((item) => item.fertilityNote).length,
    generatedAt: new Date().toISOString(),
    privateReminderCount: reminders.length,
    profileId,
    questionCount: questions.length,
    range,
    sexualHealthNoteCount: checkIns.filter(
      (item) => item.sexualHealthNote || item.libidoNote,
    ).length,
    symptomCount: symptoms.length,
  };
}

export async function getMensHealthCheckInTrends(profileId = LOCAL_PROFILE_ID) {
  const checkIns = await getMensHealthCheckInsByRange(
    addDays(new Date(), -30),
    new Date(),
    profileId,
  );
  return { checkIns, latest: checkIns[0], totalCount: checkIns.length };
}

export async function getMensHealthSymptomTimeline(
  profileId = LOCAL_PROFILE_ID,
) {
  return getMensHealthSymptomsByRange(
    addDays(new Date(), -90),
    new Date(),
    profileId,
  );
}

export async function getMensHealthReminderHistory(
  profileId = LOCAL_PROFILE_ID,
) {
  return getMensHealthRemindersByRange(
    addDays(new Date(), -90),
    addDays(new Date(), 30),
    profileId,
  );
}

export async function getMensHealthMedicationReviewSummary() {
  const summary = await calculateTodayMedicationSchedule();
  return summary.totalCount
    ? `${summary.totalCount} medications listed for review`
    : "No medications listed";
}

export async function getMensHealthSupplementReviewSummary() {
  const summary = await calculateTodaySupplementSchedule();
  return summary.totalCount
    ? `${summary.totalCount} supplements listed for review`
    : "No supplements listed";
}

export async function getMensHealthWorkoutNutritionSummary() {
  const [fitness, nutrition] = await Promise.all([
    getTodayFitnessSummary(),
    getTodayNutritionSummary(),
  ]);
  return `${fitness.activeMinutesToday ?? 0} active minutes, ${nutrition.foodLogCount} food logs`;
}

export async function createMensHealthSharePermission(
  input: Omit<MensHealthSharePermission, "createdAt" | "id" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const permission: MensHealthSharePermission = {
    ...input,
    createdAt: now,
    id: createId("mens-share"),
    updatedAt: now,
  };
  const permissions = await readJsonArray<MensHealthSharePermission>(SHARE_KEY);
  await writeJsonArray(SHARE_KEY, [permission, ...permissions]);
  return permission;
}

export async function updateMensHealthSharePermission(
  id: string,
  partial: Partial<MensHealthSharePermission>,
) {
  const permissions = await readJsonArray<MensHealthSharePermission>(SHARE_KEY);
  const updated = permissions.map((item) =>
    item.id === id
      ? { ...item, ...partial, updatedAt: new Date().toISOString() }
      : item,
  );
  await writeJsonArray(SHARE_KEY, updated);
  return updated.find((item) => item.id === id) ?? null;
}

export async function revokeMensHealthSharePermission(id: string) {
  const permissions = await readJsonArray<MensHealthSharePermission>(SHARE_KEY);
  await writeJsonArray(
    SHARE_KEY,
    permissions.filter((item) => item.id !== id),
  );
}

export async function canViewMensHealthCategory() {
  return true;
}

export function filterMensHealthDataByPermission<T>(items: T[]) {
  return items;
}

export async function getTrustedMensHealthLearnCards(): Promise<
  MensHealthLearnCard[]
> {
  return [
    {
      disclaimer:
        "Educational only. If you notice changes or feel worried, speak to a healthcare professional.",
      id: "nhs-testicular-check",
      lastCheckedAt: "2026-06-04",
      publishedOrReviewedAt: "2024",
      sourceOrganization: "NHS",
      sourceUrl:
        "https://www.nhs.uk/tests-and-treatments/how-to-check-your-testicles/",
      summary:
        "Regular checks can help you notice changes. If you find a lump, swelling, pain, or something unusual, speak to a healthcare professional.",
      title: "Testicular self-check overview",
    },
    {
      disclaimer:
        "This app does not recommend screening. Discuss screening decisions with a healthcare professional.",
      id: "cdc-prostate-screening",
      lastCheckedAt: "2026-06-04",
      sourceOrganization: "CDC",
      sourceUrl:
        "https://www.cdc.gov/prostate-cancer/screening/get-screened.html",
      summary:
        "CDC guidance emphasizes discussing prostate screening benefits and harms with a doctor before deciding.",
      title: "Prostate screening discussion",
    },
    {
      disclaimer: "Fertility information is for tracking and preparation only.",
      id: "cdc-male-infertility",
      lastCheckedAt: "2026-06-04",
      sourceOrganization: "CDC",
      sourceUrl:
        "https://www.cdc.gov/reproductive-health/infertility-faq/index.html",
      summary:
        "Male fertility concerns are typically evaluated by healthcare professionals using history, physical examination, and semen analysis.",
      title: "Male fertility overview",
    },
    {
      disclaimer:
        "Sexual health notes are private and for preparing professional conversations.",
      id: "mayo-sexual-health-discussion",
      lastCheckedAt: "2026-06-04",
      sourceOrganization: "Mayo Clinic",
      sourceUrl:
        "https://www.mayoclinic.org/health/erectile-dysfunction/DS00162",
      summary:
        "General sexual health concerns can be discussed with a doctor or qualified healthcare professional.",
      title: "Sexual health and doctor discussion",
    },
  ];
}

export async function saveTrustedMensHealthSourceContent() {
  return getTrustedMensHealthLearnCards();
}

export async function calculateMensHealthWidgetValue(widgetKey: WidgetKey) {
  const settings = await getMensHealthSettings();
  if (settings.status === "disabled") return "Private";
  const [checkIns, symptoms, reminders, questions] = await Promise.all([
    getMensHealthCheckInsByRange(addDays(new Date(), -7), new Date()),
    getMensHealthSymptomsByDate(toDateKey(new Date())),
    getMensHealthReminderHistory(),
    getMensHealthQuestions(),
  ]);
  const latest = checkIns[0];
  const nextReminder = reminders.find(
    (item) =>
      item.status === "upcoming" &&
      new Date(item.scheduledAt).getTime() >= Date.now(),
  );
  switch (widgetKey) {
    case "mens_health_check_in":
      return latest
        ? latest.energy
          ? `Energy: ${formatValue(latest.energy)}`
          : "Logged"
        : "No check-in";
    case "mens_energy_stress":
      return latest
        ? [
            latest.energy && formatValue(latest.energy),
            latest.stress && `Stress ${latest.stress}`,
          ]
            .filter(Boolean)
            .join(" / ") || "Logged"
        : "No check-in";
    case "testicular_check_reminder":
      return settings.testicularCheckReminderEnabled
        ? (nextReminder?.title ?? "Enabled")
        : "Off";
    case "prostate_discussion_reminder":
      return settings.prostateDiscussionReminderEnabled ? "Enabled" : "Off";
    case "fertility_note":
      return checkIns.some((item) => item.fertilityNote)
        ? "Has note"
        : "No note";
    case "mens_doctor_question":
      return `${questions.length} saved`;
    case "mens_private_reminder":
      return nextReminder?.title ?? "No reminder";
    case "mens_health_privacy_status":
      return settings.defaultPrivacy === "private"
        ? "Private"
        : "Shared selected";
    default:
      return symptoms.length ? `${symptoms.length} symptoms` : "Ready";
  }
}

export async function getMensHealthTimelineEvents(
  startDate: Date,
  endDate: Date,
) {
  const [checkIns, symptoms, reminders, questions] = await Promise.all([
    getMensHealthCheckInsByRange(startDate, endDate),
    getMensHealthSymptomsByRange(startDate, endDate),
    getMensHealthRemindersByRange(startDate, endDate),
    getMensHealthQuestions(),
  ]);
  return [
    ...checkIns.map((item) => ({
      eventAt: item.loggedAt,
      id: item.id,
      title: "Men’s Health check-in",
      type: "check_in" as const,
    })),
    ...symptoms.map((item) => ({
      eventAt: item.loggedAt,
      id: item.id,
      title: "Men’s Health symptom note",
      type: "symptom" as const,
    })),
    ...reminders.map((item) => ({
      eventAt: item.scheduledAt,
      id: item.id,
      title: item.title,
      type: "reminder" as const,
    })),
    ...questions
      .filter((item) => isWithinRange(item.createdAt, startDate, endDate))
      .map((item) => ({
        eventAt: item.createdAt,
        id: item.id,
        title: "Men’s Health question",
        type: "question" as const,
      })),
  ];
}

async function saveSettings(settings: MensHealthSettings) {
  const settingsList = await readJsonArray<MensHealthSettings>(SETTINGS_KEY);
  await writeJsonArray(SETTINGS_KEY, [
    settings,
    ...settingsList.filter((item) => item.profileId !== settings.profileId),
  ]);
  return settings;
}

function getRange(range: MensHealthReportSummary["range"]) {
  const end = new Date();
  const start =
    range === "today"
      ? startOfDay(end)
      : addDays(end, range === "7_days" ? -6 : -29);
  return { end, start };
}

function clean(value?: string) {
  return value?.trim() || undefined;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseDate(date: string) {
  return new Date(`${date.slice(0, 10)}T00:00:00`);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isWithinRange(value: string, startDate: Date, endDate: Date) {
  const time = new Date(value).getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
}

function sortByDate<T extends { createdAt: string }>(
  items: T[],
  key: keyof T = "createdAt",
) {
  return [...items].sort(
    (left, right) =>
      new Date(String(right[key])).getTime() -
      new Date(String(left[key])).getTime(),
  );
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function readJsonArray<T>(key: string) {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return [] as T[];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [] as T[];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}
