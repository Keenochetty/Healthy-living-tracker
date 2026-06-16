import type { AiStructuredResult } from "@/features/ai/types";

export type PastedResultType = AiStructuredResult["type"];

const TYPE_TO_TARGETS: Record<
  PastedResultType,
  AiStructuredResult["import_targets"]
> = {
  baby_log: ["baby_child"],
  calendar_event: ["calendar"],
  cycle_note: ["women_health"],
  general_note: ["general_health"],
  health_record: ["records"],
  meal_plan: ["nutrition", "shopping_list"],
  medication_reminder: ["medication", "calendar"],
  shopping_list: ["shopping_list"],
  workout_plan: ["fitness"],
};

const TYPE_LABELS: Record<PastedResultType, string> = {
  baby_log: "Baby log",
  calendar_event: "Calendar event",
  cycle_note: "Cycle note",
  general_note: "General note",
  health_record: "Health record",
  meal_plan: "Meal plan",
  medication_reminder: "Medication reminder",
  shopping_list: "Shopping list",
  workout_plan: "Workout plan",
};

const HEALTH_REVIEW_TYPES = new Set<PastedResultType>([
  "baby_log",
  "cycle_note",
  "health_record",
  "medication_reminder",
]);

export function parsePastedChatGptResult(
  rawText: string,
  type: PastedResultType,
): AiStructuredResult {
  const trimmed = rawText.trim();
  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const title = cleanLine(lines[0]) || `${TYPE_LABELS[type]} draft`;
  const summary = getSummary(lines, title);
  const listItems = lines.map(cleanListLine).filter(Boolean);
  const safety_notes = [
    "Review this pasted result before importing it into HealthSync.",
    ...(HEALTH_REVIEW_TYPES.has(type)
      ? ["AI results can help organize information, but they do not replace medical advice."]
      : []),
  ];

  return {
    confidence: "low",
    diabetic_warning: /diabet/i.test(trimmed) ? true : undefined,
    import_targets: TYPE_TO_TARGETS[type],
    ingredients: type === "meal_plan" ? listItems.slice(0, 10) : undefined,
    raw_text: trimmed,
    safety_notes,
    source: "manual_paste",
    steps: listItems.slice(0, 12),
    summary,
    title,
    type,
  };
}

export const PASTED_RESULT_TYPE_OPTIONS: Array<{
  label: string;
  value: PastedResultType;
}> = [
  { label: "Meal plan", value: "meal_plan" },
  { label: "Workout plan", value: "workout_plan" },
  { label: "Medication reminder", value: "medication_reminder" },
  { label: "Calendar event", value: "calendar_event" },
  { label: "Shopping list", value: "shopping_list" },
  { label: "Health record", value: "health_record" },
  { label: "Baby log", value: "baby_log" },
  { label: "Cycle note", value: "cycle_note" },
  { label: "General note", value: "general_note" },
];

function cleanLine(line?: string) {
  return (line ?? "")
    .replace(/^#+\s*/, "")
    .replace(/^\*\*(.*)\*\*$/, "$1")
    .trim();
}

function cleanListLine(line: string) {
  return line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
}

function getSummary(lines: string[], title: string) {
  const firstParagraph = lines.find((line) => cleanLine(line) !== title);
  return firstParagraph ? cleanLine(firstParagraph) : undefined;
}
