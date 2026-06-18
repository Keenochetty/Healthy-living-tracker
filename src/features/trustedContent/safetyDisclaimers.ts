import type {
  HealthOSTrustedContentCategory,
  HealthOSTrustedContentItem,
  HealthOSTrustedContentSafetyFlag,
} from "./types";

export const HEALTHOS_DEFAULT_MEDICAL_DISCLAIMER =
  "Educational only. This does not replace medical care.";

export function safetyFlagsForCategories(
  categories: HealthOSTrustedContentCategory[],
): HealthOSTrustedContentSafetyFlag[] {
  const flags = new Set<HealthOSTrustedContentSafetyFlag>([
    "notMedicalAdvice",
  ]);

  categories.forEach((category) => {
    if (category === "medication" || category === "supplements") {
      flags.add("medicationReview");
      flags.add("medicalDisclaimer");
    }
    if (category === "pregnancy") {
      flags.add("pregnancyReview");
      flags.add("medicalDisclaimer");
    }
    if (category === "babyChild") {
      flags.add("childReview");
      flags.add("medicalDisclaimer");
    }
    if (category === "womensHealth") {
      flags.add("medicalDisclaimer");
    }
  });

  return Array.from(flags);
}

export function getContentDisclaimer(item: HealthOSTrustedContentItem) {
  if (item.safetyFlags?.includes("emergencyCare")) {
    return "If symptoms feel severe or urgent, seek medical help.";
  }
  if (item.safetyFlags?.includes("medicationReview")) {
    return "Confirm medication instructions with your healthcare professional.";
  }
  if (
    item.safetyFlags?.includes("pregnancyReview") ||
    item.safetyFlags?.includes("childReview")
  ) {
    return "Seek professional care for urgent or severe symptoms.";
  }
  return item.medicalDisclaimerRequired
    ? HEALTHOS_DEFAULT_MEDICAL_DISCLAIMER
    : "Source-linked education for organization only.";
}
