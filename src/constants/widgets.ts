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
    key: "medication",
    title: "Medication",
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
