import type {
  ElderCareNoteType,
  ElderCareQuality,
  ElderCheckInStatus,
  ElderConsentStatus
} from "@/types/elder";

export const ELDER_CHECK_IN_STATUS_OPTIONS: Array<{
  key: ElderCheckInStatus;
  label: string;
  marker: string;
}> = [
  { key: "okay", label: "Okay", marker: "OK" },
  { key: "needs_attention", label: "Needs attention", marker: "!" },
  { key: "missed", label: "Missed", marker: "Late" },
  { key: "urgent", label: "Urgent", marker: "Urgent" },
  { key: "not_sure", label: "Not sure", marker: "?" }
];

export const ELDER_QUALITY_OPTIONS: Array<{ key: ElderCareQuality; label: string }> = [
  { key: "poor", label: "Poor" },
  { key: "okay", label: "Okay" },
  { key: "good", label: "Good" }
];

export const ELDER_CARE_NOTE_TYPE_OPTIONS: Array<{
  key: ElderCareNoteType;
  label: string;
}> = [
  { key: "general", label: "General" },
  { key: "meal", label: "Meal" },
  { key: "medication", label: "Medication" },
  { key: "mobility", label: "Mobility" },
  { key: "incident", label: "Incident" },
  { key: "appointment", label: "Appointment" },
  { key: "caregiver", label: "Caregiver" }
];

export const ELDER_CONSENT_STATUS_OPTIONS: Array<{
  key: ElderConsentStatus;
  label: string;
}> = [
  { key: "not_requested", label: "Not requested" },
  { key: "requested", label: "Requested" },
  { key: "granted", label: "Granted" },
  { key: "declined", label: "Declined" }
];

export const ELDER_CARE_DISCLAIMER =
  "This app helps organise elder-care information and check-ins. It does not replace advice from a doctor, nurse, pharmacist or healthcare professional.";

export const ELDER_EMERGENCY_DISCLAIMER =
  "If something feels urgent or dangerous, contact local emergency services or a healthcare professional.";

export const ELDER_MEDICATION_DISCLAIMER =
  "Medication notes are for tracking only. Follow the healthcare professional's instructions.";

export const ELDER_CONSENT_DISCLAIMER =
  "Elder-care information should only be added or shared with the person's consent where possible.";

export function getElderCheckInStatusLabel(status?: ElderCheckInStatus) {
  return (
    ELDER_CHECK_IN_STATUS_OPTIONS.find((option) => option.key === status)?.label ??
    "No check-in"
  );
}
