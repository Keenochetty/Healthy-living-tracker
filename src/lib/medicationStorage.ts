import AsyncStorage from "@react-native-async-storage/async-storage";

import { cancelReminderNotification, scheduleMedicationNotification } from "@/lib/notifications";
import {
  cancelRemindersByLinkedEntity,
  createMedicationReminder,
  getRemindersByLinkedEntity,
  updateReminder
} from "@/lib/reminderStorage";
import type {
  MedicationDetail,
  MedicationFrequency,
  MedicationItem,
  MedicationReminderTime,
  MedicationSchedule,
  MedicationTakenLog
} from "@/types/medication";

const MEDICATIONS_STORAGE_KEY = "family_health_medications";
const MEDICATION_SCHEDULES_STORAGE_KEY = "family_health_medication_schedules";
const MEDICATION_TAKEN_LOGS_STORAGE_KEY = "family_health_medication_taken_logs";
const medicationListeners = new Set<(medications: MedicationItem[]) => void>();

type CreateMedicationInput = {
  dosage?: string;
  instructions?: string;
  name: string;
};

export function subscribeToMedications(listener: (medications: MedicationItem[]) => void) {
  medicationListeners.add(listener);

  return () => {
    medicationListeners.delete(listener);
  };
}

function notifyMedicationListeners(medications: MedicationItem[]) {
  medicationListeners.forEach((listener) => listener(medications));
}

function createStarterMedication(): MedicationItem {
  const now = new Date().toISOString();

  return {
    active: true,
    createdAt: now,
    dosage: "",
    id: "starter-medication",
    instructions: "Follow your healthcare professional's instructions.",
    name: "Medication reminder",
    updatedAt: now
  };
}

async function readJsonArray<T>(key: string, fallback: T[]) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? (parsedValue as T[]) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));

  return value;
}

export async function getMedications() {
  const medications = await readJsonArray<MedicationItem>(MEDICATIONS_STORAGE_KEY, []);

  if (!medications.length) {
    const starterMedication = createStarterMedication();

    await saveMedications([starterMedication]);

    return [starterMedication];
  }

  return medications;
}

export async function saveMedications(medications: MedicationItem[]) {
  await writeJsonArray(MEDICATIONS_STORAGE_KEY, medications);
  notifyMedicationListeners(medications);

  return medications;
}

export async function createMedication(input: CreateMedicationInput) {
  const now = new Date().toISOString();
  const medication: MedicationItem = {
    active: true,
    createdAt: now,
    dosage: input.dosage?.trim() || undefined,
    id: `medication-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    instructions: input.instructions?.trim() || undefined,
    name: input.name.trim(),
    updatedAt: now
  };
  const medications = await getMedications();

  await saveMedications([medication, ...medications]);

  return medication;
}

export async function getMedicationById(id: string) {
  const medications = await getMedications();

  return medications.find((medication) => medication.id === id) ?? null;
}

export async function updateMedication(
  id: string,
  partial: Partial<Omit<MedicationItem, "id" | "createdAt">>
) {
  const medications = await getMedications();
  const updatedMedications = medications.map((medication) =>
    medication.id === id
      ? {
          ...medication,
          ...partial,
          updatedAt: new Date().toISOString()
        }
      : medication
  );

  await saveMedications(updatedMedications);

  return updatedMedications.find((medication) => medication.id === id) ?? null;
}

export async function getMedicationSchedules() {
  return readJsonArray<MedicationSchedule>(MEDICATION_SCHEDULES_STORAGE_KEY, []);
}

export async function getMedicationScheduleByMedicationId(medicationId: string) {
  const schedules = await getMedicationSchedules();

  return schedules.find((schedule) => schedule.medicationId === medicationId) ?? null;
}

function defaultTimesForFrequency(frequency: MedicationFrequency): string[] {
  if (frequency === "twice_daily") {
    return ["08:00", "20:00"];
  }

  if (frequency === "three_times_daily") {
    return ["08:00", "14:00", "20:00"];
  }

  return ["08:00"];
}

function buildReminderTimes(
  frequency: MedicationFrequency,
  existingTimes?: MedicationReminderTime[]
) {
  const times = frequency === "custom" && existingTimes?.length
    ? existingTimes.map((time) => time.time)
    : defaultTimesForFrequency(frequency);

  return times.map((time, index) => ({
    enabled: existingTimes?.find((item) => item.time === time)?.enabled ?? true,
    id: existingTimes?.find((item) => item.time === time)?.id ?? `time-${index}-${time}`,
    notificationId: existingTimes?.find((item) => item.time === time)?.notificationId,
    time
  }));
}

function dueAtForTime(time: string, startDate?: string) {
  const [hour, minute] = time.split(":").map(Number);
  const dueAt = startDate ? new Date(startDate) : new Date();

  dueAt.setHours(hour || 0, minute || 0, 0, 0);

  if (dueAt.getTime() <= Date.now()) {
    dueAt.setDate(dueAt.getDate() + 1);
  }

  return dueAt.toISOString();
}

export async function createDefaultScheduleForMedication(medicationId: string) {
  const now = new Date().toISOString();

  return {
    active: true,
    createdAt: now,
    frequency: "daily" as MedicationFrequency,
    id: `schedule-${medicationId}`,
    medicationId,
    reminderTimes: buildReminderTimes("daily"),
    takeWithFood: false,
    updatedAt: now
  };
}

async function saveSchedules(schedules: MedicationSchedule[]) {
  return writeJsonArray(MEDICATION_SCHEDULES_STORAGE_KEY, schedules);
}

async function syncScheduleReminders(schedule: MedicationSchedule) {
  const medication = await getMedicationById(schedule.medicationId);

  if (!medication) {
    return schedule;
  }

  const existingReminders = await getRemindersByLinkedEntity(
    "medication",
    medication.id
  );

  await Promise.all(
    existingReminders.map((reminder) => cancelReminderNotification(reminder.notificationId))
  );
  await cancelRemindersByLinkedEntity("medication", medication.id);

  if (!schedule.active || !medication.active) {
    return {
      ...schedule,
      reminderTimes: schedule.reminderTimes.map((time) => ({
        ...time,
        notificationId: undefined
      }))
    };
  }

  const nextReminderTimes: MedicationReminderTime[] = [];

  for (const reminderTime of schedule.reminderTimes) {
    if (!reminderTime.enabled) {
      nextReminderTimes.push({ ...reminderTime, notificationId: undefined });
      continue;
    }

    const reminder = await createMedicationReminder({
      dosage: medication.dosage,
      dueAt: dueAtForTime(reminderTime.time, schedule.startDate),
      instructions: schedule.instructions || medication.instructions,
      medicationId: medication.id,
      medicationName: medication.name,
      notify: true
    });
    const notificationId = await scheduleMedicationNotification({
      ...reminder,
      notify: true
    });
    const savedReminder = await updateReminder(reminder.id, {
      notificationId: notificationId ?? undefined,
      notify: Boolean(notificationId)
    });

    nextReminderTimes.push({
      ...reminderTime,
      notificationId: savedReminder?.notificationId
    });
  }

  return {
    ...schedule,
    reminderTimes: nextReminderTimes
  };
}

export async function saveMedicationSchedule(schedule: MedicationSchedule) {
  const schedules = await getMedicationSchedules();
  const normalisedSchedule: MedicationSchedule = {
    ...schedule,
    reminderTimes: buildReminderTimes(schedule.frequency, schedule.reminderTimes),
    updatedAt: new Date().toISOString()
  };
  const syncedSchedule = await syncScheduleReminders(normalisedSchedule);
  const nextSchedules = [
    syncedSchedule,
    ...schedules.filter((item) => item.id !== syncedSchedule.id)
  ];

  await saveSchedules(nextSchedules);

  return syncedSchedule;
}

export async function updateMedicationSchedule(
  scheduleId: string,
  partial: Partial<Omit<MedicationSchedule, "id" | "createdAt">>
) {
  const schedules = await getMedicationSchedules();
  const schedule = schedules.find((item) => item.id === scheduleId);

  if (!schedule) {
    return null;
  }

  return saveMedicationSchedule({
    ...schedule,
    ...partial,
    reminderTimes: partial.reminderTimes ?? schedule.reminderTimes
  });
}

export async function deleteMedicationSchedule(scheduleId: string) {
  const schedules = await getMedicationSchedules();
  const schedule = schedules.find((item) => item.id === scheduleId) ?? null;

  if (schedule) {
    const linkedReminders = await getRemindersByLinkedEntity(
      "medication",
      schedule.medicationId
    );

    await Promise.all(
      linkedReminders.map((reminder) => cancelReminderNotification(reminder.notificationId))
    );
    await cancelRemindersByLinkedEntity("medication", schedule.medicationId);
  }

  await saveSchedules(schedules.filter((item) => item.id !== scheduleId));

  return schedule;
}

export async function markMedicationTaken(medicationId: string, note?: string) {
  const logs = await readJsonArray<MedicationTakenLog>(MEDICATION_TAKEN_LOGS_STORAGE_KEY, []);
  const log: MedicationTakenLog = {
    id: `taken-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    medicationId,
    note: note?.trim() || undefined,
    takenAt: new Date().toISOString()
  };

  await writeJsonArray(MEDICATION_TAKEN_LOGS_STORAGE_KEY, [log, ...logs]);

  return log;
}

export async function getMedicationTakenLogsByMedicationId(medicationId: string) {
  const logs = await readJsonArray<MedicationTakenLog>(MEDICATION_TAKEN_LOGS_STORAGE_KEY, []);

  return logs.filter((log) => log.medicationId === medicationId);
}

export async function getMedicationDetail(
  medicationId: string
): Promise<MedicationDetail | null> {
  const medication = await getMedicationById(medicationId);

  if (!medication) {
    return null;
  }

  const [schedule, takenLogs] = await Promise.all([
    getMedicationScheduleByMedicationId(medicationId),
    getMedicationTakenLogsByMedicationId(medicationId)
  ]);

  return {
    medication,
    schedule: schedule ?? undefined,
    takenLogs
  };
}
