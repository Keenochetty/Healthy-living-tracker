import type { LifeStagePrivacyScope } from "./lifeStageTypes";

type PrivacyInput = { privacyScope?: LifeStagePrivacyScope | "private" | string | null };

export function isPregnancyPrivate(item?: PrivacyInput | null) {
  return item?.privacyScope !== "selectedFamily" && item?.privacyScope !== "caregiverLimited";
}

export function isWomenHealthPrivate(item?: PrivacyInput | null) {
  return item?.privacyScope !== "selectedFamily" && item?.privacyScope !== "caregiverLimited";
}

export function isSexDayLogPrivate() {
  return true;
}

export function isChildDataPrivate(item?: PrivacyInput | null) {
  return item?.privacyScope !== "selectedFamily" && item?.privacyScope !== "caregiverLimited";
}

export function canShowLifeStageDataInFamilyContext(input?: { explicitPermission?: boolean; category?: string }) {
  if (input?.category === "sexDay" || input?.category === "womenHealth") return false;
  return input?.explicitPermission === true;
}

export function canShowCaregiverChildSummary(input?: { explicitPermission?: boolean; isGuardian?: boolean }) {
  return input?.isGuardian === true || input?.explicitPermission === true;
}

export function getPrivacySafeLifeStageTitle(realm: "pregnancy" | "womenHealth" | "childCare" | "vaccine") {
  if (realm === "pregnancy") return "Pregnancy reminder";
  if (realm === "womenHealth") return "Women's health reminder";
  if (realm === "vaccine") return "Vaccine record reminder";
  return "Child care reminder";
}

export function getLifeStagePrivacyLabel(item?: PrivacyInput | null) {
  if (!item || item.privacyScope === "private") return "Private";
  if (item.privacyScope === "caregiverLimited") return "Limited caregiver access";
  if (item.privacyScope === "selectedFamily") return "Shared with selected people";
  return "Private";
}

export function getSharedContextRedactionLabel(category?: string) {
  if (category === "sexDay") return "Private log hidden";
  if (category === "womenHealth") return "Women's health details hidden";
  if (category === "pregnancy") return "Pregnancy details hidden";
  return "Sensitive details hidden";
}
