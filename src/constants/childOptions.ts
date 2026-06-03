import type {
  ChildProfileType,
  DiaperType,
  FeedType,
  MilestoneCategory,
  VaccinationStatus
} from "@/types/child";

export const CHILD_PROFILE_TYPE_OPTIONS: Array<{
  emoji: string;
  key: ChildProfileType;
  label: string;
}> = [
  { emoji: "Baby", key: "baby", label: "Baby" },
  { emoji: "Toddler", key: "toddler", label: "Toddler" },
  { emoji: "Child", key: "child", label: "Child" },
  { emoji: "Teen", key: "teen", label: "Teen" }
];

export const FEED_TYPE_OPTIONS: Array<{ emoji: string; key: FeedType; label: string }> = [
  { emoji: "Milk", key: "formula", label: "Formula" },
  { emoji: "Breast", key: "breast", label: "Breast" },
  { emoji: "Bottle", key: "expressed_milk", label: "Expressed milk" },
  { emoji: "Food", key: "solids", label: "Solids" },
  { emoji: "Water", key: "water", label: "Water" },
  { emoji: "Other", key: "other", label: "Other" }
];

export const QUICK_FEED_AMOUNTS = [30, 60, 90, 120, 150, 180];

export const DIAPER_OPTIONS: Array<{ key: DiaperType; label: string }> = [
  { key: "wet", label: "Wet" },
  { key: "dirty", label: "Dirty" },
  { key: "mixed", label: "Mixed" },
  { key: "dry", label: "Dry" },
  { key: "other", label: "Other" }
];

export const MILESTONE_SUGGESTIONS = [
  "First smile",
  "First laugh",
  "Rolled over",
  "Sat without support",
  "Crawled",
  "First steps",
  "First word",
  "Started solids",
  "Slept longer stretch"
];

export const MILESTONE_CATEGORIES: MilestoneCategory[] = [
  "movement",
  "speech",
  "social",
  "feeding",
  "sleep",
  "firsts",
  "custom"
];

export const VACCINATION_STATUSES: VaccinationStatus[] = [
  "planned",
  "completed",
  "postponed",
  "skipped",
  "not_sure"
];

export const CHILD_SAFETY_DISCLAIMER =
  "This app helps parents and caregivers organise child care information. It does not replace a doctor, nurse, clinic or paediatrician.";

export const VACCINATION_DISCLAIMER =
  "Vaccination records are for tracking only. Confirm timing and requirements with your healthcare professional or clinic.";

export const FEEDING_DISCLAIMER =
  "Feeding patterns can vary. If you are worried about feeding, dehydration, allergies, fever, growth or symptoms, contact a healthcare professional.";

export function getChildProfileTypeLabel(profileType: ChildProfileType) {
  return (
    CHILD_PROFILE_TYPE_OPTIONS.find((option) => option.key === profileType)?.label ??
    "Child"
  );
}

export function getFeedTypeLabel(feedType: FeedType) {
  return FEED_TYPE_OPTIONS.find((option) => option.key === feedType)?.label ?? "Feed";
}
