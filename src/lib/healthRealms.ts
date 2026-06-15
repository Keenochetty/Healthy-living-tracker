import type { AppIconName } from "@/constants/appIcons";

export type HealthRealmSlug =
  | "baby-child"
  | "care"
  | "documents"
  | "fitness"
  | "general"
  | "nutrition"
  | "womens-health";

export type HealthRealmPreview = {
  description: string;
  icon: AppIconName;
  status: string;
  title: string;
};

export type HealthRealm = {
  accent: string;
  description: string;
  eyebrow: string;
  icon: AppIconName;
  introTitle: string;
  previews: HealthRealmPreview[];
  safetyNote?: string;
  slug: HealthRealmSlug;
  status: "Family" | "Planned" | "Private" | "Ready" | "Secure" | "Support";
  subtitle: string;
  title: string;
};

export const HEALTH_REALMS: HealthRealm[] = [
  {
    accent: "#0f766e",
    description:
      "Everyday health logs, body metrics, and notes in one calm overview.",
    eyebrow: "Everyday overview",
    icon: "health",
    introTitle: "Keep the essentials easy to find",
    previews: [
      {
        description: "Organize everyday readings.",
        icon: "vitals",
        status: "Planned",
        title: "Vitals",
      },
      {
        description: "Keep weight and measurement logs.",
        icon: "weight",
        status: "Planned",
        title: "Body metrics",
      },
      {
        description: "Save questions and observations.",
        icon: "edit",
        status: "Ready",
        title: "Health notes",
      },
      {
        description: "View logged activity over time.",
        icon: "calendar_timeline",
        status: "Coming soon",
        title: "Weekly trends",
      },
    ],
    slug: "general",
    status: "Ready",
    subtitle: "A home for routine tracking, notes, and future trends.",
    title: "General Health",
  },
  {
    accent: "#db2777",
    description:
      "Private tools for cycle logs, symptoms, contraception, and notes.",
    eyebrow: "Private by default",
    icon: "pregnancy_cycle",
    introTitle: "A gentle space shaped around your choices",
    previews: [
      {
        description: "Review logged and predicted dates.",
        icon: "calendar_timeline",
        status: "Planned",
        title: "Cycle overview",
      },
      {
        description: "Keep private symptom notes.",
        icon: "edit",
        status: "Planned",
        title: "Symptoms",
      },
      {
        description: "Organize contraception reminders.",
        icon: "reminder",
        status: "Coming soon",
        title: "Contraception",
      },
      {
        description: "Control what is shared.",
        icon: "privacy",
        status: "Ready",
        title: "Private sharing",
      },
    ],
    safetyNote:
      "Predictions are estimates only. Contact a healthcare professional when unsure.",
    slug: "womens-health",
    status: "Private",
    subtitle: "Private-by-default tracking designed around your choices.",
    title: "Women's Health",
  },
  {
    accent: "#ea580c",
    description: "Movement, workout, and personal progress tools.",
    eyebrow: "Movement space",
    icon: "fitness",
    introTitle: "Build a clear view of the movement you log",
    previews: [
      {
        description: "Plan and log sessions.",
        icon: "fitness",
        status: "Ready",
        title: "Workouts",
      },
      {
        description: "Organize strength sessions.",
        icon: "health",
        status: "Ready",
        title: "Strength",
      },
      {
        description: "View steps and active time.",
        icon: "device_sync",
        status: "Ready",
        title: "Movement",
      },
      {
        description: "Save milestones you log.",
        icon: "add",
        status: "Ready",
        title: "Personal bests",
      },
    ],
    slug: "fitness",
    status: "Ready",
    subtitle: "A focused place for movement, workouts, recovery, and goals.",
    title: "Fitness",
  },
  {
    accent: "#16a34a",
    description: "Meals, hydration, and personal nutrition goals.",
    eyebrow: "Food and hydration",
    icon: "food",
    introTitle: "Keep food and water tracking simple",
    previews: [
      {
        description: "Organize meals you log.",
        icon: "food",
        status: "Planned",
        title: "Meals",
      },
      {
        description: "Keep a simple hydration log.",
        icon: "water",
        status: "Ready",
        title: "Water",
      },
      {
        description: "Prepare foods for quick logging.",
        icon: "scan",
        status: "Coming soon",
        title: "Food scan",
      },
      {
        description: "Set personal tracking goals.",
        icon: "edit",
        status: "Planned",
        title: "Goals",
      },
    ],
    slug: "nutrition",
    status: "Planned",
    subtitle: "Simple food and water organization without judgment.",
    title: "Nutrition",
  },
  {
    accent: "#0d9488",
    description: "A gentle space for child routines, records, and reminders.",
    eyebrow: "Family space",
    icon: "child_baby",
    introTitle: "Keep routines and records together",
    previews: [
      {
        description: "Save measurements and records.",
        icon: "weight",
        status: "Planned",
        title: "Growth",
      },
      {
        description: "Keep feeding logs together.",
        icon: "food",
        status: "Planned",
        title: "Feeding",
      },
      {
        description: "Organize sleep logs.",
        icon: "sleep",
        status: "Planned",
        title: "Sleep",
      },
      {
        description: "Save vaccine records and reminders.",
        icon: "records",
        status: "Coming soon",
        title: "Vaccines",
      },
    ],
    safetyNote:
      "Use records and reminders to prepare for visits, and discuss concerns with a healthcare professional.",
    slug: "baby-child",
    status: "Family",
    subtitle: "Track routines and organize records for a child profile.",
    title: "Baby / Child",
  },
  {
    accent: "#475569",
    description:
      "A secure, organized home for health files and visit paperwork.",
    eyebrow: "Organized records",
    icon: "records",
    introTitle: "Prepare important files for when they are needed",
    previews: [
      {
        description: "Organize prescription files.",
        icon: "medication",
        status: "Planned",
        title: "Prescriptions",
      },
      {
        description: "Keep results ready to review.",
        icon: "vitals",
        status: "Coming soon",
        title: "Lab results",
      },
      {
        description: "Save letters from care visits.",
        icon: "edit",
        status: "Planned",
        title: "Doctor letters",
      },
      {
        description: "Organize uploaded documents.",
        icon: "records",
        status: "Ready",
        title: "Medical files",
      },
    ],
    slug: "documents",
    status: "Secure",
    subtitle: "Prepare records and notes for future appointments.",
    title: "Documents",
  },
  {
    accent: "#0284c7",
    description: "Practical coordination tools for trusted care support.",
    eyebrow: "Trusted support",
    icon: "caregiver",
    introTitle: "Make care coordination easier to follow",
    previews: [
      {
        description: "Keep trusted contact details.",
        icon: "caregiver",
        status: "Ready",
        title: "Care contact",
      },
      {
        description: "Organize planned care times.",
        icon: "calendar_timeline",
        status: "Planned",
        title: "Rates / schedule",
      },
      {
        description: "Prepare concise care updates.",
        icon: "edit",
        status: "Coming soon",
        title: "Updates",
      },
      {
        description: "Keep important contact notes.",
        icon: "reminder",
        status: "Planned",
        title: "Emergency info",
      },
    ],
    slug: "care",
    status: "Support",
    subtitle: "Coordinate schedules, updates, and essential information.",
    title: "Care / Caregiver",
  },
];

export function getHealthRealm(slug?: string | string[]) {
  const value = Array.isArray(slug) ? slug[0] : slug;
  return HEALTH_REALMS.find((realm) => realm.slug === value);
}
