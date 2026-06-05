import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  addChildSleepLog,
  addDiaperLog,
  addFeedLog,
  addGrowthMeasurement,
  addMilestone,
  addVaccinationRecord,
  createChildProfile,
  deleteChildProfile,
  deleteMilestone,
  getAllChildSummaries,
  getChildProfile,
  getChildProfiles,
  getDiaperLogs,
  getFeedLogs,
  getGrowthMeasurements,
  getLatestChildSleep,
  getLatestDiaper,
  getLatestFeed,
  getLatestGrowthMeasurement,
  getMilestones,
  getSleepLogs,
  getTodayFeedLogs,
  getVaccinationRecords,
  updateChildProfile,
  updateFeedLog,
  updateMilestone,
  updateVaccinationRecord
} from "@/lib/childStorage";
import { getPregnancyProfile } from "@/lib/pregnancyStorage";
import type { WidgetKey } from "@/types/app";
import type {
  BabyCalendarEvent,
  BabyChildProfile,
  BabyFeedingLog,
  BabyFeedingType,
  BabyLearnCard,
  BabyMedicineLog,
  BabyReportSummary,
  BabySolidFoodLog,
  ChildProfile,
  DiaperLog,
  DiaperType,
  FeedType,
  GrowthMeasurement,
  MilestoneCategory,
  MilestoneStatus,
  VaccinationRecord
} from "@/types/child";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const SOLIDS_KEY = "family_health_phase15c_baby_solid_food_logs";
const MEDICINE_KEY = "family_health_phase15c_baby_medicine_logs";
const MILESTONE_LOGS_KEY = "family_health_phase15c_baby_milestone_logs";
const BABY_WIDGETS_KEY = "family_health_phase15c_baby_widgets";

export const BABY_WIDGET_KEYS = [
  "next_feed",
  "last_feed",
  "sleep_today",
  "last_sleep",
  "last_diaper",
  "weight_latest",
  "growth_check",
  "next_vaccine",
  "baby_medicine_due",
  "solid_food_tried",
  "milestone_check",
  "baby_note",
  "baby_today",
  "baby_feed"
] as const satisfies WidgetKey[];

export function isBabyWidget(widgetKey: WidgetKey): widgetKey is (typeof BABY_WIDGET_KEYS)[number] {
  return BABY_WIDGET_KEYS.includes(widgetKey as (typeof BABY_WIDGET_KEYS)[number]);
}

export function getAvailableBabyWidgets() {
  return BABY_WIDGET_KEYS;
}

export async function createBabyChildProfile(input: {
  birthHeadCircumferenceCm?: number;
  birthLengthCm?: number;
  birthWeightKg?: number;
  clinicName?: string;
  dateOfBirth: string;
  displayName: string;
  dueDate?: string;
  feedingType?: BabyFeedingType;
  gender?: ChildProfile["gender"];
  medicalNotes?: string;
  pediatricianName?: string;
  privacy?: "private" | "shared_selected";
  profileType?: ChildProfile["profileType"];
}) {
  return createChildProfile({
    birthHeadCircumferenceCm: input.birthHeadCircumferenceCm,
    birthLengthCm: input.birthLengthCm,
    birthWeightKg: input.birthWeightKg,
    clinicName: input.clinicName,
    dateOfBirth: input.dateOfBirth,
    displayName: input.displayName,
    dueDate: input.dueDate,
    feedingType: input.feedingType,
    gender: input.gender,
    medicalNotes: input.medicalNotes,
    pediatricianName: input.pediatricianName,
    privacy: input.privacy ?? "private",
    profileType: input.profileType ?? inferProfileType(input.dateOfBirth)
  });
}

export async function getBabyChildProfiles() {
  return (await getChildProfiles()).map(toBabyProfile);
}

export async function getBabyChildProfileById(childProfileId: string) {
  const profile = await getChildProfile(childProfileId);
  return profile ? toBabyProfile(profile) : null;
}

export async function updateBabyChildProfile(childProfileId: string, partial: Partial<ChildProfile>) {
  return updateChildProfile(childProfileId, partial);
}

export async function deleteBabyChildProfile(childProfileId: string) {
  return deleteChildProfile(childProfileId);
}

export async function getVisibleBabyProfilesForViewer() {
  return getBabyChildProfiles();
}

export async function transitionPregnancyToBabyProfile(input: {
  birthDate: string;
  displayName: string;
  includeDueDate?: boolean;
}) {
  const pregnancy = await getPregnancyProfile().catch(() => null);
  return createBabyChildProfile({
    dateOfBirth: input.birthDate,
    displayName: input.displayName,
    dueDate: input.includeDueDate ? pregnancy?.estimatedDueDate : undefined,
    privacy: "private",
    profileType: "newborn"
  });
}

export async function createBabyFeedingLog(input: {
  amountMl?: number;
  childProfileId: string;
  durationMinutes?: number;
  endedAt?: string;
  feedingType: BabyFeedingType;
  foodName?: string;
  notes?: string;
  reactionNote?: string;
  side?: BabyFeedingLog["side"];
  startedAt?: string;
  texture?: string;
}) {
  const feedType = toLegacyFeedType(input.feedingType);
  const log = await addFeedLog({
    childId: input.childProfileId,
    durationMinutes: input.durationMinutes,
    feedType,
    finishedAmountMl: input.amountMl,
    notes: input.notes
  });
  return updateFeedLog(log.id, {
    childProfileId: input.childProfileId,
    endedAt: input.endedAt,
    feedingType: input.feedingType,
    foodName: input.foodName,
    profileId: LOCAL_PROFILE_ID,
    reactionNote: input.reactionNote,
    side: input.side,
    startedAt: input.startedAt ?? log.loggedAt,
    texture: input.texture,
    updatedAt: new Date().toISOString(),
    userId: LOCAL_USER_ID
  }) as Promise<BabyFeedingLog | null>;
}

export async function getBabyFeedingLogsByDate(childProfileId: string, date: string) {
  return (await getFeedLogs(childProfileId)).filter((log) => log.loggedAt.slice(0, 10) === date.slice(0, 10));
}

export async function getBabyFeedingLogsByRange(childProfileId: string, startDate: Date, endDate: Date) {
  return (await getFeedLogs(childProfileId)).filter((log) => isWithinRange(log.loggedAt, startDate, endDate));
}

export async function updateBabyFeedingLog(logId: string, partial: Partial<BabyFeedingLog>) {
  return updateFeedLog(logId, { ...partial, updatedAt: new Date().toISOString() });
}

export async function deleteBabyFeedingLog(logId: string) {
  const logs = await readJsonArray<BabyFeedingLog>("family_health_child_feed_logs");
  await AsyncStorage.setItem("family_health_child_feed_logs", JSON.stringify(logs.filter((log) => log.id !== logId)));
}

export async function calculateFeedingSummary(childProfileId: string, date = toDateKey(new Date())) {
  const logs = await getBabyFeedingLogsByDate(childProfileId, date);
  const latest = logs[0] ?? await getLatestFeed(childProfileId);
  return {
    count: logs.length,
    latest,
    totalAmountMl: logs.reduce((sum, log) => sum + (log.finishedAmountMl ?? log.offeredAmountMl ?? 0), 0)
  };
}

export async function createBabySleepLog(input: {
  childProfileId: string;
  durationMinutes?: number;
  endedAt?: string;
  notes?: string;
  sleepLocation?: string;
  sleepType?: "nap" | "night" | "unknown";
  startedAt?: string;
}) {
  const duration = input.durationMinutes ?? calculateMinutes(input.startedAt, input.endedAt) ?? 1;
  const log = await addChildSleepLog({
    childId: input.childProfileId,
    durationMinutes: duration,
    notes: input.notes
  });
  const logs = await readJsonArray<import("@/types/child").BabySleepLog>("family_health_child_sleep_logs");
  const updated = logs.map((item) => item.id === log.id ? {
    ...item,
    childProfileId: input.childProfileId,
    profileId: LOCAL_PROFILE_ID,
    sleepEnd: input.endedAt,
    sleepLocation: input.sleepLocation,
    sleepStart: input.startedAt,
    sleepType: input.sleepType ?? "unknown",
    updatedAt: new Date().toISOString(),
    userId: LOCAL_USER_ID
  } : item);
  await AsyncStorage.setItem("family_health_child_sleep_logs", JSON.stringify(updated));
  return updated.find((item) => item.id === log.id) ?? log;
}

export async function getBabySleepLogsByDate(childProfileId: string, date: string) {
  return (await getSleepLogs(childProfileId)).filter((log) => log.loggedAt.slice(0, 10) === date.slice(0, 10));
}

export async function getBabySleepLogsByRange(childProfileId: string, startDate: Date, endDate: Date) {
  return (await getSleepLogs(childProfileId)).filter((log) => isWithinRange(log.loggedAt, startDate, endDate));
}

export async function updateBabySleepLog(logId: string, partial: Partial<import("@/types/child").BabySleepLog>) {
  const logs = await readJsonArray<import("@/types/child").BabySleepLog>("family_health_child_sleep_logs");
  const updated = logs.map((log) => log.id === logId ? { ...log, ...partial, updatedAt: new Date().toISOString() } : log);
  await AsyncStorage.setItem("family_health_child_sleep_logs", JSON.stringify(updated));
  return updated.find((log) => log.id === logId) ?? null;
}

export async function deleteBabySleepLog(logId: string) {
  const logs = await readJsonArray<import("@/types/child").BabySleepLog>("family_health_child_sleep_logs");
  await AsyncStorage.setItem("family_health_child_sleep_logs", JSON.stringify(logs.filter((log) => log.id !== logId)));
}

export async function calculateBabySleepSummary(childProfileId: string, date = toDateKey(new Date())) {
  const logs = await getBabySleepLogsByDate(childProfileId, date);
  return {
    latest: logs[0] ?? await getLatestChildSleep(childProfileId),
    napCount: logs.filter((log) => log.sleepType === "nap").length,
    totalMinutes: logs.reduce((sum, log) => sum + (log.durationMinutes ?? 0), 0)
  };
}

export async function createBabyDiaperLog(input: {
  childProfileId: string;
  color?: string;
  diaperType: DiaperType;
  loggedAt?: string;
  notes?: string;
  texture?: string;
}) {
  const log = await addDiaperLog({ childId: input.childProfileId, diaperType: input.diaperType, notes: input.notes });
  const logs = await readJsonArray<DiaperLog>("family_health_child_diaper_logs");
  const updated = logs.map((item) => item.id === log.id ? {
    ...item,
    childProfileId: input.childProfileId,
    color: input.color,
    loggedAt: input.loggedAt ?? item.loggedAt,
    profileId: LOCAL_PROFILE_ID,
    texture: input.texture,
    updatedAt: new Date().toISOString(),
    userId: LOCAL_USER_ID
  } : item);
  await AsyncStorage.setItem("family_health_child_diaper_logs", JSON.stringify(updated));
  return updated.find((item) => item.id === log.id) ?? log;
}

export async function getBabyDiaperLogsByDate(childProfileId: string, date: string) {
  return (await getDiaperLogs(childProfileId)).filter((log) => log.loggedAt.slice(0, 10) === date.slice(0, 10));
}

export async function getBabyDiaperLogsByRange(childProfileId: string, startDate: Date, endDate: Date) {
  return (await getDiaperLogs(childProfileId)).filter((log) => isWithinRange(log.loggedAt, startDate, endDate));
}

export async function updateBabyDiaperLog(logId: string, partial: Partial<DiaperLog>) {
  const logs = await readJsonArray<DiaperLog>("family_health_child_diaper_logs");
  const updated = logs.map((log) => log.id === logId ? { ...log, ...partial, updatedAt: new Date().toISOString() } : log);
  await AsyncStorage.setItem("family_health_child_diaper_logs", JSON.stringify(updated));
  return updated.find((log) => log.id === logId) ?? null;
}

export async function deleteBabyDiaperLog(logId: string) {
  const logs = await readJsonArray<DiaperLog>("family_health_child_diaper_logs");
  await AsyncStorage.setItem("family_health_child_diaper_logs", JSON.stringify(logs.filter((log) => log.id !== logId)));
}

export async function createBabyGrowthLog(input: {
  childProfileId: string;
  headCircumferenceCm?: number;
  lengthCm?: number;
  measuredAt?: string;
  measurementSource?: GrowthMeasurement["measurementSource"];
  notes?: string;
  weightKg?: number;
}) {
  const log = await addGrowthMeasurement({
    childId: input.childProfileId,
    headCircumference: input.headCircumferenceCm,
    headCircumferenceUnit: "cm",
    height: input.lengthCm,
    heightUnit: "cm",
    notes: input.notes,
    weight: input.weightKg,
    weightUnit: "kg"
  });
  const logs = await readJsonArray<GrowthMeasurement>("family_health_child_growth_logs");
  const updated = logs.map((item) => item.id === log.id ? {
    ...item,
    childProfileId: input.childProfileId,
    loggedAt: input.measuredAt ?? item.loggedAt,
    measurementSource: input.measurementSource ?? "home",
    profileId: LOCAL_PROFILE_ID,
    updatedAt: new Date().toISOString(),
    userId: LOCAL_USER_ID
  } : item);
  await AsyncStorage.setItem("family_health_child_growth_logs", JSON.stringify(updated));
  return updated.find((item) => item.id === log.id) ?? log;
}

export async function getBabyGrowthLogs(childProfileId: string) {
  return getGrowthMeasurements(childProfileId);
}

export async function updateBabyGrowthLog(logId: string, partial: Partial<GrowthMeasurement>) {
  const logs = await readJsonArray<GrowthMeasurement>("family_health_child_growth_logs");
  const updated = logs.map((log) => log.id === logId ? { ...log, ...partial, updatedAt: new Date().toISOString() } : log);
  await AsyncStorage.setItem("family_health_child_growth_logs", JSON.stringify(updated));
  return updated.find((log) => log.id === logId) ?? null;
}

export async function deleteBabyGrowthLog(logId: string) {
  const logs = await readJsonArray<GrowthMeasurement>("family_health_child_growth_logs");
  await AsyncStorage.setItem("family_health_child_growth_logs", JSON.stringify(logs.filter((log) => log.id !== logId)));
}

export async function calculateGrowthTrend(childProfileId: string) {
  const logs = await getGrowthMeasurements(childProfileId);
  return { latest: logs[0], previous: logs[1], totalCount: logs.length };
}

export async function prepareWhoGrowthChartData(childProfileId: string) {
  return {
    logs: await getGrowthMeasurements(childProfileId),
    status: "prepared" as const,
    message: "WHO growth chart support is prepared. Percentiles are not shown until reference data is implemented correctly."
  };
}

export async function getMilestoneChecklistByAge(childProfileId: string, ageMonths = 2) {
  return getSeedMilestones().filter((milestone) => milestone.childProfileId === "seed" && milestone.ageCheckpointMonths <= ageMonths + 1)
    .map((milestone) => ({ ...milestone, childProfileId }));
}

export async function createBabyMilestoneLog(input: {
  ageCheckpointMonths?: number;
  category: MilestoneCategory;
  childProfileId: string;
  milestoneId?: string;
  notes?: string;
  observedDate?: string;
  status: MilestoneStatus;
  title: string;
}) {
  return addMilestone({
    achievedAt: input.observedDate,
    ageCheckpointMonths: input.ageCheckpointMonths,
    category: input.category,
    childId: input.childProfileId,
    notes: input.notes,
    sourceOrganization: "CDC",
    sourceUrl: "https://www.cdc.gov/act-early/milestones-app/index.html",
    status: input.status,
    title: input.title
  });
}

export async function updateBabyMilestoneLog(milestoneId: string, partial: Parameters<typeof updateMilestone>[1]) {
  return updateMilestone(milestoneId, partial);
}

export async function getBabyMilestoneLogs(childProfileId: string) {
  return getMilestones(childProfileId);
}

export async function getMilestoneProgressSummary(childProfileId: string) {
  const logs = await getMilestones(childProfileId);
  return {
    notYetCount: logs.filter((log) => log.status === "not_yet").length,
    observedCount: logs.filter((log) => !log.status || log.status === "observed").length,
    totalCount: logs.length,
    unsureCount: logs.filter((log) => log.status === "unsure").length
  };
}

export async function createBabySolidFoodLog(input: Omit<BabySolidFoodLog, "createdAt" | "id" | "profileId" | "updatedAt" | "userId">) {
  const now = new Date().toISOString();
  const log: BabySolidFoodLog = {
    ...input,
    createdAt: now,
    foodName: input.foodName.trim(),
    id: createId("solid-food"),
    profileId: LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const logs = await readJsonArray<BabySolidFoodLog>(SOLIDS_KEY);
  await writeJsonArray(SOLIDS_KEY, [log, ...logs]);
  return log;
}

export async function getBabySolidFoodLogs(childProfileId: string) {
  return (await readJsonArray<BabySolidFoodLog>(SOLIDS_KEY))
    .filter((log) => log.childProfileId === childProfileId)
    .sort((left, right) => new Date(right.triedAt).getTime() - new Date(left.triedAt).getTime());
}

export async function updateBabySolidFoodLog(id: string, partial: Partial<BabySolidFoodLog>) {
  const logs = await readJsonArray<BabySolidFoodLog>(SOLIDS_KEY);
  const updated = logs.map((log) => log.id === id ? { ...log, ...partial, updatedAt: new Date().toISOString() } : log);
  await writeJsonArray(SOLIDS_KEY, updated);
  return updated.find((log) => log.id === id) ?? null;
}

export async function deleteBabySolidFoodLog(id: string) {
  const logs = await readJsonArray<BabySolidFoodLog>(SOLIDS_KEY);
  await writeJsonArray(SOLIDS_KEY, logs.filter((log) => log.id !== id));
}

export async function getAllergenWatchSummary(childProfileId: string) {
  const logs = await getBabySolidFoodLogs(childProfileId);
  const reactionCount = logs.filter((log) => Boolean(log.reactionNote?.trim())).length;
  return { allergenCount: new Set(logs.map((log) => log.allergenCategory).filter(Boolean)).size, reactionCount, triedCount: logs.length };
}

export async function createBabyMedicineLog(input: Omit<BabyMedicineLog, "createdAt" | "id" | "profileId" | "updatedAt" | "userId">) {
  const now = new Date().toISOString();
  const log: BabyMedicineLog = {
    ...input,
    createdAt: now,
    id: createId("baby-medicine"),
    medicineName: input.medicineName.trim(),
    profileId: LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const logs = await readJsonArray<BabyMedicineLog>(MEDICINE_KEY);
  await writeJsonArray(MEDICINE_KEY, [log, ...logs]);
  return log;
}

export async function getBabyMedicineLogs(childProfileId: string) {
  return (await readJsonArray<BabyMedicineLog>(MEDICINE_KEY))
    .filter((log) => log.childProfileId === childProfileId)
    .sort((left, right) => new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime());
}

export async function updateBabyMedicineLog(id: string, partial: Partial<BabyMedicineLog>) {
  const logs = await readJsonArray<BabyMedicineLog>(MEDICINE_KEY);
  const updated = logs.map((log) => log.id === id ? { ...log, ...partial, updatedAt: new Date().toISOString() } : log);
  await writeJsonArray(MEDICINE_KEY, updated);
  return updated.find((log) => log.id === id) ?? null;
}

export async function deleteBabyMedicineLog(id: string) {
  const logs = await readJsonArray<BabyMedicineLog>(MEDICINE_KEY);
  await writeJsonArray(MEDICINE_KEY, logs.filter((log) => log.id !== id));
}

export async function createBabyVaccineRecord(input: Omit<VaccinationRecord, "createdAt" | "id" | "updatedAt">) {
  return addVaccinationRecord(input);
}

export async function getBabyVaccineRecords(childProfileId: string) {
  return getVaccinationRecords(childProfileId);
}

export async function updateBabyVaccineRecord(recordId: string, partial: Parameters<typeof updateVaccinationRecord>[1]) {
  return updateVaccinationRecord(recordId, partial);
}

export async function deleteBabyVaccineRecord(recordId: string) {
  const records = await readJsonArray<VaccinationRecord>("family_health_child_vaccinations");
  await AsyncStorage.setItem("family_health_child_vaccinations", JSON.stringify(records.filter((record) => record.id !== recordId)));
}

export async function linkBabyVaccineToRecords(recordId: string, documentId?: string) {
  return updateVaccinationRecord(recordId, { documentId });
}

export async function getBabyReportSummary(childProfileId: string, range: BabyReportSummary["range"] = "today"): Promise<BabyReportSummary> {
  const { start, end } = getRange(range);
  const [feeds, sleeps, diapers, growth, solids, medicine, vaccines] = await Promise.all([
    getBabyFeedingLogsByRange(childProfileId, start, end),
    getBabySleepLogsByRange(childProfileId, start, end),
    getBabyDiaperLogsByRange(childProfileId, start, end),
    getGrowthMeasurements(childProfileId),
    getBabySolidFoodLogs(childProfileId),
    getBabyMedicineLogs(childProfileId),
    getVaccinationRecords(childProfileId)
  ]);
  return {
    childProfileId,
    diaperCount: diapers.length,
    feedingCount: feeds.length,
    generatedAt: new Date().toISOString(),
    latestWeightKg: growth[0]?.weight,
    medicineLogsCount: medicine.filter((log) => isWithinRange(log.loggedAt, start, end)).length,
    range,
    solidsTriedCount: solids.filter((log) => isWithinRange(log.triedAt, start, end)).length,
    totalSleepMinutes: sleeps.reduce((sum, log) => sum + (log.durationMinutes ?? 0), 0),
    vaccineRecordsCount: vaccines.length
  };
}

export async function getBabyTimelineSummary(childProfileId: string) {
  const events = await generateBabyCalendarEvents(addDays(new Date(), -7), new Date());
  return { latestEvent: events.find((event) => event.childProfileId === childProfileId), totalEvents: events.filter((event) => event.childProfileId === childProfileId).length };
}

export async function getBabyCareSummary(childProfileId: string) {
  const [feeding, sleep, diaper, growth, milestone, solids, medicine, vaccines] = await Promise.all([
    calculateFeedingSummary(childProfileId),
    calculateBabySleepSummary(childProfileId),
    getLatestDiaper(childProfileId),
    getLatestGrowthMeasurement(childProfileId),
    getMilestoneProgressSummary(childProfileId),
    getAllergenWatchSummary(childProfileId),
    getBabyMedicineLogs(childProfileId),
    getVaccinationRecords(childProfileId)
  ]);
  return { diaper, feeding, growth, medicineDueCount: medicine.filter((log) => log.status === "due").length, milestone, sleep, solids, vaccines };
}

export async function generateBabyCalendarEvents(startDate: Date, endDate: Date): Promise<BabyCalendarEvent[]> {
  const profiles = await getVisibleBabyProfilesForViewer();
  const allEvents = await Promise.all(profiles.map(async (profile) => {
    const [feeds, sleeps, diapers, growth, milestones, solids, medicine, vaccines] = await Promise.all([
      getBabyFeedingLogsByRange(profile.id, startDate, endDate),
      getBabySleepLogsByRange(profile.id, startDate, endDate),
      getBabyDiaperLogsByRange(profile.id, startDate, endDate),
      getGrowthMeasurements(profile.id),
      getMilestones(profile.id),
      getBabySolidFoodLogs(profile.id),
      getBabyMedicineLogs(profile.id),
      getVaccinationRecords(profile.id)
    ]);
    return [
      ...feeds.filter((log) => isWithinRange(log.loggedAt, startDate, endDate)).map((log) => makeEvent(profile.id, log.id, log.loggedAt, "feeding", "Baby feed", "#a78bfa")),
      ...sleeps.filter((log) => isWithinRange(log.loggedAt, startDate, endDate)).map((log) => makeEvent(profile.id, log.id, log.loggedAt, "sleep", "Sleep log", "#38bdf8")),
      ...diapers.filter((log) => isWithinRange(log.loggedAt, startDate, endDate)).map((log) => makeEvent(profile.id, log.id, log.loggedAt, "diaper", "Diaper log", "#34d399")),
      ...growth.filter((log) => isWithinRange(log.loggedAt, startDate, endDate)).map((log) => makeEvent(profile.id, log.id, log.loggedAt, "growth", "Growth measurement", "#f59e0b")),
      ...milestones.filter((log) => log.achievedAt && isWithinRange(log.achievedAt, startDate, endDate)).map((log) => makeEvent(profile.id, log.id, log.achievedAt ?? log.createdAt, "milestone", log.title, "#facc15")),
      ...solids.filter((log) => isWithinRange(log.triedAt, startDate, endDate)).map((log) => makeEvent(profile.id, log.id, log.triedAt, "solid_food", log.foodName, "#fb7185")),
      ...medicine.filter((log) => isWithinRange(log.loggedAt, startDate, endDate)).map((log) => makeEvent(profile.id, log.id, log.loggedAt, "medicine", log.medicineName, "#818cf8")),
      ...vaccines.filter((record) => isWithinRange(record.completedDate ?? record.dateReceived ?? record.scheduledDate ?? record.createdAt, startDate, endDate)).map((record) => makeEvent(profile.id, record.id, record.completedDate ?? record.dateReceived ?? record.scheduledDate ?? record.createdAt, "vaccine", record.vaccineName, "#14b8a6"))
    ];
  }));
  return allEvents.flat().sort((left, right) => new Date(right.eventAt).getTime() - new Date(left.eventAt).getTime());
}

export async function getBabyEventsForDate(date: string) {
  return (await generateBabyCalendarEvents(new Date(`${date.slice(0, 10)}T00:00:00`), new Date(`${date.slice(0, 10)}T23:59:59`)));
}

export async function linkBabyEventsToMainCalendar() {
  return generateBabyCalendarEvents(addDays(new Date(), -30), addDays(new Date(), 30));
}

export async function calculateBabyWidgetValue(widgetKey: WidgetKey) {
  const child = (await getVisibleBabyProfilesForViewer())[0];
  if (!child) return "No child profile";
  const care = await getBabyCareSummary(child.id);
  switch (widgetKey) {
    case "next_feed":
      return "Optional";
    case "last_feed":
    case "baby_feed":
      return care.feeding.latest ? relativeTime(care.feeding.latest.loggedAt) : "No feed";
    case "sleep_today":
      return `${Math.round(care.sleep.totalMinutes / 60 * 10) / 10}h`;
    case "last_sleep":
      return care.sleep.latest ? relativeTime(care.sleep.latest.loggedAt) : "No sleep";
    case "last_diaper":
      return care.diaper ? `${care.diaper.diaperType}, ${relativeTime(care.diaper.loggedAt)}` : "No diaper";
    case "weight_latest":
      return care.growth?.weight ? `${care.growth.weight} kg` : "No weight";
    case "growth_check":
      return care.growth ? "Logged" : "No growth log";
    case "next_vaccine":
      return care.vaccines.find((record) => record.scheduledDate || record.nextDoseDate)?.vaccineName ?? "No date";
    case "baby_medicine_due":
      return `${care.medicineDueCount} due`;
    case "solid_food_tried":
      return `${care.solids.triedCount} tried`;
    case "milestone_check":
      return `${care.milestone.observedCount}/${care.milestone.totalCount}`;
    case "baby_note":
      return child.medicalNotes ? "Has note" : "No note";
    case "baby_today":
      return `${care.feeding.count} feeds, ${care.sleep.napCount} naps`;
    default:
      return "Open";
  }
}

export async function pinBabyWidget(widgetKey: WidgetKey) {
  const widgets = await getPinnedBabyWidgets();
  if (!isBabyWidget(widgetKey) || widgets.includes(widgetKey)) return widgets;
  await AsyncStorage.setItem(BABY_WIDGETS_KEY, JSON.stringify([...widgets, widgetKey]));
  return getPinnedBabyWidgets();
}

export async function unpinBabyWidget(widgetKey: WidgetKey) {
  const widgets = await getPinnedBabyWidgets();
  await AsyncStorage.setItem(BABY_WIDGETS_KEY, JSON.stringify(widgets.filter((key) => key !== widgetKey)));
  return getPinnedBabyWidgets();
}

export async function reorderBabyWidgets(widgetKeys: WidgetKey[]) {
  const keys = widgetKeys.filter(isBabyWidget);
  await AsyncStorage.setItem(BABY_WIDGETS_KEY, JSON.stringify(keys));
  return keys;
}

export async function getPinnedBabyWidgets() {
  const stored = await readJsonArray<WidgetKey>(BABY_WIDGETS_KEY);
  return stored.filter(isBabyWidget);
}

export function canViewBabySection() {
  return true;
}

export function canAddBabyLog() {
  return true;
}

export function canEditBabyLog() {
  return true;
}

export function filterBabyDataByPermission<T>(items: T[]) {
  return items;
}

export async function getTrustedBabyLearnCards(): Promise<BabyLearnCard[]> {
  return [
    {
      category: "milestones",
      disclaimer: "Educational only. Discuss development concerns with a pediatrician or healthcare professional.",
      id: "cdc-milestones",
      lastCheckedAt: "2026-06-04",
      publishedAt: "2026-02-16",
      reviewer: "CDC Learn the Signs. Act Early.",
      sourceOrganization: "CDC",
      sourceUrl: "https://www.cdc.gov/act-early/milestones-app/index.html",
      summary: "CDC milestone checklists track development from 2 months to 5 years and are not a substitute for standardized developmental screening.",
      title: "Developmental milestone tracking"
    },
    {
      category: "growth",
      disclaimer: "Growth charts are tracking tools. A pediatrician or healthcare professional should interpret growth concerns.",
      id: "who-growth",
      lastCheckedAt: "2026-06-04",
      sourceOrganization: "WHO",
      sourceUrl: "https://www.who.int/tools/child-growth-standards/standards",
      summary: "WHO Child Growth Standards provide reference charts for early childhood growth tracking.",
      title: "Child growth standards"
    },
    {
      category: "safe_sleep",
      disclaimer: "Safe sleep information is educational. Speak to your pediatrician or clinic if unsure.",
      id: "cdc-safe-sleep",
      lastCheckedAt: "2026-06-04",
      sourceOrganization: "CDC",
      sourceUrl: "https://www.cdc.gov/sudden-infant-death/sleep-safely/index.html",
      summary: "CDC safe sleep education includes back sleeping, a firm flat surface, and keeping soft bedding out of the sleep area.",
      title: "Safe sleep basics"
    },
    {
      category: "safe_sleep",
      disclaimer: "Safe sleep information is educational. Speak to your pediatrician or clinic if unsure.",
      id: "aap-healthychildren-safe-sleep",
      lastCheckedAt: "2026-06-04",
      sourceOrganization: "AAP / HealthyChildren",
      sourceUrl: "https://healthychildren.org/English/ages-stages/baby/sleep/Pages/A-Parents-Guide-to-Safe-Sleep.aspx",
      summary: "HealthyChildren explains AAP safe sleep policy for parents and caregivers.",
      title: "AAP safe sleep policy explained"
    },
    {
      category: "vaccines",
      disclaimer: "Use this to record vaccine information from your clinic card or healthcare provider.",
      id: "cdc-vaccine-records",
      lastCheckedAt: "2026-06-04",
      sourceOrganization: "CDC",
      sourceUrl: "https://www.cdc.gov/vaccines/parents/index.html",
      summary: "Trusted vaccine information should be reviewed with your clinic or healthcare professional.",
      title: "Vaccine record keeping"
    }
  ];
}

export async function saveTrustedBabySourceContent() {
  return getTrustedBabyLearnCards();
}

export async function getDefaultBabyChildId() {
  return (await getVisibleBabyProfilesForViewer())[0]?.id;
}

function toBabyProfile(child: ChildProfile): BabyChildProfile {
  return {
    ...child,
    parentGuardianUserId: child.parentGuardianUserId ?? LOCAL_USER_ID,
    privacy: child.privacy ?? "private",
    profileId: child.profileId ?? LOCAL_PROFILE_ID,
    userId: child.userId ?? LOCAL_USER_ID
  };
}

function toLegacyFeedType(type: BabyFeedingType): FeedType {
  if (type === "breastfeeding") return "breast";
  if (type === "bottle_formula") return "formula";
  if (type === "bottle_breast_milk" || type === "pumping") return "expressed_milk";
  return type;
}

function inferProfileType(dateOfBirth?: string): ChildProfile["profileType"] {
  if (!dateOfBirth) return "infant";
  const months = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 2629800000);
  if (months < 1) return "newborn";
  if (months < 12) return "infant";
  if (months < 36) return "toddler";
  if (months < 60) return "preschool";
  return "child";
}

function getSeedMilestones() {
  const now = "2026-06-04T00:00:00.000Z";
  return [
    ["social_emotional", 2, "Calms down when spoken to or picked up"],
    ["language_communication", 2, "Makes sounds other than crying"],
    ["movement_physical", 4, "Holds head steady without support"],
    ["cognitive", 6, "Puts things in mouth to explore them"],
    ["social_emotional", 9, "Shows several facial expressions"],
    ["language_communication", 12, "Calls a parent mama or dada or another special name"],
    ["movement_physical", 18, "Walks without holding on"],
    ["language_communication", 24, "Says at least two words together"],
    ["cognitive", 36, "Draws a circle when shown how"],
    ["social_emotional", 48, "Pretends to be something else during play"],
    ["movement_physical", 60, "Hops on one foot"]
  ].map(([category, ageCheckpointMonths, title], index) => ({
    ageCheckpointMonths: Number(ageCheckpointMonths),
    category: category as MilestoneCategory,
    childProfileId: "seed",
    createdAt: now,
    id: `seed-milestone-${index}`,
    sourceOrganization: "CDC",
    sourceUrl: "https://www.cdc.gov/act-early/milestones-app/index.html",
    title: String(title),
    updatedAt: now
  }));
}

function makeEvent(childProfileId: string, relatedId: string, eventAt: string, type: BabyCalendarEvent["type"], label: string, color: string): BabyCalendarEvent {
  return {
    childProfileId,
    color,
    date: eventAt.slice(0, 10),
    eventAt,
    id: `baby-${type}-${relatedId}`,
    label,
    relatedId,
    type
  };
}

function getRange(range: BabyReportSummary["range"]) {
  const end = new Date();
  const start = range === "today" ? startOfDay(end) : addDays(end, range === "7_days" ? -6 : -29);
  return { start, end };
}

function calculateMinutes(start?: string, end?: string) {
  if (!start || !end) return undefined;
  const value = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
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

function isWithinRange(value: string | undefined, startDate: Date, endDate: Date) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJsonArray<T>(key: string) {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return [] as T[];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [] as T[];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}
