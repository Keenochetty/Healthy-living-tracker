import {
  getNutritionDailyNote,
  getNutritionEntriesByDate,
  getWaterLogsByDate,
} from "@/lib/nutritionStorage";
import { getWorkoutSessions } from "@/lib/fitnessStorage";
import { getDoseLogsByDate } from "@/lib/medicationSupplementStorage";
import { getBiometricLogsByDateRange } from "@/lib/biometricsStorage";
import {
  getDoctorVisits,
  getHealthRecords,
  getLabResultRecords,
  getPrescriptionRecords,
  getVaccineRecords,
} from "@/lib/healthRecordsStorage";
import { getSyncedHealthSamplesByDateRange } from "@/services/healthSync/healthSyncService";
import {
  getContraceptionLogs,
  getMoodEnergyLogs,
  getPeriodLogs,
  getSymptomLogs,
} from "@/lib/womensHealthStorage";
import {
  calculatePregnancyWeekSummary,
  getPregnancyAppointments,
  getPregnancyProfile,
  getPregnancyQuestions,
  getPregnancySymptomsByRange,
} from "@/lib/pregnancyStorage";
import { generateBabyCalendarEvents } from "@/lib/babyChildStorage";
import { getMensHealthTimelineEvents } from "@/lib/mensHealthStorage";
import type {
  HealthEventType,
  HealthTimelineEvent,
  TodayTimelineSummary,
} from "@/types/healthTimeline";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";

export async function getHealthTimelineEvents(
  startDate = startOfDay(new Date()),
  endDate = endOfDay(new Date()),
) {
  return getTimelineEventsByDateRange(startDate, endDate);
}

export async function getTimelineEventsByDateRange(
  startDate: Date,
  endDate: Date,
) {
  return generateTimelineEventsFromLocalData(startDate, endDate);
}

export async function generateTimelineEventsFromLocalData(
  startDate: Date,
  endDate: Date,
) {
  const events: HealthTimelineEvent[] = [];
  const days = eachDate(startDate, endDate);
  const [
    workoutSessions,
    biometricLogs,
    healthRecords,
    doctorVisits,
    vaccineRecords,
    labResults,
    prescriptions,
    syncedSamples,
    periodLogs,
    symptomLogs,
    moodEnergyLogs,
    contraceptionLogs,
    pregnancyProfile,
    pregnancyAppointments,
    pregnancySymptoms,
    pregnancyQuestions,
    babyEvents,
    mensHealthEvents,
  ] = await Promise.all([
    getWorkoutSessions(),
    getBiometricLogsByDateRange("all", startDate, endDate),
    getHealthRecords(),
    getDoctorVisits(),
    getVaccineRecords(),
    getLabResultRecords(),
    getPrescriptionRecords(),
    getSyncedHealthSamplesByDateRange("all", { startDate, endDate }),
    getPeriodLogs(),
    getSymptomLogs(),
    getMoodEnergyLogs(),
    getContraceptionLogs(),
    getPregnancyProfile(),
    getPregnancyAppointments(),
    getPregnancySymptomsByRange(startDate, endDate),
    getPregnancyQuestions(),
    generateBabyCalendarEvents(startDate, endDate),
    getMensHealthTimelineEvents(startDate, endDate),
  ]);

  for (const day of days) {
    const dateKey = toDateKey(day);
    const [entries, waterLogs, medicationLogs, supplementLogs, dailyNote] =
      await Promise.all([
        getNutritionEntriesByDate(dateKey),
        getWaterLogsByDate(dateKey),
        getDoseLogsByDate(dateKey, "medication"),
        getDoseLogsByDate(dateKey, "supplement"),
        getNutritionDailyNote(dateKey),
      ]);

    entries.forEach((entry) => {
      events.push(
        normalizeTimelineEvent({
          description: `${Math.round(entry.calories)} kcal`,
          eventAt: entry.createdAt,
          source: "nutrition_diary",
          sourceId: entry.id,
          title: entry.foodName,
          type: entry.mealGroup === "supplements" ? "supplement" : "meal",
        }),
      );
    });

    waterLogs.forEach((log) => {
      events.push(
        normalizeTimelineEvent({
          description: `${log.amountMl} ml`,
          eventAt: log.loggedAt,
          source: "water_log",
          sourceId: log.id,
          title: "Water logged",
          type: "water",
        }),
      );
    });

    medicationLogs.forEach((log) => {
      events.push(
        normalizeTimelineEvent({
          description: statusLabel(log.status),
          eventAt: log.takenAt ?? log.scheduledAt ?? log.createdAt,
          source: "dose_log",
          sourceId: log.id,
          title: "Medication log",
          type: "medication",
        }),
      );
    });

    supplementLogs.forEach((log) => {
      events.push(
        normalizeTimelineEvent({
          description: statusLabel(log.status),
          eventAt: log.takenAt ?? log.scheduledAt ?? log.createdAt,
          source: "dose_log",
          sourceId: log.id,
          title: "Supplement log",
          type: "supplement",
        }),
      );
    });

    if (dailyNote?.note) {
      events.push(
        normalizeTimelineEvent({
          description: dailyNote.note,
          eventAt: dailyNote.updatedAt ?? dailyNote.createdAt,
          source: "nutrition_note",
          sourceId: dailyNote.id,
          title: "Nutrition note",
          type: "health_note",
        }),
      );
    }
  }

  workoutSessions
    .filter((session) => isWithinRange(session.startedAt, startDate, endDate))
    .forEach((session) => {
      events.push(
        normalizeTimelineEvent({
          description: session.completed
            ? "Completed workout"
            : "Workout session",
          eventAt: session.startedAt,
          source: "workout_session",
          sourceId: session.id,
          title: session.title,
          type: "workout",
        }),
      );
    });

  biometricLogs.forEach((log) => {
    events.push(
      normalizeTimelineEvent({
        description: [
          log.label,
          log.value !== undefined
            ? `${log.value}${log.unit ? ` ${log.unit}` : ""}`
            : undefined,
        ]
          .filter(Boolean)
          .join(" - "),
        eventAt: log.loggedAt,
        source: "biometric_log",
        sourceId: log.id,
        title: formatType(log.type),
        type: "biometric_log",
      }),
    );
  });

  periodLogs
    .filter((log) => isWithinRange(log.date, startDate, endDate))
    .forEach((log) => {
      events.push(
        normalizeTimelineEvent({
          description: `Flow: ${formatType(log.flowLevel)}`,
          eventAt: log.date,
          source: "womens_health_period",
          sourceId: log.id,
          title: "Period log",
          type: "womens_health",
        }),
      );
    });

  symptomLogs
    .filter((log) => isWithinRange(log.date, startDate, endDate))
    .forEach((log) => {
      events.push(
        normalizeTimelineEvent({
          description: `${formatType(log.severity)}${log.notes ? ` - ${log.notes}` : ""}`,
          eventAt: log.date,
          source: "womens_health_symptom",
          sourceId: log.id,
          title: log.symptom,
          type: "womens_health",
        }),
      );
    });

  moodEnergyLogs
    .filter((log) => isWithinRange(log.date, startDate, endDate))
    .forEach((log) => {
      events.push(
        normalizeTimelineEvent({
          description: [
            log.mood,
            log.energyLevel !== undefined
              ? `Energy ${log.energyLevel}`
              : undefined,
          ]
            .filter(Boolean)
            .join(" - "),
          eventAt: log.date,
          source: "womens_health_mood",
          sourceId: log.id,
          title: "Mood / energy log",
          type: "womens_health",
        }),
      );
    });

  contraceptionLogs
    .filter((log) => isWithinRange(log.eventAt, startDate, endDate))
    .forEach((log) => {
      events.push(
        normalizeTimelineEvent({
          description: log.notes,
          eventAt: log.eventAt,
          source: "contraception_log",
          sourceId: log.id,
          title: `Contraception ${formatType(log.eventType)}`,
          type: "contraception",
        }),
      );
    });

  if (pregnancyProfile?.status === "active") {
    pregnancyAppointments
      .filter((appointment) =>
        isWithinRange(appointment.scheduledAt, startDate, endDate),
      )
      .forEach((appointment) => {
        events.push(
          normalizeTimelineEvent({
            description: formatType(appointment.appointmentType),
            eventAt: appointment.scheduledAt,
            source: "pregnancy_appointment",
            sourceId: appointment.id,
            title: appointment.title,
            type: "pregnancy",
          }),
        );
      });

    pregnancySymptoms.forEach((symptom) => {
      events.push(
        normalizeTimelineEvent({
          description: [
            symptom.severity ? formatType(symptom.severity) : undefined,
            symptom.notes,
          ]
            .filter(Boolean)
            .join(" - "),
          eventAt: symptom.loggedAt,
          source: "pregnancy_symptom",
          sourceId: symptom.id,
          title: symptom.symptomKey,
          type: "pregnancy",
        }),
      );
    });

    pregnancyQuestions
      .filter((question) =>
        isWithinRange(question.createdAt, startDate, endDate),
      )
      .forEach((question) => {
        events.push(
          normalizeTimelineEvent({
            description: formatType(question.status),
            eventAt: question.createdAt,
            source: "pregnancy_question",
            sourceId: question.id,
            title: question.question,
            type: "pregnancy",
          }),
        );
      });

    const pregnancyWeek = await calculatePregnancyWeekSummary(pregnancyProfile);
    if (
      pregnancyWeek.estimatedDueDate &&
      isWithinRange(pregnancyWeek.estimatedDueDate, startDate, endDate)
    ) {
      events.push(
        normalizeTimelineEvent({
          description: "Estimated date based on entered information",
          eventAt: pregnancyWeek.estimatedDueDate,
          source: "pregnancy_due_date",
          sourceId: pregnancyProfile.id,
          title: "Estimated due date",
          type: "pregnancy",
        }),
      );
    }
  }

  healthRecords
    .filter((record) => isWithinRange(record.createdAt, startDate, endDate))
    .forEach((record) => {
      events.push(
        normalizeTimelineEvent({
          description: formatType(record.type),
          eventAt: record.createdAt,
          source: "health_record",
          sourceId: record.id,
          title: record.title,
          type: record.type === "health_note" ? "health_note" : "record",
        }),
      );
    });

  doctorVisits
    .filter((visit) => isWithinRange(visit.visitDate, startDate, endDate))
    .forEach((visit) => {
      events.push(
        normalizeTimelineEvent({
          description: visit.clinicName,
          eventAt: normalizeDateTime(visit.visitDate),
          source: "doctor_visit",
          sourceId: visit.id,
          title: visit.title,
          type: "doctor_visit",
        }),
      );
    });

  vaccineRecords
    .filter((record) => isWithinRange(record.dateReceived, startDate, endDate))
    .forEach((record) => {
      events.push(
        normalizeTimelineEvent({
          description: record.doseNumber,
          eventAt: normalizeDateTime(record.dateReceived),
          source: "vaccine_record",
          sourceId: record.id,
          title: record.vaccineName,
          type: "vaccine",
        }),
      );
    });

  labResults
    .filter((record) => isWithinRange(record.testDate, startDate, endDate))
    .forEach((record) => {
      events.push(
        normalizeTimelineEvent({
          description: "Lab result recorded",
          eventAt: normalizeDateTime(record.testDate),
          source: "lab_result",
          sourceId: record.id,
          title: record.testName,
          type: "lab_review",
        }),
      );
    });

  prescriptions
    .filter(
      (record) =>
        record.dateIssued &&
        isWithinRange(record.dateIssued, startDate, endDate),
    )
    .forEach((record) => {
      events.push(
        normalizeTimelineEvent({
          description: record.provider,
          eventAt: normalizeDateTime(record.dateIssued ?? record.createdAt),
          source: "prescription_record",
          sourceId: record.id,
          title: record.title,
          type: "prescription_refill",
        }),
      );
    });

  syncedSamples.forEach((sample) => {
    events.push(
      normalizeTimelineEvent({
        description: `${sample.value}${sample.unit ? ` ${sample.unit}` : ""}`,
        eventAt: sample.startTime,
        source: "device_sync",
        sourceId: sample.id,
        title: `Synced ${formatType(sample.dataType)}`,
        type: "device_sync",
      }),
    );
  });

  babyEvents.forEach((event) => {
    events.push(
      normalizeTimelineEvent({
        description: "Baby / Child event based on your logs.",
        eventAt: event.eventAt,
        source: "baby_child",
        sourceId: event.relatedId ?? event.id,
        title: event.label,
        type: "baby_child",
      }),
    );
  });

  mensHealthEvents.forEach((event) => {
    events.push(
      normalizeTimelineEvent({
        description: "Private Men’s Health event based on your logs.",
        eventAt: event.eventAt,
        source: "mens_health",
        sourceId: event.id,
        title: event.title,
        type: "mens_health",
      }),
    );
  });

  return events.sort(
    (left, right) =>
      new Date(right.eventAt).getTime() - new Date(left.eventAt).getTime(),
  );
}

export function normalizeTimelineEvent(input: {
  description?: string;
  eventAt: string;
  linkedEntityId?: string;
  linkedEntityType?: HealthEventType;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  source: string;
  sourceId?: string;
  title: string;
  type: HealthEventType;
}): HealthTimelineEvent {
  return {
    createdAt: new Date().toISOString(),
    description: input.description,
    eventAt: normalizeDateTime(input.eventAt),
    id: `timeline-${input.source}-${input.sourceId ?? input.eventAt}`,
    isPrivate: true,
    linkedEntityId: input.linkedEntityId,
    linkedEntityType: input.linkedEntityType,
    lockedPrivate: true,
    metadata: input.metadata,
    profileId: LOCAL_PROFILE_ID,
    source: input.source,
    sourceId: input.sourceId,
    title: input.title,
    type: input.type,
    userId: LOCAL_USER_ID,
  };
}

export async function getTodayTimelineSummary(): Promise<TodayTimelineSummary> {
  const events = await getTimelineEventsByDateRange(
    startOfDay(new Date()),
    endOfDay(new Date()),
  );

  return {
    latestEvent: events[0],
    totalEvents: events.length,
  };
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
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function isWithinRange(
  value: string | undefined,
  startDate: Date,
  endDate: Date,
) {
  if (!value) return false;
  const time = new Date(normalizeDateTime(value)).getTime();

  return time >= startDate.getTime() && time <= endDate.getTime();
}

function normalizeDateTime(value: string) {
  if (value.includes("T")) {
    return new Date(value).toISOString();
  }

  return `${value.slice(0, 10)}T09:00:00.000Z`;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusLabel(value: string) {
  return formatType(value);
}
