export type AppModuleKey =
  | "personal_health"
  | "planning"
  | "circle"
  | "child_baby"
  | "pregnancy_cycle"
  | "elder_care"
  | "caregiver"
  | "fitness"
  | "food"
  | "ai_assistant";

export type AppModule = {
  key: AppModuleKey;
  name: string;
  description: string;
  emoji: string;
  core: boolean;
};

export type WidgetKey =
  | "mood"
  | "water"
  | "calories_today"
  | "protein_today"
  | "water_today"
  | "calories_progress"
  | "protein_progress"
  | "water_progress"
  | "fiber_progress"
  | "goal_weight"
  | "nutrition_goal"
  | "food_diary_status"
  | "steps"
  | "sleep"
  | "medication"
  | "next_appointment"
  | "work_reminder"
  | "food_log"
  | "workout"
  | "family_status"
  | "caregiver_active"
  | "baby_feed"
  | "cycle"
  | "cycle_private"
  | "elder_checkin"
  | "ai_suggestion";

export type LocalProfileSettings = {
  displayName: string;
  schemaVersion: 1;
  selectedModuleIds: AppModuleKey[];
  updatedAt: string | null;
};

export type ThemeDefinition = {
  colors: {
    background: string;
    border: string;
    card: string;
    mutedText: string;
    primary: string;
    primarySoft: string;
    secondary: string;
    text: string;
    warning: string;
    warningSoft: string;
  };
  radius: {
    button: number;
    card: number;
    pill: number;
  };
  spacing: {
    lg: number;
    md: number;
    sm: number;
    xl: number;
    xs: number;
  };
};
