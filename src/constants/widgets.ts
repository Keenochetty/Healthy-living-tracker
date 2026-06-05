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
    key: "recent_record",
    title: "Recent Record",
    moduleKey: "personal_health",
  },
  {
    key: "upcoming_follow_up",
    title: "Upcoming Follow-Up",
    moduleKey: "personal_health",
  },
  {
    key: "prescription_refill",
    title: "Prescription Refill",
    moduleKey: "personal_health",
  },
  {
    key: "next_vaccine",
    title: "Next Vaccine",
    moduleKey: "personal_health",
  },
  {
    key: "lab_follow_up",
    title: "Lab Follow-Up",
    moduleKey: "personal_health",
  },
  {
    key: "pinned_health_record",
    title: "Pinned Health Record",
    moduleKey: "personal_health",
  },
  {
    key: "records_needing_attention",
    title: "Records Needing Attention",
    moduleKey: "personal_health",
  },
  {
    key: "today_reminders",
    title: "Today's Reminders",
    moduleKey: "personal_health",
  },
  {
    key: "next_reminder",
    title: "Next Reminder",
    moduleKey: "personal_health",
  },
  {
    key: "overdue_items",
    title: "Due Items",
    moduleKey: "personal_health",
  },
  {
    key: "upcoming_appointment",
    title: "Upcoming Appointment",
    moduleKey: "personal_health",
  },
  {
    key: "medication_schedule",
    title: "Medication Schedule",
    moduleKey: "personal_health",
  },
  {
    key: "supplement_schedule",
    title: "Supplement Schedule",
    moduleKey: "personal_health",
  },
  {
    key: "workout_plan",
    title: "Workout Plan",
    moduleKey: "personal_health",
  },
  {
    key: "water_check",
    title: "Water Check",
    moduleKey: "personal_health",
  },
  {
    key: "timeline_today",
    title: "Timeline Today",
    moduleKey: "personal_health",
  },
  {
    key: "reminder_next",
    title: "Next Reminder",
    moduleKey: "personal_health",
  },
  {
    key: "reminders_today",
    title: "Today's Reminders",
    moduleKey: "personal_health",
  },
  {
    key: "overdue_reminders",
    title: "Overdue Reminders",
    moduleKey: "personal_health",
  },
  {
    key: "medication_due",
    title: "Medication Due",
    moduleKey: "personal_health",
  },
  {
    key: "supplement_due",
    title: "Supplement Due",
    moduleKey: "personal_health",
  },
  {
    key: "contraception_next",
    title: "Contraception Reminder",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "baby_reminder",
    title: "Baby Reminder",
    moduleKey: "child_baby",
  },
  {
    key: "appointment_reminder",
    title: "Appointment Reminder",
    moduleKey: "personal_health",
  },
  {
    key: "water_reminder",
    title: "Water Reminder",
    moduleKey: "food",
  },
  {
    key: "workout_reminder",
    title: "Workout Reminder",
    moduleKey: "fitness",
  },
  {
    key: "caregiver_task",
    title: "Caregiver Task",
    moduleKey: "caregiver",
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
    key: "next_feed",
    title: "Next Feed",
    moduleKey: "child_baby",
  },
  {
    key: "last_feed",
    title: "Last Feed",
    moduleKey: "child_baby",
  },
  {
    key: "sleep_today",
    title: "Sleep Today",
    moduleKey: "child_baby",
  },
  {
    key: "last_sleep",
    title: "Last Sleep",
    moduleKey: "child_baby",
  },
  {
    key: "last_diaper",
    title: "Last Diaper",
    moduleKey: "child_baby",
  },
  {
    key: "weight_latest",
    title: "Weight Latest",
    moduleKey: "child_baby",
  },
  {
    key: "growth_check",
    title: "Growth Check",
    moduleKey: "child_baby",
  },
  {
    key: "baby_medicine_due",
    title: "Baby Medicine Due",
    moduleKey: "child_baby",
  },
  {
    key: "solid_food_tried",
    title: "Solid Food Tried",
    moduleKey: "child_baby",
  },
  {
    key: "milestone_check",
    title: "Milestone Check",
    moduleKey: "child_baby",
  },
  {
    key: "baby_note",
    title: "Baby Note",
    moduleKey: "child_baby",
  },
  {
    key: "baby_today",
    title: "Baby Today",
    moduleKey: "child_baby",
  },
  {
    key: "cycle",
    title: "Cycle",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "cycle_private",
    title: "Women’s Health Privacy",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "cycle_day",
    title: "Cycle Day",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "period_expected",
    title: "Period Estimate",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "period_active",
    title: "Period Active",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "fertile_window_estimate",
    title: "Fertile Estimate",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "estimated_ovulation",
    title: "Ovulation Estimate",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "symptoms_today",
    title: "Symptoms Today",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "mood_today",
    title: "Mood Today",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "contraception_reminder",
    title: "Contraception Reminder",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "contraception_status",
    title: "Contraception Status",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "contraception_caution",
    title: "Contraception Review",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "womens_health_privacy_status",
    title: "Women’s Health Privacy",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "pregnancy_week",
    title: "Pregnancy Week",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "pregnancy_due_date",
    title: "Due Date",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "pregnancy_next_appointment",
    title: "Next Pregnancy Appointment",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "pregnancy_symptom_log",
    title: "Pregnancy Symptom Log",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "pregnancy_medication_review",
    title: "Pregnancy Medication Review",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "pregnancy_question",
    title: "Pregnancy Question",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "pregnancy_record",
    title: "Pregnancy Record",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "pregnancy_privacy_status",
    title: "Pregnancy Privacy",
    moduleKey: "pregnancy_cycle",
  },
  {
    key: "mens_health_check_in",
    title: "Men's Health Check-in",
    moduleKey: "mens_health",
  },
  {
    key: "mens_energy_stress",
    title: "Energy / Stress",
    moduleKey: "mens_health",
  },
  {
    key: "testicular_check_reminder",
    title: "Testicular Check Reminder",
    moduleKey: "mens_health",
  },
  {
    key: "prostate_discussion_reminder",
    title: "Prostate Discussion",
    moduleKey: "mens_health",
  },
  {
    key: "fertility_note",
    title: "Fertility Note",
    moduleKey: "mens_health",
  },
  {
    key: "mens_doctor_question",
    title: "Doctor Question",
    moduleKey: "mens_health",
  },
  {
    key: "mens_private_reminder",
    title: "Private Reminder",
    moduleKey: "mens_health",
  },
  {
    key: "mens_health_privacy_status",
    title: "Men's Health Privacy",
    moduleKey: "mens_health",
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
