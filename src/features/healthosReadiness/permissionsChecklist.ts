import type { HealthOSReadinessStatus } from "./performanceChecklist";

export type HealthOSPermissionReadinessItem = {
  currentImplementationStatus: HealthOSReadinessStatus;
  permission: string;
  reasonCopy: string;
  releaseBlocker: boolean;
  requestTiming: string;
  risk: string;
  storeDisclosureNeeded: boolean;
  usedBy: string[];
};

export const healthOSPermissionsChecklist: HealthOSPermissionReadinessItem[] = [
  permission("Camera", ["Scan camera", "Barcode scanning", "Profile photo"], "Needed only when the user chooses scan, camera capture, or barcode actions.", "User action", "needsReview", true, "Must be tested in development build.", true),
  permission("Photos / Media Library", ["Record upload", "AI input picker", "Profile photo", "Food image draft"], "Needed when the user chooses to import an image or document photo.", "User action", "needsReview", true, "Large images need thumbnail/storage strategy before release.", true),
  permission("Notifications", ["Reminder center", "Medication reminders", "Calendar reminders"], "Needed only when the user enables reminder notifications.", "User action/settings", "needsReview", true, "Push/local notification behavior needs development-build testing.", true),
  permission("Calendar", ["Health calendar export later"], "Calendar integration is installed but should only be requested when explicit calendar sync is enabled.", "Deferred user action", "deferred", true, "Do not imply native calendar sync is live until implemented.", false),
  permission("File / Document Access", ["Records upload"], "Needed when the user chooses a file to add to Records.", "User action", "needsReview", true, "Secure storage/viewer path must be finalized.", true),
  permission("Microphone", ["Voice logging later"], "Not active; disclose only if voice features become native recording.", "Deferred", "deferred", true, "Do not request microphone on startup.", false),
  permission("Location", ["Not active"], "Not required for current MVP.", "Not requested", "pass", false, "Avoid adding until a real feature needs it.", false),
  permission("Health integrations", ["Device Sync later"], "Not active as native health integration in this pass.", "Deferred", "deferred", true, "Needs platform-specific disclosure and device QA.", false),
  permission("Biometrics", ["App lock/security"], "Used only when the user enables local biometric security.", "User action/settings", "needsReview", true, "Needs denied/unavailable fallback testing.", true),
];

function permission(
  permission: string,
  usedBy: string[],
  reasonCopy: string,
  requestTiming: string,
  currentImplementationStatus: HealthOSReadinessStatus,
  storeDisclosureNeeded: boolean,
  risk: string,
  releaseBlocker: boolean,
): HealthOSPermissionReadinessItem {
  return {
    currentImplementationStatus,
    permission,
    reasonCopy,
    releaseBlocker,
    requestTiming,
    risk,
    storeDisclosureNeeded,
    usedBy,
  };
}
