import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Platform } from "react-native";

import type {
  HealthReminder,
  NotificationDetailLevel,
  NotificationPermissionStatus,
  NotificationSettings,
  QuietHoursBehavior,
  ReminderActionLog,
  ReminderCategory,
  ReminderCategorySettings,
  ScheduledNotificationRecord,
} from "@/types/healthTimeline";

type ExpoNotificationsModule = typeof import("expo-notifications");
type ScheduleLocalNotificationInput = {
  body?: string;
  category?: ReminderCategory;
  data?: Record<string, string | number | boolean | null | undefined>;
  detailLevel?: NotificationDetailLevel;
  id?: string;
  params?: Record<string, unknown>;
  profileId?: string;
  reminderId: string;
  route?: string;
  scheduledAt: string;
  title: string;
};

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const SETTINGS_KEY = "family_health_phase19_notification_settings";
const CATEGORY_SETTINGS_KEY =
  "family_health_phase19_reminder_category_settings";
const SCHEDULED_RECORDS_KEY =
  "family_health_phase19_scheduled_notification_records";
const ACTION_LOGS_KEY = "family_health_phase19_reminder_action_logs";

let notificationsModule: ExpoNotificationsModule | null = null;
let initialized = false;
let receivedSubscription: { remove: () => void } | null = null;
let responseSubscription: { remove: () => void } | null = null;

export const REMINDER_CATEGORIES: ReminderCategory[] = [
  "medication",
  "supplement",
  "contraception",
  "baby_feeding",
  "baby_sleep",
  "baby_medicine",
  "vaccine",
  "appointment",
  "prescription_refill",
  "lab_follow_up",
  "workout",
  "food_meal",
  "water",
  "biometric_log",
  "womens_health",
  "pregnancy",
  "mens_health",
  "family_caregiver",
  "records",
  "custom",
];

const SENSITIVE_CATEGORIES = new Set<ReminderCategory>([
  "medication",
  "supplement",
  "contraception",
  "womens_health",
  "pregnancy",
  "baby_medicine",
  "mens_health",
  "records",
  "biometric_log",
]);

export async function initializeNotifications() {
  if (initialized) return true;
  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("health-reminders", {
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#8b5cf6",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      name: "Health reminders",
    });
    await Notifications.setNotificationChannelAsync(
      "private-health-reminders",
      {
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: "#8b5cf6",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.SECRET,
        name: "Private health reminders",
      },
    );
  }

  await registerNotificationCategories(Notifications);
  initialized = true;
  return true;
}

export async function requestNotificationPermission() {
  const Notifications = await loadNotifications();
  if (!Notifications || !(await initializeNotifications())) {
    await updateNotificationSettings({
      notificationsEnabled: false,
      permissionStatus: "unavailable",
    });
    return "unavailable" as NotificationPermissionStatus;
  }

  const current = await Notifications.getPermissionsAsync();
  if (
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    const status = current.granted ? "granted" : "provisional";
    await updateNotificationSettings({
      notificationsEnabled: true,
      permissionStatus: status,
    });
    return status as NotificationPermissionStatus;
  }

  const requested = await Notifications.requestPermissionsAsync();
  const permissionStatus = requested.granted
    ? "granted"
    : requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      ? "provisional"
      : "denied";

  await updateNotificationSettings({
    notificationsEnabled:
      permissionStatus === "granted" || permissionStatus === "provisional",
    permissionStatus,
  });

  return permissionStatus;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const Notifications = await loadNotifications();
  if (!Notifications) return "unavailable";

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) return "granted";
  if (
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
    return "provisional";
  if (permissions.canAskAgain === false) return "denied";
  return "not_requested";
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const settings = await readJsonArray<NotificationSettings>(SETTINGS_KEY);
  const current = settings.find((item) => item.userId === LOCAL_USER_ID);
  if (current) return current;

  const now = new Date().toISOString();
  return {
    createdAt: now,
    id: createId("notification-settings"),
    notificationsEnabled: false,
    permissionStatus: "not_requested",
    quietHoursEnabled: false,
    quietHoursEnd: "07:00",
    quietHoursStart: "22:00",
    sensitiveLockScreenPrivate: true,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
}

export async function updateNotificationSettings(
  partial: Partial<NotificationSettings>,
) {
  const current = await getNotificationSettings();
  const next: NotificationSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  const settings = await readJsonArray<NotificationSettings>(SETTINGS_KEY);
  await writeJsonArray(SETTINGS_KEY, [
    next,
    ...settings.filter((item) => item.userId !== LOCAL_USER_ID),
  ]);
  return next;
}

export async function getReminderCategorySettings(
  profileId = LOCAL_PROFILE_ID,
) {
  const stored = await readJsonArray<ReminderCategorySettings>(
    CATEGORY_SETTINGS_KEY,
  );
  const byCategory = new Map<ReminderCategory, ReminderCategorySettings>();

  REMINDER_CATEGORIES.forEach((category) =>
    byCategory.set(category, defaultCategorySettings(category, profileId)),
  );
  stored
    .filter(
      (item) =>
        item.profileId === profileId ||
        (!item.profileId && profileId === LOCAL_PROFILE_ID),
    )
    .forEach((item) => byCategory.set(item.category, item));

  return Array.from(byCategory.values());
}

export async function updateReminderCategorySettings(
  category: ReminderCategory,
  partial: Partial<ReminderCategorySettings>,
  profileId = LOCAL_PROFILE_ID,
) {
  const settings = await readJsonArray<ReminderCategorySettings>(
    CATEGORY_SETTINGS_KEY,
  );
  const current =
    (await getReminderCategorySettings(profileId)).find(
      (item) => item.category === category,
    ) ?? defaultCategorySettings(category, profileId);
  const next: ReminderCategorySettings = {
    ...current,
    ...partial,
    category,
    profileId,
    updatedAt: new Date().toISOString(),
  };

  await writeJsonArray(CATEGORY_SETTINGS_KEY, [
    next,
    ...settings.filter(
      (item) =>
        !(
          item.category === category &&
          (item.profileId ?? LOCAL_PROFILE_ID) === profileId
        ),
    ),
  ]);

  return next;
}

export async function scheduleLocalNotification(
  input: ScheduleLocalNotificationInput,
) {
  const settings = await getNotificationSettings();
  const categorySettings = await getCategorySetting(
    input.category ?? "custom",
    input.profileId ?? LOCAL_PROFILE_ID,
  );
  const permissionStatus = await getNotificationPermissionStatus();

  if (
    !settings.notificationsEnabled ||
    !categorySettings.notificationEnabled ||
    permissionStatus === "denied" ||
    permissionStatus === "unavailable"
  ) {
    return saveScheduledNotificationRecord(
      input,
      undefined,
      "failed",
      "Device notifications are off. In-app reminders are still active.",
    );
  }

  const Notifications = await loadNotifications();
  if (!Notifications || !(await initializeNotifications())) {
    return saveScheduledNotificationRecord(
      input,
      undefined,
      "failed",
      "Notification delivery is unavailable.",
    );
  }

  const scheduledFor = await calculateNextAllowedNotificationTime(
    input.scheduledAt,
    categorySettings.quietHoursBehavior,
  );
  const scheduledAt = new Date(scheduledFor);
  if (scheduledAt.getTime() <= Date.now()) {
    return saveScheduledNotificationRecord(
      input,
      undefined,
      "expired",
      "Reminder time has already passed.",
    );
  }
  const quietNow = await isWithinQuietHours(input.scheduledAt);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      body: input.body ?? "Health reminder",
      categoryIdentifier: notificationCategoryIdentifier(
        input.category ?? "custom",
      ),
      data: {
        ...(input.data ?? {}),
        paramsJson: input.params ? JSON.stringify(input.params) : undefined,
        reminderId: input.reminderId,
        route: input.route,
        sourceRealm: input.data?.sourceRealm,
      },
      sound:
        categorySettings.quietHoursBehavior === "silent" && quietNow
          ? false
          : undefined,
      title: input.title,
    },
    trigger: {
      channelId: SENSITIVE_CATEGORIES.has(input.category ?? "custom")
        ? "private-health-reminders"
        : "health-reminders",
      date: scheduledAt,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    } as never,
  });

  return saveScheduledNotificationRecord(input, notificationId, "scheduled");
}

export async function cancelLocalNotification(notificationId?: string) {
  if (!notificationId) return null;
  const Notifications = await loadNotifications();
  if (Notifications) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  const records = await readJsonArray<ScheduledNotificationRecord>(
    SCHEDULED_RECORDS_KEY,
  );
  const updated = records.map((record) =>
    record.notificationId === notificationId
      ? {
          ...record,
          status: "cancelled" as const,
          updatedAt: new Date().toISOString(),
        }
      : record,
  );
  await writeJsonArray(SCHEDULED_RECORDS_KEY, updated);
  return (
    updated.find((record) => record.notificationId === notificationId) ?? null
  );
}

export async function cancelNotificationsForReminder(reminderId: string) {
  const records = (await getScheduledNotificationRecords()).filter(
    (record) =>
      record.reminderId === reminderId && record.status === "scheduled",
  );
  await Promise.all(
    records.map((record) => cancelLocalNotification(record.notificationId)),
  );
  return records.length;
}

export async function rescheduleNotification(
  input: ScheduleLocalNotificationInput,
) {
  await cancelNotificationsForReminder(input.reminderId);
  return scheduleLocalNotification(input);
}

export async function handleNotificationReceived(notification: unknown) {
  const data = extractNotificationData(notification);
  if (data.reminderId) {
    await createReminderActionLog({
      action: "opened",
      actionSource: "notification",
      reminderId: String(data.reminderId),
    });
  }
}

export async function handleNotificationResponse(response: unknown) {
  const data = extractNotificationData(response);
  const reminderId = data.reminderId ? String(data.reminderId) : undefined;

  if (reminderId) {
    await createReminderActionLog({
      action: "opened",
      actionSource: "notification",
      reminderId,
    });
  }

  navigateFromReminderNotification(data);
}

export async function registerNotificationListeners() {
  const Notifications = await loadNotifications();
  if (!Notifications || !(await initializeNotifications())) return false;

  unregisterNotificationListeners();
  receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      void handleNotificationReceived(notification);
    },
  );
  responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      void handleNotificationResponse(response);
    },
  );

  return true;
}

export function unregisterNotificationListeners() {
  receivedSubscription?.remove();
  responseSubscription?.remove();
  receivedSubscription = null;
  responseSubscription = null;
}

export async function getScheduledNotifications() {
  const Notifications = await loadNotifications();
  if (!Notifications) return [];
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function clearAllLocalNotificationsForUser() {
  const Notifications = await loadNotifications();
  if (Notifications) {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  const records = await readJsonArray<ScheduledNotificationRecord>(
    SCHEDULED_RECORDS_KEY,
  );
  await writeJsonArray(
    SCHEDULED_RECORDS_KEY,
    records.map((record) =>
      record.userId === LOCAL_USER_ID
        ? {
            ...record,
            status: "cancelled",
            updatedAt: new Date().toISOString(),
          }
        : record,
    ),
  );
}

export async function getScheduledNotificationRecords() {
  return readJsonArray<ScheduledNotificationRecord>(SCHEDULED_RECORDS_KEY);
}

export async function createReminderActionLog(
  input: Omit<ReminderActionLog, "createdAt" | "id" | "userId"> & {
    userId?: string;
  },
) {
  const log: ReminderActionLog = {
    ...input,
    createdAt: new Date().toISOString(),
    id: createId("reminder-action"),
    userId: input.userId ?? LOCAL_USER_ID,
  };
  const logs = await readJsonArray<ReminderActionLog>(ACTION_LOGS_KEY);
  await writeJsonArray(ACTION_LOGS_KEY, [log, ...logs].slice(0, 500));
  return log;
}

export async function getReminderActionLogs() {
  return readJsonArray<ReminderActionLog>(ACTION_LOGS_KEY);
}

export function getSensitiveNotificationTitle(
  category: ReminderCategory,
  detailLevel: NotificationDetailLevel,
  detailedTitle?: string,
) {
  if (detailLevel === "detailed" && detailedTitle) return detailedTitle;
  if (detailLevel === "private")
    return category === "baby_medicine" ||
      category === "baby_feeding" ||
      category === "baby_sleep"
      ? "Baby care reminder"
      : "Health reminder";

  switch (category) {
    case "medication":
      return "Medication reminder";
    case "supplement":
      return "Supplement reminder";
    case "contraception":
      return "Private health reminder";
    case "pregnancy":
    case "womens_health":
    case "mens_health":
      return "Private health check-in";
    case "baby_medicine":
    case "baby_feeding":
    case "baby_sleep":
      return "Baby care reminder";
    case "water":
      return "Water reminder";
    case "workout":
      return "Workout reminder";
    case "appointment":
      return "Appointment reminder";
    default:
      return "Health reminder";
  }
}

export function getSensitiveNotificationBody(
  category: ReminderCategory,
  detailLevel: NotificationDetailLevel,
  detailedBody?: string,
) {
  if (detailLevel === "detailed" && detailedBody) return detailedBody;
  if (detailLevel === "private") return "You have a health reminder.";

  switch (category) {
    case "medication":
      return "Medication reminder. Always follow your prescription label or healthcare professional's instructions.";
    case "supplement":
      return "Supplement reminder. Follow your product label or healthcare professional's instructions.";
    case "contraception":
      return "Contraception reminder. Follow your product leaflet, clinic guidance, or healthcare professional's advice.";
    case "baby_medicine":
      return "Baby care reminder. If concerned, contact a pediatrician, clinic, nurse, doctor, or healthcare professional.";
    case "pregnancy":
      return "Pregnancy reminder for organization only.";
    default:
      return "Reminder from your health planner.";
  }
}

export function isWithinQuietHours(dateValue = new Date().toISOString()) {
  const now = new Date(dateValue);
  const minutes = now.getHours() * 60 + now.getMinutes();
  return getQuietHoursRange().then(({ enabled, end, start }) => {
    if (!enabled) return false;
    return start <= end
      ? minutes >= start && minutes < end
      : minutes >= start || minutes < end;
  });
}

export async function applyQuietHoursBehavior(
  dateValue: string,
  behavior: QuietHoursBehavior,
) {
  if (behavior === "deliver") return dateValue;
  if (!(await isWithinQuietHours(dateValue))) return dateValue;
  return behavior === "delay"
    ? calculateNextAllowedNotificationTime(dateValue, behavior)
    : dateValue;
}

export async function calculateNextAllowedNotificationTime(
  dateValue: string,
  behavior: QuietHoursBehavior,
) {
  if (behavior !== "delay") return dateValue;
  const date = new Date(dateValue);
  const settings = await getNotificationSettings();
  if (!settings.quietHoursEnabled) return dateValue;

  const endMinutes = timeToMinutes(settings.quietHoursEnd ?? "07:00");
  const startMinutes = timeToMinutes(settings.quietHoursStart ?? "22:00");
  const minutes = date.getHours() * 60 + date.getMinutes();
  const inside =
    startMinutes <= endMinutes
      ? minutes >= startMinutes && minutes < endMinutes
      : minutes >= startMinutes || minutes < endMinutes;
  if (!inside) return dateValue;

  date.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);
  if (startMinutes > endMinutes && minutes >= startMinutes) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString();
}

export async function scheduleReminderNotification(reminder: HealthReminder) {
  const category = reminder.category ?? reminderCategoryFromType(reminder.type);
  const categorySetting = await getCategorySetting(
    category,
    reminder.profileId,
  );
  const detailLevel = reminder.detailLevel ?? categorySetting.detailLevel;
  const scheduledFor = new Date(reminder.dueAt);
  scheduledFor.setMinutes(
    scheduledFor.getMinutes() -
      (reminder.leadTimeMinutes ?? categorySetting.defaultLeadTimeMinutes ?? 0),
  );

  return scheduleLocalNotification({
    body: getSensitiveNotificationBody(category, detailLevel, reminder.notes),
    category,
    data: {
      reminderId: reminder.id,
      sourceId: reminder.sourceId,
      sourceRealm: reminder.sourceRealm ?? reminder.source,
      type: reminder.type,
    },
    detailLevel,
    params: reminder.params,
    profileId: reminder.profileId,
    reminderId: reminder.id,
    route: reminder.route ?? buildReminderDeepLink(reminder).route,
    scheduledAt: scheduledFor.toISOString(),
    title: getSensitiveNotificationTitle(category, detailLevel, reminder.title),
  });
}

export async function cancelReminderNotification(notificationId?: string) {
  return cancelLocalNotification(notificationId);
}

export async function rescheduleReminderNotification(reminder: HealthReminder) {
  await cancelNotificationsForReminder(reminder.id);
  return scheduleReminderNotification(reminder);
}

export function buildReminderDeepLink(
  reminder: Pick<HealthReminder, "params" | "route" | "type">,
) {
  if (reminder.route) return { params: reminder.params, route: reminder.route };

  switch (reminder.type) {
    case "medication":
      return { route: "/medication" };
    case "supplement":
      return { route: "/supplements" };
    case "contraception":
    case "womens_health":
      return {
        params: {
          tab: reminder.type === "contraception" ? "contraception" : "today",
        },
        route: "/cycle",
      };
    case "pregnancy":
      return { route: "/pregnancy" };
    case "baby_child":
      return { route: "/baby-child" };
    case "water":
    case "meal":
      return {
        params: reminder.type === "water" ? { tab: "water" } : undefined,
        route: "/food",
      };
    case "workout":
      return { route: "/fitness" };
    case "doctor_visit":
    case "vaccine":
    case "prescription_refill":
    case "lab_review":
    case "record":
      return { route: "/records" };
    case "mens_health":
      return { route: "/mens-health" };
    default:
      return { route: "/health-calendar" };
  }
}

export function parseReminderNotificationPayload(
  data: Record<string, unknown>,
) {
  const params =
    typeof data.paramsJson === "string"
      ? safeJsonParse(data.paramsJson)
      : undefined;
  return {
    params,
    reminderId:
      typeof data.reminderId === "string" ? data.reminderId : undefined,
    route: typeof data.route === "string" ? data.route : undefined,
    sourceRealm:
      typeof data.sourceRealm === "string" ? data.sourceRealm : undefined,
    sourceId: typeof data.sourceId === "string" ? data.sourceId : undefined,
  };
}

export function navigateFromReminderNotification(
  data: Record<string, unknown>,
) {
  const payload = parseReminderNotificationPayload(data);
  const route = payload.route || "/health-calendar";
  router.push(
    payload.params
      ? ({ pathname: route, params: payload.params } as never)
      : (route as never),
  );
}

export function canScheduleReminderForUser(reminder: HealthReminder) {
  return reminder.userId === LOCAL_USER_ID && reminder.lockedPrivate !== false;
}

export function canShowReminderToViewer(reminder: HealthReminder) {
  return (
    reminder.userId === LOCAL_USER_ID ||
    reminder.sharedWithCaregiver ||
    reminder.sharedWithFamily ||
    reminder.sharedWithPartner
  );
}

export function filterRemindersByPermission<T extends HealthReminder>(
  reminders: T[],
) {
  return reminders.filter(canShowReminderToViewer);
}

export async function handleReminderAction(
  reminder: HealthReminder,
  action: ReminderActionLog["action"],
  actionSource: ReminderActionLog["actionSource"] = "in_app",
) {
  return createReminderActionLog({
    action,
    actionSource,
    profileId: reminder.profileId,
    reminderId: reminder.id,
  });
}

export const handleMedicationReminderAction = handleReminderAction;
export const handleSupplementReminderAction = handleReminderAction;
export const handleContraceptionReminderAction = handleReminderAction;
export const handleBabyReminderAction = handleReminderAction;
export const handleWaterReminderAction = handleReminderAction;
export const handleWorkoutReminderAction = handleReminderAction;

export async function getReminderNotificationStatus() {
  return getNotificationPermissionStatus();
}

export async function requestReminderNotificationPermission() {
  return requestNotificationPermission();
}

export async function scheduleHealthReminderNotification(
  input: Omit<ScheduleLocalNotificationInput, "reminderId"> & {
    reminderId?: string;
  },
) {
  return scheduleLocalNotification({
    ...input,
    reminderId: input.reminderId ?? input.id ?? createId("legacy-reminder"),
  });
}

export async function cancelHealthReminderNotification(
  notificationId?: string,
) {
  return cancelLocalNotification(notificationId);
}

export async function rescheduleHealthReminderNotification(
  input: Omit<ScheduleLocalNotificationInput, "reminderId"> & {
    reminderId?: string;
  },
) {
  await cancelLocalNotification(input.id);
  return scheduleHealthReminderNotification(input);
}

async function saveScheduledNotificationRecord(
  input: ScheduleLocalNotificationInput,
  notificationId: string | undefined,
  status: ScheduledNotificationRecord["status"],
  errorMessage?: string,
) {
  const now = new Date().toISOString();
  const record: ScheduledNotificationRecord = {
    body: input.body ?? "Health reminder",
    category: input.category ?? "custom",
    createdAt: now,
    detailLevel: input.detailLevel ?? "private",
    errorMessage,
    id: input.id ?? createId("scheduled-notification"),
    notificationId,
    params: input.params,
    profileId: input.profileId,
    reminderId: input.reminderId,
    route: input.route,
    scheduledFor: input.scheduledAt,
    status,
    title: input.title,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const records = await readJsonArray<ScheduledNotificationRecord>(
    SCHEDULED_RECORDS_KEY,
  );
  await writeJsonArray(SCHEDULED_RECORDS_KEY, [
    record,
    ...records.filter((item) => item.reminderId !== record.reminderId),
  ]);
  return record;
}

async function registerNotificationCategories(
  Notifications: ExpoNotificationsModule,
) {
  const categories = [
    ["default-reminder", ["MARK_DONE", "SNOOZE_10", "OPEN_APP"]],
    ["medication-reminder", ["MARK_TAKEN", "SKIP", "SNOOZE_30", "OPEN_APP"]],
    ["baby-reminder", ["LOG_FEED", "MARK_DONE", "OPEN_APP"]],
    ["water-reminder", ["ADD_WATER_250", "SNOOZE_30", "OPEN_APP"]],
  ] as const;

  await Promise.all(
    categories.map(([identifier, actions]) =>
      Notifications.setNotificationCategoryAsync(
        identifier,
        actions.map((action) => ({
          buttonTitle: actionLabel(action),
          identifier: action,
          options: { opensAppToForeground: true },
        })),
      ),
    ),
  );
}

function notificationCategoryIdentifier(category: ReminderCategory) {
  if (category === "medication" || category === "supplement")
    return "medication-reminder";
  if (category.startsWith("baby_")) return "baby-reminder";
  if (category === "water") return "water-reminder";
  return "default-reminder";
}

function actionLabel(action: string) {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function reminderCategoryFromType(type: string): ReminderCategory {
  switch (type) {
    case "medication":
    case "supplement":
    case "contraception":
    case "pregnancy":
    case "mens_health":
    case "water":
    case "workout":
      return type;
    case "baby_child":
      return "baby_medicine";
    case "doctor_visit":
      return "appointment";
    case "prescription_refill":
      return "prescription_refill";
    case "lab_review":
      return "lab_follow_up";
    case "biometric_log":
      return "biometric_log";
    case "meal":
      return "food_meal";
    case "record":
      return "records";
    case "vaccine":
      return "vaccine";
    case "womens_health":
      return "womens_health";
    default:
      return "custom";
  }
}

function defaultCategorySettings(
  category: ReminderCategory,
  profileId = LOCAL_PROFILE_ID,
): ReminderCategorySettings {
  const now = new Date().toISOString();
  const sensitive = SENSITIVE_CATEGORIES.has(category);
  return {
    category,
    createdAt: now,
    defaultLeadTimeMinutes: category === "appointment" ? 60 : 0,
    detailLevel: sensitive ? "private" : "category",
    enabled: true,
    id: `category-settings-${profileId}-${category}`,
    notificationEnabled: false,
    profileId,
    quickActionsEnabled: false,
    quietHoursBehavior:
      category === "medication" ||
      category === "baby_medicine" ||
      category === "appointment"
        ? "deliver"
        : "delay",
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
}

async function getCategorySetting(
  category: ReminderCategory,
  profileId: string,
) {
  return (
    (await getReminderCategorySettings(profileId)).find(
      (item) => item.category === category,
    ) ?? defaultCategorySettings(category, profileId)
  );
}

async function getQuietHoursRange() {
  const settings = await getNotificationSettings();
  return {
    enabled: settings.quietHoursEnabled,
    end: timeToMinutes(settings.quietHoursEnd ?? "07:00"),
    start: timeToMinutes(settings.quietHoursStart ?? "22:00"),
  };
}

function timeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function extractNotificationData(input: unknown) {
  const maybeResponse = input as {
    notification?: {
      request?: { content?: { data?: Record<string, unknown> } };
    };
    request?: { content?: { data?: Record<string, unknown> } };
  };
  return (
    maybeResponse.notification?.request?.content?.data ??
    maybeResponse.request?.content?.data ??
    {}
  );
}

async function loadNotifications() {
  if (notificationsModule) return notificationsModule;
  try {
    notificationsModule = await import("expo-notifications");
    return notificationsModule;
  } catch {
    return null;
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
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
