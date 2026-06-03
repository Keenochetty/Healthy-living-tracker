import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AppReminder,
  ReminderLinkedEntityType,
  ReminderPriority,
  ReminderStatus,
  ReminderType
} from "@/types/reminders";

const REMINDERS_STORAGE_KEY = "family_health_reminders";
const reminderListeners = new Set<(reminders: AppReminder[]) => void>();

type CreateReminderInput = {
  dueAt: string;
  linkedEntityId?: string;
  linkedEntityType?: ReminderLinkedEntityType;
  metadata?: Record<string, string | number | boolean | null>;
  notes?: string;
  notificationId?: string;
  notify: boolean;
  priority: ReminderPriority;
  title: string;
  type: ReminderType;
};

export function subscribeToReminders(listener: (reminders: AppReminder[]) => void) {
  reminderListeners.add(listener);

  return () => {
    reminderListeners.delete(listener);
  };
}

function notifyReminderListeners(reminders: AppReminder[]) {
  reminderListeners.forEach((listener) => listener(reminders));
}

function toStartOfDay(date: Date) {
  const nextDate = new Date(date);

  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

export function formatReminderTime(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDate));
}

export function formatReminderDate(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(isoDate));
}

export function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    weekday: "short"
  }).format(date);
}

function isSameDay(isoDate: string, date: Date) {
  const reminderDate = toStartOfDay(new Date(isoDate));
  const selectedDate = toStartOfDay(date);

  return reminderDate.getTime() === selectedDate.getTime();
}

function sortReminders(reminders: AppReminder[]) {
  return [...reminders].sort(
    (left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()
  );
}

function createStarterReminder({
  hours,
  minutes,
  priority,
  title,
  type
}: {
  hours: number;
  minutes: number;
  priority: ReminderPriority;
  title: string;
  type: ReminderType;
}): AppReminder {
  const dueAt = new Date();
  const now = new Date().toISOString();

  dueAt.setHours(hours, minutes, 0, 0);

  return {
    createdAt: now,
    dueAt: dueAt.toISOString(),
    id: `starter-${type}-${hours}-${minutes}`,
    notify: false,
    priority,
    status: "pending",
    title,
    type,
    updatedAt: now
  };
}

function getStarterReminders() {
  return [
    createStarterReminder({
      hours: 10,
      minutes: 30,
      priority: "important",
      title: "Doctor appointment",
      type: "doctor_visit"
    }),
    createStarterReminder({
      hours: 14,
      minutes: 0,
      priority: "normal",
      title: "Team meeting",
      type: "work"
    }),
    createStarterReminder({
      hours: 18,
      minutes: 0,
      priority: "important",
      title: "Medication reminder",
      type: "medication"
    })
  ];
}

async function readReminders() {
  try {
    const storedReminders = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);

    if (!storedReminders) {
      const starterReminders = getStarterReminders();

      await saveReminders(starterReminders);

      return starterReminders;
    }

    const parsedReminders = JSON.parse(storedReminders);

    return Array.isArray(parsedReminders)
      ? sortReminders(parsedReminders as AppReminder[])
      : [];
  } catch {
    return getStarterReminders();
  }
}

export async function getReminders() {
  return readReminders();
}

export async function getReminderById(id: string) {
  const reminders = await getReminders();

  return reminders.find((reminder) => reminder.id === id) ?? null;
}

export async function saveReminders(reminders: AppReminder[]) {
  const sortedReminders = sortReminders(reminders);

  await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(sortedReminders));
  notifyReminderListeners(sortedReminders);

  return sortedReminders;
}

export async function createReminder(input: CreateReminderInput) {
  const now = new Date().toISOString();
  const reminder: AppReminder = {
    createdAt: now,
    dueAt: input.dueAt,
    id: `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    linkedEntityId: input.linkedEntityId,
    linkedEntityType: input.linkedEntityType,
    metadata: input.metadata,
    notes: input.notes?.trim() || undefined,
    notificationId: input.notificationId,
    notify: input.notify,
    priority: input.priority,
    status: "pending",
    title: input.title.trim(),
    type: input.type,
    updatedAt: now
  };
  const reminders = await getReminders();

  await saveReminders([reminder, ...reminders]);

  return reminder;
}

export async function createMedicationReminder({
  dosage,
  dueAt,
  instructions,
  medicationId,
  medicationName,
  notificationId,
  notify = false
}: {
  dosage?: string;
  dueAt: string;
  instructions?: string;
  medicationId: string;
  medicationName: string;
  notificationId?: string;
  notify?: boolean;
}) {
  const notes = [
    dosage ? `Dosage: ${dosage}` : null,
    instructions ? `Instructions: ${instructions}` : null,
    "Follow your healthcare professional's instructions."
  ]
    .filter(Boolean)
    .join("\n");

  return createReminder({
    dueAt,
    linkedEntityId: medicationId,
    linkedEntityType: "medication",
    metadata: {
      medicationName
    },
    notes,
    notificationId,
    notify,
    priority: "important",
    title: `Medication: ${medicationName}`,
    type: "medication"
  });
}

export async function updateReminder(
  id: string,
  partial: Partial<Omit<AppReminder, "id" | "createdAt">>
) {
  const reminders = await getReminders();
  const updatedReminders = reminders.map((reminder) =>
    reminder.id === id
      ? {
          ...reminder,
          ...partial,
          updatedAt: new Date().toISOString()
        }
      : reminder
  );

  await saveReminders(updatedReminders);

  return updatedReminders.find((reminder) => reminder.id === id) ?? null;
}

async function setReminderStatus(id: string, status: ReminderStatus) {
  return updateReminder(id, { status });
}

export async function completeReminder(id: string) {
  return setReminderStatus(id, "completed");
}

export async function skipReminder(id: string) {
  return setReminderStatus(id, "skipped");
}

export async function deleteReminder(id: string) {
  const reminders = await getReminders();
  const reminder = reminders.find((item) => item.id === id) ?? null;

  await saveReminders(reminders.filter((item) => item.id !== id));

  return reminder;
}

export async function getRemindersByLinkedEntity(
  type: ReminderLinkedEntityType,
  id: string
) {
  const reminders = await getReminders();

  return sortReminders(
    reminders.filter(
      (reminder) => reminder.linkedEntityType === type && reminder.linkedEntityId === id
    )
  );
}

export async function cancelRemindersByLinkedEntity(
  type: ReminderLinkedEntityType,
  id: string
) {
  const reminders = await getReminders();
  const updatedReminders = reminders.map((reminder) =>
    reminder.linkedEntityType === type && reminder.linkedEntityId === id
      ? {
          ...reminder,
          status: "cancelled" as ReminderStatus,
          updatedAt: new Date().toISOString()
        }
      : reminder
  );

  return saveReminders(updatedReminders);
}

export async function getTodayReminders() {
  return getRemindersByDate(new Date());
}

export async function getUpcomingReminders() {
  const now = Date.now();
  const reminders = await getReminders();

  return sortReminders(
    reminders.filter(
      (reminder) =>
        reminder.status === "pending" && new Date(reminder.dueAt).getTime() >= now
    )
  );
}

export async function getRemindersByDate(date: Date) {
  const reminders = await getReminders();

  return sortReminders(reminders.filter((reminder) => isSameDay(reminder.dueAt, date)));
}
