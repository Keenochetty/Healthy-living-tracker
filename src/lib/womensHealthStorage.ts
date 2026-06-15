import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCycleLogs, getCycleSettings } from "@/lib/cycleStorage";
import type { WidgetKey } from "@/types/app";
import type {
  CalendarHaloOverlay,
  ContraceptionLog,
  ContraceptionMethod,
  ContraceptionMethodType,
  CycleEstimate,
  CycleProfile,
  FlowLevel,
  MoodEnergyLog,
  PeriodLog,
  TrustedHealthContentCard,
  WomensHealthSettings,
  WomensHealthSharePermission,
  WomensHealthTodaySummary,
  WomensSymptomLog,
} from "@/types/womensHealth";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const SETTINGS_KEY = "family_health_phase15a_womens_health_settings";
const CYCLE_PROFILE_KEY = "family_health_phase15a_cycle_profile";
const PERIOD_LOGS_KEY = "family_health_phase15a_period_logs";
const SYMPTOM_LOGS_KEY = "family_health_phase15a_symptom_logs";
const MOOD_LOGS_KEY = "family_health_phase15a_mood_energy_logs";
const CONTRACEPTION_METHODS_KEY =
  "family_health_phase15a_contraception_methods";
const CONTRACEPTION_LOGS_KEY = "family_health_phase15a_contraception_logs";
const SHARE_PERMISSIONS_KEY = "family_health_phase15a_share_permissions";

export const WOMENS_HEALTH_WIDGET_KEYS = [
  "cycle_day",
  "period_expected",
  "period_active",
  "fertile_window_estimate",
  "estimated_ovulation",
  "symptoms_today",
  "mood_today",
  "contraception_reminder",
  "contraception_status",
  "contraception_caution",
  "womens_health_privacy_status",
] as const satisfies WidgetKey[];

export function isWomensHealthWidget(widgetKey: WidgetKey) {
  return WOMENS_HEALTH_WIDGET_KEYS.includes(
    widgetKey as (typeof WOMENS_HEALTH_WIDGET_KEYS)[number],
  );
}

export function getAvailableWomensHealthWidgets() {
  return WOMENS_HEALTH_WIDGET_KEYS;
}

export async function getWomensHealthSettings(
  profileId = LOCAL_PROFILE_ID,
): Promise<WomensHealthSettings> {
  const settings = (
    await readJsonArray<WomensHealthSettings>(SETTINGS_KEY)
  ).find((item) => item.profileId === profileId);
  const now = new Date().toISOString();

  return (
    settings ?? {
      createdAt: now,
      featureStatus: "disabled",
      id: createId("womens-health-settings"),
      isPrivate: true,
      lockedPrivate: true,
      overlayEnabled: true,
      profileId,
      sharedWithCaregiver: false,
      sharedWithFamily: false,
      sharedWithPartner: false,
      trackingEnabled: false,
      updatedAt: now,
      userId: LOCAL_USER_ID,
    }
  );
}

export async function saveWomensHealthSettings(
  input: Partial<WomensHealthSettings> & { profileId?: string },
) {
  const profileId = input.profileId ?? LOCAL_PROFILE_ID;
  const current = await getWomensHealthSettings(profileId);
  const settings: WomensHealthSettings = {
    ...current,
    ...input,
    featureStatus:
      input.featureStatus ??
      (input.trackingEnabled ? "enabled" : current.featureStatus),
    isPrivate: true,
    lockedPrivate: true,
    profileId,
    sharedWithCaregiver: Boolean(input.sharedWithCaregiver),
    sharedWithFamily: Boolean(input.sharedWithFamily),
    sharedWithPartner: Boolean(input.sharedWithPartner),
    updatedAt: new Date().toISOString(),
    userId: LOCAL_USER_ID,
  };
  const settingsList = await readJsonArray<WomensHealthSettings>(SETTINGS_KEY);

  await writeJsonArray(SETTINGS_KEY, [
    settings,
    ...settingsList.filter((item) => item.profileId !== profileId),
  ]);

  return settings;
}

export async function enableWomensHealth(profileId = LOCAL_PROFILE_ID) {
  return saveWomensHealthSettings({
    featureStatus: "enabled",
    profileId,
    trackingEnabled: true,
  });
}

export async function getCycleProfile(
  profileId = LOCAL_PROFILE_ID,
): Promise<CycleProfile> {
  const stored = (await readJsonArray<CycleProfile>(CYCLE_PROFILE_KEY)).find(
    (item) => item.profileId === profileId,
  );

  if (stored) return stored;

  const legacy = await getCycleSettings().catch(() => null);
  const now = new Date().toISOString();

  return {
    contraceptionTrackingEnabled: false,
    createdAt: now,
    fertilityEstimatesEnabled: true,
    id: createId("cycle-profile"),
    isCycleRegular: null,
    lastPeriodStartDate: legacy?.lastPeriodStartDate,
    ovulationTestTrackingEnabled: false,
    periodLengthDays: legacy?.averagePeriodLengthDays ?? 5,
    pregnancyTestTrackingEnabled: false,
    profileId,
    cycleLengthDays: legacy?.averageCycleLengthDays ?? 28,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
}

export async function saveCycleProfile(
  input: Partial<CycleProfile> & { profileId?: string },
) {
  const profileId = input.profileId ?? LOCAL_PROFILE_ID;
  const current = await getCycleProfile(profileId);
  const profile: CycleProfile = {
    ...current,
    ...input,
    cycleLengthDays: clampNumber(
      input.cycleLengthDays ?? current.cycleLengthDays,
      18,
      60,
    ),
    periodLengthDays: clampNumber(
      input.periodLengthDays ?? current.periodLengthDays,
      1,
      14,
    ),
    profileId,
    updatedAt: new Date().toISOString(),
    userId: LOCAL_USER_ID,
  };
  const profiles = await readJsonArray<CycleProfile>(CYCLE_PROFILE_KEY);

  await writeJsonArray(CYCLE_PROFILE_KEY, [
    profile,
    ...profiles.filter((item) => item.profileId !== profileId),
  ]);

  return profile;
}

export async function getPeriodLogs(profileId = LOCAL_PROFILE_ID) {
  const [stored, legacy] = await Promise.all([
    readJsonArray<PeriodLog>(PERIOD_LOGS_KEY),
    getCycleLogs().catch(() => []),
  ]);
  const migrated = legacy.map<PeriodLog>((log) => ({
    createdAt: log.createdAt,
    date: log.date,
    energyLevel: log.energyLevel,
    flowLevel: log.flowLevel as FlowLevel,
    id: `legacy-${log.id}`,
    mood: log.mood,
    notes: log.notes,
    painLevel: log.painLevel,
    profileId,
    updatedAt: log.updatedAt,
    userId: LOCAL_USER_ID,
  }));
  const byId = new Map<string, PeriodLog>();

  [
    ...migrated,
    ...stored.filter((item) => item.profileId === profileId),
  ].forEach((log) => byId.set(log.id, log));

  return sortByDate(Array.from(byId.values()));
}

export async function createPeriodLog(
  input: Omit<
    PeriodLog,
    "createdAt" | "id" | "profileId" | "updatedAt" | "userId"
  > & { profileId?: string },
) {
  const now = new Date().toISOString();
  const profileId = input.profileId ?? LOCAL_PROFILE_ID;
  const log: PeriodLog = {
    ...input,
    clotsNote: clean(input.clotsNote),
    createdAt: now,
    id: createId("period-log"),
    medicationNote: clean(input.medicationNote),
    notes: clean(input.notes),
    profileId,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const logs = await readJsonArray<PeriodLog>(PERIOD_LOGS_KEY);

  await writeJsonArray(PERIOD_LOGS_KEY, [log, ...logs]);

  if (log.flowLevel !== "none") {
    await saveCycleProfile({ lastPeriodStartDate: log.date, profileId });
  }

  return log;
}

export async function updatePeriodLog(
  logId: string,
  partial: Partial<PeriodLog>,
) {
  const logs = await readJsonArray<PeriodLog>(PERIOD_LOGS_KEY);
  const updated = logs.map((log) =>
    log.id === logId
      ? { ...log, ...partial, updatedAt: new Date().toISOString() }
      : log,
  );

  await writeJsonArray(PERIOD_LOGS_KEY, updated);

  return updated.find((log) => log.id === logId) ?? null;
}

export async function deletePeriodLog(logId: string) {
  const logs = await readJsonArray<PeriodLog>(PERIOD_LOGS_KEY);

  await writeJsonArray(
    PERIOD_LOGS_KEY,
    logs.filter((log) => log.id !== logId),
  );
}

export async function getPeriodLogsByDate(
  date: string,
  profileId = LOCAL_PROFILE_ID,
) {
  return (await getPeriodLogs(profileId)).filter((log) => log.date === date);
}

export async function getSymptomLogs(profileId = LOCAL_PROFILE_ID) {
  return sortByDate(
    (await readJsonArray<WomensSymptomLog>(SYMPTOM_LOGS_KEY)).filter(
      (log) => log.profileId === profileId,
    ),
  );
}

export async function createSymptomLog(
  input: Omit<
    WomensSymptomLog,
    "createdAt" | "id" | "profileId" | "updatedAt" | "userId"
  > & { profileId?: string },
) {
  const now = new Date().toISOString();
  const log: WomensSymptomLog = {
    ...input,
    createdAt: now,
    id: createId("womens-symptom"),
    notes: clean(input.notes),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    symptom: input.symptom.trim(),
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const logs = await readJsonArray<WomensSymptomLog>(SYMPTOM_LOGS_KEY);

  await writeJsonArray(SYMPTOM_LOGS_KEY, [log, ...logs]);

  return log;
}

export async function deleteSymptomLog(logId: string) {
  const logs = await readJsonArray<WomensSymptomLog>(SYMPTOM_LOGS_KEY);

  await writeJsonArray(
    SYMPTOM_LOGS_KEY,
    logs.filter((log) => log.id !== logId),
  );
}

export async function getMoodEnergyLogs(profileId = LOCAL_PROFILE_ID) {
  return sortByDate(
    (await readJsonArray<MoodEnergyLog>(MOOD_LOGS_KEY)).filter(
      (log) => log.profileId === profileId,
    ),
  );
}

export async function createMoodEnergyLog(
  input: Omit<
    MoodEnergyLog,
    "createdAt" | "id" | "profileId" | "updatedAt" | "userId"
  > & { profileId?: string },
) {
  const now = new Date().toISOString();
  const log: MoodEnergyLog = {
    ...input,
    createdAt: now,
    id: createId("mood-energy"),
    notes: clean(input.notes),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const logs = await readJsonArray<MoodEnergyLog>(MOOD_LOGS_KEY);

  await writeJsonArray(MOOD_LOGS_KEY, [log, ...logs]);

  return log;
}

export async function deleteMoodEnergyLog(logId: string) {
  const logs = await readJsonArray<MoodEnergyLog>(MOOD_LOGS_KEY);

  await writeJsonArray(
    MOOD_LOGS_KEY,
    logs.filter((log) => log.id !== logId),
  );
}

export async function getContraceptionMethods(profileId = LOCAL_PROFILE_ID) {
  return sortByDate(
    (
      await readJsonArray<ContraceptionMethod>(CONTRACEPTION_METHODS_KEY)
    ).filter((method) => method.profileId === profileId && method.isActive),
  );
}

export async function createContraceptionMethod(
  input: Omit<
    ContraceptionMethod,
    "createdAt" | "id" | "isActive" | "profileId" | "updatedAt" | "userId"
  > & { profileId?: string },
) {
  const now = new Date().toISOString();
  const method: ContraceptionMethod = {
    ...input,
    createdAt: now,
    foodTimingNote: clean(input.foodTimingNote),
    id: createId("contraception-method"),
    isActive: true,
    name: input.name.trim(),
    notes: clean(input.notes),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const methods = await readJsonArray<ContraceptionMethod>(
    CONTRACEPTION_METHODS_KEY,
  );

  await writeJsonArray(CONTRACEPTION_METHODS_KEY, [method, ...methods]);

  return method;
}

export async function updateContraceptionMethod(
  methodId: string,
  partial: Partial<ContraceptionMethod>,
) {
  const methods = await readJsonArray<ContraceptionMethod>(
    CONTRACEPTION_METHODS_KEY,
  );
  const updated = methods.map((method) =>
    method.id === methodId
      ? { ...method, ...partial, updatedAt: new Date().toISOString() }
      : method,
  );

  await writeJsonArray(CONTRACEPTION_METHODS_KEY, updated);

  return updated.find((method) => method.id === methodId) ?? null;
}

export async function archiveContraceptionMethod(methodId: string) {
  return updateContraceptionMethod(methodId, { isActive: false });
}

export async function getContraceptionLogs(profileId = LOCAL_PROFILE_ID) {
  return sortByDate(
    (await readJsonArray<ContraceptionLog>(CONTRACEPTION_LOGS_KEY)).filter(
      (log) => log.profileId === profileId,
    ),
  );
}

export async function createContraceptionLog(
  input: Omit<
    ContraceptionLog,
    "createdAt" | "id" | "profileId" | "updatedAt" | "userId"
  > & { profileId?: string },
) {
  const now = new Date().toISOString();
  const log: ContraceptionLog = {
    ...input,
    createdAt: now,
    id: createId("contraception-log"),
    notes: clean(input.notes),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const logs = await readJsonArray<ContraceptionLog>(CONTRACEPTION_LOGS_KEY);

  await writeJsonArray(CONTRACEPTION_LOGS_KEY, [log, ...logs]);

  return log;
}

export async function deleteContraceptionLog(logId: string) {
  const logs = await readJsonArray<ContraceptionLog>(CONTRACEPTION_LOGS_KEY);

  await writeJsonArray(
    CONTRACEPTION_LOGS_KEY,
    logs.filter((log) => log.id !== logId),
  );
}

export async function getWomensHealthSharePermissions(
  profileId = LOCAL_PROFILE_ID,
) {
  return (
    await readJsonArray<WomensHealthSharePermission>(SHARE_PERMISSIONS_KEY)
  ).filter((item) => item.profileId === profileId);
}

export async function saveWomensHealthSharePermission(
  input: Omit<WomensHealthSharePermission, "createdAt" | "id" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const permission: WomensHealthSharePermission = {
    ...input,
    createdAt: now,
    id: createId("womens-health-share"),
    updatedAt: now,
  };
  const permissions = await readJsonArray<WomensHealthSharePermission>(
    SHARE_PERMISSIONS_KEY,
  );

  await writeJsonArray(SHARE_PERMISSIONS_KEY, [
    permission,
    ...permissions.filter(
      (item) =>
        !(
          item.profileId === input.profileId &&
          item.category === input.category &&
          item.viewerType === input.viewerType
        ),
    ),
  ]);

  return permission;
}

export async function calculateCycleEstimate(
  profileId = LOCAL_PROFILE_ID,
): Promise<CycleEstimate> {
  const [profile, logs] = await Promise.all([
    getCycleProfile(profileId),
    getPeriodLogs(profileId),
  ]);
  const periodStarts = logs
    .filter((log) => log.flowLevel !== "none")
    .map((log) => log.date)
    .sort();
  const lastStart = periodStarts.at(-1) ?? profile.lastPeriodStartDate;
  const now = new Date().toISOString();

  if (!lastStart) {
    return {
      confidence: "low",
      createdAt: now,
      estimateOnly: true,
      id: createId("cycle-estimate"),
      profileId,
      updatedAt: now,
      userId: LOCAL_USER_ID,
    };
  }

  const cycleLength =
    periodStarts.length >= 3
      ? (averageCycleLength(periodStarts) ?? profile.cycleLengthDays)
      : profile.cycleLengthDays;
  const lastStartDate = parseDate(lastStart);
  const today = startOfDay(new Date());
  const cycleDay = Math.max(
    1,
    Math.floor((today.getTime() - lastStartDate.getTime()) / 86400000) + 1,
  );
  const nextPeriodStart = addDays(lastStartDate, cycleLength);
  const ovulation = addDays(nextPeriodStart, -14);

  return {
    confidence: periodStarts.length >= 3 ? "medium" : "low",
    createdAt: now,
    cycleDay,
    estimatedOvulationDate: toDateKey(ovulation),
    estimateOnly: true,
    fertileWindowEnd: toDateKey(addDays(ovulation, 1)),
    fertileWindowStart: toDateKey(addDays(ovulation, -5)),
    id: createId("cycle-estimate"),
    nextPeriodEnd: toDateKey(
      addDays(nextPeriodStart, profile.periodLengthDays - 1),
    ),
    nextPeriodStart: toDateKey(nextPeriodStart),
    profileId,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
}

export async function getWomensHealthTodaySummary(
  profileId = LOCAL_PROFILE_ID,
): Promise<WomensHealthTodaySummary> {
  const today = toDateKey(new Date());
  const [
    settings,
    estimate,
    periodLogs,
    symptoms,
    moods,
    methods,
    contraceptionLogs,
  ] = await Promise.all([
    getWomensHealthSettings(profileId),
    calculateCycleEstimate(profileId),
    getPeriodLogs(profileId),
    getSymptomLogs(profileId),
    getMoodEnergyLogs(profileId),
    getContraceptionMethods(profileId),
    getContraceptionLogs(profileId),
  ]);
  const todayPeriodLogs = periodLogs.filter((log) => log.date === today);
  const activePeriod = todayPeriodLogs.some((log) => log.flowLevel !== "none");
  const latestMood = moods.find((log) => log.date === today) ?? moods[0];
  const contraceptionReminder = getNextContraceptionReminder(
    methods,
    contraceptionLogs,
  );

  return {
    activePeriod,
    contraceptionReminder,
    contraceptionStatus: methods.length
      ? `${methods.length} method${methods.length === 1 ? "" : "s"} tracked`
      : "Not tracking",
    cycleDay: estimate.cycleDay,
    estimate,
    latestMood,
    latestPeriodLog: todayPeriodLogs[0] ?? periodLogs[0],
    nextPeriodText: estimate.nextPeriodStart
      ? `Estimated ${estimate.nextPeriodStart}`
      : "No estimate yet",
    privacyStatus:
      settings.sharedWithPartner ||
      settings.sharedWithFamily ||
      settings.sharedWithCaregiver
        ? "Shared selected"
        : "Private",
    symptomCountToday: symptoms.filter((log) => log.date === today).length,
  };
}

export async function getCalendarHaloOverlaysForDateRange(
  startDate: Date,
  endDate: Date,
  profileId = LOCAL_PROFILE_ID,
): Promise<CalendarHaloOverlay[]> {
  const settings = await getWomensHealthSettings(profileId);

  if (!settings.trackingEnabled || !settings.overlayEnabled) return [];

  const [estimate, periodLogs, symptoms, moods, methods, contraceptionLogs] =
    await Promise.all([
      calculateCycleEstimate(profileId),
      getPeriodLogs(profileId),
      getSymptomLogs(profileId),
      getMoodEnergyLogs(profileId),
      getContraceptionMethods(profileId),
      getContraceptionLogs(profileId),
    ]);
  const overlays: CalendarHaloOverlay[] = [];
  const start = toDateKey(startDate);
  const end = toDateKey(endDate);

  periodLogs
    .filter(
      (log) => isDateInRange(log.date, start, end) && log.flowLevel !== "none",
    )
    .forEach((log) => {
      overlays.push(
        makeOverlay(
          log.date,
          "period_logged",
          "Period logged",
          "#db2777",
          log.id,
          profileId,
        ),
      );
    });
  symptoms
    .filter((log) => isDateInRange(log.date, start, end))
    .forEach((log) => {
      overlays.push(
        makeOverlay(
          log.date,
          "symptom_logged",
          "Symptom logged",
          "#f97316",
          log.id,
          profileId,
        ),
      );
    });
  moods
    .filter((log) => isDateInRange(log.date, start, end))
    .forEach((log) => {
      overlays.push(
        makeOverlay(
          log.date,
          "mood_logged",
          "Mood or energy",
          "#8b5cf6",
          log.id,
          profileId,
        ),
      );
    });
  contraceptionLogs
    .filter((log) => isDateInRange(log.eventAt.slice(0, 10), start, end))
    .forEach((log) => {
      overlays.push(
        makeOverlay(
          log.eventAt.slice(0, 10),
          log.eventType === "late" || log.eventType === "missed"
            ? "contraception_caution"
            : "contraception_due",
          "Contraception note",
          "#14b8a6",
          log.id,
          profileId,
        ),
      );
    });
  methods.forEach((method) => {
    if (
      method.nextDueAt &&
      isDateInRange(method.nextDueAt.slice(0, 10), start, end)
    ) {
      overlays.push(
        makeOverlay(
          method.nextDueAt.slice(0, 10),
          "contraception_due",
          `${method.name} due`,
          "#14b8a6",
          method.id,
          profileId,
        ),
      );
    }
  });

  if (estimate.nextPeriodStart && estimate.nextPeriodEnd) {
    eachDate(
      parseDate(estimate.nextPeriodStart),
      parseDate(estimate.nextPeriodEnd),
    ).forEach((date) => {
      const dateKey = toDateKey(date);
      if (isDateInRange(dateKey, start, end)) {
        overlays.push(
          makeOverlay(
            dateKey,
            "period_predicted",
            "Period estimate",
            "#f9a8d4",
            `estimate-period-${dateKey}`,
            profileId,
          ),
        );
      }
    });
  }
  if (estimate.fertileWindowStart && estimate.fertileWindowEnd) {
    eachDate(
      parseDate(estimate.fertileWindowStart),
      parseDate(estimate.fertileWindowEnd),
    ).forEach((date) => {
      const dateKey = toDateKey(date);
      if (isDateInRange(dateKey, start, end)) {
        overlays.push(
          makeOverlay(
            dateKey,
            "fertile_window_estimate",
            "Fertile window estimate",
            "#fbbf24",
            `estimate-fertile-${dateKey}`,
            profileId,
          ),
        );
      }
    });
  }
  if (
    estimate.estimatedOvulationDate &&
    isDateInRange(estimate.estimatedOvulationDate, start, end)
  ) {
    overlays.push(
      makeOverlay(
        estimate.estimatedOvulationDate,
        "ovulation_estimate",
        "Ovulation estimate",
        "#22c55e",
        "estimate-ovulation",
        profileId,
      ),
    );
  }

  return overlays;
}

export async function getTrustedHealthContentCards(): Promise<
  TrustedHealthContentCard[]
> {
  return [
    {
      authorOrReviewer: "ACOG",
      id: "acog-first-period",
      lastCheckedAt: "2026-06-04",
      sourceName: "ACOG",
      summary:
        "Cycle tracking can use the first day of bleeding as day 1. Estimates in this app stay informational only.",
      title: "Understanding your cycle",
      url: "https://www.acog.org/womens-health/faqs/your-first-period",
    },
    {
      authorOrReviewer: "CDC",
      id: "cdc-combined-hormonal",
      lastCheckedAt: "2026-06-04",
      sourceName: "CDC",
      summary:
        "Vomiting, diarrhoea, missed or late doses, and some medicines or herbal supplements may need label or professional review.",
      title: "Contraception timing notes",
      url: "https://www.cdc.gov/contraception/hcp/usspr/combined-hormonal-contraceptives.html",
    },
    {
      authorOrReviewer: "CDC",
      id: "cdc-progestin-only",
      lastCheckedAt: "2026-06-04",
      sourceName: "CDC",
      summary:
        "Different pill types can have different timing guidance. The app stores reminders and notes but does not decide what to do.",
      title: "Progestogen-only pill notes",
      url: "https://www.cdc.gov/contraception/hcp/usspr/progestin-only-pills.html",
    },
  ];
}

export async function calculateWomensHealthWidgetValue(widgetKey: WidgetKey) {
  const [summary, methods, logs] = await Promise.all([
    getWomensHealthTodaySummary(),
    getContraceptionMethods(),
    getContraceptionLogs(),
  ]);

  switch (widgetKey) {
    case "cycle_day":
      return summary.cycleDay ? `Day ${summary.cycleDay}` : "Set cycle";
    case "period_expected":
      return summary.estimate.nextPeriodStart ?? "No estimate";
    case "period_active":
      return summary.activePeriod ? "Logged today" : "Not logged";
    case "fertile_window_estimate":
      return summary.estimate.fertileWindowStart
        ? `${summary.estimate.fertileWindowStart}`
        : "No estimate";
    case "estimated_ovulation":
      return summary.estimate.estimatedOvulationDate ?? "No estimate";
    case "symptoms_today":
      return summary.symptomCountToday
        ? `${summary.symptomCountToday} today`
        : "None";
    case "mood_today":
      return summary.latestMood?.mood ?? "Not logged";
    case "contraception_reminder":
      return summary.contraceptionReminder ?? "No reminder";
    case "contraception_status":
      return summary.contraceptionStatus;
    case "contraception_caution":
      return logs.some(
        (log) => log.eventType === "late" || log.eventType === "missed",
      )
        ? "Review notes"
        : methods.some((method) => method.foodTimingNote)
          ? "Timing note"
          : "No notes";
    case "womens_health_privacy_status":
      return summary.privacyStatus;
    case "cycle":
    case "cycle_private":
      return summary.privacyStatus;
    default:
      return "Ready";
  }
}

export function getContraceptionMethodLabel(
  methodType: ContraceptionMethodType,
) {
  return methodType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getNextContraceptionReminder(
  methods: ContraceptionMethod[],
  logs: ContraceptionLog[],
) {
  const activeDue = methods
    .filter((method) => method.nextDueAt)
    .sort(
      (left, right) =>
        new Date(left.nextDueAt ?? "").getTime() -
        new Date(right.nextDueAt ?? "").getTime(),
    )[0];
  const latestCaution = logs.find(
    (log) => log.eventType === "late" || log.eventType === "missed",
  );

  if (latestCaution) return "Review timing note";
  if (activeDue?.nextDueAt)
    return `${activeDue.name} ${activeDue.nextDueAt.slice(0, 10)}`;

  return undefined;
}

function averageCycleLength(periodStarts: string[]) {
  const gaps = periodStarts
    .slice(1)
    .map((start, index) =>
      Math.round(
        (parseDate(start).getTime() -
          parseDate(periodStarts[index]).getTime()) /
          86400000,
      ),
    )
    .filter((gap) => gap >= 18 && gap <= 60);

  if (!gaps.length) return null;

  return Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length);
}

function makeOverlay(
  date: string,
  type: CalendarHaloOverlay["type"],
  label: string,
  color: string,
  relatedId: string,
  profileId: string,
): CalendarHaloOverlay {
  return {
    color,
    date,
    id: `${type}-${relatedId}-${date}`,
    isShared: false,
    label,
    profileAvatarLabel: "WH",
    profileId,
    profileName: "Women’s Health",
    relatedId,
    type,
  };
}

function isDateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

function sortByDate<
  T extends {
    createdAt: string;
    date?: string;
    eventAt?: string;
    updatedAt?: string;
  },
>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      new Date(
        right.date ?? right.eventAt ?? right.updatedAt ?? right.createdAt,
      ).getTime() -
      new Date(
        left.date ?? left.eventAt ?? left.updatedAt ?? left.createdAt,
      ).getTime(),
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

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDate(dateKey: string) {
  return new Date(`${dateKey.slice(0, 10)}T12:00:00`);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(
    max,
    Math.max(min, Number.isFinite(value) ? Math.round(value) : min),
  );
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
