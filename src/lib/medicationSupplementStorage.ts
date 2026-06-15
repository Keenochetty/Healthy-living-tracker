import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AdherenceSummary,
  DoseLog,
  DoseLogStatus,
  FoodTiming,
  HealthDocument,
  HealthSchedule,
  HealthScheduleReminder,
  Medication,
  MedicationForm,
  MedicationItem,
  MedicationSchedule,
  MedicationSupplementNote,
  MedicationSupplementTodaySummary,
  ScheduleTiming,
  Supplement,
  SupplementForm,
} from "@/types/medication";

const MEDICATIONS_STORAGE_KEY = "family_health_phase10_medications";
const SUPPLEMENTS_STORAGE_KEY = "family_health_phase10_supplements";
const HEALTH_SCHEDULES_STORAGE_KEY = "family_health_phase10_health_schedules";
const DOSE_LOGS_STORAGE_KEY = "family_health_phase10_dose_logs";
const HEALTH_DOCUMENTS_STORAGE_KEY = "family_health_phase10_health_documents";
const MEDICATION_SUPPLEMENT_NOTES_STORAGE_KEY =
  "family_health_phase10_medication_supplement_notes";
const LEGACY_MEDICATIONS_STORAGE_KEY = "family_health_medications";
const LEGACY_MEDICATION_SCHEDULES_STORAGE_KEY =
  "family_health_medication_schedules";
const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";

type CreateMedicationInput = Partial<
  Omit<
    Medication,
    | "id"
    | "userId"
    | "profileId"
    | "createdAt"
    | "updatedAt"
    | "isActive"
    | "isPrivate"
    | "sharedWithPartner"
    | "sharedWithFamily"
    | "sharedWithCaregiver"
    | "lockedPrivate"
  >
> & {
  name: string;
};

type CreateSupplementInput = Partial<
  Omit<
    Supplement,
    | "id"
    | "userId"
    | "profileId"
    | "createdAt"
    | "updatedAt"
    | "isActive"
    | "isPrivate"
    | "sharedWithPartner"
    | "sharedWithFamily"
    | "sharedWithCaregiver"
    | "lockedPrivate"
  >
> & {
  name: string;
};

type ScheduleInput = Partial<
  Omit<
    HealthSchedule,
    "id" | "userId" | "profileId" | "createdAt" | "updatedAt"
  >
> & {
  itemId: string;
  itemType: "medication" | "supplement";
};

export async function createMedication(input: CreateMedicationInput) {
  const now = new Date().toISOString();
  const medication: Medication = {
    brandName: input.brandName?.trim() || undefined,
    createdAt: now,
    doseAmount: numberOrUndefined(input.doseAmount),
    doseUnit: input.doseUnit?.trim() || undefined,
    endDate: input.endDate || undefined,
    form: input.form ?? "tablet",
    genericName: input.genericName?.trim() || undefined,
    id: createId("medication"),
    instructions: input.instructions?.trim() || undefined,
    isActive: true,
    isPrivate: true,
    lockedPrivate: true,
    name: input.name.trim(),
    notes: input.notes?.trim() || undefined,
    pharmacy: input.pharmacy?.trim() || undefined,
    prescribedBy: input.prescribedBy?.trim() || undefined,
    profileId: LOCAL_PROFILE_ID,
    reason: input.reason?.trim() || undefined,
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    startDate: input.startDate || toDateKey(new Date()),
    strength: input.strength?.trim() || undefined,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const medications = await getMedications();

  await writeJsonArray(MEDICATIONS_STORAGE_KEY, [medication, ...medications]);

  return medication;
}

export async function getMedications() {
  await migrateLegacyMedications();
  const medications = await readJsonArray<Medication>(MEDICATIONS_STORAGE_KEY);

  return medications.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export async function getMedicationById(id: string) {
  const medications = await getMedications();

  return medications.find((medication) => medication.id === id) ?? null;
}

export async function updateMedication(
  id: string,
  partial: Partial<
    Omit<Medication, "id" | "userId" | "profileId" | "createdAt">
  >,
) {
  const medications = await getMedications();
  const updatedMedications = medications.map((medication) =>
    medication.id === id
      ? { ...medication, ...partial, updatedAt: new Date().toISOString() }
      : medication,
  );

  await writeJsonArray(MEDICATIONS_STORAGE_KEY, updatedMedications);

  return updatedMedications.find((medication) => medication.id === id) ?? null;
}

export async function archiveMedication(id: string) {
  return updateMedication(id, { isActive: false });
}

export async function deleteMedication(id: string) {
  const [medications, schedules, logs, documents, notes] = await Promise.all([
    getMedications(),
    getHealthSchedules(),
    getDoseLogs(),
    getHealthDocuments(),
    getMedicationSupplementNotes(),
  ]);
  const medication = medications.find((item) => item.id === id) ?? null;

  await Promise.all([
    writeJsonArray(
      MEDICATIONS_STORAGE_KEY,
      medications.filter((item) => item.id !== id),
    ),
    writeJsonArray(
      HEALTH_SCHEDULES_STORAGE_KEY,
      schedules.filter(
        (item) => !(item.itemType === "medication" && item.itemId === id),
      ),
    ),
    writeJsonArray(
      DOSE_LOGS_STORAGE_KEY,
      logs.filter(
        (item) => !(item.itemType === "medication" && item.itemId === id),
      ),
    ),
    writeJsonArray(
      HEALTH_DOCUMENTS_STORAGE_KEY,
      documents.filter(
        (item) => !(item.relatedType === "medication" && item.relatedId === id),
      ),
    ),
    writeJsonArray(
      MEDICATION_SUPPLEMENT_NOTES_STORAGE_KEY,
      notes.filter(
        (item) => !(item.relatedType === "medication" && item.relatedId === id),
      ),
    ),
  ]);

  return medication;
}

export async function searchMedicationNames(query: string) {
  const medications = await getMedications();
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return [] as Medication[];
  }

  return medications.filter((medication) =>
    [medication.name, medication.genericName, medication.brandName].some(
      (value) => value?.toLowerCase().includes(trimmedQuery),
    ),
  );
}

export async function createSupplement(input: CreateSupplementInput) {
  const now = new Date().toISOString();
  const supplement: Supplement = {
    brand: input.brand?.trim() || undefined,
    createdAt: now,
    endDate: input.endDate || undefined,
    form: input.form ?? "capsule",
    id: createId("supplement"),
    instructions: input.instructions?.trim() || undefined,
    isActive: true,
    isPrivate: true,
    lockedPrivate: true,
    mainIngredient: input.mainIngredient?.trim() || undefined,
    name: input.name.trim(),
    notes: input.notes?.trim() || undefined,
    profileId: LOCAL_PROFILE_ID,
    reason: input.reason?.trim() || undefined,
    servingAmount: numberOrUndefined(input.servingAmount),
    servingUnit: input.servingUnit?.trim() || undefined,
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    startDate: input.startDate || toDateKey(new Date()),
    strength: input.strength?.trim() || undefined,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const supplements = await getSupplements();

  await writeJsonArray(SUPPLEMENTS_STORAGE_KEY, [supplement, ...supplements]);

  return supplement;
}

export async function getSupplements() {
  const supplements = await readJsonArray<Supplement>(SUPPLEMENTS_STORAGE_KEY);

  return supplements.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export async function getSupplementById(id: string) {
  const supplements = await getSupplements();

  return supplements.find((supplement) => supplement.id === id) ?? null;
}

export async function updateSupplement(
  id: string,
  partial: Partial<
    Omit<Supplement, "id" | "userId" | "profileId" | "createdAt">
  >,
) {
  const supplements = await getSupplements();
  const updatedSupplements = supplements.map((supplement) =>
    supplement.id === id
      ? { ...supplement, ...partial, updatedAt: new Date().toISOString() }
      : supplement,
  );

  await writeJsonArray(SUPPLEMENTS_STORAGE_KEY, updatedSupplements);

  return updatedSupplements.find((supplement) => supplement.id === id) ?? null;
}

export async function archiveSupplement(id: string) {
  return updateSupplement(id, { isActive: false });
}

export async function deleteSupplement(id: string) {
  const [supplements, schedules, logs, documents, notes] = await Promise.all([
    getSupplements(),
    getHealthSchedules(),
    getDoseLogs(),
    getHealthDocuments(),
    getMedicationSupplementNotes(),
  ]);
  const supplement = supplements.find((item) => item.id === id) ?? null;

  await Promise.all([
    writeJsonArray(
      SUPPLEMENTS_STORAGE_KEY,
      supplements.filter((item) => item.id !== id),
    ),
    writeJsonArray(
      HEALTH_SCHEDULES_STORAGE_KEY,
      schedules.filter(
        (item) => !(item.itemType === "supplement" && item.itemId === id),
      ),
    ),
    writeJsonArray(
      DOSE_LOGS_STORAGE_KEY,
      logs.filter(
        (item) => !(item.itemType === "supplement" && item.itemId === id),
      ),
    ),
    writeJsonArray(
      HEALTH_DOCUMENTS_STORAGE_KEY,
      documents.filter(
        (item) => !(item.relatedType === "supplement" && item.relatedId === id),
      ),
    ),
    writeJsonArray(
      MEDICATION_SUPPLEMENT_NOTES_STORAGE_KEY,
      notes.filter(
        (item) => !(item.relatedType === "supplement" && item.relatedId === id),
      ),
    ),
  ]);

  return supplement;
}

export async function searchSupplementNames(query: string) {
  const supplements = await getSupplements();
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return [] as Supplement[];
  }

  return supplements.filter((supplement) =>
    [supplement.name, supplement.brand, supplement.mainIngredient].some(
      (value) => value?.toLowerCase().includes(trimmedQuery),
    ),
  );
}

export async function createHealthSchedule(input: ScheduleInput) {
  const now = new Date().toISOString();
  const schedule: HealthSchedule = {
    createdAt: now,
    customInstructions: input.customInstructions?.trim() || undefined,
    daysOfWeek: input.daysOfWeek,
    endDate: input.endDate || undefined,
    everyXHours: numberOrUndefined(input.everyXHours),
    foodTiming: input.foodTiming ?? "none",
    id: createId("health-schedule"),
    itemId: input.itemId,
    itemType: input.itemType,
    profileId: LOCAL_PROFILE_ID,
    reminderEnabled: input.reminderEnabled ?? true,
    startDate: input.startDate || toDateKey(new Date()),
    timing: input.timing ?? "once_daily",
    times: normalizeTimes(input.timing ?? "once_daily", input.times),
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const schedules = await getHealthSchedules();

  await writeJsonArray(HEALTH_SCHEDULES_STORAGE_KEY, [schedule, ...schedules]);

  return schedule;
}

export async function getSchedulesByItem(
  itemType: "medication" | "supplement",
  itemId: string,
) {
  const schedules = await getHealthSchedules();

  return schedules.filter(
    (schedule) => schedule.itemType === itemType && schedule.itemId === itemId,
  );
}

export async function getSchedulesForDate(
  date: Date | string,
  itemType?: "medication" | "supplement",
) {
  const schedules = await getHealthSchedules();
  const dateKey = typeof date === "string" ? date : toDateKey(date);

  return schedules.filter(
    (schedule) =>
      (!itemType || schedule.itemType === itemType) &&
      isScheduleActiveOnDate(schedule, dateKey),
  );
}

export async function updateHealthSchedule(
  id: string,
  partial: Partial<
    Omit<HealthSchedule, "id" | "userId" | "profileId" | "createdAt">
  >,
) {
  const schedules = await getHealthSchedules();
  const updatedSchedules = schedules.map((schedule) =>
    schedule.id === id
      ? {
          ...schedule,
          ...partial,
          times:
            partial.times || partial.timing
              ? normalizeTimes(
                  partial.timing ?? schedule.timing,
                  partial.times ?? schedule.times,
                )
              : schedule.times,
          updatedAt: new Date().toISOString(),
        }
      : schedule,
  );

  await writeJsonArray(HEALTH_SCHEDULES_STORAGE_KEY, updatedSchedules);

  return updatedSchedules.find((schedule) => schedule.id === id) ?? null;
}

export async function deleteHealthSchedule(id: string) {
  const schedules = await getHealthSchedules();
  const schedule = schedules.find((item) => item.id === id) ?? null;

  await writeJsonArray(
    HEALTH_SCHEDULES_STORAGE_KEY,
    schedules.filter((item) => item.id !== id),
  );

  return schedule;
}

export async function calculateTodayMedicationSchedule() {
  return calculateTodaySchedule("medication");
}

export async function calculateTodaySupplementSchedule() {
  return calculateTodaySchedule("supplement");
}

export async function createDoseLog(
  input: Partial<
    Omit<DoseLog, "id" | "userId" | "profileId" | "createdAt" | "updatedAt">
  > & {
    itemId: string;
    itemType: "medication" | "supplement";
    status: DoseLogStatus;
  },
) {
  const now = new Date().toISOString();
  const log: DoseLog = {
    amount: numberOrUndefined(input.amount),
    createdAt: now,
    foodTimingNote: input.foodTimingNote?.trim() || undefined,
    id: createId("dose-log"),
    itemId: input.itemId,
    itemType: input.itemType,
    notes: input.notes?.trim() || undefined,
    profileId: LOCAL_PROFILE_ID,
    scheduleId: input.scheduleId,
    scheduledAt: input.scheduledAt,
    sideEffectNote: input.sideEffectNote?.trim() || undefined,
    status: input.status,
    takenAt: input.takenAt ?? (input.status === "taken" ? now : undefined),
    unit: input.unit?.trim() || undefined,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const logs = await getDoseLogs();

  await writeJsonArray(DOSE_LOGS_STORAGE_KEY, [log, ...logs]);

  return log;
}

export async function markDoseTaken(input: DoseActionInput) {
  return createDoseLog({
    ...input,
    status: "taken",
    takenAt: new Date().toISOString(),
  });
}

export async function markDoseSkipped(input: DoseActionInput) {
  return createDoseLog({ ...input, status: "skipped" });
}

export async function markDoseMissed(input: DoseActionInput) {
  return createDoseLog({ ...input, status: "missed" });
}

export async function snoozeDoseReminder(input: DoseActionInput) {
  return createDoseLog({
    ...input,
    notes: input.notes ?? "Snoozed reminder.",
    status: "snoozed",
  });
}

type DoseActionInput = {
  amount?: number;
  foodTimingNote?: string;
  itemId: string;
  itemType: "medication" | "supplement";
  notes?: string;
  scheduleId?: string;
  scheduledAt?: string;
  sideEffectNote?: string;
  unit?: string;
};

export async function getDoseLogsByDate(
  date: Date | string,
  itemType?: "medication" | "supplement",
) {
  const logs = await getDoseLogs();
  const dateKey = typeof date === "string" ? date : toDateKey(date);

  return logs.filter((log) => {
    const logDate = log.takenAt ?? log.scheduledAt ?? log.createdAt;

    return (
      (!itemType || log.itemType === itemType) && logDate.startsWith(dateKey)
    );
  });
}

export async function getDoseLogsByItem(
  itemType: "medication" | "supplement",
  itemId: string,
) {
  const logs = await getDoseLogs();

  return logs.filter(
    (log) => log.itemType === itemType && log.itemId === itemId,
  );
}

export async function getMedicationAdherenceSummary(itemId?: string) {
  return getAdherenceSummary("medication", itemId);
}

export async function getSupplementAdherenceSummary(itemId?: string) {
  return getAdherenceSummary("supplement", itemId);
}

export async function createHealthDocument(
  input: Partial<
    Omit<
      HealthDocument,
      | "id"
      | "userId"
      | "profileId"
      | "createdAt"
      | "updatedAt"
      | "isPrivate"
      | "sharedWithPartner"
      | "sharedWithFamily"
      | "sharedWithCaregiver"
      | "lockedPrivate"
    >
  > & {
    title: string;
  },
) {
  const now = new Date().toISOString();
  const document: HealthDocument = {
    createdAt: now,
    fileType: input.fileType ?? "note",
    fileUrl: input.fileUrl,
    id: createId("health-doc"),
    isPrivate: true,
    lockedPrivate: true,
    noteText: input.noteText?.trim() || undefined,
    profileId: LOCAL_PROFILE_ID,
    relatedId: input.relatedId,
    relatedType: input.relatedType ?? "doctor_note",
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    title: input.title.trim(),
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const documents = await getHealthDocuments();

  await writeJsonArray(HEALTH_DOCUMENTS_STORAGE_KEY, [document, ...documents]);

  return document;
}

export async function getHealthDocumentsByItem(
  relatedType: "medication" | "supplement",
  relatedId: string,
) {
  const documents = await getHealthDocuments();

  return documents.filter(
    (document) =>
      document.relatedType === relatedType && document.relatedId === relatedId,
  );
}

export async function deleteHealthDocument(id: string) {
  const documents = await getHealthDocuments();
  const document = documents.find((item) => item.id === id) ?? null;

  await writeJsonArray(
    HEALTH_DOCUMENTS_STORAGE_KEY,
    documents.filter((item) => item.id !== id),
  );

  return document;
}

export async function createMedicationSupplementNote(
  input: Partial<
    Omit<
      MedicationSupplementNote,
      | "id"
      | "userId"
      | "profileId"
      | "createdAt"
      | "updatedAt"
      | "isPrivate"
      | "sharedWithPartner"
      | "sharedWithFamily"
      | "sharedWithCaregiver"
      | "lockedPrivate"
    >
  > & {
    note: string;
  },
) {
  const now = new Date().toISOString();
  const note: MedicationSupplementNote = {
    createdAt: now,
    id: createId("med-supp-note"),
    isPrivate: true,
    lockedPrivate: true,
    loggedAt: input.loggedAt ?? now,
    note: input.note.trim(),
    profileId: LOCAL_PROFILE_ID,
    relatedId: input.relatedId,
    relatedType: input.relatedType ?? "general",
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const notes = await getMedicationSupplementNotes();

  await writeJsonArray(MEDICATION_SUPPLEMENT_NOTES_STORAGE_KEY, [
    note,
    ...notes,
  ]);

  return note;
}

export async function getNotesByItem(
  relatedType: "medication" | "supplement" | "general",
  relatedId?: string,
) {
  const notes = await getMedicationSupplementNotes();

  return notes.filter(
    (note) =>
      note.relatedType === relatedType &&
      (!relatedId || note.relatedId === relatedId),
  );
}

export async function getNotesByDate(
  date: Date | string,
  relatedType?: "medication" | "supplement" | "general",
) {
  const notes = await getMedicationSupplementNotes();
  const dateKey = typeof date === "string" ? date : toDateKey(date);

  return notes.filter(
    (note) =>
      note.loggedAt.startsWith(dateKey) &&
      (!relatedType || note.relatedType === relatedType),
  );
}

export function getAvailableMedicationWidgets() {
  return [
    "medication_due_today",
    "next_medication",
    "medication_taken_today",
    "missed_medication",
    "medication_schedule_status",
  ] as const;
}

export function getAvailableSupplementWidgets() {
  return [
    "supplements_due_today",
    "next_supplement",
    "supplements_taken_today",
    "supplement_schedule_status",
  ] as const;
}

export async function calculateMedicationWidgetValue(widgetKey: string) {
  const summary = await calculateTodayMedicationSchedule();

  switch (widgetKey) {
    case "medication_due_today":
      return `${summary.dueCount} due`;
    case "next_medication":
      return summary.nextItem?.itemName ?? "None";
    case "medication_taken_today":
      return `${summary.takenCount} / ${summary.totalCount}`;
    case "missed_medication":
      return `${summary.missedCount} missed`;
    case "medication":
    case "medication_schedule_status":
      return summary.totalCount
        ? `${summary.takenCount} of ${summary.totalCount} taken`
        : "No schedule";
    default:
      return "Ready";
  }
}

export async function calculateSupplementWidgetValue(widgetKey: string) {
  const summary = await calculateTodaySupplementSchedule();

  switch (widgetKey) {
    case "supplements_due_today":
      return `${summary.dueCount} due`;
    case "next_supplement":
      return summary.nextItem?.itemName ?? "None";
    case "supplements_taken_today":
      return `${summary.takenCount} / ${summary.totalCount}`;
    case "supplement_schedule_status":
      return summary.totalCount
        ? `${summary.takenCount} of ${summary.totalCount} taken`
        : "No schedule";
    default:
      return "Ready";
  }
}

export async function getMedicationSupplementFoodTimingSummary() {
  const schedules = await getHealthSchedules();
  const foodTimingSchedules = schedules.filter(
    (schedule) => schedule.foodTiming !== "none" && schedule.reminderEnabled,
  );

  return {
    count: foodTimingSchedules.length,
    hasFoodTimingNotes: foodTimingSchedules.length > 0,
    message:
      "Some medications or supplements have food timing notes. Follow the label or healthcare professional's instructions.",
  };
}

async function calculateTodaySchedule(
  itemType: "medication" | "supplement",
): Promise<MedicationSupplementTodaySummary> {
  const today = new Date();
  const todayKey = toDateKey(today);
  const [schedules, logs, medications, supplements] = await Promise.all([
    getSchedulesForDate(todayKey, itemType),
    getDoseLogsByDate(todayKey, itemType),
    getMedications(),
    getSupplements(),
  ]);
  const activeItems =
    itemType === "medication"
      ? medications.filter((item) => item.isActive)
      : supplements.filter((item) => item.isActive);
  const reminders = schedules
    .filter((schedule) =>
      activeItems.some((item) => item.id === schedule.itemId),
    )
    .flatMap((schedule) => buildRemindersForSchedule(schedule, logs, today));
  const dueCount = reminders.filter(
    (reminder) => reminder.status === "due",
  ).length;
  const takenCount = logs.filter((log) => log.status === "taken").length;
  const missedCount =
    reminders.filter((reminder) => reminder.status === "missed").length +
    logs.filter((log) => log.status === "missed").length;
  const nextItem = reminders
    .filter(
      (reminder) => reminder.status === "upcoming" || reminder.status === "due",
    )
    .sort(
      (left, right) =>
        new Date(left.scheduledAt ?? 0).getTime() -
        new Date(right.scheduledAt ?? 0).getTime(),
    )[0];

  return {
    dueCount,
    missedCount,
    nextItem,
    reminders,
    takenCount,
    totalCount: reminders.length,
  };
}

function buildRemindersForSchedule(
  schedule: HealthSchedule,
  logs: DoseLog[],
  date: Date,
): HealthScheduleReminder[] {
  const itemName = getCachedItemName(schedule.itemType, schedule.itemId);

  if (schedule.timing === "as_needed") {
    return [
      {
        itemId: schedule.itemId,
        itemName,
        itemType: schedule.itemType,
        scheduleId: schedule.id,
        status: "upcoming",
        subtitle: "As needed",
      },
    ];
  }

  return schedule.times.map((time) => {
    const scheduledAt = toScheduledAt(date, time);
    const existingLog =
      logs.find(
        (log) =>
          log.scheduleId === schedule.id && log.scheduledAt === scheduledAt,
      ) ??
      logs.find(
        (log) =>
          log.itemId === schedule.itemId &&
          log.status !== "upcoming" &&
          (log.scheduledAt ?? "").startsWith(toDateKey(date)),
      );

    return {
      itemId: schedule.itemId,
      itemName,
      itemType: schedule.itemType,
      scheduleId: schedule.id,
      scheduledAt,
      status: existingLog?.status ?? inferReminderStatus(scheduledAt),
      subtitle: schedule.customInstructions,
    };
  });
}

let itemNameCache = new Map<string, string>();

async function refreshItemNameCache() {
  const [medications, supplements] = await Promise.all([
    getMedications(),
    getSupplements(),
  ]);

  itemNameCache = new Map([
    ...medications.map(
      (medication) => [`medication-${medication.id}`, medication.name] as const,
    ),
    ...supplements.map(
      (supplement) => [`supplement-${supplement.id}`, supplement.name] as const,
    ),
  ]);
}

function getCachedItemName(
  itemType: "medication" | "supplement",
  itemId: string,
) {
  return (
    itemNameCache.get(`${itemType}-${itemId}`) ??
    (itemType === "medication" ? "Medication" : "Supplement")
  );
}

async function getHealthSchedules() {
  await migrateLegacyMedications();
  await refreshItemNameCache();

  return readJsonArray<HealthSchedule>(HEALTH_SCHEDULES_STORAGE_KEY);
}

async function getDoseLogs() {
  return readJsonArray<DoseLog>(DOSE_LOGS_STORAGE_KEY);
}

async function getHealthDocuments() {
  return readJsonArray<HealthDocument>(HEALTH_DOCUMENTS_STORAGE_KEY);
}

async function getMedicationSupplementNotes() {
  return readJsonArray<MedicationSupplementNote>(
    MEDICATION_SUPPLEMENT_NOTES_STORAGE_KEY,
  );
}

async function getAdherenceSummary(
  itemType: "medication" | "supplement",
  itemId?: string,
): Promise<AdherenceSummary> {
  const logs = await getDoseLogs();
  const filteredLogs = logs.filter(
    (log) => log.itemType === itemType && (!itemId || log.itemId === itemId),
  );

  return {
    missed: filteredLogs.filter((log) => log.status === "missed").length,
    skipped: filteredLogs.filter((log) => log.status === "skipped").length,
    taken: filteredLogs.filter((log) => log.status === "taken").length,
    total: filteredLogs.length,
  };
}

async function migrateLegacyMedications() {
  const existingMedications = await readJsonArray<Medication>(
    MEDICATIONS_STORAGE_KEY,
  );

  if (existingMedications.length) {
    return;
  }

  const legacyMedications = await readJsonArray<MedicationItem>(
    LEGACY_MEDICATIONS_STORAGE_KEY,
  );

  if (!legacyMedications.length) {
    return;
  }

  const medications: Medication[] = legacyMedications.map((item) => ({
    createdAt: item.createdAt,
    doseUnit: item.dosage,
    form: "tablet",
    id: item.id,
    instructions: item.instructions,
    isActive: item.active,
    isPrivate: true,
    lockedPrivate: true,
    name: item.name,
    notes: undefined,
    profileId: LOCAL_PROFILE_ID,
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    strength: item.dosage,
    updatedAt: item.updatedAt,
    userId: LOCAL_USER_ID,
  }));
  const legacySchedules = await readJsonArray<MedicationSchedule>(
    LEGACY_MEDICATION_SCHEDULES_STORAGE_KEY,
  );
  const schedules: HealthSchedule[] = legacySchedules.map((schedule) => ({
    createdAt: schedule.createdAt,
    customInstructions: schedule.instructions,
    endDate: schedule.endDate,
    foodTiming: schedule.takeWithFood ? "with_food" : "none",
    id: schedule.id,
    itemId: schedule.medicationId,
    itemType: "medication",
    profileId: LOCAL_PROFILE_ID,
    reminderEnabled: schedule.active,
    startDate: schedule.startDate,
    timing: legacyFrequencyToTiming(schedule.frequency),
    times: schedule.reminderTimes.map((time) => time.time),
    updatedAt: schedule.updatedAt,
    userId: LOCAL_USER_ID,
  }));

  await Promise.all([
    writeJsonArray(MEDICATIONS_STORAGE_KEY, medications),
    writeJsonArray(HEALTH_SCHEDULES_STORAGE_KEY, schedules),
  ]);
}

function legacyFrequencyToTiming(frequency: string): ScheduleTiming {
  switch (frequency) {
    case "twice_daily":
      return "twice_daily";
    case "three_times_daily":
      return "three_times_daily";
    case "custom":
      return "specific_times";
    default:
      return "once_daily";
  }
}

function isScheduleActiveOnDate(schedule: HealthSchedule, dateKey: string) {
  if (schedule.startDate && schedule.startDate > dateKey) {
    return false;
  }

  if (schedule.endDate && schedule.endDate < dateKey) {
    return false;
  }

  if (schedule.timing === "specific_days" && schedule.daysOfWeek?.length) {
    const day = new Date(`${dateKey}T12:00:00`).getDay();

    return schedule.daysOfWeek.includes(day);
  }

  return true;
}

function normalizeTimes(timing: ScheduleTiming, times?: string[]) {
  if (timing === "twice_daily") {
    return ["08:00", "20:00"];
  }

  if (timing === "three_times_daily") {
    return ["08:00", "14:00", "20:00"];
  }

  if (timing === "every_x_hours") {
    return times?.length ? times : ["08:00"];
  }

  if (timing === "as_needed") {
    return [];
  }

  return times?.length ? times : ["08:00"];
}

function inferReminderStatus(scheduledAt: string): DoseLogStatus {
  const scheduledTime = new Date(scheduledAt).getTime();
  const now = Date.now();

  if (scheduledTime > now) {
    return "upcoming";
  }

  if (now - scheduledTime < 60 * 60 * 1000) {
    return "due";
  }

  return "missed";
}

function toScheduledAt(date: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const nextDate = new Date(date);

  nextDate.setHours(hour || 0, minute || 0, 0, 0);

  return nextDate.toISOString();
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function numberOrUndefined(value: unknown) {
  const nextValue = Number(value);

  return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : undefined;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readJsonArray<T>(key: string) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return [] as T[];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch {
    return [] as T[];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));

  return value;
}

export const MEDICATION_FORM_OPTIONS: Array<{
  key: MedicationForm;
  label: string;
}> = [
  { key: "tablet", label: "Tablet" },
  { key: "capsule", label: "Capsule" },
  { key: "syrup", label: "Syrup" },
  { key: "injection", label: "Injection" },
  { key: "cream", label: "Cream" },
  { key: "drops", label: "Drops" },
  { key: "inhaler", label: "Inhaler" },
  { key: "other", label: "Other" },
];

export const SUPPLEMENT_FORM_OPTIONS: Array<{
  key: SupplementForm;
  label: string;
}> = [
  { key: "tablet", label: "Tablet" },
  { key: "capsule", label: "Capsule" },
  { key: "powder", label: "Powder" },
  { key: "liquid", label: "Liquid" },
  { key: "gummy", label: "Gummy" },
  { key: "drops", label: "Drops" },
  { key: "other", label: "Other" },
];

export const SCHEDULE_TIMING_OPTIONS: Array<{
  key: ScheduleTiming;
  label: string;
}> = [
  { key: "once_daily", label: "Once daily" },
  { key: "twice_daily", label: "Twice daily" },
  { key: "three_times_daily", label: "Three times daily" },
  { key: "specific_times", label: "Specific times" },
  { key: "every_x_hours", label: "Every X hours" },
  { key: "specific_days", label: "Specific days" },
  { key: "as_needed", label: "As needed / PRN" },
];

export const FOOD_TIMING_OPTIONS: Array<{ key: FoodTiming; label: string }> = [
  { key: "none", label: "No timing note" },
  { key: "with_food", label: "With food" },
  { key: "without_food", label: "Without food" },
  { key: "before_meal", label: "Before meal" },
  { key: "after_meal", label: "After meal" },
];
