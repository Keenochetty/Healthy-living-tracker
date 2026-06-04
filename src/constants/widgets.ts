import { AppModuleKey, WidgetKey } from "@/types/app";

export type AppWidget = {
  key: WidgetKey;
  title: string;
  moduleKey: AppModuleKey;
};

export const APP_WIDGETS: AppWidget[] = [
  {
    key: "mood",
    title: "Mood",
    moduleKey: "personal_health",
  },
  {
    key: "water",
    title: "Water",
    moduleKey: "personal_health",
  },
  {
    key: "sleep",
    title: "Sleep",
    moduleKey: "personal_health",
  },
  {
    key: "weight",
    title: "Weight",
    moduleKey: "personal_health",
  },
  {
    key: "biometric_goal_weight",
    title: "Goal Weight",
    moduleKey: "personal_health",
  },
  {
    key: "energy",
    title: "Energy",
    moduleKey: "personal_health",
  },
  {
    key: "resting_heart_rate",
    title: "Resting Heart Rate",
    moduleKey: "personal_health",
  },
  {
    key: "blood_pressure",
    title: "Blood Pressure",
    moduleKey: "personal_health",
  },
  {
    key: "blood_glucose",
    title: "Blood Glucose",
    moduleKey: "personal_health",
  },
  {
    key: "digestion",
    title: "Digestion",
    moduleKey: "personal_health",
  },
  {
    key: "symptoms",
    title: "Symptoms",
    moduleKey: "personal_health",
  },
  {
    key: "steps_today",
    title: "Steps Today",
    moduleKey: "personal_health",
  },
  {
    key: "distance_today",
    title: "Distance Today",
    moduleKey: "personal_health",
  },
  {
    key: "last_synced_workout",
    title: "Last Synced Workout",
    moduleKey: "personal_health",
  },
  {
    key: "sleep_last_night",
    title: "Sleep Last Night",
    moduleKey: "personal_health",
  },
  {
    key: "active_calories",
    title: "Active Calories",
    moduleKey: "personal_health",
  },
  {
    key: "synced_weight",
    title: "Synced Weight",
    moduleKey: "personal_health",
  },
  {
    key: "sync_status",
    title: "Sync Status",
    moduleKey: "personal_health",
  },
  {
    key: "medication",
    title: "Medication",
    moduleKey: "personal_health",
  },
  {
    key: "medication_due_today",
    title: "Medication Due Today",
    moduleKey: "personal_health",
  },
  {
    key: "next_medication",
    title: "Next Medication",
    moduleKey: "personal_health",
  },
  {
    key: "medication_taken_today",
    title: "Medication Taken Today",
    moduleKey: "personal_health",
  },
  {
    key: "missed_medication",
    title: "Missed Medication",
    moduleKey: "personal_health",
  },
  {
    key: "medication_schedule_status",
    title: "Medication Schedule Status",
    moduleKey: "personal_health",
  },
  {
    key: "supplements_due_today",
    title: "Supplements Due Today",
    moduleKey: "personal_health",
  },
  {
    key: "next_supplement",
    title: "Next Supplement",
    moduleKey: "personal_health",
  },
  {
    key: "supplements_taken_today",
    title: "Supplements Taken Today",
    moduleKey: "personal_health",
  },
  {
    key: "supplement_schedule_status",
    title: "Supplement Schedule Status",
    moduleKey: "personal_health",
  },
  {
    key: "next_appointment",
    title: "Next Appointment",
    moduleKey: "planning",
  },
  {
    key: "work_reminder",
    title: "Work Reminder",
    moduleKey: "planning",
  },
  {
    key: "family_status",
    title: "Family Status",
    moduleKey: "circle",
  },
  {
    key: "steps",
    title: "Steps",
    moduleKey: "fitness",
  },
  {
    key: "workout",
    title: "Workout",
    moduleKey: "fitness",
  },
  {
    key: "food_log",
    title: "Food Log",
    moduleKey: "food",
  },
  {
    key: "calories_today",
    title: "Calories Today",
    moduleKey: "food",
  },
  {
    key: "protein_today",
    title: "Protein Today",
    moduleKey: "food",
  },
  {
    key: "water_today",
    title: "Water Today",
    moduleKey: "food",
  },
  {
    key: "calories_progress",
    title: "Calories Progress",
    moduleKey: "food",
  },
  {
    key: "protein_progress",
    title: "Protein Progress",
    moduleKey: "food",
  },
  {
    key: "water_progress",
    title: "Water Progress",
    moduleKey: "food",
  },
  {
    key: "fiber_progress",
    title: "Fiber Progress",
    moduleKey: "food",
  },
  {
    key: "goal_weight",
    title: "Goal Weight",
    moduleKey: "food",
  },
  {
    key: "nutrition_goal",
    title: "Nutrition Goal",
    moduleKey: "food",
  },
  {
    key: "food_diary_status",
    title: "Food Diary Status",
    moduleKey: "food",
  },
  {
    key: "baby_feed",
    title: "Baby Feed",
    moduleKey: "child_baby",
  },
  {
    key: "cycle",
    title: "Cycle",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "cycle_private",
    title: "Private Cycle",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "elder_checkin",
    title: "Elder Check-in",
    moduleKey: "elder_care",
  },
  {
    key: "caregiver_active",
    title: "Caregiver Active",
    moduleKey: "caregiver",
  },
  {
    key: "ai_suggestion",
    title: "AI Suggestion",
    moduleKey: "ai_assistant",
  },
];
