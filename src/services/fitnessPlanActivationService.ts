import { FITNESS_WORKOUT_PROGRAMS } from "@/constants/fitnessRealmConfig";
import { EXERCISE_LIBRARY, PREBUILT_ROUTINES, getExerciseById } from "@/constants/workoutLibrary";
import { supabase } from "@/lib/supabase";
import { getWorkoutProgramDays, normalizeProgramDayContent, type FitnessProgramDayContent } from "@/services/fitnessContentService";
import type { AppReminder } from "@/types/reminders";

export type PlanActivationOptions = {
  calendarColor?: string;
  duplicateAnyway?: boolean;
  profileId?: string;
  reminderMinutes: number;
  restDayHandling: "skip" | "show";
  startDate: string;
  workoutTime: string;
  workoutWeekdays: number[];
};

export type PlanSchedulePreviewDay = FitnessProgramDayContent & {
  safetyNote?: string;
  scheduledFor: string;
};

export type ActiveFitnessPlan = {
  id: string;
  source_program_id: string;
  start_date: string;
  status: string;
  title: string;
};

export async function buildPlanSchedulePreview(programId: string, options: PlanActivationOptions) {
  const program = getProgram(programId);
  const { data } = await getWorkoutProgramDays(programId);
  const sourceDays = data?.length ? data.map((row) => normalizeProgramDayContent(row)) : fallbackProgramDays(programId);
  const workoutCount = Math.max(sourceDays.length, Math.ceil((program.days ?? 7) / 7) * (program.daysPerWeek ?? 3));
  const weekdays = options.workoutWeekdays.length ? [...options.workoutWeekdays].sort() : [1, 3, 5];
  const preview: PlanSchedulePreviewDay[] = [];
  let cursor = parseLocalDate(options.startDate);
  let attempts = 0;

  while (preview.length < workoutCount && preview.length < 40 && attempts < 370) {
    if (weekdays.includes(cursor.getDay())) {
      const source = sourceDays[preview.length % sourceDays.length];
      preview.push({
        ...source,
        dayNumber: preview.length + 1,
        safetyNote: source.safetyNote ?? programSafetyNote(programId),
        scheduledFor: combineDateAndTime(cursor, options.workoutTime).toISOString(),
      });
    }
    cursor = addDays(cursor, 1);
    attempts += 1;
  }
  return preview;
}

export async function getActiveFitnessPlans() {
  const user = await requireUser();
  return supabase.from("user_imported_plans").select("*").eq("user_id", user.id).eq("status", "active").order("activated_at", { ascending: false });
}

export async function activateProgramPlan(programId: string, options: PlanActivationOptions) {
  const user = await requireUser();
  const program = getProgram(programId);
  const profileId = options.profileId || user.id;
  const duplicate = await supabase.from("user_imported_plans").select("id,title,status").eq("user_id", user.id).eq("source_program_id", programId).eq("status", "active").limit(1).maybeSingle();
  if (duplicate.data && !options.duplicateAnyway) return { duplicate: duplicate.data, error: null };

  const preview = await buildPlanSchedulePreview(programId, options);
  const createdCalendarIds: string[] = [];
  let importedPlanId = "";

  try {
    const planResult = await supabase.from("user_imported_plans").insert({
      calendar_color: options.calendarColor,
      profile_id: profileId,
      reminder_minutes: options.reminderMinutes,
      rest_day_handling: options.restDayHandling,
      source_program_id: programId,
      start_date: options.startDate,
      status: "active",
      title: program.title,
      user_id: user.id,
      workout_time: options.workoutTime,
      workout_weekdays: options.workoutWeekdays,
    }).select("id").single();
    if (planResult.error || !planResult.data) throw planResult.error ?? new Error("Could not create imported plan");
    importedPlanId = planResult.data.id;

    const dayResult = await supabase.from("user_imported_plan_days").insert(preview.map((day) => ({
      estimated_minutes: day.durationMinutes,
      exercises: day.exercises,
      focus: day.focus,
      imported_plan_id: importedPlanId,
      safety_note: day.safetyNote,
      scheduled_for: day.scheduledFor,
      source_day_number: day.dayNumber,
    }))).select("id,source_day_number,scheduled_for");
    if (dayResult.error || !dayResult.data) throw dayResult.error ?? new Error("Could not create imported plan days");

    for (const importedDay of dayResult.data) {
      const previewDay = preview.find((day) => day.dayNumber === importedDay.source_day_number)!;
      const event = await createCalendarEventForPlanDay(previewDay, {
        importedPlanId,
        profileId,
        programId,
        programTitle: program.title,
        userId: user.id,
      });
      createdCalendarIds.push(event.id);
      const link = await supabase.from("user_plan_calendar_events").insert({
        calendar_event_id: event.id,
        imported_plan_day_id: importedDay.id,
        imported_plan_id: importedPlanId,
        user_id: user.id,
      });
      if (link.error) throw link.error;
    }
    const historyResult = await recordFitnessHistoryEvent({ eventType: "plan_activated", importedPlanId, profileId, programId, userId: user.id });
    if (historyResult.error) throw historyResult.error;
    return { data: { importedPlanId, calendarEventCount: createdCalendarIds.length }, duplicate: null, error: null };
  } catch (error) {
    if (createdCalendarIds.length) await supabase.from("calendar_events").delete().in("id", createdCalendarIds);
    if (importedPlanId) await supabase.from("user_imported_plans").delete().eq("id", importedPlanId);
    return { data: null, duplicate: null, error };
  }
}

export async function createCalendarEventForPlanDay(day: PlanSchedulePreviewDay, options: { importedPlanId: string; profileId: string; programId: string; programTitle: string; userId: string }) {
  const startsAt = new Date(day.scheduledFor);
  const endsAt = new Date(startsAt.getTime() + day.durationMinutes * 60_000);
  const description = [
    `Program: ${options.programTitle}`,
    `Day ${day.dayNumber}: ${day.focus}`,
    `Exercises: ${day.exercises.slice(0, 6).join(", ") || "See program details"}`,
    day.safetyNote ? `Safety: ${day.safetyNote}` : "",
    `Route: /fitness/program/${options.programId}`,
    `Imported plan: ${options.importedPlanId}`,
  ].filter(Boolean).join("\n");
  const result = await supabase.from("calendar_events").insert({
    calendar_type: "personal",
    created_by: options.userId,
    created_by_user_id: options.userId,
    description,
    end_time: endsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    event_type: "family_event",
    is_sensitive: false,
    notes: description,
    privacy_level: "private",
    profile_id: options.profileId,
    requires_approval: false,
    share_with_caregiver: false,
    share_with_family: false,
    start_time: startsAt.toISOString(),
    starts_at: startsAt.toISOString(),
    status: "pending",
    title: `Workout: Day ${day.dayNumber} - ${day.focus}`,
  }).select("id").single();
  if (result.error || !result.data) throw result.error ?? new Error("Could not create calendar event");
  return result.data;
}

export async function deactivateFitnessPlan(importedPlanId: string, options: { removeFutureEvents: boolean }) {
  const user = await requireUser();
  if (options.removeFutureEvents) {
    const links = await supabase.from("user_plan_calendar_events").select("calendar_event_id").eq("user_id", user.id).eq("imported_plan_id", importedPlanId);
    const ids = links.data?.map((item) => item.calendar_event_id) ?? [];
    if (ids.length) await supabase.from("calendar_events").delete().in("id", ids).gte("start_time", new Date().toISOString());
  }
  const result = await supabase.from("user_imported_plans").update({ deactivated_at: new Date().toISOString(), status: "cancelled" }).eq("id", importedPlanId).eq("user_id", user.id);
  if (!result.error) await recordFitnessHistoryEvent({ eventType: "plan_deactivated", importedPlanId, userId: user.id });
  return result;
}

export async function recordFitnessHistoryEvent(payload: { eventType: string; importedPlanId?: string; profileId?: string; programId?: string; userId?: string }) {
  const userId = payload.userId ?? (await requireUser()).id;
  return supabase.from("user_fitness_history").insert({
    event_type: payload.eventType,
    imported_plan_id: payload.importedPlanId,
    metadata: { source: "fitness_plan_activation" },
    profile_id: payload.profileId,
    source_program_id: payload.programId,
    user_id: userId,
  });
}

export async function getFitnessCalendarReminders(): Promise<AppReminder[]> {
  try {
    const user = await requireUser();
    const { data } = await supabase.from("calendar_events").select("id,title,description,start_time,end_time,created_at,updated_at").eq("created_by", user.id).ilike("title", "Workout:%").order("start_time");
    return (data ?? []).map((event) => ({
      createdAt: event.created_at,
      dueAt: event.start_time,
      id: `calendar-event-${event.id}`,
      metadata: { calendarEventId: event.id, endAt: event.end_time, category: "workout" },
      notes: event.description,
      notify: false,
      priority: "normal",
      status: "pending",
      title: event.title,
      type: "fitness",
      updatedAt: event.updated_at,
    }));
  } catch {
    return [];
  }
}

function getProgram(programId: string) {
  return FITNESS_WORKOUT_PROGRAMS.find((item) => item.id === programId) ?? FITNESS_WORKOUT_PROGRAMS[0];
}

function fallbackProgramDays(programId: string): FitnessProgramDayContent[] {
  const program = getProgram(programId);
  const routine = PREBUILT_ROUTINES.find((item) => item.id === program.routineId) ?? PREBUILT_ROUTINES[0];
  return [{
    dayNumber: 1,
    durationMinutes: routine.durationMinutes,
    exercises: routine.exerciseIds.map((id) => getExerciseById(id)?.name ?? id),
    focus: routine.name,
    safetyNote: programSafetyNote(programId),
    setsReps: "3 controlled sets per movement",
  }];
}

function programSafetyNote(programId: string) {
  const program = getProgram(programId);
  const value = `${program.title} ${program.goal} ${program.audience} ${program.level}`.toLowerCase();
  return /pregnan|postpartum|injur|advanced|weight loss/.test(value)
    ? "General guidance. Adjust to your body, stop if something feels unsafe, and seek professional advice when needed."
    : undefined;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (Number.isFinite(parsed.getTime())) return parsed;
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(0, 0, 0, 0);
  return fallback;
}
function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  return next;
}
function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error("Sign in required");
  return data.user;
}
