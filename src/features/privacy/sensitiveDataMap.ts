import type { HealthOSPrivacyScopeKey } from "./privacyScopes";

export type HealthOSDataArea =
  | "profile"
  | "emergencyContacts"
  | "healthLogs"
  | "biometrics"
  | "medication"
  | "supplements"
  | "records"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "family"
  | "caregiver"
  | "aiImport"
  | "notifications"
  | "trustedContent"
  | "calendar"
  | "fitness"
  | "nutrition";

export type HealthOSDataSensitivity = {
  area: HealthOSDataArea;
  label: string;
  sensitive: boolean;
  defaultPrivacyScope: HealthOSPrivacyScopeKey;
  notificationPrivacySafeTitle: string;
  canShareWithFamily: boolean;
  canShareWithCaregiver: boolean;
  requiresReview: boolean;
  exportApplies: boolean;
  deleteApplies: boolean;
};

export const healthOSSensitiveDataMap: Record<
  HealthOSDataArea,
  HealthOSDataSensitivity
> = {
  profile: data("profile", "Profile", true, "private", "Profile update", true, false, false),
  emergencyContacts: data("emergencyContacts", "Emergency contacts", true, "emergencyOnly", "Emergency contact update", true, true, true),
  healthLogs: data("healthLogs", "Health logs", true, "private", "Health log update", true, false, true),
  biometrics: data("biometrics", "Biometrics", true, "private", "Biometric update", true, false, true),
  medication: data("medication", "Medication", true, "private", "Medication update", true, false, true),
  supplements: data("supplements", "Supplements", true, "private", "Supplement update", true, false, true),
  records: data("records", "Records", true, "private", "Record update", true, false, true),
  pregnancy: data("pregnancy", "Pregnancy", true, "private", "Pregnancy update", true, false, true),
  babyChild: data("babyChild", "Baby / child", true, "caregiverLimited", "Child care update", true, true, true),
  womensHealth: data("womensHealth", "Women's health", true, "private", "Women's health update", true, false, true),
  family: data("family", "Family", true, "selectedFamily", "Family update", true, true, false),
  caregiver: data("caregiver", "Caregiver", true, "caregiverLimited", "Caregiver update", true, true, false),
  aiImport: data("aiImport", "AI import", true, "private", "AI draft update", false, false, true),
  notifications: data("notifications", "Notifications", true, "private", "Reminder update", false, false, false),
  trustedContent: data("trustedContent", "Trusted content", false, "publicReference", "Trusted content", true, true, false),
  calendar: data("calendar", "Calendar", true, "selectedFamily", "Calendar update", true, true, false),
  fitness: data("fitness", "Fitness", true, "private", "Fitness update", true, false, true),
  nutrition: data("nutrition", "Nutrition", true, "private", "Nutrition update", true, false, true),
};

function data(
  area: HealthOSDataArea,
  label: string,
  sensitive: boolean,
  defaultPrivacyScope: HealthOSPrivacyScopeKey,
  notificationPrivacySafeTitle: string,
  canShareWithFamily: boolean,
  canShareWithCaregiver: boolean,
  requiresReview: boolean,
): HealthOSDataSensitivity {
  return {
    area,
    label,
    sensitive,
    defaultPrivacyScope,
    notificationPrivacySafeTitle,
    canShareWithFamily,
    canShareWithCaregiver,
    requiresReview,
    exportApplies: true,
    deleteApplies: true,
  };
}
