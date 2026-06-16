export type AssistantFeatureMatch = {
  description: string;
  label: string;
  route: string;
};

type FeatureRule = AssistantFeatureMatch & {
  intent: RegExp;
  subject: RegExp;
};

const FEATURE_RULES: FeatureRule[] = [
  {
    description: "Log meals, water, recipes, and nutrition.",
    intent: /\b(add|log|open|record|scan|show|track)\b/i,
    label: "Open Food",
    route: "/food",
    subject: /\b(food|meal|breakfast|lunch|dinner|nutrition|water|recipe)\b/i,
  },
  {
    description: "Open workouts, plans, goals, and exercise history.",
    intent: /\b(add|log|open|plan|record|show|start|track)\b/i,
    label: "Open Fitness",
    route: "/fitness",
    subject: /\b(exercise|fitness|goal|run|steps|workout)\b/i,
  },
  {
    description: "Add or review reminders and appointments.",
    intent: /\b(add|book|create|open|remind|schedule|show)\b/i,
    label: "Open Calendar",
    route: "/calendar",
    subject: /\b(appointment|calendar|event|reminder|schedule)\b/i,
  },
  {
    description: "Add or review medications and supplements.",
    intent: /\b(add|check|log|open|record|show|track)\b/i,
    label: "Open Medication",
    route: "/medication",
    subject: /\b(medication|medicine|pill|prescription|supplement)\b/i,
  },
  {
    description: "Store and review health records and notes.",
    intent: /\b(add|find|open|record|scan|search|show|upload)\b/i,
    label: "Open Records",
    route: "/records",
    subject: /\b(document|lab|note|record|report|result)\b/i,
  },
  {
    description: "Open vital signs, measurements, and health history.",
    intent: /\b(add|check|log|open|record|show|track)\b/i,
    label: "Open Health",
    route: "/health",
    subject:
      /\b(blood pressure|health|heart rate|oxygen|temperature|vitals|weight)\b/i,
  },
  {
    description: "Use the camera and document scanning tools.",
    intent: /\b(open|scan|take|upload)\b/i,
    label: "Open Scan",
    route: "/scan",
    subject: /\b(barcode|camera|document|food|label|photo|report)\b/i,
  },
  {
    description: "Open family sharing and caregiver tools.",
    intent: /\b(add|invite|open|share|show)\b/i,
    label: "Open Family",
    route: "/circle",
    subject: /\b(caregiver|circle|family|member|partner)\b/i,
  },
  {
    description: "Open baby and child tracking.",
    intent: /\b(add|log|open|record|show|track)\b/i,
    label: "Open Baby & Child",
    route: "/baby-child",
    subject: /\b(baby|child|diaper|feeding|milestone|vaccination)\b/i,
  },
  {
    description: "Open private cycle tracking.",
    intent: /\b(add|log|open|record|show|track)\b/i,
    label: "Open Cycle",
    route: "/cycle",
    subject: /\b(cycle|period|menstrual|symptom)\b/i,
  },
  {
    description: "Open pregnancy tracking and appointment preparation.",
    intent: /\b(add|log|open|record|show|track)\b/i,
    label: "Open Pregnancy",
    route: "/pregnancy",
    subject: /\b(pregnancy|pregnant|trimester|week)\b/i,
  },
  {
    description: "Review privacy, permissions, and assistant consent.",
    intent: /\b(change|manage|open|review|show|update)\b/i,
    label: "Open Privacy",
    route: "/settings/privacy-center",
    subject: /\b(consent|permission|privacy|sharing)\b/i,
  },
  {
    description: "Open app settings.",
    intent: /\b(change|manage|open|show|update)\b/i,
    label: "Open Settings",
    route: "/settings",
    subject: /\b(notification|profile|setting|theme|unit)\b/i,
  },
];

export function findAssistantFeature(message: string) {
  const normalized = message.trim();

  return (
    FEATURE_RULES.find(
      (feature) =>
        feature.intent.test(normalized) && feature.subject.test(normalized),
    ) ?? null
  );
}
