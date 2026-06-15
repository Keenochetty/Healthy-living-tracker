import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  ElderAppointment,
  ElderCareNote,
  ElderCheckIn,
  ElderMedicationItem,
  ElderMedicationTakenLog,
  ElderProfile,
  ElderSummary,
  ElderVitalsLog,
} from "@/types/elder";

const ELDER_PROFILES_KEY = "family_health_elder_profiles";
const ELDER_CHECK_INS_KEY = "family_health_elder_check_ins";
const ELDER_VITALS_KEY = "family_health_elder_vitals";
const ELDER_MEDICATIONS_KEY = "family_health_elder_medications";
const ELDER_MEDICATION_TAKEN_KEY = "family_health_elder_medication_taken";
const ELDER_CARE_NOTES_KEY = "family_health_elder_care_notes";
const ELDER_APPOINTMENTS_KEY = "family_health_elder_appointments";

const elderListeners = new Set<() => void>();

type CreateElderProfileInput = Omit<
  ElderProfile,
  "id" | "createdAt" | "updatedAt"
>;

export function subscribeToElders(listener: () => void) {
  elderListeners.add(listener);

  return () => {
    elderListeners.delete(listener);
  };
}

function notifyElderListeners() {
  elderListeners.forEach((listener) => listener());
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
  notifyElderListeners();

  return value;
}

function sortByTime<
  T extends { appointmentDate?: string; loggedAt?: string; createdAt: string },
>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      new Date(
        right.appointmentDate ?? right.loggedAt ?? right.createdAt,
      ).getTime() -
      new Date(
        left.appointmentDate ?? left.loggedAt ?? left.createdAt,
      ).getTime(),
  );
}

export async function getElderProfiles() {
  return readJsonArray<ElderProfile>(ELDER_PROFILES_KEY);
}

export async function getElderProfile(elderId: string) {
  const elders = await getElderProfiles();

  return elders.find((elder) => elder.id === elderId) ?? null;
}

export async function createElderProfile(input: CreateElderProfileInput) {
  const now = new Date().toISOString();
  const elder: ElderProfile = {
    ...input,
    allergies: input.allergies?.filter(Boolean),
    createdAt: now,
    displayName: input.displayName.trim(),
    id: id("elder"),
    medicalNotes: input.medicalNotes?.trim() || undefined,
    updatedAt: now,
  };
  const elders = await getElderProfiles();

  await writeJsonArray(ELDER_PROFILES_KEY, [elder, ...elders]);

  return elder;
}

export async function updateElderProfile(
  elderId: string,
  partial: Partial<Omit<ElderProfile, "id" | "createdAt">>,
) {
  const elders = await getElderProfiles();
  const updatedElders = elders.map((elder) =>
    elder.id === elderId
      ? { ...elder, ...partial, updatedAt: new Date().toISOString() }
      : elder,
  );

  await writeJsonArray(ELDER_PROFILES_KEY, updatedElders);

  return updatedElders.find((elder) => elder.id === elderId) ?? null;
}

export async function deleteElderProfile(elderId: string) {
  const elders = await getElderProfiles();

  await writeJsonArray(
    ELDER_PROFILES_KEY,
    elders.filter((elder) => elder.id !== elderId),
  );
}

export async function getElderCheckIns(elderId: string) {
  const checkIns = await readJsonArray<ElderCheckIn>(ELDER_CHECK_INS_KEY);

  return sortByTime(checkIns.filter((checkIn) => checkIn.elderId === elderId));
}

export async function addElderCheckIn(
  input: Omit<ElderCheckIn, "id" | "loggedAt" | "createdAt">,
) {
  const now = new Date().toISOString();
  const checkIn: ElderCheckIn = {
    ...input,
    createdAt: now,
    id: id("elder-check-in"),
    loggedAt: now,
    notes: input.notes?.trim() || undefined,
  };
  const checkIns = await readJsonArray<ElderCheckIn>(ELDER_CHECK_INS_KEY);

  await writeJsonArray(ELDER_CHECK_INS_KEY, [checkIn, ...checkIns]);

  return checkIn;
}

export async function getLatestElderCheckIn(elderId: string) {
  return (await getElderCheckIns(elderId))[0];
}

export async function getTodayElderCheckIns(elderId: string) {
  const today = new Date().toDateString();

  return (await getElderCheckIns(elderId)).filter(
    (checkIn) => new Date(checkIn.loggedAt).toDateString() === today,
  );
}

export async function getElderVitals(elderId: string) {
  const vitals = await readJsonArray<ElderVitalsLog>(ELDER_VITALS_KEY);

  return sortByTime(vitals.filter((log) => log.elderId === elderId));
}

export async function addElderVitals(
  input: Omit<ElderVitalsLog, "id" | "loggedAt" | "createdAt">,
) {
  const now = new Date().toISOString();
  const vitals: ElderVitalsLog = {
    ...input,
    createdAt: now,
    id: id("elder-vitals"),
    loggedAt: now,
    notes: input.notes?.trim() || undefined,
  };
  const logs = await readJsonArray<ElderVitalsLog>(ELDER_VITALS_KEY);

  await writeJsonArray(ELDER_VITALS_KEY, [vitals, ...logs]);

  return vitals;
}

export async function getLatestElderVitals(elderId: string) {
  return (await getElderVitals(elderId))[0];
}

export async function getElderMedications(elderId: string) {
  const medications = await readJsonArray<ElderMedicationItem>(
    ELDER_MEDICATIONS_KEY,
  );

  return medications.filter((medication) => medication.elderId === elderId);
}

export async function addElderMedication(
  input: Omit<ElderMedicationItem, "id" | "active" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const medication: ElderMedicationItem = {
    ...input,
    active: true,
    createdAt: now,
    id: id("elder-medication"),
    updatedAt: now,
  };
  const medications = await readJsonArray<ElderMedicationItem>(
    ELDER_MEDICATIONS_KEY,
  );

  await writeJsonArray(ELDER_MEDICATIONS_KEY, [medication, ...medications]);

  return medication;
}

export async function updateElderMedication(
  medicationId: string,
  partial: Partial<Omit<ElderMedicationItem, "id" | "elderId" | "createdAt">>,
) {
  const medications = await readJsonArray<ElderMedicationItem>(
    ELDER_MEDICATIONS_KEY,
  );
  const updatedMedications = medications.map((medication) =>
    medication.id === medicationId
      ? { ...medication, ...partial, updatedAt: new Date().toISOString() }
      : medication,
  );

  await writeJsonArray(ELDER_MEDICATIONS_KEY, updatedMedications);

  return (
    updatedMedications.find((medication) => medication.id === medicationId) ??
    null
  );
}

export async function deactivateElderMedication(medicationId: string) {
  return updateElderMedication(medicationId, { active: false });
}

export async function logElderMedicationTaken(
  input: Omit<ElderMedicationTakenLog, "id" | "takenAt" | "createdAt">,
) {
  const now = new Date().toISOString();
  const log: ElderMedicationTakenLog = {
    ...input,
    createdAt: now,
    id: id("elder-medication-taken"),
    takenAt: now,
  };
  const logs = await readJsonArray<ElderMedicationTakenLog>(
    ELDER_MEDICATION_TAKEN_KEY,
  );

  await writeJsonArray(ELDER_MEDICATION_TAKEN_KEY, [log, ...logs]);

  return log;
}

export async function getElderMedicationTakenLogs(elderId: string) {
  const logs = await readJsonArray<ElderMedicationTakenLog>(
    ELDER_MEDICATION_TAKEN_KEY,
  );

  return sortByTime(logs.filter((log) => log.elderId === elderId));
}

export async function getElderCareNotes(elderId: string) {
  const notes = await readJsonArray<ElderCareNote>(ELDER_CARE_NOTES_KEY);

  return sortByTime(notes.filter((note) => note.elderId === elderId));
}

export async function addElderCareNote(
  input: Omit<ElderCareNote, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const note: ElderCareNote = {
    ...input,
    createdAt: now,
    id: id("elder-care-note"),
    note: input.note.trim(),
    title: input.title.trim(),
    updatedAt: now,
  };
  const notes = await readJsonArray<ElderCareNote>(ELDER_CARE_NOTES_KEY);

  await writeJsonArray(ELDER_CARE_NOTES_KEY, [note, ...notes]);

  return note;
}

export async function updateElderCareNote(
  noteId: string,
  partial: Partial<Omit<ElderCareNote, "id" | "elderId" | "createdAt">>,
) {
  const notes = await readJsonArray<ElderCareNote>(ELDER_CARE_NOTES_KEY);
  const updatedNotes = notes.map((note) =>
    note.id === noteId
      ? { ...note, ...partial, updatedAt: new Date().toISOString() }
      : note,
  );

  await writeJsonArray(ELDER_CARE_NOTES_KEY, updatedNotes);

  return updatedNotes.find((note) => note.id === noteId) ?? null;
}

export async function deleteElderCareNote(noteId: string) {
  const notes = await readJsonArray<ElderCareNote>(ELDER_CARE_NOTES_KEY);

  await writeJsonArray(
    ELDER_CARE_NOTES_KEY,
    notes.filter((note) => note.id !== noteId),
  );
}

export async function getElderAppointments(elderId: string) {
  const appointments = await readJsonArray<ElderAppointment>(
    ELDER_APPOINTMENTS_KEY,
  );

  return sortByTime(
    appointments.filter((appointment) => appointment.elderId === elderId),
  );
}

export async function addElderAppointment(
  input: Omit<ElderAppointment, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const appointment: ElderAppointment = {
    ...input,
    createdAt: now,
    id: id("elder-appointment"),
    notes: input.notes?.trim() || undefined,
    updatedAt: now,
  };
  const appointments = await readJsonArray<ElderAppointment>(
    ELDER_APPOINTMENTS_KEY,
  );

  await writeJsonArray(ELDER_APPOINTMENTS_KEY, [appointment, ...appointments]);

  return appointment;
}

export async function updateElderAppointment(
  appointmentId: string,
  partial: Partial<Omit<ElderAppointment, "id" | "elderId" | "createdAt">>,
) {
  const appointments = await readJsonArray<ElderAppointment>(
    ELDER_APPOINTMENTS_KEY,
  );
  const updatedAppointments = appointments.map((appointment) =>
    appointment.id === appointmentId
      ? { ...appointment, ...partial, updatedAt: new Date().toISOString() }
      : appointment,
  );

  await writeJsonArray(ELDER_APPOINTMENTS_KEY, updatedAppointments);

  return (
    updatedAppointments.find(
      (appointment) => appointment.id === appointmentId,
    ) ?? null
  );
}

export async function deleteElderAppointment(appointmentId: string) {
  const appointments = await readJsonArray<ElderAppointment>(
    ELDER_APPOINTMENTS_KEY,
  );

  await writeJsonArray(
    ELDER_APPOINTMENTS_KEY,
    appointments.filter((appointment) => appointment.id !== appointmentId),
  );
}

export async function getElderSummary(
  elderId: string,
): Promise<ElderSummary | null> {
  const elder = await getElderProfile(elderId);

  if (!elder) return null;

  const [latestCheckIn, latestVitals, medications, notes, appointments] =
    await Promise.all([
      getLatestElderCheckIn(elderId),
      getLatestElderVitals(elderId),
      getElderMedications(elderId),
      getElderCareNotes(elderId),
      getElderAppointments(elderId),
    ]);

  const nextAppointment = appointments
    .filter(
      (appointment) =>
        new Date(appointment.appointmentDate).getTime() >= Date.now(),
    )
    .sort(
      (left, right) =>
        new Date(left.appointmentDate).getTime() -
        new Date(right.appointmentDate).getTime(),
    )[0];

  return {
    activeMedicationCount: medications.filter((medication) => medication.active)
      .length,
    elder,
    latestCareNote: notes[0],
    latestCheckIn,
    latestVitals,
    needsAttention:
      latestCheckIn?.status === "needs_attention" ||
      latestCheckIn?.status === "missed" ||
      latestCheckIn?.status === "urgent",
    nextAppointment,
  };
}

export async function getAllElderSummaries() {
  const elders = await getElderProfiles();
  const summaries = await Promise.all(
    elders.map((elder) => getElderSummary(elder.id)),
  );

  return summaries.filter((summary): summary is ElderSummary =>
    Boolean(summary),
  );
}
