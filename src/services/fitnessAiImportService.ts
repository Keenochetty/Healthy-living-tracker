import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "@/lib/supabase";
import {
  createCalendarEventForPlanDay,
  recordFitnessHistoryEvent,
  type PlanActivationOptions,
  type PlanSchedulePreviewDay,
} from "@/services/fitnessPlanActivationService";

const PREVIEW_KEY = "fitness_ai_import_preview_v1";

export type AiPlanContext = {
  audience?: string;
  dietPreference?: string;
  equipment?: string;
  goal?: string;
  intensity?: string;
  profileId?: string;
  safetyFlags?: string[];
  timeAvailable?: string;
};

export type NormalizedImportedPlan = {
  aiConfidence?: number;
  audience: string;
  description: string;
  dietStyle?: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  durationDays: number;
  equipment?: string[];
  estimatedMinutesPerSession?: number;
  goal?: string;
  originalSearchQuery?: string;
  planType: "workout" | "nutrition" | "hybrid" | "recovery" | "goal_path";
  reviewRequired: boolean;
  safetyFlags: string[];
  sourceDomain?: string;
  sourceLicenseNote?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  title: string;
  days: Array<{
    dayNumber: number;
    estimatedMinutes?: number;
    exercises?: Array<{
      muscleGroups?: string[];
      name: string;
      notes?: string;
      reps?: string;
      sets?: string;
      time?: string;
    }>;
    focus: string;
    meals?: Array<{
      caloriesEstimate?: number;
      carbsEstimate?: number;
      fatEstimate?: number;
      mealType: string;
      name: string;
      notes?: string;
      proteinEstimate?: number;
    }>;
    safetyNote?: string;
    title: string;
  }>;
};

export type AiPlanSearchResult = NormalizedImportedPlan & {
  id: string;
  reviewStatus: string;
};

export async function searchExternalPlans(
  query: string,
  context: AiPlanContext,
): Promise<AiPlanSearchResult[]> {
  const endpoint = process.env.EXPO_PUBLIC_FITNESS_AI_SEARCH_URL;
  let results: AiPlanSearchResult[] = [];
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        body: JSON.stringify({ context, query }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (response.ok) {
        const payload = await response.json();
        if (Array.isArray(payload.results))
          results = payload.results.map(
            (item: NormalizedImportedPlan, index: number) => ({
              ...item,
              id: `backend-${index}`,
              reviewStatus: item.reviewRequired
                ? "Review required"
                : "Structured review",
            }),
          );
      }
    } catch {
      results = [];
    }
  }
  if (!results.length) results = mockResults(query, context);
  await recordAiSearchLog({
    backendConfigured: Boolean(endpoint),
    context,
    query,
    resultCount: results.length,
  });
  return results;
}

export async function normalizePlanFromSearchResult(
  result: AiPlanSearchResult,
  context: AiPlanContext,
) {
  const safety = runSafetyChecks(result, context);
  return {
    ...result,
    reviewRequired: result.reviewRequired || safety.reviewRequired,
    safetyFlags: Array.from(new Set([...result.safetyFlags, ...safety.flags])),
  };
}

export function runSafetyChecks(
  plan: NormalizedImportedPlan,
  context: AiPlanContext,
) {
  const value = [
    plan.title,
    plan.description,
    plan.audience,
    plan.goal,
    plan.dietStyle,
    ...plan.safetyFlags,
    ...(context.safetyFlags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  const flags: string[] = [];
  for (const [pattern, label] of [
    [/pregnan/, "Pregnancy: seek professional guidance when needed"],
    [
      /postpartum/,
      "Postpartum: adjust to your body and seek professional guidance",
    ],
    [
      /child|teen/,
      "Age-aware review required; no supplements, max lifts, or extreme restriction",
    ],
    [
      /injur|pain|medical|diabetes|eating disorder/,
      "Health or injury caution: general guidance only",
    ],
    [
      /weight loss|keto|diet/,
      "Nutrition review: avoid extreme restriction and check ingredients",
    ],
    [/advanced|expert|extreme/, "Advanced intensity review required"],
  ] as Array<[RegExp, string]>)
    if (pattern.test(value)) flags.push(label);
  flags.push(
    "Stop for pain, dizziness, bleeding, unusual shortness of breath, or symptoms that feel unsafe. Seek professional advice when needed.",
  );
  return { flags, reviewRequired: flags.length > 1 };
}

export async function storePreview(plan: NormalizedImportedPlan) {
  await AsyncStorage.setItem(PREVIEW_KEY, JSON.stringify(plan));
}
export async function getStoredPreview(): Promise<NormalizedImportedPlan | null> {
  const value = await AsyncStorage.getItem(PREVIEW_KEY);
  return value ? JSON.parse(value) : null;
}
export async function clearStoredPreview() {
  await AsyncStorage.removeItem(PREVIEW_KEY);
}

export async function saveImportedPlanDraft(
  plan: NormalizedImportedPlan,
  context: AiPlanContext,
) {
  const user = await requireUser();
  const profileId = context.profileId || user.id;
  const planResult = await supabase
    .from("user_imported_plans")
    .insert({
      ai_confidence: plan.aiConfidence,
      audience: plan.audience,
      description: plan.description,
      diet_style: plan.dietStyle,
      difficulty: plan.difficulty,
      equipment: plan.equipment ?? [],
      goal: plan.goal,
      import_status: "ai_draft",
      normalized_plan_json: plan,
      original_search_query: plan.originalSearchQuery,
      profile_id: profileId,
      review_required: plan.reviewRequired,
      safety_flags: plan.safetyFlags,
      source_domain: plan.sourceDomain,
      source_license_note: plan.sourceLicenseNote,
      source_program_id: `ai-${Date.now()}`,
      source_title: plan.sourceTitle,
      source_url: plan.sourceUrl,
      start_date: tomorrowKey(),
      status: "draft",
      title: plan.title,
      user_editable: true,
      user_id: user.id,
      workout_time: "07:00",
      workout_weekdays: [1, 3, 5],
    })
    .select("id")
    .single();
  if (planResult.error || !planResult.data)
    throw planResult.error ?? new Error("Could not save draft");
  const importedPlanId = planResult.data.id;
  const rows = plan.days.map((day, index) => ({
    estimated_minutes:
      day.estimatedMinutes ?? plan.estimatedMinutesPerSession ?? 30,
    exercise_details: day.exercises ?? [],
    exercises: day.exercises?.map((item) => item.name) ?? [],
    focus: day.focus,
    imported_plan_id: importedPlanId,
    meals: day.meals ?? [],
    safety_note: day.safetyNote,
    scheduled_for: addDaysAtTime(index + 1, "07:00"),
    source_day_number: day.dayNumber,
    title: day.title,
  }));
  const daysResult = await supabase
    .from("user_imported_plan_days")
    .insert(rows);
  if (daysResult.error) {
    await supabase
      .from("user_imported_plans")
      .delete()
      .eq("id", importedPlanId);
    throw daysResult.error;
  }
  await recordFitnessHistoryEvent({
    eventType: "ai_plan_imported",
    importedPlanId,
    profileId,
    programId: `ai-${importedPlanId}`,
    userId: user.id,
  });
  return importedPlanId;
}

export async function getImportedPlans() {
  const user = await requireUser();
  return supabase
    .from("user_imported_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("import_status", "ai_draft")
    .order("created_at", { ascending: false });
}
export async function getImportedPlanById(importedPlanId: string) {
  const user = await requireUser();
  const [plan, days] = await Promise.all([
    supabase
      .from("user_imported_plans")
      .select("*")
      .eq("id", importedPlanId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("user_imported_plan_days")
      .select("*")
      .eq("imported_plan_id", importedPlanId)
      .order("source_day_number"),
  ]);
  return {
    days: days.data ?? [],
    error: plan.error ?? days.error,
    plan: plan.data,
  };
}
export async function updateImportedPlan(
  importedPlanId: string,
  updates: Record<string, unknown>,
) {
  const user = await requireUser();
  return supabase
    .from("user_imported_plans")
    .update(updates)
    .eq("id", importedPlanId)
    .eq("user_id", user.id);
}
export async function deleteImportedPlan(importedPlanId: string) {
  const user = await requireUser();
  return supabase
    .from("user_imported_plans")
    .delete()
    .eq("id", importedPlanId)
    .eq("user_id", user.id)
    .eq("status", "draft");
}
export async function removeImportedPlanDay(dayId: string) {
  return supabase.from("user_imported_plan_days").delete().eq("id", dayId);
}

export async function activateImportedPlan(
  importedPlanId: string,
  options: PlanActivationOptions,
) {
  const user = await requireUser();
  const { plan, days, error } = await getImportedPlanById(importedPlanId);
  if (error || !plan)
    return { data: null, error: error ?? new Error("Draft not found") };
  const createdIds: string[] = [];
  try {
    for (const [index, day] of days.entries()) {
      const preview: PlanSchedulePreviewDay = {
        dayNumber: day.source_day_number,
        durationMinutes: day.estimated_minutes,
        exercises: day.exercises ?? [],
        focus: day.focus,
        safetyNote: day.safety_note,
        setsReps: undefined,
        scheduledFor: scheduleOnWeekdays(
          options.startDate,
          options.workoutTime,
          options.workoutWeekdays,
          index,
        ),
      };
      const event = await createCalendarEventForPlanDay(preview, {
        importedPlanId,
        profileId: options.profileId || user.id,
        programId: importedPlanId,
        programTitle: plan.title,
        userId: user.id,
      });
      createdIds.push(event.id);
      const link = await supabase
        .from("user_plan_calendar_events")
        .insert({
          calendar_event_id: event.id,
          imported_plan_day_id: day.id,
          imported_plan_id: importedPlanId,
          user_id: user.id,
        });
      if (link.error) throw link.error;
    }
    const update = await supabase
      .from("user_imported_plans")
      .update({
        activated_at: new Date().toISOString(),
        import_status: "ai_activated",
        start_date: options.startDate,
        status: "active",
        workout_time: options.workoutTime,
        workout_weekdays: options.workoutWeekdays,
      })
      .eq("id", importedPlanId)
      .eq("user_id", user.id);
    if (update.error) throw update.error;
    await recordFitnessHistoryEvent({
      eventType: "plan_activated",
      importedPlanId,
      profileId: options.profileId || user.id,
      programId: importedPlanId,
      userId: user.id,
    });
    return { data: { calendarEventCount: createdIds.length }, error: null };
  } catch (activationError) {
    if (createdIds.length)
      await supabase.from("calendar_events").delete().in("id", createdIds);
    return { data: null, error: activationError };
  }
}

export async function recordAiSearchLog(payload: {
  backendConfigured: boolean;
  context: AiPlanContext;
  query: string;
  resultCount: number;
}) {
  try {
    const user = await requireUser();
    return supabase
      .from("ai_plan_search_logs")
      .insert({
        backend_configured: payload.backendConfigured,
        context: payload.context,
        profile_id: payload.context.profileId,
        query: payload.query,
        result_count: payload.resultCount,
        user_id: user.id,
      });
  } catch {
    return { error: null };
  }
}

function mockResults(
  query: string,
  context: AiPlanContext,
): AiPlanSearchResult[] {
  const lower = query.toLowerCase();
  const nutrition = /vegan|keto|meal|nutrition|vegetarian/.test(lower);
  const sensitive =
    /pregnan|postpartum|child|teen|injur|pain|weight loss|keto/.test(lower);
  const title = query.trim() || "Balanced fitness starter";
  const base: NormalizedImportedPlan = {
    aiConfidence: 0.72,
    audience:
      context.audience ??
      (lower.includes("teen")
        ? "Teens"
        : lower.includes("child")
          ? "Children"
          : "Adults"),
    description:
      "A summarized, editable plan generated from structured guidance. Review every day before use.",
    difficulty: lower.includes("advanced") ? "advanced" : "beginner",
    durationDays: lower.includes("28") ? 28 : 7,
    equipment: context.equipment ? [context.equipment] : ["Bodyweight"],
    estimatedMinutesPerSession: 30,
    goal: context.goal ?? title,
    originalSearchQuery: query,
    planType: nutrition
      ? "nutrition"
      : lower.includes("weight loss")
        ? "hybrid"
        : "workout",
    reviewRequired: sensitive,
    safetyFlags: sensitive
      ? ["Review required for audience, diet, or safety context"]
      : [],
    sourceDomain: "fallback.local",
    sourceLicenseNote:
      "Fallback structured example; no external protected text copied.",
    sourceTitle: "Safe fallback plan template",
    title,
    days: Array.from(
      { length: Math.min(lower.includes("28") ? 7 : 4, 7) },
      (_, index) => ({
        dayNumber: index + 1,
        estimatedMinutes: 30,
        exercises: nutrition
          ? undefined
          : [
              {
                muscleGroups: ["full_body"],
                name:
                  index % 2
                    ? "Gentle mobility flow"
                    : "Controlled full-body circuit",
                notes: "Adjust to your body.",
                time: "20-30 min",
              },
            ],
        focus: nutrition
          ? "Balanced training meals"
          : index % 2
            ? "Recovery and mobility"
            : "Full-body movement",
        meals: nutrition
          ? [
              {
                mealType: "Main meal",
                name: lower.includes("vegan")
                  ? "Plant-based recovery bowl"
                  : "Balanced training meal",
                notes: "Check ingredients and allergies.",
              },
            ]
          : undefined,
        safetyNote: sensitive
          ? "General guidance. Seek professional advice when needed."
          : undefined,
        title: `Day ${index + 1}`,
      }),
    ),
  };
  const checked = runSafetyChecks(base, context);
  return [
    {
      ...base,
      id: "fallback-1",
      reviewRequired: base.reviewRequired || checked.reviewRequired,
      reviewStatus: "Fallback review",
      safetyFlags: [...base.safetyFlags, ...checked.flags],
    },
  ];
}
function tomorrowKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}
function addDaysAtTime(days: number, time: string) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}
function scheduleOnWeekdays(
  startDate: string,
  time: string,
  weekdays: number[],
  offset: number,
) {
  let date = new Date(`${startDate}T00:00:00`);
  let found = -1;
  while (found < offset) {
    if (weekdays.includes(date.getDay())) found += 1;
    if (found < offset) date.setDate(date.getDate() + 1);
  }
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}
async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error("Sign in required");
  return data.user;
}
