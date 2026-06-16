export type AiSource =
  | "chatgpt_user_account"
  | "manual_paste"
  | "healthsync_local";

export type AiSessionStatus = "draft" | "imported" | "dismissed";
export type AiImportStatus =
  | "pending"
  | "routed"
  | "saved"
  | "failed"
  | "cancelled";

export type AiImportTarget =
  | "nutrition"
  | "calendar"
  | "shopping_list"
  | "fitness"
  | "medication"
  | "records"
  | "family"
  | "women_health"
  | "baby_child"
  | "general_health";

export type AiStructuredResult = {
  allergy_flags?: string[];
  confidence?: "low" | "medium" | "high";
  diabetic_warning?: boolean;
  import_targets: AiImportTarget[];
  ingredients?: string[];
  raw_text?: string;
  safety_notes?: string[];
  source: AiSource;
  steps?: string[];
  summary?: string;
  title: string;
  type:
    | "meal_plan"
    | "workout_plan"
    | "medication_reminder"
    | "calendar_event"
    | "shopping_list"
    | "health_record"
    | "baby_log"
    | "cycle_note"
    | "general_note";
};

export type HealthSyncAiSession = {
  active_profile_id: string | null;
  confidence: AiStructuredResult["confidence"] | null;
  created_at: string;
  dismissed_at: string | null;
  id: string;
  import_targets: AiImportTarget[];
  imported_at: string | null;
  raw_text: string | null;
  result_type: AiStructuredResult["type"];
  source: AiSource;
  status: AiSessionStatus;
  structured_result: AiStructuredResult;
  summary: string | null;
  title: string;
  updated_at: string;
  user_id: string;
};

export type HealthSyncAiImport = {
  app_record_id: string | null;
  created_at: string;
  error_message: string | null;
  id: string;
  session_id: string;
  status: AiImportStatus;
  target: AiImportTarget;
  target_route: string | null;
  updated_at: string;
  user_id: string;
};
