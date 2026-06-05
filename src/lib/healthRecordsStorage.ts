import AsyncStorage from "@react-native-async-storage/async-storage";

import type { WidgetKey } from "@/types/app";
import type {
  DoctorVisit,
  HealthRecord,
  HealthRecordFileType,
  HealthRecordFilters,
  HealthRecordFolder,
  HealthRecordReminder,
  HealthRecordReminderStatus,
  HealthRecordReminderType,
  HealthRecordType,
  LabResultRecord,
  PrescriptionRecord,
  RecordWidgetKey,
  RecordsOverviewSummary,
  VaccineRecord
} from "@/types/healthRecords";

const HEALTH_RECORDS_STORAGE_KEY = "family_health_phase12_health_records";
const DOCTOR_VISITS_STORAGE_KEY = "family_health_phase12_doctor_visits";
const VACCINE_RECORDS_STORAGE_KEY = "family_health_phase12_vaccine_records";
const LAB_RESULT_RECORDS_STORAGE_KEY = "family_health_phase12_lab_result_records";
const PRESCRIPTION_RECORDS_STORAGE_KEY = "family_health_phase12_prescription_records";
const HEALTH_RECORD_FOLDERS_STORAGE_KEY = "family_health_phase12_health_record_folders";
const HEALTH_RECORD_REMINDERS_STORAGE_KEY = "family_health_phase12_health_record_reminders";
const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";

const DEFAULT_FOLDERS = [
  { color: "#fef3c7", icon: "documents", id: "folder-prescriptions", name: "Prescriptions" },
  { color: "#e0f2fe", icon: "documents", id: "folder-lab-results", name: "Lab Results" },
  { color: "#ecfdf5", icon: "doctor", id: "folder-doctor-visits", name: "Doctor Visits" },
  { color: "#fce7f3", icon: "vaccines", id: "folder-vaccines", name: "Vaccines" },
  { color: "#f3e8ff", icon: "documents", id: "folder-child-records", name: "Child Records" },
  { color: "#fee2e2", icon: "medication", id: "folder-medication-labels", name: "Medication Labels" },
  { color: "#ccfbf1", icon: "health", id: "folder-supplement-labels", name: "Supplement Labels" },
  { color: "#f8fafc", icon: "documents", id: "folder-general-notes", name: "General Notes" }
] as const;

export const RECORD_WIDGET_KEYS = [
  "recent_record",
  "upcoming_follow_up",
  "prescription_refill",
  "next_vaccine",
  "lab_follow_up",
  "pinned_health_record",
  "records_needing_attention"
] as const satisfies WidgetKey[];

type CreateHealthRecordInput = Partial<Omit<HealthRecord, "allowedViewerIds" | "createdAt" | "id" | "isPrivate" | "lockedPrivate" | "profileId" | "sharedWithCaregiver" | "sharedWithFamily" | "sharedWithPartner" | "updatedAt" | "userId">> & {
  title: string;
  type: HealthRecordType;
};

type CreateDoctorVisitInput = Partial<Omit<DoctorVisit, "allowedViewerIds" | "createdAt" | "id" | "isPrivate" | "lockedPrivate" | "profileId" | "sharedWithCaregiver" | "sharedWithFamily" | "sharedWithPartner" | "updatedAt" | "userId">> & {
  title: string;
  visitDate?: string;
};

type CreateVaccineRecordInput = Partial<Omit<VaccineRecord, "allowedViewerIds" | "createdAt" | "id" | "isPrivate" | "lockedPrivate" | "profileId" | "sharedWithCaregiver" | "sharedWithFamily" | "sharedWithPartner" | "updatedAt" | "userId">> & {
  vaccineName: string;
};

type CreateLabResultInput = Partial<Omit<LabResultRecord, "allowedViewerIds" | "createdAt" | "id" | "isPrivate" | "lockedPrivate" | "profileId" | "sharedWithCaregiver" | "sharedWithFamily" | "sharedWithPartner" | "updatedAt" | "userId">> & {
  testName: string;
};

type CreatePrescriptionInput = Partial<Omit<PrescriptionRecord, "allowedViewerIds" | "createdAt" | "id" | "isPrivate" | "lockedPrivate" | "profileId" | "sharedWithCaregiver" | "sharedWithFamily" | "sharedWithPartner" | "updatedAt" | "userId">> & {
  title: string;
};

type CreateFolderInput = Partial<Omit<HealthRecordFolder, "createdAt" | "id" | "isDefault" | "profileId" | "updatedAt" | "userId">> & {
  name: string;
};

type CreateReminderInput = Partial<Omit<HealthRecordReminder, "createdAt" | "id" | "profileId" | "status" | "updatedAt" | "userId">> & {
  reminderDate: string;
  title: string;
  type: HealthRecordReminderType;
};

export async function createHealthRecord(input: CreateHealthRecordInput) {
  const now = new Date().toISOString();
  const record: HealthRecord = {
    allowedViewerIds: [],
    createdAt: now,
    documentDate: input.documentDate || todayKey(),
    expiryDate: input.expiryDate || undefined,
    fileType: input.fileType ?? "note",
    fileUrl: input.fileUrl,
    folderId: input.folderId,
    id: createId("health-record"),
    isPinned: input.isPinned ?? false,
    isPrivate: true,
    lockedPrivate: true,
    notes: clean(input.notes),
    profileId: LOCAL_PROFILE_ID,
    relatedMedicationId: input.relatedMedicationId,
    relatedSupplementId: input.relatedSupplementId,
    relatedVisitId: input.relatedVisitId,
    reminderDate: input.reminderDate || undefined,
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    tags: normalizeTags(input.tags),
    title: input.title.trim(),
    type: input.type,
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const records = await getHealthRecords();

  await writeJsonArray(HEALTH_RECORDS_STORAGE_KEY, [record, ...records]);

  if (record.reminderDate) {
    await createHealthRecordReminder({
      relatedRecordId: record.id,
      reminderDate: record.reminderDate,
      title: `${record.title} reminder`,
      type: record.expiryDate === record.reminderDate ? "document_expiry" : "general"
    });
  }

  return record;
}

export async function getHealthRecords() {
  const records = await readJsonArray<HealthRecord>(HEALTH_RECORDS_STORAGE_KEY);

  return records.sort(sortByUpdatedAt);
}

export async function getHealthRecordById(id: string) {
  const records = await getHealthRecords();

  return records.find((record) => record.id === id) ?? null;
}

export async function updateHealthRecord(id: string, partial: Partial<Omit<HealthRecord, "createdAt" | "id" | "profileId" | "userId">>) {
  const records = await getHealthRecords();
  const updatedRecords = records.map((record) =>
    record.id === id
      ? { ...record, ...partial, tags: partial.tags ? normalizeTags(partial.tags) : record.tags, updatedAt: new Date().toISOString() }
      : record
  );

  await writeJsonArray(HEALTH_RECORDS_STORAGE_KEY, updatedRecords);

  return updatedRecords.find((record) => record.id === id) ?? null;
}

export async function deleteHealthRecord(id: string) {
  const [records, reminders] = await Promise.all([getHealthRecords(), getHealthRecordReminders()]);
  const record = records.find((item) => item.id === id) ?? null;

  await Promise.all([
    writeJsonArray(HEALTH_RECORDS_STORAGE_KEY, records.filter((item) => item.id !== id)),
    writeJsonArray(HEALTH_RECORD_REMINDERS_STORAGE_KEY, reminders.filter((item) => item.relatedRecordId !== id))
  ]);

  return record;
}

export async function pinHealthRecord(id: string) {
  return updateHealthRecord(id, { isPinned: true });
}

export async function unpinHealthRecord(id: string) {
  return updateHealthRecord(id, { isPinned: false });
}

export async function searchHealthRecords(query: string) {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return getHealthRecords();
  }

  const [records, visits, prescriptions] = await Promise.all([
    getHealthRecords(),
    getDoctorVisits(),
    getPrescriptionRecords()
  ]);

  return records.filter((record) => {
    const relatedVisit = visits.find((visit) => visit.id === record.relatedVisitId);
    const relatedPrescription = prescriptions.find((prescription) => prescription.documentId === record.id);
    const haystack = [
      record.title,
      record.type,
      record.notes,
      record.documentDate,
      record.expiryDate,
      record.reminderDate,
      relatedVisit?.clinicName,
      relatedVisit?.practitionerName,
      relatedPrescription?.provider,
      ...record.tags
    ].filter(Boolean).join(" ").toLowerCase();

    return haystack.includes(trimmedQuery);
  });
}

export async function filterHealthRecords(filters: HealthRecordFilters) {
  const records = await getHealthRecords();

  return records.filter((record) =>
    (!filters.documentType || record.type === filters.documentType) &&
    (!filters.folderId || record.folderId === filters.folderId) &&
    (!filters.profileId || record.profileId === filters.profileId) &&
    (filters.isPinned === undefined || record.isPinned === filters.isPinned) &&
    (filters.hasFile === undefined || Boolean(record.fileUrl) === filters.hasFile) &&
    (filters.hasReminder === undefined || Boolean(record.reminderDate || record.expiryDate) === filters.hasReminder) &&
    (!filters.needsFollowUp || Boolean(record.reminderDate || record.expiryDate)) &&
    isDateInRange(record.documentDate ?? record.createdAt, filters.dateFrom, filters.dateTo)
  );
}

export async function prepareHealthRecordUpload(fileType: HealthRecordFileType = "unknown") {
  return {
    fileType,
    localOnly: true,
    message: "File upload storage will be connected later. You can still organize this record manually."
  };
}

export async function saveHealthRecordFile(recordId: string, fileUrl: string, fileType: HealthRecordFileType = "unknown") {
  return updateHealthRecord(recordId, { fileType, fileUrl });
}

export async function deleteHealthRecordFile(recordId: string) {
  return updateHealthRecord(recordId, { fileType: "unknown", fileUrl: undefined });
}

export async function getRecordsByDocumentType(type: HealthRecordType) {
  return filterHealthRecords({ documentType: type });
}

export async function createDoctorVisit(input: CreateDoctorVisitInput) {
  const now = new Date().toISOString();
  const visit: DoctorVisit = {
    allowedViewerIds: [],
    clinicName: clean(input.clinicName),
    createdAt: now,
    followUpDate: input.followUpDate || undefined,
    followUpRequired: input.followUpRequired ?? Boolean(input.followUpDate),
    id: createId("doctor-visit"),
    instructions: clean(input.instructions),
    isPrivate: true,
    location: clean(input.location),
    lockedPrivate: true,
    practitionerName: clean(input.practitionerName),
    profileId: LOCAL_PROFILE_ID,
    questionsAsked: clean(input.questionsAsked),
    reason: clean(input.reason),
    relatedDocumentIds: input.relatedDocumentIds ?? [],
    relatedMedicationIds: input.relatedMedicationIds ?? [],
    relatedSupplementIds: input.relatedSupplementIds ?? [],
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    specialty: clean(input.specialty),
    summaryNotes: clean(input.summaryNotes),
    title: input.title.trim(),
    updatedAt: now,
    userId: LOCAL_USER_ID,
    visitDate: input.visitDate || now
  };
  const visits = await getDoctorVisits();

  await writeJsonArray(DOCTOR_VISITS_STORAGE_KEY, [visit, ...visits]);

  if (visit.followUpDate) {
    await createHealthRecordReminder({
      relatedVisitId: visit.id,
      reminderDate: visit.followUpDate,
      title: `${visit.title} follow-up`,
      type: "follow_up_visit"
    });
  }

  return visit;
}

export async function getDoctorVisits() {
  const visits = await readJsonArray<DoctorVisit>(DOCTOR_VISITS_STORAGE_KEY);

  return visits.sort(sortByVisitDate);
}

export async function getDoctorVisitById(id: string) {
  const visits = await getDoctorVisits();

  return visits.find((visit) => visit.id === id) ?? null;
}

export async function updateDoctorVisit(id: string, partial: Partial<Omit<DoctorVisit, "createdAt" | "id" | "profileId" | "userId">>) {
  const visits = await getDoctorVisits();
  const updatedVisits = visits.map((visit) =>
    visit.id === id ? { ...visit, ...partial, updatedAt: new Date().toISOString() } : visit
  );

  await writeJsonArray(DOCTOR_VISITS_STORAGE_KEY, updatedVisits);

  return updatedVisits.find((visit) => visit.id === id) ?? null;
}

export async function deleteDoctorVisit(id: string) {
  const [visits, reminders] = await Promise.all([getDoctorVisits(), getHealthRecordReminders()]);
  const visit = visits.find((item) => item.id === id) ?? null;

  await Promise.all([
    writeJsonArray(DOCTOR_VISITS_STORAGE_KEY, visits.filter((item) => item.id !== id)),
    writeJsonArray(HEALTH_RECORD_REMINDERS_STORAGE_KEY, reminders.filter((item) => item.relatedVisitId !== id))
  ]);

  return visit;
}

export async function linkRecordToVisit(recordId: string, visitId: string) {
  const visit = await getDoctorVisitById(visitId);

  await updateHealthRecord(recordId, { relatedVisitId: visitId });

  if (visit) {
    await updateDoctorVisit(visitId, {
      relatedDocumentIds: Array.from(new Set([...visit.relatedDocumentIds, recordId]))
    });
  }
}

export async function createVaccineRecord(input: CreateVaccineRecordInput) {
  const now = new Date().toISOString();
  const vaccine: VaccineRecord = {
    allowedViewerIds: [],
    batchNumber: clean(input.batchNumber),
    createdAt: now,
    dateReceived: input.dateReceived || todayKey(),
    documentId: input.documentId,
    doseNumber: clean(input.doseNumber),
    id: createId("vaccine-record"),
    isPrivate: true,
    location: clean(input.location),
    lockedPrivate: true,
    nextDoseDate: input.nextDoseDate || undefined,
    notes: clean(input.notes),
    profileId: LOCAL_PROFILE_ID,
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    updatedAt: now,
    userId: LOCAL_USER_ID,
    vaccineName: input.vaccineName.trim()
  };
  const records = await getVaccineRecords();

  await writeJsonArray(VACCINE_RECORDS_STORAGE_KEY, [vaccine, ...records]);

  if (vaccine.nextDoseDate) {
    await createHealthRecordReminder({
      relatedRecordId: vaccine.documentId,
      reminderDate: vaccine.nextDoseDate,
      title: `${vaccine.vaccineName} next dose`,
      type: "next_vaccine_dose"
    });
  }

  return vaccine;
}

export async function getVaccineRecords() {
  return (await readJsonArray<VaccineRecord>(VACCINE_RECORDS_STORAGE_KEY)).sort(sortByUpdatedAt);
}

export async function updateVaccineRecord(id: string, partial: Partial<Omit<VaccineRecord, "createdAt" | "id" | "profileId" | "userId">>) {
  return updateStoredRecord(VACCINE_RECORDS_STORAGE_KEY, id, partial, getVaccineRecords);
}

export async function deleteVaccineRecord(id: string) {
  return deleteStoredRecord(VACCINE_RECORDS_STORAGE_KEY, id, getVaccineRecords);
}

export async function createLabResultRecord(input: CreateLabResultInput) {
  const now = new Date().toISOString();
  const lab: LabResultRecord = {
    allowedViewerIds: [],
    createdAt: now,
    documentId: input.documentId,
    followUpDate: input.followUpDate || undefined,
    id: createId("lab-result"),
    isPrivate: true,
    lockedPrivate: true,
    notes: clean(input.notes),
    profileId: LOCAL_PROFILE_ID,
    provider: clean(input.provider),
    referenceRange: clean(input.referenceRange),
    resultValue: clean(input.resultValue),
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    testDate: input.testDate || todayKey(),
    testName: input.testName.trim(),
    unit: clean(input.unit),
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const records = await getLabResultRecords();

  await writeJsonArray(LAB_RESULT_RECORDS_STORAGE_KEY, [lab, ...records]);

  if (lab.followUpDate) {
    await createHealthRecordReminder({
      relatedRecordId: lab.documentId,
      reminderDate: lab.followUpDate,
      title: `${lab.testName} review`,
      type: "lab_review"
    });
  }

  return lab;
}

export async function getLabResultRecords() {
  return (await readJsonArray<LabResultRecord>(LAB_RESULT_RECORDS_STORAGE_KEY)).sort(sortByUpdatedAt);
}

export async function updateLabResultRecord(id: string, partial: Partial<Omit<LabResultRecord, "createdAt" | "id" | "profileId" | "userId">>) {
  return updateStoredRecord(LAB_RESULT_RECORDS_STORAGE_KEY, id, partial, getLabResultRecords);
}

export async function deleteLabResultRecord(id: string) {
  return deleteStoredRecord(LAB_RESULT_RECORDS_STORAGE_KEY, id, getLabResultRecords);
}

export async function createPrescriptionRecord(input: CreatePrescriptionInput) {
  const now = new Date().toISOString();
  const prescription: PrescriptionRecord = {
    allowedViewerIds: [],
    createdAt: now,
    dateIssued: input.dateIssued || todayKey(),
    documentId: input.documentId,
    expiryDate: input.expiryDate || undefined,
    id: createId("prescription-record"),
    isPrivate: true,
    lockedPrivate: true,
    notes: clean(input.notes),
    profileId: LOCAL_PROFILE_ID,
    provider: clean(input.provider),
    refillReminderDate: input.refillReminderDate || undefined,
    relatedMedicationId: input.relatedMedicationId,
    repeatPrescription: input.repeatPrescription ?? false,
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    title: input.title.trim(),
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const records = await getPrescriptionRecords();

  await writeJsonArray(PRESCRIPTION_RECORDS_STORAGE_KEY, [prescription, ...records]);

  if (prescription.refillReminderDate) {
    await createHealthRecordReminder({
      relatedRecordId: prescription.documentId,
      reminderDate: prescription.refillReminderDate,
      title: `${prescription.title} refill`,
      type: "prescription_refill"
    });
  }

  return prescription;
}

export async function getPrescriptionRecords() {
  return (await readJsonArray<PrescriptionRecord>(PRESCRIPTION_RECORDS_STORAGE_KEY)).sort(sortByUpdatedAt);
}

export async function updatePrescriptionRecord(id: string, partial: Partial<Omit<PrescriptionRecord, "createdAt" | "id" | "profileId" | "userId">>) {
  return updateStoredRecord(PRESCRIPTION_RECORDS_STORAGE_KEY, id, partial, getPrescriptionRecords);
}

export async function deletePrescriptionRecord(id: string) {
  return deleteStoredRecord(PRESCRIPTION_RECORDS_STORAGE_KEY, id, getPrescriptionRecords);
}

export async function linkPrescriptionToMedication(prescriptionId: string, medicationId: string) {
  return updatePrescriptionRecord(prescriptionId, { relatedMedicationId: medicationId });
}

export async function createHealthRecordFolder(input: CreateFolderInput) {
  const now = new Date().toISOString();
  const folder: HealthRecordFolder = {
    color: input.color ?? "#f8fafc",
    createdAt: now,
    icon: input.icon ?? "documents",
    id: createId("record-folder"),
    isDefault: false,
    name: input.name.trim(),
    profileId: LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const folders = await getHealthRecordFolders();

  await writeJsonArray(HEALTH_RECORD_FOLDERS_STORAGE_KEY, [folder, ...folders]);

  return folder;
}

export async function getHealthRecordFolders() {
  const folders = await readJsonArray<HealthRecordFolder>(HEALTH_RECORD_FOLDERS_STORAGE_KEY);
  const folderIds = new Set(folders.map((folder) => folder.id));
  const now = new Date().toISOString();
  const defaults = DEFAULT_FOLDERS
    .filter((folder) => !folderIds.has(folder.id))
    .map((folder) => ({
      ...folder,
      createdAt: now,
      isDefault: true,
      profileId: LOCAL_PROFILE_ID,
      updatedAt: now,
      userId: LOCAL_USER_ID
    }));

  if (defaults.length) {
    await writeJsonArray(HEALTH_RECORD_FOLDERS_STORAGE_KEY, [...defaults, ...folders]);
  }

  return [...defaults, ...folders].sort((left, right) => Number(right.isDefault) - Number(left.isDefault) || left.name.localeCompare(right.name));
}

export async function updateHealthRecordFolder(id: string, partial: Partial<Omit<HealthRecordFolder, "createdAt" | "id" | "isDefault" | "profileId" | "userId">>) {
  return updateStoredRecord(HEALTH_RECORD_FOLDERS_STORAGE_KEY, id, partial, getHealthRecordFolders);
}

export async function deleteHealthRecordFolder(id: string) {
  const folders = await getHealthRecordFolders();
  const folder = folders.find((item) => item.id === id) ?? null;

  if (folder?.isDefault) {
    return null;
  }

  await writeJsonArray(HEALTH_RECORD_FOLDERS_STORAGE_KEY, folders.filter((item) => item.id !== id));

  return folder;
}

export async function createHealthRecordReminder(input: CreateReminderInput) {
  const now = new Date().toISOString();
  const reminder: HealthRecordReminder = {
    createdAt: now,
    id: createId("record-reminder"),
    notes: clean(input.notes),
    profileId: LOCAL_PROFILE_ID,
    relatedRecordId: input.relatedRecordId,
    relatedVisitId: input.relatedVisitId,
    reminderDate: input.reminderDate,
    status: "upcoming",
    title: input.title.trim(),
    type: input.type,
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const reminders = await getHealthRecordReminders();

  await writeJsonArray(HEALTH_RECORD_REMINDERS_STORAGE_KEY, [reminder, ...reminders]);

  return reminder;
}

export async function getHealthRecordReminders() {
  const reminders = await readJsonArray<HealthRecordReminder>(HEALTH_RECORD_REMINDERS_STORAGE_KEY);

  return reminders.map((reminder) => ({
    ...reminder,
    status: inferReminderStatus(reminder)
  })).sort((left, right) => new Date(left.reminderDate).getTime() - new Date(right.reminderDate).getTime());
}

export async function getUpcomingRecordReminders(limit = 5) {
  const reminders = await getHealthRecordReminders();

  return reminders.filter((reminder) => reminder.status === "upcoming" || reminder.status === "missed").slice(0, limit);
}

export async function markRecordReminderDone(id: string) {
  return updateReminderStatus(id, "done");
}

export async function dismissRecordReminder(id: string) {
  return updateReminderStatus(id, "dismissed");
}

export function getAvailableRecordWidgets() {
  return RECORD_WIDGET_KEYS;
}

export function isRecordWidget(widgetKey: WidgetKey): widgetKey is RecordWidgetKey {
  return RECORD_WIDGET_KEYS.includes(widgetKey as RecordWidgetKey);
}

export async function calculateRecordWidgetValue(widgetKey: WidgetKey) {
  const summary = await getRecordsOverviewSummary();

  switch (widgetKey) {
    case "recent_record":
      return summary.recentRecords[0]?.title ?? "No records";
    case "upcoming_follow_up":
      return summary.upcomingReminders[0]?.title ?? "None";
    case "prescription_refill":
      return summary.prescriptionRefills[0]?.title ?? "None";
    case "next_vaccine":
      return summary.nextVaccine?.vaccineName ?? "None";
    case "lab_follow_up":
      return summary.labFollowUps[0]?.testName ?? "None";
    case "pinned_health_record":
      return summary.pinnedRecords.length ? `${summary.pinnedRecords.length} pinned` : "None";
    case "records_needing_attention":
      return `${summary.recordsNeedingAttention} items`;
    default:
      return "Records";
  }
}

export async function getRecordsOverviewSummary(): Promise<RecordsOverviewSummary> {
  const [records, visits, reminders, vaccines, labs, prescriptions] = await Promise.all([
    getHealthRecords(),
    getDoctorVisits(),
    getUpcomingRecordReminders(8),
    getVaccineRecords(),
    getLabResultRecords(),
    getPrescriptionRecords()
  ]);
  const today = todayKey();
  const labFollowUps = labs.filter((lab) => lab.followUpDate && lab.followUpDate >= today).slice(0, 3);
  const prescriptionRefills = prescriptions.filter((prescription) => prescription.refillReminderDate && prescription.refillReminderDate >= today).slice(0, 3);

  return {
    labFollowUps,
    nextVaccine: vaccines.filter((vaccine) => vaccine.nextDoseDate && vaccine.nextDoseDate >= today)[0],
    pinnedRecords: records.filter((record) => record.isPinned).slice(0, 5),
    prescriptionRefills,
    recentRecords: records.slice(0, 5),
    recentVisits: visits.slice(0, 3),
    recordsNeedingAttention: reminders.filter((reminder) => reminder.status === "missed" || reminder.status === "upcoming").length,
    upcomingReminders: reminders
  };
}

async function updateReminderStatus(id: string, status: HealthRecordReminderStatus) {
  const reminders = await getHealthRecordReminders();
  const updatedReminders = reminders.map((reminder) =>
    reminder.id === id ? { ...reminder, status, updatedAt: new Date().toISOString() } : reminder
  );

  await writeJsonArray(HEALTH_RECORD_REMINDERS_STORAGE_KEY, updatedReminders);

  return updatedReminders.find((reminder) => reminder.id === id) ?? null;
}

async function updateStoredRecord<T extends { id: string; updatedAt: string }>(
  storageKey: string,
  id: string,
  partial: Partial<Omit<T, "createdAt" | "id" | "profileId" | "userId">>,
  getter: () => Promise<T[]>
) {
  const records = await getter();
  const updatedRecords = records.map((record) =>
    record.id === id ? { ...record, ...partial, updatedAt: new Date().toISOString() } : record
  );

  await writeJsonArray(storageKey, updatedRecords);

  return updatedRecords.find((record) => record.id === id) ?? null;
}

async function deleteStoredRecord<T extends { id: string }>(
  storageKey: string,
  id: string,
  getter: () => Promise<T[]>
) {
  const records = await getter();
  const record = records.find((item) => item.id === id) ?? null;

  await writeJsonArray(storageKey, records.filter((item) => item.id !== id));

  return record;
}

function inferReminderStatus(reminder: HealthRecordReminder): HealthRecordReminderStatus {
  if (reminder.status === "done" || reminder.status === "dismissed") {
    return reminder.status;
  }

  return reminder.reminderDate < todayKey() ? "missed" : "upcoming";
}

function normalizeTags(tags?: string[]) {
  return Array.from(new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean)));
}

function clean(value?: string) {
  return value?.trim() || undefined;
}

function isDateInRange(dateValue: string, dateFrom?: string, dateTo?: string) {
  const dateKey = dateValue.slice(0, 10);

  return (!dateFrom || dateKey >= dateFrom) && (!dateTo || dateKey <= dateTo);
}

function sortByUpdatedAt<T extends { updatedAt: string }>(left: T, right: T) {
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

function sortByVisitDate(left: DoctorVisit, right: DoctorVisit) {
  return new Date(right.visitDate).getTime() - new Date(left.visitDate).getTime();
}

function todayKey() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
