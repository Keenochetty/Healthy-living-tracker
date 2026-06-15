import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  BabyFeedLog,
  BabySleepLog,
  ChildMilestone,
  ChildProfile,
  ChildProfileType,
  ChildSummary,
  DiaperLog,
  FeedType,
  GrowthMeasurement,
  VaccinationRecord,
} from "@/types/child";

const CHILD_PROFILES_KEY = "family_health_child_profiles";
const FEED_LOGS_KEY = "family_health_child_feed_logs";
const SLEEP_LOGS_KEY = "family_health_child_sleep_logs";
const DIAPER_LOGS_KEY = "family_health_child_diaper_logs";
const GROWTH_LOGS_KEY = "family_health_child_growth_logs";
const MILESTONES_KEY = "family_health_child_milestones";
const VACCINATIONS_KEY = "family_health_child_vaccinations";
const childListeners = new Set<() => void>();

type CreateChildProfileInput = {
  allergies?: string[];
  avatarEmoji?: string;
  birthHeadCircumferenceCm?: number;
  birthLengthCm?: number;
  birthWeightKg?: number;
  clinicName?: string;
  dateOfBirth?: string;
  dueDate?: string;
  displayName: string;
  feedingType?: ChildProfile["feedingType"];
  gender?: ChildProfile["gender"];
  medicalNotes?: string;
  parentGuardianUserId?: string;
  pediatricianName?: string;
  privacy?: ChildProfile["privacy"];
  profileType: ChildProfileType;
};

export function subscribeToChildren(listener: () => void) {
  childListeners.add(listener);

  return () => {
    childListeners.delete(listener);
  };
}

function notifyChildListeners() {
  childListeners.forEach((listener) => listener());
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
  notifyChildListeners();

  return value;
}

function sortByLoggedAt<T extends { loggedAt?: string; createdAt: string }>(
  items: T[],
) {
  return [...items].sort(
    (left, right) =>
      new Date(right.loggedAt ?? right.createdAt).getTime() -
      new Date(left.loggedAt ?? left.createdAt).getTime(),
  );
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getChildProfiles() {
  return readJsonArray<ChildProfile>(CHILD_PROFILES_KEY);
}

export async function getChildProfile(childId: string) {
  const children = await getChildProfiles();

  return children.find((child) => child.id === childId) ?? null;
}

export async function createChildProfile(input: CreateChildProfileInput) {
  const now = new Date().toISOString();
  const child: ChildProfile = {
    adultHandoverAtAge18: true,
    allergies: input.allergies?.filter(Boolean),
    avatarEmoji: input.avatarEmoji,
    birthHeadCircumferenceCm: input.birthHeadCircumferenceCm,
    birthLengthCm: input.birthLengthCm,
    birthWeightKg: input.birthWeightKg,
    childAccessPaused: true,
    clinicName: input.clinicName?.trim() || undefined,
    createdAt: now,
    dateOfBirth: input.dateOfBirth || undefined,
    displayName: input.displayName.trim(),
    dueDate: input.dueDate || undefined,
    feedingType: input.feedingType,
    gender: input.gender,
    id: id("child"),
    medicalNotes: input.medicalNotes?.trim() || undefined,
    parentControlled: true,
    parentGuardianUserId: input.parentGuardianUserId ?? "local-user",
    pediatricianName: input.pediatricianName?.trim() || undefined,
    privacy: input.privacy ?? "private",
    profileType: input.profileType,
    profileId: "local-profile",
    transitionAtAge13: true,
    updatedAt: now,
    userId: "local-user",
  };
  const children = await getChildProfiles();

  await writeJsonArray(CHILD_PROFILES_KEY, [child, ...children]);

  return child;
}

export async function updateChildProfile(
  childId: string,
  partial: Partial<Omit<ChildProfile, "id" | "createdAt">>,
) {
  const children = await getChildProfiles();
  const updatedChildren = children.map((child) =>
    child.id === childId
      ? { ...child, ...partial, updatedAt: new Date().toISOString() }
      : child,
  );

  await writeJsonArray(CHILD_PROFILES_KEY, updatedChildren);

  return updatedChildren.find((child) => child.id === childId) ?? null;
}

export async function deleteChildProfile(childId: string) {
  const children = await getChildProfiles();
  const child = children.find((item) => item.id === childId) ?? null;

  await writeJsonArray(
    CHILD_PROFILES_KEY,
    children.filter((item) => item.id !== childId),
  );

  return child;
}

export async function getFeedLogs(childId: string) {
  const logs = await readJsonArray<BabyFeedLog>(FEED_LOGS_KEY);

  return sortByLoggedAt(logs.filter((log) => log.childId === childId));
}

export async function addFeedLog(input: {
  childId: string;
  durationMinutes?: number;
  extraAmountMl?: number;
  feedType: FeedType;
  finishedAmountMl?: number;
  notes?: string;
  offeredAmountMl?: number;
}) {
  const now = new Date().toISOString();
  const log: BabyFeedLog = {
    ...input,
    createdAt: now,
    id: id("feed"),
    loggedAt: now,
    notes: input.notes?.trim() || undefined,
  };
  const logs = await readJsonArray<BabyFeedLog>(FEED_LOGS_KEY);

  await writeJsonArray(FEED_LOGS_KEY, [log, ...logs]);

  return log;
}

export async function updateFeedLog(
  logId: string,
  partial: Partial<Omit<BabyFeedLog, "id" | "childId" | "createdAt">>,
) {
  const logs = await readJsonArray<BabyFeedLog>(FEED_LOGS_KEY);
  const updatedLogs = logs.map((log) =>
    log.id === logId ? { ...log, ...partial } : log,
  );

  await writeJsonArray(FEED_LOGS_KEY, updatedLogs);

  return updatedLogs.find((log) => log.id === logId) ?? null;
}

export async function deleteFeedLog(logId: string) {
  const logs = await readJsonArray<BabyFeedLog>(FEED_LOGS_KEY);

  await writeJsonArray(
    FEED_LOGS_KEY,
    logs.filter((log) => log.id !== logId),
  );
}

export async function getLatestFeed(childId: string) {
  return (await getFeedLogs(childId))[0];
}

export async function getTodayFeedLogs(childId: string) {
  const today = new Date().toDateString();

  return (await getFeedLogs(childId)).filter(
    (log) => new Date(log.loggedAt).toDateString() === today,
  );
}

export async function getSleepLogs(childId: string) {
  const logs = await readJsonArray<BabySleepLog>(SLEEP_LOGS_KEY);

  return sortByLoggedAt(logs.filter((log) => log.childId === childId));
}

export async function addChildSleepLog(input: {
  childId: string;
  durationMinutes: number;
  notes?: string;
  quality?: BabySleepLog["quality"];
}) {
  const now = new Date().toISOString();
  const log: BabySleepLog = {
    ...input,
    createdAt: now,
    id: id("sleep"),
    loggedAt: now,
    notes: input.notes?.trim() || undefined,
  };
  const logs = await readJsonArray<BabySleepLog>(SLEEP_LOGS_KEY);

  await writeJsonArray(SLEEP_LOGS_KEY, [log, ...logs]);

  return log;
}

export async function updateChildSleepLog(
  logId: string,
  partial: Partial<Omit<BabySleepLog, "id" | "childId" | "createdAt">>,
) {
  const logs = await readJsonArray<BabySleepLog>(SLEEP_LOGS_KEY);
  const updatedLogs = logs.map((log) =>
    log.id === logId ? { ...log, ...partial } : log,
  );

  await writeJsonArray(SLEEP_LOGS_KEY, updatedLogs);

  return updatedLogs.find((log) => log.id === logId) ?? null;
}

export async function deleteChildSleepLog(logId: string) {
  const logs = await readJsonArray<BabySleepLog>(SLEEP_LOGS_KEY);

  await writeJsonArray(
    SLEEP_LOGS_KEY,
    logs.filter((log) => log.id !== logId),
  );
}

export async function getLatestChildSleep(childId: string) {
  return (await getSleepLogs(childId))[0];
}

export async function getDiaperLogs(childId: string) {
  const logs = await readJsonArray<DiaperLog>(DIAPER_LOGS_KEY);

  return sortByLoggedAt(logs.filter((log) => log.childId === childId));
}

export async function addDiaperLog(
  input: Omit<DiaperLog, "id" | "loggedAt" | "createdAt">,
) {
  const now = new Date().toISOString();
  const log: DiaperLog = {
    ...input,
    createdAt: now,
    id: id("diaper"),
    loggedAt: now,
    notes: input.notes?.trim() || undefined,
  };
  const logs = await readJsonArray<DiaperLog>(DIAPER_LOGS_KEY);

  await writeJsonArray(DIAPER_LOGS_KEY, [log, ...logs]);

  return log;
}

export async function getLatestDiaper(childId: string) {
  return (await getDiaperLogs(childId))[0];
}

export async function getGrowthMeasurements(childId: string) {
  const logs = await readJsonArray<GrowthMeasurement>(GROWTH_LOGS_KEY);

  return sortByLoggedAt(logs.filter((log) => log.childId === childId));
}

export async function addGrowthMeasurement(
  input: Omit<GrowthMeasurement, "id" | "loggedAt" | "createdAt">,
) {
  const now = new Date().toISOString();
  const measurement: GrowthMeasurement = {
    ...input,
    createdAt: now,
    id: id("growth"),
    loggedAt: now,
    notes: input.notes?.trim() || undefined,
  };
  const logs = await readJsonArray<GrowthMeasurement>(GROWTH_LOGS_KEY);

  await writeJsonArray(GROWTH_LOGS_KEY, [measurement, ...logs]);

  return measurement;
}

export async function getLatestGrowthMeasurement(childId: string) {
  return (await getGrowthMeasurements(childId))[0];
}

export async function getMilestones(childId: string) {
  const milestones = await readJsonArray<ChildMilestone>(MILESTONES_KEY);

  return milestones.filter((milestone) => milestone.childId === childId);
}

export async function addMilestone(
  input: Omit<ChildMilestone, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const milestone: ChildMilestone = {
    ...input,
    createdAt: now,
    id: id("milestone"),
    notes: input.notes?.trim() || undefined,
    updatedAt: now,
  };
  const milestones = await readJsonArray<ChildMilestone>(MILESTONES_KEY);

  await writeJsonArray(MILESTONES_KEY, [milestone, ...milestones]);

  return milestone;
}

export async function updateMilestone(
  milestoneId: string,
  partial: Partial<Omit<ChildMilestone, "id" | "childId" | "createdAt">>,
) {
  const milestones = await readJsonArray<ChildMilestone>(MILESTONES_KEY);
  const updatedMilestones = milestones.map((milestone) =>
    milestone.id === milestoneId
      ? { ...milestone, ...partial, updatedAt: new Date().toISOString() }
      : milestone,
  );

  await writeJsonArray(MILESTONES_KEY, updatedMilestones);

  return (
    updatedMilestones.find((milestone) => milestone.id === milestoneId) ?? null
  );
}

export async function deleteMilestone(milestoneId: string) {
  const milestones = await readJsonArray<ChildMilestone>(MILESTONES_KEY);

  await writeJsonArray(
    MILESTONES_KEY,
    milestones.filter((item) => item.id !== milestoneId),
  );
}

export async function getVaccinationRecords(childId: string) {
  const records = await readJsonArray<VaccinationRecord>(VACCINATIONS_KEY);

  return records.filter((record) => record.childId === childId);
}

export async function addVaccinationRecord(
  input: Omit<VaccinationRecord, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const record: VaccinationRecord = {
    ...input,
    createdAt: now,
    id: id("vaccine"),
    notes: input.notes?.trim() || undefined,
    updatedAt: now,
  };
  const records = await readJsonArray<VaccinationRecord>(VACCINATIONS_KEY);

  await writeJsonArray(VACCINATIONS_KEY, [record, ...records]);

  return record;
}

export async function updateVaccinationRecord(
  recordId: string,
  partial: Partial<Omit<VaccinationRecord, "id" | "childId" | "createdAt">>,
) {
  const records = await readJsonArray<VaccinationRecord>(VACCINATIONS_KEY);
  const updatedRecords = records.map((record) =>
    record.id === recordId
      ? { ...record, ...partial, updatedAt: new Date().toISOString() }
      : record,
  );

  await writeJsonArray(VACCINATIONS_KEY, updatedRecords);

  return updatedRecords.find((record) => record.id === recordId) ?? null;
}

export async function deleteVaccinationRecord(recordId: string) {
  const records = await readJsonArray<VaccinationRecord>(VACCINATIONS_KEY);

  await writeJsonArray(
    VACCINATIONS_KEY,
    records.filter((item) => item.id !== recordId),
  );
}

export async function getChildSummary(
  childId: string,
): Promise<ChildSummary | null> {
  const child = await getChildProfile(childId);

  if (!child) return null;

  const [
    latestFeed,
    latestSleep,
    latestDiaper,
    latestGrowth,
    milestones,
    records,
  ] = await Promise.all([
    getLatestFeed(childId),
    getLatestChildSleep(childId),
    getLatestDiaper(childId),
    getLatestGrowthMeasurement(childId),
    getMilestones(childId),
    getVaccinationRecords(childId),
  ]);

  return {
    child,
    latestDiaper,
    latestFeed,
    latestGrowth,
    latestSleep,
    milestonesCount: milestones.length,
    vaccinationRecordsCount: records.length,
  };
}

export async function getAllChildSummaries() {
  const children = await getChildProfiles();
  const summaries = await Promise.all(
    children.map((child) => getChildSummary(child.id)),
  );

  return summaries.filter((summary): summary is ChildSummary =>
    Boolean(summary),
  );
}
