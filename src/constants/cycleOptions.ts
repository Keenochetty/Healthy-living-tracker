import type {
  CycleFlowLevel,
  CycleMood,
  CycleSymptomType,
  PregnancyStatus
} from "@/types/cycle";

export const FLOW_OPTIONS: Array<{ key: CycleFlowLevel; label: string }> = [
  { key: "spotting", label: "Spotting" },
  { key: "light", label: "Light" },
  { key: "medium", label: "Medium" },
  { key: "heavy", label: "Heavy" },
  { key: "very_heavy", label: "Very heavy" }
];

export const SYMPTOM_OPTIONS: Array<{ key: CycleSymptomType; label: string }> = [
  { key: "cramps", label: "Cramps" },
  { key: "headache", label: "Headache" },
  { key: "bloating", label: "Bloating" },
  { key: "breast_tenderness", label: "Breast tenderness" },
  { key: "acne", label: "Acne" },
  { key: "nausea", label: "Nausea" },
  { key: "back_pain", label: "Back pain" },
  { key: "fatigue", label: "Fatigue" },
  { key: "cravings", label: "Cravings" },
  { key: "mood_changes", label: "Mood changes" },
  { key: "sleep_changes", label: "Sleep changes" },
  { key: "other", label: "Other" }
];

export const MOOD_OPTIONS: Array<{ key: CycleMood; label: string }> = [
  { key: "calm", label: "Calm" },
  { key: "happy", label: "Happy" },
  { key: "emotional", label: "Emotional" },
  { key: "irritated", label: "Irritated" },
  { key: "anxious", label: "Anxious" },
  { key: "low", label: "Low" },
  { key: "stressed", label: "Stressed" },
  { key: "tired", label: "Tired" }
];

export const PREGNANCY_STATUS_OPTIONS: Array<{
  key: PregnancyStatus;
  label: string;
}> = [
  { key: "not_tracking", label: "Not tracking" },
  { key: "possible", label: "Possible" },
  { key: "trying", label: "Trying" },
  { key: "pregnant", label: "Pregnant" },
  { key: "postpartum", label: "Postpartum" },
  { key: "not_sure", label: "Not sure" }
];

export const CYCLE_DISCLAIMER =
  "This tracker helps you notice cycle patterns. Predictions are estimates and do not replace advice from a healthcare professional.";

export const PREGNANCY_DISCLAIMER =
  "This app can help organise pregnancy notes, symptoms and appointments. It does not diagnose pregnancy or replace a doctor, midwife, nurse or healthcare professional.";

export const CYCLE_PRIVACY_DISCLAIMER =
  "Cycle and pregnancy information is private by default. It is not shared with your circle unless you choose to share it later.";

export const URGENT_PREGNANCY_SYMPTOM_WARNING =
  "If symptoms feel urgent, severe, unusual, or worrying, contact a healthcare professional or emergency service.";

export function getPregnancyStatusLabel(status?: PregnancyStatus) {
  return (
    PREGNANCY_STATUS_OPTIONS.find((option) => option.key === status)?.label ??
    "Not tracking"
  );
}
