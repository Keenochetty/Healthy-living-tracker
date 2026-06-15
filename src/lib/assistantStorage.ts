import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createBabyDiaperLog,
  createBabyFeedingLog,
  getVisibleBabyProfilesForViewer,
} from "@/lib/babyChildStorage";
import {
  completeWorkoutSession,
  getTodayFitnessSummary,
  createWorkoutSession,
} from "@/lib/fitnessStorage";
import {
  canViewProfileRealm,
  createHealthAuditLog,
  getActiveProfile,
  getPermissionCategoryForWidget,
} from "@/lib/familyPermissionsStorage";
import {
  createHealthRecord,
  getHealthRecords,
} from "@/lib/healthRecordsStorage";
import { createDoseLog } from "@/lib/medicationSupplementStorage";
import {
  createMensHealthQuestion,
  getMensHealthReportSummary,
} from "@/lib/mensHealthStorage";
import {
  createNutritionEntry,
  getTodayNutritionSummary,
  toNutritionDateKey,
} from "@/lib/nutritionStorage";
import {
  createPregnancyQuestion,
  getPregnancyProfile,
} from "@/lib/pregnancyStorage";
import {
  getSourceCardsForTopic as getGovernedSourceCardsForTopic,
  logAiContentUsage,
} from "@/lib/trustedContentStorage";
import { createHealthReminder } from "@/services/reminders/reminderEngine";
import {
  createPeriodLog,
  createSymptomLog,
  getWomensHealthTodaySummary,
} from "@/lib/womensHealthStorage";
import type { PermissionCategory } from "@/types/familyPermissions";
import type {
  HealthContentRealm,
  TrustedHealthContentCard,
} from "@/types/trustedContent";
import type {
  AssistantActionType,
  AssistantAuditLog,
  AssistantConversation,
  AssistantDataCategory,
  AssistantDraft,
  AssistantMessage,
  AssistantMode,
  AssistantRequestResult,
  AssistantRiskCategory,
  AssistantSettings,
  AssistantSourceCard,
} from "@/types/assistant";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const SETTINGS_KEY = "family_health_phase17_assistant_settings";
const CONVERSATIONS_KEY = "family_health_phase17_assistant_conversations";
const MESSAGES_KEY = "family_health_phase17_assistant_messages";
const DRAFTS_KEY = "family_health_phase17_assistant_drafts";
const AUDIT_KEY = "family_health_phase17_assistant_audit_logs";

const SENSITIVE_CATEGORIES: AssistantDataCategory[] = [
  "biometrics",
  "womens_health",
  "pregnancy",
  "baby_child",
  "medication_supplements",
  "records",
  "mens_health",
];

const GENERAL_FOOTER =
  "The assistant helps with tracking, organization, summaries, and education. It is not medical advice and does not replace a doctor, pharmacist, nurse, clinic, pediatrician, midwife, therapist, or healthcare professional.";
const SENSITIVE_FOOTER =
  "This is for tracking and education only and is not medical advice. Speak to a healthcare professional if unsure.";
const DRAFT_FOOTER =
  "Review and confirm before saving. AI suggestions may be incomplete or incorrect.";
const EMERGENCY_FOOTER =
  "If this feels urgent or severe, contact local emergency services or a healthcare professional immediately.";

export const ASSISTANT_MODES: Array<{ key: AssistantMode; label: string }> = [
  { key: "general_health", label: "General Health Helper" },
  { key: "quick_logger", label: "Quick Logger" },
  { key: "food_logger", label: "Food Logger" },
  { key: "workout_logger", label: "Workout Logger" },
  { key: "calendar_helper", label: "Calendar Helper" },
  { key: "records_helper", label: "Records Helper" },
  { key: "medication_supplement", label: "Medication/Supplement Organizer" },
  { key: "womens_health", label: "Women’s Health Helper" },
  { key: "pregnancy", label: "Pregnancy Helper" },
  { key: "baby_child", label: "Baby/Child Helper" },
  { key: "mens_health", label: "Men’s Health Helper" },
  { key: "family_caregiver", label: "Family/Caregiver Helper" },
];

export const ASSISTANT_CONSENT_CATEGORIES: Array<{
  key: AssistantDataCategory;
  label: string;
  sensitive: boolean;
}> = [
  { key: "nutrition", label: "Food/Nutrition logs", sensitive: false },
  { key: "workout", label: "Workout logs", sensitive: false },
  { key: "calendar", label: "Calendar and reminders", sensitive: false },
  { key: "biometrics", label: "Biometrics", sensitive: true },
  { key: "womens_health", label: "Women’s Health", sensitive: true },
  { key: "pregnancy", label: "Pregnancy", sensitive: true },
  { key: "baby_child", label: "Baby/Child data", sensitive: true },
  {
    key: "medication_supplements",
    label: "Medication/Supplements",
    sensitive: true,
  },
  { key: "records", label: "Records/Documents", sensitive: true },
  { key: "mens_health", label: "Men’s Health", sensitive: true },
];

export async function getAssistantSettings(
  profileId = LOCAL_PROFILE_ID,
): Promise<AssistantSettings> {
  const settings = (await readJsonArray<AssistantSettings>(SETTINGS_KEY)).find(
    (item) => item.profileId === profileId,
  );

  if (settings) return settings;

  const now = new Date().toISOString();
  return {
    allowedDataCategories: ["nutrition", "workout", "calendar"],
    assistantEnabled: false,
    conversationHistoryEnabled: false,
    createdAt: now,
    id: createId("assistant-settings"),
    profileId,
    quickLoggingEnabled: false,
    sensitiveCategoryConsent: Object.fromEntries(
      SENSITIVE_CATEGORIES.map((category) => [category, false]),
    ),
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
}

export async function updateAssistantSettings(
  partial: Partial<AssistantSettings> & { profileId?: string },
) {
  const current = await getAssistantSettings(
    partial.profileId ?? LOCAL_PROFILE_ID,
  );
  const next: AssistantSettings = {
    ...current,
    ...partial,
    profileId: partial.profileId ?? current.profileId,
    sensitiveCategoryConsent: {
      ...current.sensitiveCategoryConsent,
      ...partial.sensitiveCategoryConsent,
    },
    updatedAt: new Date().toISOString(),
  };
  const settings = await readJsonArray<AssistantSettings>(SETTINGS_KEY);

  await writeJsonArray(SETTINGS_KEY, [
    next,
    ...settings.filter((item) => item.profileId !== next.profileId),
  ]);

  return next;
}

export async function checkAssistantPermission(
  category: AssistantDataCategory,
  profileId = LOCAL_PROFILE_ID,
) {
  const settings = await getAssistantSettings(profileId);

  if (!settings.assistantEnabled) return false;
  if (!settings.allowedDataCategories.includes(category)) return false;
  if (
    SENSITIVE_CATEGORIES.includes(category) &&
    !settings.sensitiveCategoryConsent[category]
  )
    return false;

  return validateAssistantCanAccessData([category], profileId);
}

export async function createAssistantConversation(input: {
  mode: AssistantMode;
  title?: string;
  profileId?: string;
}) {
  const now = new Date().toISOString();
  const conversation: AssistantConversation = {
    createdAt: now,
    id: createId("assistant-conversation"),
    isDeleted: false,
    mode: input.mode,
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    title: input.title?.trim() || "Assistant chat",
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const conversations =
    await readJsonArray<AssistantConversation>(CONVERSATIONS_KEY);

  await writeJsonArray(CONVERSATIONS_KEY, [conversation, ...conversations]);

  return conversation;
}

export async function createAssistantMessage(
  input: Omit<AssistantMessage, "createdAt" | "id" | "profileId" | "userId"> & {
    profileId?: string;
  },
) {
  const message: AssistantMessage = {
    ...input,
    createdAt: new Date().toISOString(),
    id: createId("assistant-message"),
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    userId: LOCAL_USER_ID,
  };
  const messages = await readJsonArray<AssistantMessage>(MESSAGES_KEY);

  await writeJsonArray(MESSAGES_KEY, [message, ...messages]);

  return message;
}

export async function getAssistantMessages(conversationId?: string) {
  const messages = await readJsonArray<AssistantMessage>(MESSAGES_KEY);

  return messages
    .filter(
      (message) => !conversationId || message.conversationId === conversationId,
    )
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    );
}

export async function deleteAssistantConversation(conversationId: string) {
  const conversations =
    await readJsonArray<AssistantConversation>(CONVERSATIONS_KEY);
  await writeJsonArray(
    CONVERSATIONS_KEY,
    conversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            isDeleted: true,
            updatedAt: new Date().toISOString(),
          }
        : conversation,
    ),
  );
}

export async function clearAssistantHistory(profileId = LOCAL_PROFILE_ID) {
  const [conversations, messages] = await Promise.all([
    readJsonArray<AssistantConversation>(CONVERSATIONS_KEY),
    readJsonArray<AssistantMessage>(MESSAGES_KEY),
  ]);

  await writeJsonArray(
    CONVERSATIONS_KEY,
    conversations.filter(
      (conversation) => conversation.profileId !== profileId,
    ),
  );
  await writeJsonArray(
    MESSAGES_KEY,
    messages.filter((message) => message.profileId !== profileId),
  );
}

export function classifyAssistantRequestRisk(
  text: string,
  mode: AssistantMode,
): AssistantRiskCategory {
  if (detectUrgentEmergencyLanguage(text)) return "emergency_or_urgent";
  if (blockUnsafeMedicalAdvice(text)) return "blocked_medical_advice";
  if (
    mode === "pregnancy" ||
    /\bpregnan|midwife|miscarriage|contraction/i.test(text)
  )
    return "pregnancy";
  if (
    mode === "baby_child" ||
    /\bbaby|child|pediatric|diaper|formula\b/i.test(text)
  )
    return "baby_child";
  if (
    mode === "medication_supplement" ||
    /\bmedication|medicine|pill|dose|supplement|contraception\b/i.test(text)
  )
    return "medication_supplement";
  if (
    /\bsymptom|pain|bleeding|glucose|blood pressure|fertility|sexual|period\b/i.test(
      text,
    )
  )
    return "sensitive_health";
  return "low_risk";
}

export function detectUrgentEmergencyLanguage(text: string) {
  return /\b(severe chest pain|trouble breathing|can't breathe|cannot breathe|anaphylaxis|severe allergic|seizure|unconscious|severe bleeding|not breathing|self[- ]?harm|suicidal|severe dehydration|pregnancy severe bleeding|severe pain)\b/i.test(
    text,
  );
}

export function blockUnsafeMedicalAdvice(text: string) {
  return /\b(diagnose|do i have|what disease|prescribe|what dose|dosage|increase my dose|stop taking|start taking|is it safe|safe or unsafe|normal or abnormal|interpret my lab|interpret scan|do i have cancer|low testosterone|am i pregnant|contraception failed|baby delayed)\b/i.test(
    text,
  );
}

export function enforceAssistantSafetyRules(text: string, mode: AssistantMode) {
  const riskCategory = classifyAssistantRequestRisk(text, mode);

  if (riskCategory === "emergency_or_urgent") {
    return { blocked: true, message: EMERGENCY_FOOTER, riskCategory };
  }

  if (riskCategory === "blocked_medical_advice") {
    return {
      blocked: true,
      message:
        "I can help you organize logs, summaries, and questions, but I cannot diagnose, prescribe, dose, interpret results, or decide whether something is safe or unsafe.",
      riskCategory,
    };
  }

  return { blocked: false, message: "", riskCategory };
}

export function buildSafetyFooter(
  riskCategory: AssistantRiskCategory,
  mode: AssistantMode,
) {
  if (riskCategory === "emergency_or_urgent") return EMERGENCY_FOOTER;
  if (mode === "baby_child" || riskCategory === "baby_child")
    return `${SENSITIVE_FOOTER} This does not replace a pediatrician or clinic.`;
  if (mode === "pregnancy" || riskCategory === "pregnancy")
    return `${SENSITIVE_FOOTER} This does not replace your doctor, midwife, nurse, or clinic.`;
  if (
    mode === "medication_supplement" ||
    riskCategory === "medication_supplement"
  )
    return `${SENSITIVE_FOOTER} Always follow your label and healthcare professional's instructions.`;
  if (riskCategory === "sensitive_health") return SENSITIVE_FOOTER;
  return GENERAL_FOOTER;
}

export async function validateAssistantCanAccessData(
  categories: AssistantDataCategory[],
  profileId = LOCAL_PROFILE_ID,
) {
  const permissionCategories = new Set<PermissionCategory>();

  categories.forEach((category) =>
    permissionCategories.add(toPermissionCategory(category)),
  );

  const checks = await Promise.all(
    Array.from(permissionCategories).map((category) =>
      canViewProfileRealm(profileId, category),
    ),
  );

  return checks.every(Boolean);
}

export async function handleAssistantPrompt(input: {
  mode: AssistantMode;
  prompt: string;
  profileId?: string;
}): Promise<AssistantRequestResult> {
  const profileId = input.profileId ?? LOCAL_PROFILE_ID;
  const safety = enforceAssistantSafetyRules(input.prompt, input.mode);
  const dataCategories = getDataCategoriesForMode(input.mode, input.prompt);
  const sourceCards = await getTrustedSourceCardsForTopic(
    input.prompt,
    input.mode,
  );

  if (safety.blocked) {
    await createAssistantAuditLog({
      actionType: "blocked",
      assistantMode: input.mode,
      confirmedByUser: false,
      dataCategoriesAccessed: [],
      profileId,
    });
    return {
      actionType: "blocked",
      message: safety.message,
      riskCategory: safety.riskCategory,
      safetyFooter: buildSafetyFooter(safety.riskCategory, input.mode),
      sourceCards: [],
    };
  }

  const allowed = await validateAssistantCanAccessData(
    dataCategories,
    profileId,
  );
  const consented = await Promise.all(
    dataCategories.map((category) =>
      checkAssistantPermission(category, profileId),
    ),
  );

  if (!allowed || consented.some((value) => !value)) {
    return {
      actionType: "blocked",
      message: "You do not have permission to view that information.",
      riskCategory: safety.riskCategory,
      safetyFooter: buildSafetyFooter(safety.riskCategory, input.mode),
      sourceCards: [],
    };
  }

  const actionType = inferActionType(input.mode, input.prompt);
  const draft =
    actionType === "answer" || actionType === "summarize"
      ? undefined
      : await createAssistantDraft({
          actionType,
          draftPayload: parseDraftPayload(input.prompt, input.mode, actionType),
          mode: input.mode,
          profileId,
          targetRealm: getTargetRealm(input.mode, input.prompt),
        });
  const message = draft
    ? "Review before saving. I created a draft only."
    : await buildAssistantSummary(input.mode, input.prompt, sourceCards);

  await createAssistantAuditLog({
    actionType,
    assistantMode: input.mode,
    confirmedByUser: false,
    createdDraftIds: draft ? [draft.id] : [],
    dataCategoriesAccessed: dataCategories,
    profileId,
  });

  return {
    actionType,
    draft,
    message,
    riskCategory: safety.riskCategory,
    safetyFooter: draft
      ? DRAFT_FOOTER
      : buildSafetyFooter(safety.riskCategory, input.mode),
    sourceCards,
  };
}

export async function createAssistantDraft(
  input: Omit<
    AssistantDraft,
    "createdAt" | "id" | "status" | "updatedAt" | "userId"
  >,
) {
  const now = new Date().toISOString();
  const draft: AssistantDraft = {
    ...input,
    createdAt: now,
    id: createId("assistant-draft"),
    status: "draft",
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const drafts = await readJsonArray<AssistantDraft>(DRAFTS_KEY);

  await writeJsonArray(DRAFTS_KEY, [draft, ...drafts]);

  return draft;
}

export async function updateAssistantDraft(
  id: string,
  partial: Partial<AssistantDraft>,
) {
  const drafts = await readJsonArray<AssistantDraft>(DRAFTS_KEY);
  const updated = drafts.map((draft) =>
    draft.id === id
      ? {
          ...draft,
          ...partial,
          status: partial.status ?? "edited",
          updatedAt: new Date().toISOString(),
        }
      : draft,
  );

  await writeJsonArray(DRAFTS_KEY, updated);

  return updated.find((draft) => draft.id === id) ?? null;
}

export async function confirmAssistantDraft(id: string) {
  const draft = (await readJsonArray<AssistantDraft>(DRAFTS_KEY)).find(
    (item) => item.id === id,
  );

  if (!draft) return null;

  const saved = await saveDraftToTargetRealm(draft);
  const updated = await updateAssistantDraft(id, {
    confirmedAt: new Date().toISOString(),
    status: "confirmed",
  });

  await createAssistantAuditLog({
    actionType: draft.actionType,
    assistantMode: draft.mode,
    confirmedByUser: true,
    createdDraftIds: [draft.id],
    dataCategoriesAccessed: getDataCategoriesForMode(draft.mode, ""),
    profileId: draft.profileId,
    relatedRecordIds: saved?.id ? [String(saved.id)] : [],
  });

  return updated;
}

export async function cancelAssistantDraft(id: string) {
  return updateAssistantDraft(id, { status: "cancelled" });
}

export async function getAssistantDrafts(status?: AssistantDraft["status"]) {
  const drafts = await readJsonArray<AssistantDraft>(DRAFTS_KEY);

  return drafts
    .filter((draft) => !status || draft.status === status)
    .sort(sortNewest);
}

export async function saveDraftToTargetRealm(
  draft: AssistantDraft,
): Promise<{ id?: string } | null> {
  const payload = draft.draftPayload;

  switch (draft.targetRealm) {
    case "nutrition":
      return createNutritionEntry({
        calories: numberValue(payload.calories),
        carbsG: numberValue(payload.carbsG),
        entryDate: String(payload.entryDate ?? toNutritionDateKey(new Date())),
        entrySource: "smart_log",
        fatG: numberValue(payload.fatG),
        foodName: String(payload.foodName ?? "Assistant food draft"),
        mealGroup: "breakfast",
        notes: String(
          payload.notes ?? "Assistant-created draft confirmed by user.",
        ),
        proteinG: numberValue(payload.proteinG),
        quantity: numberValue(payload.quantity) || 1,
        unit: String(payload.unit ?? "serving"),
      });
    case "workout": {
      const session = await createWorkoutSession({
        durationSeconds: (numberValue(payload.durationMinutes) || 0) * 60,
        intensity: "moderate",
        notes: String(
          payload.notes ?? "Assistant-created draft confirmed by user.",
        ),
        planId: undefined,
        startedAt: String(payload.startedAt ?? new Date().toISOString()),
        title: String(payload.title ?? "Workout log"),
        workoutType: "strength",
      });
      await completeWorkoutSession(session.id, {});
      return session;
    }
    case "calendar":
      return createHealthReminder({
        dueAt: String(payload.dueAt ?? new Date().toISOString()),
        notes: String(payload.notes ?? ""),
        title: String(payload.title ?? "Assistant reminder"),
        type: "custom",
      });
    case "records":
      return createHealthRecord({
        notes: String(
          payload.notes ?? "Assistant-created draft confirmed by user.",
        ),
        title: String(payload.title ?? "Assistant note"),
        type: "health_note",
      });
    case "womens_health":
      await createPeriodLog({
        date: String(payload.date ?? toNutritionDateKey(new Date())),
        flowLevel: "light",
        notes: String(
          payload.notes ?? "Assistant-created draft confirmed by user.",
        ),
      });
      if (payload.symptom) {
        await createSymptomLog({
          date: String(payload.date ?? toNutritionDateKey(new Date())),
          severity: "mild",
          symptom: String(payload.symptom),
        });
      }
      return { id: draft.id };
    case "pregnancy":
      return createPregnancyQuestion({
        category: "symptoms",
        question: String(
          payload.question ?? "Question for my healthcare professional",
        ),
        status: "draft",
      });
    case "baby_child": {
      const profiles = await getVisibleBabyProfilesForViewer();
      const childProfileId = profiles[0]?.id;
      if (!childProfileId) return null;
      if (String(payload.logType ?? "").includes("diaper")) {
        return createBabyDiaperLog({
          childProfileId,
          diaperType: "dirty",
          loggedAt: String(payload.loggedAt ?? new Date().toISOString()),
          notes: String(
            payload.notes ?? "Assistant-created draft confirmed by user.",
          ),
        });
      }
      return createBabyFeedingLog({
        amountMl: numberValue(payload.amountMl) || undefined,
        childProfileId,
        feedingType: "bottle_formula",
        notes: String(
          payload.notes ?? "Assistant-created draft confirmed by user.",
        ),
        startedAt: String(payload.loggedAt ?? new Date().toISOString()),
      });
    }
    case "medication_supplement":
      return createDoseLog({
        itemId: String(payload.itemId ?? "assistant-draft"),
        itemType:
          String(payload.itemType ?? "medication") === "supplement"
            ? "supplement"
            : "medication",
        notes: String(
          payload.notes ?? "Assistant-created draft confirmed by user.",
        ),
        scheduledAt: String(payload.scheduledAt ?? new Date().toISOString()),
        status: "taken",
        takenAt: new Date().toISOString(),
      });
    case "mens_health":
      return createMensHealthQuestion({
        category: "other",
        question: String(
          payload.question ?? "Question for my healthcare professional",
        ),
        status: "draft",
      });
    default:
      return null;
  }
}

export function parseFoodLogDraft(text: string) {
  return parseDraftPayload(text, "food_logger", "create_draft_log");
}

export function parseWorkoutLogDraft(text: string) {
  return parseDraftPayload(text, "workout_logger", "create_draft_log");
}

export function parseMedicationDoseDraft(text: string) {
  return parseDraftPayload(text, "medication_supplement", "create_draft_log");
}

export function parseSupplementLogDraft(text: string) {
  return { ...parseMedicationDoseDraft(text), itemType: "supplement" };
}

export function parseWomensHealthLogDraft(text: string) {
  return parseDraftPayload(text, "womens_health", "create_draft_log");
}

export function parsePregnancyQuestionDraft(text: string) {
  return parseDraftPayload(text, "pregnancy", "prepare_questions");
}

export function parseBabyLogDraft(text: string) {
  return parseDraftPayload(text, "baby_child", "create_draft_log");
}

export function parseCalendarReminderDraft(text: string) {
  return parseDraftPayload(text, "calendar_helper", "create_draft_reminder");
}

export function parseHealthNoteDraft(text: string) {
  return parseDraftPayload(text, "records_helper", "create_draft_note");
}

export async function summarizeTodayHealth() {
  const [nutrition, fitness] = await Promise.all([
    getTodayNutritionSummary(),
    getTodayFitnessSummary(),
  ]);
  return `Based on your logs: ${nutrition.foodLogCount} food entries, ${Math.round(nutrition.waterMl)} ml water, and ${fitness.latestWorkout ? "a workout logged" : "no workout logged"}.`;
}

export async function summarizeNutrition() {
  const summary = await getTodayNutritionSummary();
  return `Based on your logs: ${summary.foodLogCount} entries, ${Math.round(summary.calories)} kcal, ${Math.round(summary.proteinGrams)} g protein, and ${Math.round(summary.waterMl)} ml water.`;
}

export async function summarizeWorkout() {
  const summary = await getTodayFitnessSummary();
  return summary.latestWorkout
    ? `Latest workout: ${summary.latestWorkout.title}.`
    : "No workout logged today.";
}

export async function summarizeBabyLogs() {
  return "Baby / Child summaries use only logs you have permission to view.";
}

export async function summarizeMedicationSchedule() {
  return "Medication and supplement schedule summaries are for organization only. Always follow your label and healthcare professional's instructions.";
}

export async function summarizePregnancyPrep() {
  const profile = await getPregnancyProfile();
  return profile?.status === "active"
    ? "Pregnancy Mode is active. I can help prepare draft questions for your appointment."
    : "Pregnancy Mode is not active.";
}

export async function summarizeRecords() {
  const records = await getHealthRecords();
  return records.length
    ? `${records.length} records saved. I can help prepare a draft summary without interpreting results.`
    : "No records saved yet.";
}

export async function summarizeWomensHealth() {
  const summary = await getWomensHealthTodaySummary();
  return `Based on today's logs: ${summary.activePeriod ? "period active" : "no active period log"}, ${summary.symptomCountToday} symptom notes.`;
}

export async function summarizeMensHealth() {
  const summary = await getMensHealthReportSummary("today");
  return `Based on today's logs: ${summary.checkInCount} check-ins and ${summary.symptomCount} symptom notes.`;
}

export function generateDoctorQuestions(text: string) {
  return buildQuestions(text, "doctor");
}

export function generatePediatricianQuestions(text: string) {
  return buildQuestions(text, "pediatrician");
}

export function generatePharmacistQuestions(text: string) {
  return buildQuestions(text, "pharmacist");
}

export function generateMidwifeQuestions(text: string) {
  return buildQuestions(text, "midwife");
}

export async function getTrustedSourceCardsForTopic(
  text: string,
  mode: AssistantMode,
): Promise<AssistantSourceCard[]> {
  const cards = await getGovernedSourceCardsForTopic(
    text,
    modeToContentRealm(mode),
  );

  if (cards.length) {
    await logAiContentUsage(cards.map((card) => card.id));
  }

  return cards.map(toAssistantSourceCard);
}

export async function answerFromTrustedSourceCards(
  text: string,
  mode: AssistantMode,
) {
  const cards = await getTrustedSourceCardsForTopic(text, mode);

  return cards.length
    ? `I found ${cards.length} trusted source card${cards.length === 1 ? "" : "s"} for this topic.`
    : fallbackToProfessionalConfirmation();
}

export function fallbackToProfessionalConfirmation() {
  return "I do not have a trusted source saved for this topic yet. Please speak to a healthcare professional or check an official health source.";
}

export async function createAssistantAuditLog(
  input: Omit<AssistantAuditLog, "createdAt" | "id" | "userId"> & {
    userId?: string;
  },
) {
  const log: AssistantAuditLog = {
    ...input,
    createdAt: new Date().toISOString(),
    id: createId("assistant-audit"),
    userId: input.userId ?? LOCAL_USER_ID,
  };
  const logs = await readJsonArray<AssistantAuditLog>(AUDIT_KEY);

  await writeJsonArray(AUDIT_KEY, [log, ...logs].slice(0, 500));
  await createHealthAuditLog({
    action: `assistant_${input.actionType}`,
    metadata: {
      assistantMode: input.assistantMode,
      dataCategoriesAccessed: input.dataCategoriesAccessed.join(","),
    },
    relatedRealm: "assistant",
    targetProfileId: input.profileId,
  });

  return log;
}

export async function getAssistantAuditLogs(profileId = LOCAL_PROFILE_ID) {
  return (await readJsonArray<AssistantAuditLog>(AUDIT_KEY)).filter(
    (log) => log.profileId === profileId,
  );
}

function inferActionType(
  mode: AssistantMode,
  text: string,
): AssistantActionType {
  if (/\bquestion|ask|doctor|midwife|pharmacist|pediatrician\b/i.test(text))
    return "prepare_questions";
  if (/\bsummarize|summary|show me|today|week\b/i.test(text))
    return "summarize";
  if (
    /\bremind|appointment|calendar\b/i.test(text) ||
    mode === "calendar_helper"
  )
    return "create_draft_reminder";
  if (/\bnote|record|document\b/i.test(text) || mode === "records_helper")
    return "create_draft_note";
  if (mode === "general_health" || mode === "family_caregiver") return "answer";
  return "create_draft_log";
}

function getTargetRealm(mode: AssistantMode, text: string) {
  if (mode === "food_logger") return "nutrition";
  if (mode === "workout_logger") return "workout";
  if (mode === "calendar_helper" || /\bremind|appointment\b/i.test(text))
    return "calendar";
  if (mode === "records_helper") return "records";
  if (mode === "womens_health") return "womens_health";
  if (mode === "pregnancy") return "pregnancy";
  if (mode === "baby_child") return "baby_child";
  if (mode === "medication_supplement") return "medication_supplement";
  if (mode === "mens_health") return "mens_health";
  if (/\bfood|meal|breakfast|lunch|dinner|toast|egg\b/i.test(text))
    return "nutrition";
  if (/\bworkout|pushup|run|walk|sets?\b/i.test(text)) return "workout";
  return "records";
}

function parseDraftPayload(
  text: string,
  mode: AssistantMode,
  actionType: AssistantActionType,
): Record<string, unknown> {
  if (actionType === "prepare_questions") {
    return {
      question: buildQuestions(
        text,
        mode === "pregnancy"
          ? "midwife"
          : mode === "baby_child"
            ? "pediatrician"
            : "doctor",
      )[0],
    };
  }

  if (actionType === "create_draft_reminder") {
    return {
      dueAt: new Date().toISOString(),
      notes: text,
      title: extractTitle(text, "Assistant reminder"),
    };
  }

  if (mode === "food_logger" || getTargetRealm(mode, text) === "nutrition") {
    return {
      calories: 0,
      foodName: extractFoodName(text),
      notes: text,
      quantity: extractFirstNumber(text) || 1,
      unit: "serving",
    };
  }

  if (mode === "workout_logger") {
    return {
      durationMinutes: 0,
      notes: text,
      title: extractTitle(text, "Workout log"),
    };
  }

  if (mode === "baby_child") {
    return {
      amountMl: extractFirstNumber(text),
      logType: /\bdiaper\b/i.test(text) ? "diaper" : "feeding",
      notes: text,
    };
  }

  if (mode === "womens_health") {
    return {
      date: toNutritionDateKey(new Date()),
      notes: text,
      symptom: /\bcramp/i.test(text) ? "cramps" : undefined,
    };
  }

  if (mode === "medication_supplement") {
    return {
      itemName: extractTitle(text, "Medication or supplement"),
      itemType: /\bsupplement\b/i.test(text) ? "supplement" : "medication",
      notes: text,
    };
  }

  return { notes: text, title: extractTitle(text, "Assistant note") };
}

function getDataCategoriesForMode(
  mode: AssistantMode,
  text: string,
): AssistantDataCategory[] {
  switch (mode) {
    case "food_logger":
      return ["nutrition"];
    case "workout_logger":
      return ["workout"];
    case "calendar_helper":
      return ["calendar"];
    case "records_helper":
      return ["records"];
    case "medication_supplement":
      return ["medication_supplements"];
    case "womens_health":
      return ["womens_health"];
    case "pregnancy":
      return ["pregnancy"];
    case "baby_child":
      return ["baby_child"];
    case "mens_health":
      return ["mens_health"];
    case "quick_logger":
      return [toDataCategoryForTarget(getTargetRealm(mode, text))];
    default:
      return ["nutrition", "workout", "calendar"].filter(
        (category) => category !== undefined,
      ) as AssistantDataCategory[];
  }
}

function toDataCategoryForTarget(targetRealm: string): AssistantDataCategory {
  switch (targetRealm) {
    case "nutrition":
      return "nutrition";
    case "workout":
      return "workout";
    case "calendar":
      return "calendar";
    case "records":
      return "records";
    case "womens_health":
      return "womens_health";
    case "pregnancy":
      return "pregnancy";
    case "baby_child":
      return "baby_child";
    case "medication_supplement":
      return "medication_supplements";
    case "mens_health":
      return "mens_health";
    default:
      return "records";
  }
}

function toPermissionCategory(
  category: AssistantDataCategory,
): PermissionCategory {
  if (category === "medication_supplements") return "medication";
  return getPermissionCategoryForWidget(
    category === "nutrition"
      ? "food_log"
      : category === "workout"
        ? "workout"
        : category === "calendar"
          ? "today_reminders"
          : category === "records"
            ? "recent_record"
            : category === "baby_child"
              ? "baby_today"
              : category === "mens_health"
                ? "mens_health_check_in"
                : category === "pregnancy"
                  ? "pregnancy_week"
                  : category === "womens_health"
                    ? "cycle_day"
                    : "weight",
  );
}

async function buildAssistantSummary(
  mode: AssistantMode,
  text: string,
  sourceCards: AssistantSourceCard[],
) {
  if (mode === "food_logger") return summarizeNutrition();
  if (mode === "workout_logger") return summarizeWorkout();
  if (mode === "records_helper") return summarizeRecords();
  if (mode === "womens_health") return summarizeWomensHealth();
  if (mode === "pregnancy") return summarizePregnancyPrep();
  if (mode === "baby_child") return summarizeBabyLogs();
  if (mode === "mens_health") return summarizeMensHealth();
  if (/trusted|source|learn|explain/i.test(text))
    return sourceCards.length
      ? answerFromTrustedSourceCards(text, mode)
      : fallbackToProfessionalConfirmation();
  return summarizeTodayHealth();
}

function buildQuestions(text: string, professional: string) {
  return [
    `What should I ask my ${professional} about: ${text.slice(0, 80)}?`,
    "When should I seek care if this continues or changes?",
    "Should I bring my logs, medication/supplement list, or records to the appointment?",
  ];
}

function modeToContentRealm(
  mode: AssistantMode,
): HealthContentRealm | undefined {
  switch (mode) {
    case "food_logger":
      return "nutrition";
    case "workout_logger":
      return "workout";
    case "records_helper":
      return "records";
    case "medication_supplement":
      return "medication";
    case "womens_health":
      return "womens_health";
    case "pregnancy":
      return "pregnancy";
    case "baby_child":
      return "baby_child";
    case "mens_health":
      return "mens_health";
    case "calendar_helper":
      return "calendar";
    case "general_health":
    case "family_caregiver":
    case "quick_logger":
      return undefined;
  }
}

function toAssistantSourceCard(
  card: TrustedHealthContentCard,
): AssistantSourceCard {
  return {
    createdAt: card.createdAt,
    id: card.id,
    lastCheckedDate: card.lastCheckedDate,
    reviewedDate: card.reviewedDate,
    sourceOrganization: card.sourceOrganization,
    sourceUrl: card.sourceUrl,
    summary: card.shortSummary,
    title: card.title,
    updatedAt: card.updatedAt,
  };
}

function extractFirstNumber(text: string) {
  const match = text.match(/\b\d+(\.\d+)?\b/);
  return match ? Number(match[0]) : undefined;
}

function extractFoodName(text: string) {
  return (
    text
      .replace(/\blog\b|\bfor breakfast\b|\bfor lunch\b|\bfor dinner\b/gi, "")
      .trim() || "Food draft"
  );
}

function extractTitle(text: string, fallback: string) {
  return (
    text
      .replace(/\b(log|add|remind me|mark)\b/gi, "")
      .trim()
      .slice(0, 80) || fallback
  );
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortNewest<T extends { createdAt: string }>(left: T, right: T) {
  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
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
