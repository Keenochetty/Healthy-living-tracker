import type { Href } from "expo-router";

import type { AiImportTarget } from "@/features/ai/types";

const AI_IMPORT_ROUTES: Record<AiImportTarget, Href> = {
  baby_child: "/baby-child",
  calendar: "/calendar",
  family: "/circle",
  fitness: "/fitness",
  general_health: "/health",
  medication: "/medication",
  nutrition: "/food",
  records: "/records",
  shopping_list: "/food",
  women_health: "/cycle",
};

export function getAiImportRoute(target: AiImportTarget) {
  return AI_IMPORT_ROUTES[target];
}

export function getAiImportTargetLabel(target: AiImportTarget) {
  return target
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
