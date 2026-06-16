export type AppAIInputType =
  | "text"
  | "photo"
  | "barcode"
  | "voice"
  | "document"
  | "manual";

export type AppAIImportTarget =
  | "nutrition"
  | "fitness"
  | "medication"
  | "supplements"
  | "calendar"
  | "shopping_list"
  | "baby_child"
  | "cycle"
  | "pregnancy"
  | "records"
  | "family";

export type AppAIImportPayload = {
  source: {
    input_type: AppAIInputType;
    query: string;
    image_url: string | null;
    barcode: string | null;
    confidence: number;
    requires_review: boolean;
  };
  intent: {
    primary:
      | "nutrition"
      | "fitness"
      | "medication"
      | "supplement"
      | "calendar"
      | "baby_child"
      | "pregnancy"
      | "cycle"
      | "general_health"
      | "family"
      | "shopping"
      | "reminder"
      | "record"
      | "unknown";
    secondary: string[];
    user_goal: string;
  };
  summary: {
    title: string;
    short_description: string;
    important_notes: string[];
    medical_disclaimer_required: boolean;
  };
  health_flags: {
    allergy_flags: string[];
    diabetic_warning: boolean;
    pregnancy_warning: boolean;
    medication_interaction_warning: boolean;
    contraceptive_interaction_warning: boolean;
    child_safety_warning: boolean;
    high_risk_warning: boolean;
    warnings: string[];
  };
  nutrition: {
    meal_type: string | null;
    ingredients: string[];
    nutrients: {
      calories: number | null;
      protein_g: number | null;
      carbs_g: number | null;
      fat_g: number | null;
      sugar_g: number | null;
      fiber_g: number | null;
      sodium_mg: number | null;
    };
    diet_tags: string[];
    allergens: string[];
    shopping_items: string[];
    recipe_steps: string[];
    servings: number | null;
  };
  fitness: {
    workout_name: string | null;
    goal: string | null;
    exercises: string[];
    muscle_groups: string[];
    duration_minutes: number | null;
    difficulty: string | null;
    equipment: string[];
    sets_reps: string[];
    safety_notes: string[];
    progression_plan: string[];
  };
  medication: {
    name: string | null;
    dosage: string | null;
    frequency: string | null;
    time_of_day: string[];
    instructions: string[];
    side_effects: string[];
    interaction_notes: string[];
    reminder_needed: boolean;
  };
  supplement: {
    name: string | null;
    dosage: string | null;
    purpose: string | null;
    timing: string | null;
    interaction_notes: string[];
  };
  calendar: {
    title: string | null;
    start_date: string | null;
    start_time: string | null;
    end_time: string | null;
    repeat_rule: string | null;
    reminder_minutes_before: number | null;
  };
  baby_child: {
    child_age: string | null;
    milestone: string | null;
    feeding: string | null;
    sleep: string | null;
    vaccine: string | null;
    growth_note: string | null;
    safety_notes: string[];
  };
  women_health: {
    cycle_day: number | null;
    symptoms: string[];
    mood: string | null;
    contraceptive: string | null;
    pregnancy_related: boolean;
    notes: string[];
  };
  family: {
    share_with: string[];
    privacy_level: "private" | "shared" | "family_admin_only";
    caregiver_visible: boolean;
  };
  records: {
    record_type: string | null;
    document_title: string | null;
    extracted_fields: Record<string, unknown>;
    attachments: string[];
  };
  import_targets: AppAIImportTarget[];
  actions: {
    can_import: boolean;
    suggested_buttons: string[];
    requires_user_confirmation: boolean;
  };
};

export type AppAIChat = {
  created_at: string;
  id: string;
  last_message_preview: string | null;
  title: string;
  updated_at: string;
};

export type AppAIImport = {
  created_at: string;
  id: string;
  payload: AppAIImportPayload;
  status: "confirmed" | "failed";
  target: AppAIImportTarget;
};
