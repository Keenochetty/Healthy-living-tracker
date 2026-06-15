import type { AppModuleKey } from "@/types/app";
import type { ReminderPriority, ReminderType } from "@/types/reminders";

export type ReminderTypeDefinition = {
  colour: string;
  description: string;
  emoji: string;
  key: ReminderType;
  label: string;
  moduleKey?: AppModuleKey;
};

export const REMINDER_TYPES: ReminderTypeDefinition[] = [
  {
    colour: "#8652d6",
    description: "Personal tasks, habits and daily planning.",
    emoji: "Me",
    key: "personal",
    label: "Personal"
  },
  {
    colour: "#3279f4",
    description: "Work tasks, meetings and deadlines.",
    emoji: "Work",
    key: "work",
    label: "Work"
  },
  {
    colour: "#7860e5",
    description: "Medication reminders with safe wording.",
    emoji: "Med",
    key: "medication",
    label: "Medication"
  },
  {
    colour: "#24897f",
    description: "Doctor visits, checkups and appointments.",
    emoji: "Doc",
    key: "doctor_visit",
    label: "Doctor Visit"
  },
  {
    colour: "#f0ae2e",
    description: "Shared family events when circle features grow.",
    emoji: "Fam",
    key: "family",
    label: "Family"
  },
  {
    colour: "#3279f4",
    description: "Workouts, walks and movement goals.",
    emoji: "Fit",
    key: "fitness",
    label: "Fitness",
    moduleKey: "fitness"
  },
  {
    colour: "#f58d24",
    description: "Meal planning, food logs and hydration.",
    emoji: "Food",
    key: "food",
    label: "Food",
    moduleKey: "food"
  },
  {
    colour: "#48b9f0",
    description: "Future baby care reminders.",
    emoji: "Baby",
    key: "child_baby",
    label: "Child & Baby",
    moduleKey: "child_baby"
  },
  {
    colour: "#24897f",
    description: "Future elder check-ins and care tasks.",
    emoji: "Elder",
    key: "elder_care",
    label: "Elder Care",
    moduleKey: "elder_care"
  },
  {
    colour: "#f0ae2e",
    description: "Future caregiver shifts and care notes.",
    emoji: "Care",
    key: "caregiver",
    label: "Caregiver",
    moduleKey: "caregiver"
  },
  {
    colour: "#8652d6",
    description: "A custom reminder you define.",
    emoji: "Note",
    key: "custom",
    label: "Custom"
  }
];

export const PRIORITY_LABELS: Record<ReminderPriority, string> = {
  important: "Important",
  low: "Low",
  normal: "Normal",
  urgent: "Urgent"
};

export const PRIORITY_COLORS: Record<ReminderPriority, string> = {
  important: "#f97316",
  low: "#94a3b8",
  normal: "#7c3aed",
  urgent: "#dc2626"
};

export function getReminderTypeDefinition(type: ReminderType) {
  return REMINDER_TYPES.find((definition) => definition.key === type) ?? REMINDER_TYPES[0];
}
