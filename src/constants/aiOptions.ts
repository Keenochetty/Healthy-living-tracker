import type { AiJobType } from "@/types/ai";

export const AI_JOB_TYPE_OPTIONS: Array<{
  description: string;
  emoji: string;
  key: AiJobType;
  label: string;
}> = [
  {
    description: "Extract a visit summary, instructions and follow-up notes.",
    emoji: "Report",
    key: "doctor_report_scan",
    label: "Doctor report",
  },
  {
    description:
      "Create a draft medication reminder from instructions you approve.",
    emoji: "Pill",
    key: "prescription_scan",
    label: "Prescription",
  },
  {
    description: "Read label details for your review.",
    emoji: "Label",
    key: "medication_label_scan",
    label: "Medication label",
  },
  {
    description: "Estimate meal details. Estimates only.",
    emoji: "Food",
    key: "food_photo_scan",
    label: "Food photo",
  },
  {
    description: "Read formula label information for parent review.",
    emoji: "Formula",
    key: "formula_label_scan",
    label: "Formula label",
  },
  {
    description: "Create a draft vaccination record.",
    emoji: "Vaccine",
    key: "vaccination_card_scan",
    label: "Vaccination card",
  },
  {
    description: "Organise your symptoms into a note for review.",
    emoji: "Note",
    key: "symptom_summary",
    label: "Symptom summary",
  },
  {
    description: "Summarise caregiver or family care notes.",
    emoji: "Care",
    key: "care_note_summary",
    label: "Care note",
  },
  {
    description: "Organise a general note into a private draft.",
    emoji: "General",
    key: "general_note_organise",
    label: "General note",
  },
];

export const AI_GENERAL_DISCLAIMER =
  "AI can help organise information, but it can make mistakes. Review everything before saving.";
export const AI_MEDICAL_DISCLAIMER =
  "This app does not diagnose or replace a doctor, nurse, pharmacist, dietitian, clinic or healthcare professional.";
export const AI_MEDICATION_DISCLAIMER =
  "AI-created medication schedules are drafts. Follow your healthcare professional's instructions.";
export const AI_FOOD_DISCLAIMER =
  "Food and nutrition values are estimates only.";
export const AI_BABY_FORMULA_DISCLAIMER =
  "Baby feeding and formula information must be confirmed with your healthcare professional or clinic if you are unsure.";
export const AI_VACCINATION_DISCLAIMER =
  "Vaccination records are for tracking. Confirm timing and requirements with your healthcare professional or clinic.";

export function getAiJobTypeLabel(jobType: AiJobType) {
  return (
    AI_JOB_TYPE_OPTIONS.find((option) => option.key === jobType)?.label ??
    jobType
  );
}
