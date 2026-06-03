import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  CycleLog,
  CyclePrediction,
  CycleSettings,
  PregnancyAppointment,
  PregnancyNote,
  PregnancyProfile,
  PregnancySummary,
  PregnancySymptomLog
} from "@/types/cycle";

const CYCLE_SETTINGS_KEY = "family_health_cycle_settings";
const CYCLE_LOGS_KEY = "family_health_cycle_logs";
const PREGNANCY_PROFILE_KEY = "family_health_pregnancy_profile";
const PREGNANCY_SYMPTOMS_KEY = "family_health_pregnancy_symptoms";
const PREGNANCY_APPOINTMENTS_KEY = "family_health_pregnancy_appointments";
const PREGNANCY_NOTES_KEY = "family_health_pregnancy_notes";

const cycleListeners = new Set<() => void>();

const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
  averageCycleLengthDays: 28,
  averagePeriodLengthDays: 5,
  partnerSharingEnabled: false,
  predictionEnabled: true,
  privateMode: true,
  trackingEnabled: true
};

export function subscribeToCycle(listener: () => void) {
  cycleListeners.add(listener);

  return () => {
    cycleListeners.delete(listener);
  };
}

function notifyCycleListeners() {
  cycleListeners.forEach((listener) => listener());
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJsonArray<T>(key: string) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) return [] as T[];

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch {
    return [] as T[];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  notifyCycleListeners();

  return value;
}

async function readJsonObject<T>(key: string) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) return null;

    return JSON.parse(storedValue) as T;
  } catch {
    return null;
  }
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sortByDate<T extends { date?: string; loggedAt?: string; createdAt: string }>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.date ?? right.loggedAt ?? right.createdAt).getTime() -
      new Date(left.date ?? left.loggedAt ?? left.createdAt).getTime()
  );
}

export async function getCycleSettings(): Promise<CycleSettings> {
  const settings = await readJsonObject<CycleSettings>(CYCLE_SETTINGS_KEY);

  return {
    ...DEFAULT_CYCLE_SETTINGS,
    ...settings,
    partnerSharingEnabled: false,
    privateMode: true
  };
}

export async function saveCycleSettings(settings: CycleSettings) {
  const savedSettings: CycleSettings = {
    ...settings,
    partnerSharingEnabled: false,
    privateMode: true
  };

  await AsyncStorage.setItem(CYCLE_SETTINGS_KEY, JSON.stringify(savedSettings));
  notifyCycleListeners();

  return savedSettings;
}

export async function updateCycleSettings(partial: Partial<CycleSettings>) {
  const settings = await getCycleSettings();

  return saveCycleSettings({
    ...settings,
    ...partial,
    partnerSharingEnabled: false,
    privateMode: true
  });
}

export async function getCycleLogs() {
  return sortByDate(await readJsonArray<CycleLog>(CYCLE_LOGS_KEY));
}

export async function addCycleLog(
  input: Omit<CycleLog, "id" | "private" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const log: CycleLog = {
    ...input,
    createdAt: now,
    id: id("cycle-log"),
    notes: input.notes?.trim() || undefined,
    private: true,
    updatedAt: now
  };
  const logs = await getCycleLogs();

  await writeJsonArray(CYCLE_LOGS_KEY, [log, ...logs]);

  if (input.flowLevel !== "none") {
    const settings = await getCycleSettings();

    await updateCycleSettings({ ...settings, lastPeriodStartDate: input.date });
  }

  return log;
}

export async function updateCycleLog(
  logId: string,
  partial: Partial<Omit<CycleLog, "id" | "createdAt" | "private">>
) {
  const now = new Date().toISOString();
  const logs = await getCycleLogs();
  const updatedLogs = logs.map((log) =>
    log.id === logId ? { ...log, ...partial, private: true as const, updatedAt: now } : log
  );

  await writeJsonArray(CYCLE_LOGS_KEY, updatedLogs);

  return updatedLogs.find((log) => log.id === logId) ?? null;
}

export async function deleteCycleLog(logId: string) {
  const logs = await getCycleLogs();

  await writeJsonArray(CYCLE_LOGS_KEY, logs.filter((log) => log.id !== logId));
}

export async function getCycleLogsByDate(date: string) {
  const logs = await getCycleLogs();

  return logs.filter((log) => log.date === date);
}

export async function getLatestCycleLog() {
  return (await getCycleLogs())[0] ?? null;
}

export async function getCycleLogsForMonth(year: number, month: number) {
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const logs = await getCycleLogs();

  return logs.filter((log) => log.date.startsWith(monthPrefix));
}

export async function calculateCyclePrediction(): Promise<CyclePrediction> {
  const settings = await getCycleSettings();

  if (!settings.predictionEnabled || !settings.lastPeriodStartDate) {
    return { confidence: "low", estimateOnly: true };
  }

  const lastStart = new Date(settings.lastPeriodStartDate);

  if (Number.isNaN(lastStart.getTime())) {
    return { confidence: "low", estimateOnly: true };
  }

  const nextPeriodStart = addDays(lastStart, settings.averageCycleLengthDays);
  const nextPeriodEnd = addDays(nextPeriodStart, settings.averagePeriodLengthDays - 1);
  const estimatedOvulationDate = addDays(nextPeriodStart, -14);

  return {
    confidence: settings.lastPeriodStartDate ? "medium" : "low",
    estimatedOvulationDate: toDateString(estimatedOvulationDate),
    estimateOnly: true,
    fertileWindowEnd: toDateString(addDays(estimatedOvulationDate, 1)),
    fertileWindowStart: toDateString(addDays(estimatedOvulationDate, -5)),
    nextPeriodEnd: toDateString(nextPeriodEnd),
    nextPeriodStart: toDateString(nextPeriodStart)
  };
}

export async function getPossiblePregnancyHint() {
  const settings = await getCycleSettings();
  const prediction = await calculateCyclePrediction();

  if (!settings.lastPeriodStartDate || !prediction.nextPeriodStart) return null;

  const nextPeriodStartValue = prediction.nextPeriodStart;
  const nextPeriodStart = new Date(nextPeriodStartValue);
  const today = new Date();

  if (today.getTime() <= nextPeriodStart.getTime()) return null;

  const logsSinceEstimate = (await getCycleLogs()).filter(
    (log) => log.date >= nextPeriodStartValue && log.flowLevel !== "none"
  );

  if (logsSinceEstimate.length) return null;

  return "Your period may be later than expected. If pregnancy is possible, consider taking a pregnancy test or speaking to a healthcare professional.";
}

export async function getPregnancyProfile() {
  return readJsonObject<PregnancyProfile>(PREGNANCY_PROFILE_KEY);
}

export async function savePregnancyProfile(
  input: Omit<PregnancyProfile, "id" | "private" | "sharingEnabled" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const existingProfile = await getPregnancyProfile();
  const profile: PregnancyProfile = {
    ...input,
    allergies: input.allergies?.filter(Boolean),
    createdAt: existingProfile?.createdAt ?? now,
    id: existingProfile?.id ?? id("pregnancy"),
    medicalNotes: input.medicalNotes?.trim() || undefined,
    private: true,
    sharingEnabled: false,
    updatedAt: now
  };

  await AsyncStorage.setItem(PREGNANCY_PROFILE_KEY, JSON.stringify(profile));
  notifyCycleListeners();

  return profile;
}

export async function updatePregnancyProfile(partial: Partial<PregnancyProfile>) {
  const profile = await getPregnancyProfile();

  if (!profile) return null;

  const mergedProfile = {
    ...profile,
    ...partial
  };

  return savePregnancyProfile({
    allergies: mergedProfile.allergies,
    currentWeek: mergedProfile.currentWeek,
    estimatedDueDate: mergedProfile.estimatedDueDate,
    lastPeriodStartDate: mergedProfile.lastPeriodStartDate,
    medicalNotes: mergedProfile.medicalNotes,
    pregnancyStartDate: mergedProfile.pregnancyStartDate,
    status: mergedProfile.status
  });
}

export async function clearPregnancyProfile() {
  await AsyncStorage.removeItem(PREGNANCY_PROFILE_KEY);
  notifyCycleListeners();
}

export async function getPregnancySymptomLogs() {
  return sortByDate(await readJsonArray<PregnancySymptomLog>(PREGNANCY_SYMPTOMS_KEY));
}

export async function addPregnancySymptomLog(
  input: Omit<PregnancySymptomLog, "id" | "loggedAt" | "createdAt">
) {
  const now = new Date().toISOString();
  const log: PregnancySymptomLog = {
    ...input,
    createdAt: now,
    id: id("pregnancy-symptom"),
    loggedAt: now,
    notes: input.notes?.trim() || undefined
  };
  const logs = await getPregnancySymptomLogs();

  await writeJsonArray(PREGNANCY_SYMPTOMS_KEY, [log, ...logs]);

  return log;
}

export async function getPregnancyAppointments() {
  return sortByDate(await readJsonArray<PregnancyAppointment>(PREGNANCY_APPOINTMENTS_KEY));
}

export async function addPregnancyAppointment(
  input: Omit<PregnancyAppointment, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const appointment: PregnancyAppointment = {
    ...input,
    createdAt: now,
    id: id("pregnancy-appointment"),
    notes: input.notes?.trim() || undefined,
    updatedAt: now
  };
  const appointments = await getPregnancyAppointments();

  await writeJsonArray(PREGNANCY_APPOINTMENTS_KEY, [appointment, ...appointments]);

  return appointment;
}

export async function updatePregnancyAppointment(
  appointmentId: string,
  partial: Partial<Omit<PregnancyAppointment, "id" | "createdAt">>
) {
  const appointments = await getPregnancyAppointments();
  const updatedAppointments = appointments.map((appointment) =>
    appointment.id === appointmentId
      ? { ...appointment, ...partial, updatedAt: new Date().toISOString() }
      : appointment
  );

  await writeJsonArray(PREGNANCY_APPOINTMENTS_KEY, updatedAppointments);

  return updatedAppointments.find((appointment) => appointment.id === appointmentId) ?? null;
}

export async function deletePregnancyAppointment(appointmentId: string) {
  const appointments = await getPregnancyAppointments();

  await writeJsonArray(
    PREGNANCY_APPOINTMENTS_KEY,
    appointments.filter((appointment) => appointment.id !== appointmentId)
  );
}

export async function getPregnancyNotes() {
  return sortByDate(await readJsonArray<PregnancyNote>(PREGNANCY_NOTES_KEY));
}

export async function addPregnancyNote(
  input: Omit<PregnancyNote, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const note: PregnancyNote = {
    ...input,
    createdAt: now,
    id: id("pregnancy-note"),
    note: input.note.trim(),
    title: input.title.trim(),
    updatedAt: now
  };
  const notes = await getPregnancyNotes();

  await writeJsonArray(PREGNANCY_NOTES_KEY, [note, ...notes]);

  return note;
}

export async function updatePregnancyNote(
  noteId: string,
  partial: Partial<Omit<PregnancyNote, "id" | "pregnancyProfileId" | "createdAt">>
) {
  const notes = await getPregnancyNotes();
  const updatedNotes = notes.map((note) =>
    note.id === noteId ? { ...note, ...partial, updatedAt: new Date().toISOString() } : note
  );

  await writeJsonArray(PREGNANCY_NOTES_KEY, updatedNotes);

  return updatedNotes.find((note) => note.id === noteId) ?? null;
}

export async function deletePregnancyNote(noteId: string) {
  const notes = await getPregnancyNotes();

  await writeJsonArray(
    PREGNANCY_NOTES_KEY,
    notes.filter((note) => note.id !== noteId)
  );
}

export async function getPregnancySummary(): Promise<PregnancySummary> {
  const [profile, symptoms, appointments, notes] = await Promise.all([
    getPregnancyProfile(),
    getPregnancySymptomLogs(),
    getPregnancyAppointments(),
    getPregnancyNotes()
  ]);

  return {
    appointmentCount: appointments.length,
    latestSymptom: symptoms[0],
    noteCount: notes.length,
    profile
  };
}
