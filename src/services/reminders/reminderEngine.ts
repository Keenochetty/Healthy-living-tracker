import AsyncStorage from "@react-native-async-storage/async-storage";

import { getReminders as getLegacyReminders } from "@/lib/reminderStorage";
import {
  calculateTodayMedicationSchedule,
  calculateTodaySupplementSchedule,
  markDoseSkipped,
  markDoseTaken,
  snoozeDoseReminder,
} from "@/lib/medicationSupplementStorage";
import {
  getDoctorVisits,
  getLabResultRecords,
  getPrescriptionRecords,
  getUpcomingRecordReminders,
  getVaccineRecords,
  markRecordReminderDone,
} from "@/lib/healthRecordsStorage";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import { getContraceptionMethods } from "@/lib/womensHealthStorage";
import {
  calculatePregnancyWeekSummary,
  getPregnancyAppointments,
  getPregnancyProfile,
} from "@/lib/pregnancyStorage";
import {
  getBabyMedicineLogs,
  getBabyVaccineRecords,
  getVisibleBabyProfilesForViewer,
} from "@/lib/babyChildStorage";
import { getMensHealthRemindersByRange } from "@/lib/mensHealthStorage";
import {
  cancelNotificationsForReminder,
  canScheduleReminderForUser,
  createReminderActionLog,
  filterRemindersByPermission,
  getScheduledNotificationRecords,
  getScheduledNotifications,
  scheduleReminderNotification,
} from "@/services/reminders/notificationService";
import type { WidgetKey } from "@/types/app";
import type {
  CalendarDaySummary,
  CreateHealthReminderInput,
  HealthCalendarWidgetKey,
  HealthEventType,
  HealthReminder,
  HealthReminderStatus,
  ReminderCategory,
  ReminderSnoozeOption,
  UpdateHealthReminderInput,
} from "@/types/healthTimeline";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const HEALTH_REMINDERS_STORAGE_KEY = "family_health_phase13_health_reminders";

export const HEALTH_CALENDAR_WIDGET_KEYS = [
  "today_reminders",
  "next_reminder",
  "overdue_items",
  "upcoming_appointment",
  "medication_schedule",
  "supplement_schedule",
  "workout_plan",
  "water_check",
  "timeline_today",
  "reminder_next",
  "reminders_today",
  "overdue_reminders",
  "medication_due",
  "supplement_due",
  "contraception_next",
  "baby_reminder",
  "appointment_reminder",
  "water_reminder",
  "workout_reminder",
  "caregiver_task",
] as const satisfies WidgetKey[];

export const REMINDER_SNOOZE_OPTIONS: ReminderSnoozeOption[] = [
  { label: "10 minutes", minutes: 10 },
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "Tomorrow", minutes: 24 * 60 },
];

export function isHealthCalendarWidget(
  widgetKey: WidgetKey,
): widgetKey is HealthCalendarWidgetKey {
  return HEALTH_CALENDAR_WIDGET_KEYS.includes(
    widgetKey as HealthCalendarWidgetKey,
  );
}

export function getAvailableHealthCalendarWidgets() {
  return HEALTH_CALENDAR_WIDGET_KEYS;
}

export async function createHealthReminder(input: CreateHealthReminderInput) {
  const now = new Date().toISOString();
  const reminder: HealthReminder = {
    allDay: Boolean(input.allDay),
    category: input.category ?? reminderCategoryFromType(input.type),
    createdAt: now,
    detailLevel: input.detailLevel,
    dueAt: input.dueAt,
    id: createId("health-reminder"),
    isPrivate: true,
    leadTimeMinutes: input.leadTimeMinutes,
    linkedEntityId: input.linkedEntityId,
    linkedEntityType: input.linkedEntityType,
    lockedPrivate: true,
    metadata: input.metadata,
    missedThresholdMinutes: input.missedThresholdMinutes,
    notes: clean(input.notes),
    notificationRecordId: input.notificationRecordId,
    notificationEnabled: Boolean(input.notificationEnabled),
    notificationId: input.notificationId,
    params: input.params,
    pausedUntil: input.pausedUntil,
    profileId: LOCAL_PROFILE_ID,
    quietHoursBehavior: input.quietHoursBehavior,
    repeatFrequency: input.repeatFrequency ?? "none",
    repeatRule: clean(input.repeatRule),
    route: input.route,
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    source: input.source ?? "manual",
    sourceId: input.sourceId,
    sourceRealm: input.sourceRealm ?? input.source,
    sourceType: input.sourceType,
    status: calculateReminderDueStatus(input.dueAt),
    title: input.title.trim(),
    type: input.type,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const reminders = await readStoredReminders();

  await writeStoredReminders(
    sortReminders([reminder, ...dedupeBySource(reminders, reminder)]),
  );
  if (reminder.notificationEnabled && canScheduleReminderForUser(reminder)) {
    const record = await scheduleReminderNotification(reminder);
    await updateHealthReminder(reminder.id, {
      notificationId: record.notificationId,
      notificationRecordId: record.id,
    });
  }

  return reminder;
}

export async function getHealthReminders() {
  const stored = await readStoredReminders();
  const generated = await generateRemindersFromSchedules(new Date());
  const legacy = await getLegacyHealthReminders();

  return filterRemindersByPermission(
    mergeReminders([...stored, ...generated, ...legacy]),
  );
}

export async function getHealthReminderById(id: string) {
  const reminders = await getHealthReminders();

  return reminders.find((reminder) => reminder.id === id) ?? null;
}

export async function updateHealthReminder(
  id: string,
  partial: UpdateHealthReminderInput,
) {
  const reminders = await readStoredReminders();
  const updated = reminders.map((reminder) =>
    reminder.id === id
      ? {
          ...reminder,
          ...partial,
          notes:
            partial.notes === undefined ? reminder.notes : clean(partial.notes),
          status:
            partial.status ??
            calculateReminderDueStatus(
              partial.dueAt ?? reminder.dueAt,
              partial.snoozedUntil ?? reminder.snoozedUntil,
            ),
          updatedAt: new Date().toISOString(),
        }
      : reminder,
  );

  await writeStoredReminders(sortReminders(updated));
  const result = updated.find((reminder) => reminder.id === id) ?? null;

  if (result?.notificationEnabled && canScheduleReminderForUser(result)) {
    const record = await scheduleReminderNotification(result);
    await writeStoredReminders(
      sortReminders(
        updated.map((reminder) =>
          reminder.id === id
            ? {
                ...reminder,
                notificationId: record.notificationId,
                notificationRecordId: record.id,
              }
            : reminder,
        ),
      ),
    );
  } else if (result) {
    await cancelNotificationsForReminder(result.id);
  }

  return result;
}

export async function deleteHealthReminder(id: string) {
  const reminders = await readStoredReminders();
  const deleted = reminders.find((reminder) => reminder.id === id) ?? null;

  await writeStoredReminders(
    reminders.filter((reminder) => reminder.id !== id),
  );
  await cancelNotificationsForReminder(id);

  return deleted;
}

export async function completeHealthReminder(id: string) {
  return setHealthReminderStatus(id, "completed");
}

export async function skipHealthReminder(id: string) {
  return setHealthReminderStatus(id, "skipped");
}

export async function snoozeHealthReminder(id: string, minutes = 30) {
  const reminder = await getHealthReminderById(id);

  if (!reminder) {
    return null;
  }

  const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();

  if (reminder.type === "medication" || reminder.type === "supplement") {
    await snoozeDoseReminder({
      itemId: String(
        reminder.metadata?.itemId ?? reminder.linkedEntityId ?? "",
      ),
      itemType: reminder.type,
      scheduleId: String(reminder.metadata?.scheduleId ?? ""),
      scheduledAt: reminder.metadata?.scheduledAt
        ? String(reminder.metadata.scheduledAt)
        : reminder.dueAt,
    });
  }

  const next = await upsertMaterializedReminder({
    ...reminder,
    snoozedUntil,
    status: "snoozed",
    updatedAt: new Date().toISOString(),
  });

  if (next?.notificationEnabled) {
    await scheduleReminderNotification({ ...next, dueAt: snoozedUntil });
  }
  await createReminderActionLog({
    action: "snoozed",
    actionSource: "in_app",
    profileId: next?.profileId,
    reminderId: id,
  });
  return next;
}

export async function cancelHealthReminder(id: string) {
  return setHealthReminderStatus(id, "cancelled");
}

export const getReminderById = getHealthReminderById;
export const markReminderCompleted = completeHealthReminder;
export const markReminderSkipped = skipHealthReminder;

export async function getRemindersForDateRange(
  startDate: Date | string,
  endDate: Date | string,
) {
  const start =
    typeof startDate === "string"
      ? new Date(`${startDate.slice(0, 10)}T00:00:00`)
      : startDate;
  const end =
    typeof endDate === "string"
      ? new Date(`${endDate.slice(0, 10)}T23:59:59`)
      : endDate;
  const reminders = await getHealthReminders();
  return reminders.filter((reminder) => {
    const dueAt = new Date(reminder.snoozedUntil ?? reminder.dueAt).getTime();
    return dueAt >= start.getTime() && dueAt <= end.getTime();
  });
}

export async function getUpcomingReminders(limit = 20) {
  return (await getHealthReminders())
    .filter(
      (reminder) =>
        reminder.status === "upcoming" || reminder.status === "snoozed",
    )
    .slice(0, limit);
}

export async function getDueReminders() {
  return (await getHealthReminders()).filter(
    (reminder) => reminder.status === "due",
  );
}

export async function getRemindersForDate(date: Date | string) {
  const dateKey =
    typeof date === "string" ? date.slice(0, 10) : toDateKey(date);
  const stored = await readStoredReminders();
  const generated = await generateRemindersFromSchedules(
    new Date(`${dateKey}T12:00:00`),
  );
  const legacy = await getLegacyHealthReminders();

  return filterRemindersByPermission(
    mergeReminders([...stored, ...generated, ...legacy]),
  ).filter(
    (reminder) =>
      toDateKey(new Date(reminder.snoozedUntil ?? reminder.dueAt)) === dateKey,
  );
}

export async function getOverdueReminders() {
  const reminders = await getHealthReminders();

  return reminders.filter(
    (reminder) => reminder.status === "missed" || reminder.status === "due",
  );
}

export async function pauseReminder(id: string, pausedUntil?: string) {
  const reminder = await getHealthReminderById(id);
  if (!reminder) return null;
  await cancelNotificationsForReminder(id);
  return upsertMaterializedReminder({
    ...reminder,
    pausedUntil,
    status: "paused",
    updatedAt: new Date().toISOString(),
  });
}

export async function resumeReminder(id: string) {
  const reminder = await getHealthReminderById(id);
  if (!reminder) return null;
  const resumed = await upsertMaterializedReminder({
    ...reminder,
    pausedUntil: undefined,
    status: calculateReminderDueStatus(reminder.dueAt, reminder.snoozedUntil),
    updatedAt: new Date().toISOString(),
  });
  if (resumed.notificationEnabled) await scheduleReminderNotification(resumed);
  return resumed;
}

export async function rescheduleReminder(id: string, dueAt: string) {
  const reminder = await updateHealthReminder(id, {
    dueAt,
    snoozedUntil: undefined,
  });
  if (reminder) {
    await createReminderActionLog({
      action: "rescheduled",
      actionSource: "in_app",
      profileId: reminder.profileId,
      reminderId: reminder.id,
    });
  }
  return reminder;
}

export async function generateRemindersFromSchedules(
  date: Date | string = new Date(),
) {
  const targetDate =
    typeof date === "string" ? new Date(`${date.slice(0, 10)}T12:00:00`) : date;
  const dateKey = toDateKey(targetDate);
  const isToday = dateKey === toDateKey(new Date());
  const generated: HealthReminder[] = [];

  if (isToday) {
    const [
      medicationSummary,
      supplementSummary,
      fitnessSummary,
      nutritionSummary,
    ] = await Promise.all([
      calculateTodayMedicationSchedule(),
      calculateTodaySupplementSchedule(),
      getTodayFitnessSummary(),
      getTodayNutritionSummary(),
    ]);

    medicationSummary.reminders.forEach((item) => {
      if (item.scheduledAt) {
        generated.push(
          makeGeneratedReminder({
            dueAt: item.scheduledAt,
            linkedEntityId: item.itemId,
            metadata: {
              itemId: item.itemId,
              scheduleId: item.scheduleId,
              scheduledAt: item.scheduledAt,
            },
            source: "medication_schedule",
            sourceId: `${item.scheduleId ?? item.itemId}:${item.scheduledAt}`,
            status: mapDoseStatus(item.status),
            title: item.itemName,
            type: "medication",
          }),
        );
      }
    });

    supplementSummary.reminders.forEach((item) => {
      if (item.scheduledAt) {
        generated.push(
          makeGeneratedReminder({
            dueAt: item.scheduledAt,
            linkedEntityId: item.itemId,
            metadata: {
              itemId: item.itemId,
              scheduleId: item.scheduleId,
              scheduledAt: item.scheduledAt,
            },
            source: "supplement_schedule",
            sourceId: `${item.scheduleId ?? item.itemId}:${item.scheduledAt}`,
            status: mapDoseStatus(item.status),
            title: item.itemName,
            type: "supplement",
          }),
        );
      }
    });

    if (!fitnessSummary.latestWorkout) {
      generated.push(
        makeGeneratedReminder({
          dueAt: atLocalTime(targetDate, 18, 0),
          source: "workout",
          sourceId: `${dateKey}:workout-plan`,
          title: "Workout check-in",
          type: "workout",
        }),
      );
    }

    if ((nutritionSummary.waterMl ?? 0) < 2000) {
      generated.push(
        makeGeneratedReminder({
          dueAt: atLocalTime(targetDate, 15, 0),
          source: "water",
          sourceId: `${dateKey}:water-check`,
          title: "Water check",
          type: "water",
        }),
      );
    }
  }

  const contraceptionMethods = await getContraceptionMethods();

  contraceptionMethods
    .filter((method) => method.nextDueAt?.slice(0, 10) === dateKey)
    .forEach((method) => {
      generated.push(
        makeGeneratedReminder({
          allDay: !method.nextDueAt?.includes("T"),
          dueAt: normalizeDateTime(method.nextDueAt ?? dateKey),
          linkedEntityId: method.id,
          metadata: {
            methodType: method.methodType,
            reminderEnabled: method.reminderEnabled,
          },
          source: "contraception",
          sourceId: `${method.id}:${method.nextDueAt}`,
          title: `${method.name} reminder`,
          type: "contraception",
        }),
      );
    });

  const [pregnancyProfile, pregnancyAppointments] = await Promise.all([
    getPregnancyProfile(),
    getPregnancyAppointments(),
  ]);

  if (pregnancyProfile?.status === "active") {
    pregnancyAppointments
      .filter((appointment) => appointment.scheduledAt.slice(0, 10) === dateKey)
      .forEach((appointment) => {
        generated.push(
          makeGeneratedReminder({
            allDay: !appointment.scheduledAt.includes("T"),
            dueAt: normalizeDateTime(appointment.scheduledAt),
            linkedEntityId: appointment.id,
            metadata: {
              appointmentType: appointment.appointmentType,
              pregnancyProfileId: appointment.pregnancyProfileId,
            },
            source: "pregnancy",
            sourceId: appointment.id,
            title: appointment.title,
            type: "pregnancy",
          }),
        );
      });

    const pregnancyWeek = await calculatePregnancyWeekSummary(pregnancyProfile);
    if (pregnancyWeek.estimatedDueDate?.slice(0, 10) === dateKey) {
      generated.push(
        makeGeneratedReminder({
          allDay: true,
          dueAt: allDayAt(dateKey),
          linkedEntityId: pregnancyProfile.id,
          metadata: {
            pregnancyProfileId: pregnancyProfile.id,
            sourceBasis: pregnancyWeek.sourceBasis,
          },
          source: "pregnancy",
          sourceId: `${pregnancyProfile.id}:due-date`,
          title: "Estimated due date",
          type: "pregnancy",
        }),
      );
    }
  }

  const babyProfiles = await getVisibleBabyProfilesForViewer();

  for (const profile of babyProfiles) {
    const [babyMedicineLogs, babyVaccines] = await Promise.all([
      getBabyMedicineLogs(profile.id),
      getBabyVaccineRecords(profile.id),
    ]);

    babyMedicineLogs
      .filter(
        (log) =>
          log.status === "due" && toDateKey(new Date(log.loggedAt)) === dateKey,
      )
      .forEach((log) => {
        generated.push(
          makeGeneratedReminder({
            dueAt: log.loggedAt,
            linkedEntityId: log.id,
            metadata: { childProfileId: profile.id },
            source: "baby_child",
            sourceId: `baby-medicine:${log.id}`,
            title: `${profile.displayName}: ${log.medicineName}`,
            type: "baby_child",
          }),
        );
      });

    babyVaccines
      .filter(
        (record) =>
          record.nextDoseDate &&
          toDateKey(new Date(record.nextDoseDate)) === dateKey,
      )
      .forEach((record) => {
        generated.push(
          makeGeneratedReminder({
            dueAt: `${record.nextDoseDate}T09:00:00`,
            linkedEntityId: record.id,
            metadata: { childProfileId: profile.id },
            source: "baby_child",
            sourceId: `baby-vaccine:${record.id}:${record.nextDoseDate}`,
            title: `${profile.displayName}: ${record.vaccineName}`,
            type: "baby_child",
          }),
        );
      });
  }

  const mensHealthReminders = await getMensHealthRemindersByRange(
    new Date(`${dateKey}T00:00:00`),
    new Date(`${dateKey}T23:59:59`),
  );

  mensHealthReminders.forEach((reminder) => {
    generated.push(
      makeGeneratedReminder({
        dueAt: normalizeDateTime(reminder.scheduledAt),
        linkedEntityId: reminder.id,
        metadata: {
          reminderType: reminder.reminderType,
        },
        source: "mens_health",
        sourceId: reminder.id,
        status:
          reminder.status === "completed"
            ? "completed"
            : calculateReminderDueStatus(reminder.scheduledAt),
        title: reminder.title,
        type: "mens_health",
      }),
    );
  });

  const [recordReminders, visits, vaccines, labs, prescriptions] =
    await Promise.all([
      getUpcomingRecordReminders(20),
      getDoctorVisits(),
      getVaccineRecords(),
      getLabResultRecords(),
      getPrescriptionRecords(),
    ]);

  recordReminders
    .filter((reminder) => reminder.reminderDate.slice(0, 10) === dateKey)
    .forEach((reminder) => {
      generated.push(
        makeGeneratedReminder({
          allDay: true,
          dueAt: allDayAt(dateKey),
          linkedEntityId: reminder.relatedRecordId ?? reminder.relatedVisitId,
          source: "health_record",
          sourceId: reminder.id,
          status:
            reminder.status === "done" || reminder.status === "dismissed"
              ? "completed"
              : calculateReminderDueStatus(allDayAt(dateKey)),
          title: reminder.title,
          type: recordReminderTypeToEventType(reminder.type),
        }),
      );
    });

  visits
    .filter(
      (visit) =>
        visit.visitDate?.slice(0, 10) === dateKey ||
        visit.followUpDate?.slice(0, 10) === dateKey,
    )
    .forEach((visit) => {
      generated.push(
        makeGeneratedReminder({
          allDay: !visit.visitDate?.includes("T"),
          dueAt: normalizeDateTime(
            visit.visitDate || visit.followUpDate || dateKey,
          ),
          linkedEntityId: visit.id,
          source: "doctor_visit",
          sourceId: visit.id,
          title: visit.title,
          type: "doctor_visit",
        }),
      );
    });

  vaccines
    .filter((vaccine) => vaccine.nextDoseDate?.slice(0, 10) === dateKey)
    .forEach((vaccine) => {
      generated.push(
        makeGeneratedReminder({
          allDay: true,
          dueAt: allDayAt(dateKey),
          linkedEntityId: vaccine.id,
          source: "vaccine",
          sourceId: vaccine.id,
          title: `${vaccine.vaccineName} next dose`,
          type: "vaccine",
        }),
      );
    });

  labs
    .filter((lab) => lab.followUpDate?.slice(0, 10) === dateKey)
    .forEach((lab) => {
      generated.push(
        makeGeneratedReminder({
          allDay: true,
          dueAt: allDayAt(dateKey),
          linkedEntityId: lab.id,
          source: "lab",
          sourceId: lab.id,
          title: `${lab.testName} review`,
          type: "lab_review",
        }),
      );
    });

  prescriptions
    .filter(
      (prescription) =>
        prescription.refillReminderDate?.slice(0, 10) === dateKey,
    )
    .forEach((prescription) => {
      generated.push(
        makeGeneratedReminder({
          allDay: true,
          dueAt: allDayAt(dateKey),
          linkedEntityId: prescription.id,
          source: "prescription",
          sourceId: prescription.id,
          title: `${prescription.title} refill`,
          type: "prescription_refill",
        }),
      );
    });

  return generated;
}

export function calculateReminderDueStatus(
  dueAt: string,
  snoozedUntil?: string,
): HealthReminderStatus {
  const compareAt = new Date(snoozedUntil ?? dueAt).getTime();
  const now = Date.now();

  if (snoozedUntil && compareAt > now) {
    return "snoozed";
  }

  if (compareAt > now) {
    return "upcoming";
  }

  if (now - compareAt < 60 * 60 * 1000) {
    return "due";
  }

  return "missed";
}

export function calculateReminderStatus(
  reminder: Pick<
    HealthReminder,
    "dueAt" | "pausedUntil" | "snoozedUntil" | "status"
  >,
) {
  if (
    reminder.status === "completed" ||
    reminder.status === "skipped" ||
    reminder.status === "cancelled"
  )
    return reminder.status;
  if (
    reminder.pausedUntil &&
    new Date(reminder.pausedUntil).getTime() > Date.now()
  )
    return "paused";
  return calculateReminderDueStatus(reminder.dueAt, reminder.snoozedUntil);
}

export function markReminderMissedIfPastThreshold(reminder: HealthReminder) {
  if (["completed", "skipped", "cancelled", "paused"].includes(reminder.status))
    return reminder;
  const thresholdMinutes =
    reminder.missedThresholdMinutes ??
    defaultMissedThresholdMinutes(
      reminder.category ?? reminderCategoryFromType(reminder.type),
    );
  if (thresholdMinutes <= 0) return reminder;
  return Date.now() - new Date(reminder.dueAt).getTime() >
    thresholdMinutes * 60 * 1000
    ? { ...reminder, status: "missed" as const }
    : reminder;
}

export async function updateOverdueReminders() {
  const stored = await readStoredReminders();
  const updated = stored.map((reminder) =>
    markReminderMissedIfPastThreshold({
      ...reminder,
      status: calculateReminderStatus(reminder),
    }),
  );
  await writeStoredReminders(sortReminders(updated));
  return updated;
}

export async function getCalendarDaySummaries(
  startDate: Date,
  endDate: Date,
): Promise<CalendarDaySummary[]> {
  const days = eachDate(startDate, endDate);

  return Promise.all(
    days.map(async (date) => {
      const dateKey = toDateKey(date);
      const reminders = await getRemindersForDate(date);

      return {
        completedCount: reminders.filter(
          (reminder) => reminder.status === "completed",
        ).length,
        date: dateKey,
        dueCount: reminders.filter(
          (reminder) =>
            reminder.status === "due" ||
            reminder.status === "upcoming" ||
            reminder.status === "snoozed",
        ).length,
        eventCount: reminders.length,
        hasAppointment: reminders.some(
          (reminder) => reminder.type === "doctor_visit",
        ),
        hasMedication: reminders.some(
          (reminder) => reminder.type === "medication",
        ),
        hasSupplement: reminders.some(
          (reminder) => reminder.type === "supplement",
        ),
        hasWorkout: reminders.some((reminder) => reminder.type === "workout"),
        missedCount: reminders.filter(
          (reminder) => reminder.status === "missed",
        ).length,
        nextReminder: reminders.find(
          (reminder) =>
            reminder.status === "due" || reminder.status === "upcoming",
        ),
        reminderCount: reminders.length,
      };
    }),
  );
}

export async function getNextHealthReminder() {
  const reminders = await getHealthReminders();

  return (
    reminders.find(
      (reminder) =>
        reminder.status === "due" ||
        reminder.status === "upcoming" ||
        reminder.status === "snoozed",
    ) ?? null
  );
}

export async function getHealthReminderWidgetValue(widgetKey: WidgetKey) {
  const [today, overdue, next] = await Promise.all([
    getRemindersForDate(new Date()),
    getOverdueReminders(),
    getNextHealthReminder(),
  ]);

  switch (widgetKey) {
    case "today_reminders":
    case "reminders_today":
      return today.length ? `${today.length} today` : "None today";
    case "next_reminder":
    case "reminder_next":
      return next?.title ?? "No reminder";
    case "overdue_items":
    case "overdue_reminders":
      return overdue.length ? `${overdue.length} due` : "None";
    case "upcoming_appointment": {
      const appointment = today.find(
        (reminder) => reminder.type === "doctor_visit",
      );
      return appointment?.title ?? "None";
    }
    case "medication_schedule":
    case "medication_due":
      return `${today.filter((reminder) => reminder.type === "medication").length} medication`;
    case "supplement_schedule":
    case "supplement_due":
      return `${today.filter((reminder) => reminder.type === "supplement").length} supplements`;
    case "workout_plan":
    case "workout_reminder":
      return (
        today.find((reminder) => reminder.type === "workout")?.title ??
        "No plan"
      );
    case "water_check":
    case "water_reminder":
      return (
        today.find((reminder) => reminder.type === "water")?.title ?? "Water"
      );
    case "contraception_next":
      return (
        today.find((reminder) => reminder.type === "contraception")?.title ??
        "None"
      );
    case "baby_reminder":
      return (
        today.find((reminder) => reminder.type === "baby_child")?.title ??
        "None"
      );
    case "appointment_reminder":
      return (
        today.find((reminder) => reminder.type === "doctor_visit")?.title ??
        "None"
      );
    case "caregiver_task":
      return (
        today.find((reminder) => reminder.category === "family_caregiver")
          ?.title ?? "None"
      );
    case "timeline_today":
      return `${today.length} items`;
    default:
      return "Calendar";
  }
}

export async function calculateHealthCalendarWidgetValue(widgetKey: WidgetKey) {
  return getHealthReminderWidgetValue(widgetKey);
}

async function setHealthReminderStatus(
  id: string,
  status: HealthReminderStatus,
) {
  const reminder = await getHealthReminderById(id);

  if (!reminder) {
    return null;
  }

  if (status === "completed") {
    if (reminder.type === "medication" || reminder.type === "supplement") {
      await markDoseTaken({
        itemId: String(
          reminder.metadata?.itemId ?? reminder.linkedEntityId ?? "",
        ),
        itemType: reminder.type,
        scheduleId: String(reminder.metadata?.scheduleId ?? ""),
        scheduledAt: reminder.metadata?.scheduledAt
          ? String(reminder.metadata.scheduledAt)
          : reminder.dueAt,
      });
    } else if (reminder.source === "health_record" && reminder.sourceId) {
      await markRecordReminderDone(reminder.sourceId);
    }
  }

  if (
    status === "skipped" &&
    (reminder.type === "medication" || reminder.type === "supplement")
  ) {
    await markDoseSkipped({
      itemId: String(
        reminder.metadata?.itemId ?? reminder.linkedEntityId ?? "",
      ),
      itemType: reminder.type,
      scheduleId: String(reminder.metadata?.scheduleId ?? ""),
      scheduledAt: reminder.metadata?.scheduledAt
        ? String(reminder.metadata.scheduledAt)
        : reminder.dueAt,
    });
  }

  const next = await upsertMaterializedReminder({
    ...reminder,
    status,
    updatedAt: new Date().toISOString(),
  });
  if (
    status === "completed" ||
    status === "skipped" ||
    status === "cancelled"
  ) {
    await cancelNotificationsForReminder(id);
  }
  await createReminderActionLog({
    action:
      status === "completed"
        ? "completed"
        : status === "skipped"
          ? "skipped"
          : "dismissed",
    actionSource: "in_app",
    profileId: next?.profileId,
    reminderId: id,
  });
  return next;
}

export async function generateRepeatingReminderInstances(
  reminder: HealthReminder,
  windowDays = 7,
) {
  if (reminder.repeatFrequency === "none") return [reminder];
  const instances: HealthReminder[] = [];
  const start = new Date(reminder.dueAt);
  const end = new Date();
  end.setDate(end.getDate() + windowDays);
  let cursor = new Date(start);
  let index = 0;

  while (cursor.getTime() <= end.getTime() && instances.length < 60) {
    if (cursor.getTime() >= Date.now() - 24 * 60 * 60 * 1000) {
      instances.push({
        ...reminder,
        dueAt: cursor.toISOString(),
        id: `${reminder.id}:repeat:${index}`,
        sourceId: `${reminder.sourceId ?? reminder.id}:repeat:${index}`,
      });
    }
    cursor = nextRepeatDate(
      cursor,
      reminder.repeatFrequency,
      reminder.repeatRule,
    );
    index += 1;
  }
  return instances;
}

export function preventDuplicateReminders(reminders: HealthReminder[]) {
  return mergeReminders(reminders);
}

export async function checkReminderPermissions(reminder: HealthReminder) {
  return canScheduleReminderForUser(reminder);
}

export async function reconcileScheduledNotifications() {
  await updateOverdueReminders();
  const [reminders, scheduledRecords, scheduledNotifications] =
    await Promise.all([
      getHealthReminders(),
      getScheduledNotificationRecords(),
      getScheduledNotifications(),
    ]);
  const activeReminderIds = new Set(reminders.map((reminder) => reminder.id));
  const scheduledNotificationIds = new Set(
    scheduledNotifications
      .map((notification: { identifier?: string }) => notification.identifier)
      .filter(Boolean),
  );
  let scheduledCount = 0;
  let orphanCount = 0;

  for (const record of scheduledRecords) {
    if (!activeReminderIds.has(record.reminderId)) {
      orphanCount += 1;
    }
  }

  for (const reminder of reminders) {
    if (
      !reminder.notificationEnabled ||
      reminder.status === "completed" ||
      reminder.status === "skipped" ||
      reminder.status === "cancelled" ||
      reminder.status === "paused"
    )
      continue;
    const hasScheduledRecord = scheduledRecords.some(
      (record) =>
        record.reminderId === reminder.id &&
        record.status === "scheduled" &&
        (!record.notificationId ||
          scheduledNotificationIds.has(record.notificationId)),
    );
    if (!hasScheduledRecord && canScheduleReminderForUser(reminder)) {
      await scheduleReminderNotification(reminder);
      scheduledCount += 1;
    }
  }

  return {
    activeReminders: reminders.length,
    lastReconciledAt: new Date().toISOString(),
    orphanCount,
    scheduledCount,
    scheduledNotifications: scheduledNotifications.length,
  };
}

export async function scheduleNextReminderInstance(reminder: HealthReminder) {
  return reminder.notificationEnabled
    ? scheduleReminderNotification(reminder)
    : null;
}

export async function scheduleRollingReminderWindow(windowDays = 7) {
  const reminders = await getRemindersForDateRange(
    new Date(),
    addDays(new Date(), windowDays),
  );
  const scheduled = await Promise.all(
    reminders
      .filter((reminder) => reminder.notificationEnabled)
      .map(scheduleReminderNotification),
  );
  return scheduled.length;
}

export const reconcileReminderStateOnAppStart = reconcileScheduledNotifications;
export const reconcileReminderStateOnForeground =
  reconcileScheduledNotifications;
export const reconcileReminderStateAfterProfileSwitch =
  reconcileScheduledNotifications;

async function upsertMaterializedReminder(reminder: HealthReminder) {
  const stored = await readStoredReminders();
  const exists = stored.some((item) => item.id === reminder.id);
  const next = exists
    ? stored.map((item) => (item.id === reminder.id ? reminder : item))
    : [reminder, ...stored];

  await writeStoredReminders(sortReminders(next));

  return reminder;
}

async function getLegacyHealthReminders(): Promise<HealthReminder[]> {
  try {
    const reminders = await getLegacyReminders();

    return reminders.map((reminder) =>
      makeGeneratedReminder({
        dueAt: reminder.dueAt,
        linkedEntityId: reminder.linkedEntityId,
        metadata: reminder.metadata,
        source: "legacy",
        sourceId: reminder.id,
        status:
          reminder.status === "completed"
            ? "completed"
            : reminder.status === "skipped"
              ? "skipped"
              : reminder.status === "cancelled"
                ? "cancelled"
                : calculateReminderDueStatus(reminder.dueAt),
        title: reminder.title,
        type: legacyTypeToEventType(reminder.type),
      }),
    );
  } catch {
    return [];
  }
}

function makeGeneratedReminder(input: {
  allDay?: boolean;
  dueAt: string;
  linkedEntityId?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  source: HealthReminder["source"];
  sourceId: string;
  status?: HealthReminderStatus;
  title: string;
  type: HealthEventType;
}): HealthReminder {
  const now = new Date().toISOString();

  return {
    allDay: Boolean(input.allDay),
    category: reminderCategoryFromType(input.type),
    createdAt: now,
    detailLevel: undefined,
    dueAt: input.dueAt,
    id: `generated-${input.source}-${input.sourceId}`,
    isPrivate: true,
    linkedEntityId: input.linkedEntityId,
    linkedEntityType: input.type,
    lockedPrivate: true,
    metadata: input.metadata,
    notificationEnabled: false,
    profileId: LOCAL_PROFILE_ID,
    quietHoursBehavior: "delay",
    repeatFrequency: "none",
    route: routeForEventType(input.type),
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    source: input.source,
    sourceId: input.sourceId,
    sourceRealm: input.source,
    sourceType: input.source,
    status: input.status ?? calculateReminderDueStatus(input.dueAt),
    title: input.title,
    type: input.type,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
}

function mergeReminders(reminders: HealthReminder[]) {
  const byKey = new Map<string, HealthReminder>();

  reminders.forEach((reminder) => {
    const key = reminder.sourceId
      ? `${reminder.source}:${reminder.sourceId}`
      : reminder.id;
    const existing = byKey.get(key);

    if (!existing || existing.source !== "manual") {
      byKey.set(key, {
        ...reminder,
        status:
          reminder.status === "completed" ||
          reminder.status === "skipped" ||
          reminder.status === "cancelled" ||
          reminder.status === "paused"
            ? reminder.status
            : calculateReminderStatus(reminder),
      });
    }
  });

  return sortReminders(Array.from(byKey.values()));
}

function dedupeBySource(reminders: HealthReminder[], reminder: HealthReminder) {
  if (!reminder.sourceId) {
    return reminders;
  }

  return reminders.filter(
    (item) =>
      !(item.source === reminder.source && item.sourceId === reminder.sourceId),
  );
}

async function readStoredReminders() {
  try {
    const stored = await AsyncStorage.getItem(HEALTH_REMINDERS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? (parsed as HealthReminder[]) : [];
  } catch {
    return [];
  }
}

async function writeStoredReminders(reminders: HealthReminder[]) {
  await AsyncStorage.setItem(
    HEALTH_REMINDERS_STORAGE_KEY,
    JSON.stringify(reminders),
  );

  return reminders;
}

function sortReminders(reminders: HealthReminder[]) {
  return [...reminders].sort(
    (left, right) =>
      new Date(left.snoozedUntil ?? left.dueAt).getTime() -
      new Date(right.snoozedUntil ?? right.dueAt).getTime(),
  );
}

function mapDoseStatus(status: string): HealthReminderStatus {
  switch (status) {
    case "taken":
      return "completed";
    case "skipped":
      return "skipped";
    case "missed":
      return "missed";
    case "snoozed":
      return "snoozed";
    case "due":
      return "due";
    default:
      return "upcoming";
  }
}

function legacyTypeToEventType(type: string): HealthEventType {
  switch (type) {
    case "medication":
      return "medication";
    case "doctor_visit":
      return "doctor_visit";
    case "fitness":
      return "workout";
    case "food":
      return "meal";
    default:
      return "custom";
  }
}

function recordReminderTypeToEventType(type: string): HealthEventType {
  switch (type) {
    case "follow_up_visit":
      return "doctor_visit";
    case "prescription_refill":
      return "prescription_refill";
    case "next_vaccine_dose":
      return "vaccine";
    case "lab_review":
      return "lab_review";
    default:
      return "record";
  }
}

function reminderCategoryFromType(type: HealthEventType): ReminderCategory {
  switch (type) {
    case "medication":
      return "medication";
    case "supplement":
      return "supplement";
    case "contraception":
      return "contraception";
    case "pregnancy":
      return "pregnancy";
    case "mens_health":
      return "mens_health";
    case "water":
      return "water";
    case "workout":
      return "workout";
    case "meal":
      return "food_meal";
    case "biometric_log":
      return "biometric_log";
    case "baby_child":
      return "baby_medicine";
    case "doctor_visit":
      return "appointment";
    case "vaccine":
      return "vaccine";
    case "prescription_refill":
      return "prescription_refill";
    case "lab_review":
      return "lab_follow_up";
    case "womens_health":
      return "womens_health";
    case "record":
    case "health_note":
      return "records";
    default:
      return "custom";
  }
}

function defaultMissedThresholdMinutes(category: ReminderCategory) {
  switch (category) {
    case "medication":
      return 12 * 60;
    case "supplement":
      return 24 * 60;
    case "workout":
      return 24 * 60;
    case "water":
    case "baby_feeding":
      return 0;
    default:
      return 24 * 60;
  }
}

function nextRepeatDate(
  date: Date,
  repeatFrequency: HealthReminder["repeatFrequency"],
  repeatRule?: string,
) {
  const next = new Date(date);
  const interval = Number(repeatRule?.match(/\d+/)?.[0] ?? 1);

  switch (repeatFrequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "every_x_hours":
      next.setHours(next.getHours() + Math.max(1, interval));
      break;
    case "every_x_days":
      next.setDate(next.getDate() + Math.max(1, interval));
      break;
    case "specific_days":
    case "custom":
    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
}

function routeForEventType(type: HealthEventType) {
  switch (type) {
    case "medication":
      return "/medication";
    case "supplement":
      return "/supplements";
    case "contraception":
    case "womens_health":
      return "/cycle";
    case "pregnancy":
      return "/pregnancy";
    case "baby_child":
      return "/baby-child";
    case "water":
    case "meal":
      return "/food";
    case "workout":
      return "/fitness";
    case "doctor_visit":
    case "vaccine":
    case "prescription_refill":
    case "lab_review":
    case "record":
      return "/records";
    case "mens_health":
      return "/mens-health";
    default:
      return "/health-calendar";
  }
}

function eachDate(startDate: Date, endDate: Date) {
  const days: Date[] = [];
  const cursor = new Date(startDate);

  cursor.setHours(12, 0, 0, 0);

  while (cursor.getTime() <= endDate.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function normalizeDateTime(value: string) {
  if (value.includes("T")) {
    return new Date(value).toISOString();
  }

  return allDayAt(value.slice(0, 10));
}

function allDayAt(dateKey: string) {
  return `${dateKey}T09:00:00.000Z`;
}

function atLocalTime(date: Date, hours: number, minutes: number) {
  const next = new Date(date);

  next.setHours(hours, minutes, 0, 0);

  return next.toISOString();
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function clean(value?: string) {
  return value?.trim() || undefined;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
