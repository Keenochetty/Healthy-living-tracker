import type {
  HealthOSTrustedContentCategory,
  HealthOSTrustedContentRealm,
} from "./types";

export const HEALTHOS_TRUSTED_CONTENT_FILTERS: {
  key: HealthOSTrustedContentCategory | "all" | "needsReview" | "officialSources" | "recentlyUpdated" | "saved";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "generalHealth", label: "Health" },
  { key: "nutrition", label: "Nutrition" },
  { key: "medication", label: "Medication" },
  { key: "supplements", label: "Supplements" },
  { key: "fitness", label: "Fitness" },
  { key: "pregnancy", label: "Pregnancy" },
  { key: "babyChild", label: "Baby/Child" },
  { key: "womensHealth", label: "Women’s Health" },
  { key: "records", label: "Records" },
  { key: "family", label: "Family" },
  { key: "calendar", label: "Calendar" },
  { key: "saved", label: "Saved" },
  { key: "needsReview", label: "Needs review" },
  { key: "officialSources", label: "Official sources" },
  { key: "recentlyUpdated", label: "Recently updated" },
];

export const HEALTHOS_REALM_CONTENT_TITLES: Record<
  HealthOSTrustedContentRealm,
  { subtitle: string; title: string }
> = {
  ai: {
    subtitle: "Source context for assistant answers.",
    title: "AI source cards",
  },
  babyChild: {
    subtitle: "Source-linked baby and child care education.",
    title: "Baby and child care",
  },
  calendar: {
    subtitle: "Planning and reminder education.",
    title: "Calendar guides",
  },
  family: {
    subtitle: "Family care and caregiver education.",
    title: "Family care guides",
  },
  fitness: {
    subtitle: "Exercise, recovery, and safety guides.",
    title: "Fitness guides",
  },
  health: {
    subtitle: "General health education.",
    title: "Health education",
  },
  general: {
    subtitle: "General educational content.",
    title: "General education",
  },
  home: {
    subtitle: "Helpful education for today.",
    title: "Recommended reading",
  },
  medication: {
    subtitle: "Medication safety and label education.",
    title: "Medication safety",
  },
  nutrition: {
    subtitle: "Nutrition articles and recipes.",
    title: "Nutrition articles and recipes",
  },
  pregnancy: {
    subtitle: "Pregnancy education and planning.",
    title: "Pregnancy articles",
  },
  records: {
    subtitle: "Record organization and source tips.",
    title: "Record organization tips",
  },
  scan: {
    subtitle: "Scanning and import education.",
    title: "Scan source education",
  },
  settings: {
    subtitle: "Privacy, account, and app education.",
    title: "Settings education",
  },
  supplements: {
    subtitle: "Supplement label and safety education.",
    title: "Supplement safety",
  },
  womensHealth: {
    subtitle: "Women’s health and cycle education.",
    title: "Women’s health articles",
  },
};

export function categoryLabel(category: HealthOSTrustedContentCategory) {
  return (
    HEALTHOS_TRUSTED_CONTENT_FILTERS.find((item) => item.key === category)
      ?.label ?? "Other"
  );
}
