import { AppModule } from "@/types/app";

export const APP_MODULES: AppModule[] = [
  {
    key: "personal_health",
    name: "Personal Health",
    description: "Mood, sleep, water, medication and personal health logs.",
    emoji: "💜",
    core: true,
  },
  {
    key: "planning",
    name: "Planning",
    description: "Calendar, work reminders, appointments and daily planning.",
    emoji: "📅",
    core: true,
  },
  {
    key: "circle",
    name: "Circle",
    description: "Invite a partner, friend, family member or trusted person.",
    emoji: "👨‍👩‍👧",
    core: true,
  },
  {
    key: "child_baby",
    name: "Child & Baby",
    description: "Feeds, milestones, growth, sleep, vaccines and baby care.",
    emoji: "🍼",
    core: false,
  },
  {
    key: "pregnancy_cycle",
    name: "Pregnancy & Cycle",
    description: "Private flow tracking, pregnancy support and cycle insights.",
    emoji: "🌸",
    core: false,
  },
  {
    key: "elder_care",
    name: "Elder Care",
    description: "Check-ins, medication, vitals and elder-care reminders.",
    emoji: "🌿",
    core: false,
  },
  {
    key: "caregiver",
    name: "Caregiver",
    description: "Caregiver card, booking, rates, check-ins and care notes.",
    emoji: "🤝",
    core: false,
  },
  {
    key: "fitness",
    name: "Fitness",
    description: "Steps, workouts, timers, goals and progress tracking.",
    emoji: "🏃",
    core: false,
  },
  {
    key: "food",
    name: "Food Tracking",
    description: "Food photos, calories, vitamins, water and meal insights.",
    emoji: "🥗",
    core: false,
  },
  {
    key: "ai_assistant",
    name: "AI Assistant",
    description: "Scan reports, organise reminders and help explain records.",
    emoji: "✨",
    core: false,
  },
];

export const CORE_MODULE_KEYS = APP_MODULES.filter((module) => module.core).map(
  (module) => module.key
);
