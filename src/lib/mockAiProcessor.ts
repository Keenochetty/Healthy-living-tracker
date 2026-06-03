import type { AiExtractedDraft, AiJob } from "@/types/ai";

// Used only when backend is unavailable or during local UI tests.
const commonWarnings = [
  "Review this carefully before saving.",
  "Contact a healthcare professional if anything is unclear."
];

export function processMockAiJob(job: AiJob): AiExtractedDraft {
  switch (job.jobType) {
    case "doctor_report_scan":
      return {
        confidence: "medium",
        draftType: "doctor_visit",
        fields: {
          followUpDate: "Review needed",
          instructions: "Review original document before saving.",
          reason: "Review needed",
          summary: "AI found possible visit notes. Please review before saving.",
          warnings: commonWarnings
        },
        suggestedActions: ["Review visit date", "Confirm follow-up instructions"],
        summary: "AI found possible visit notes. Please review before saving.",
        title: "Doctor visit summary draft",
        warnings: commonWarnings
      };
    case "prescription_scan":
    case "medication_label_scan":
      return {
        confidence: "low",
        draftType: "medication_schedule",
        fields: {
          instructionsText: "Review needed",
          medicationName: "Review needed",
          warnings: [
            "AI may misread medication names or instructions.",
            "Do not save until you confirm the prescription."
          ]
        },
        remindersDraft: [
          {
            id: `reminder-${Date.now()}`,
            requiresUserConfirmation: true,
            title: "Medication reminder draft"
          }
        ],
        title: "Medication schedule draft",
        warnings: [
          "AI may misread medication names or instructions.",
          "Do not save until you confirm the prescription."
        ]
      };
    case "food_photo_scan":
      return {
        confidence: "low",
        draftType: "food_log",
        fields: {
          estimateOnly: true,
          foodName: "Food estimate needs review",
          warnings: ["Nutrition values are estimates."]
        },
        title: "Food estimate draft",
        warnings: ["Nutrition values are estimates."]
      };
    case "formula_label_scan":
      return {
        confidence: "low",
        draftType: "formula_info",
        fields: {
          formulaName: "Review needed",
          preparationInstructions: "Confirm on original label.",
          warnings: ["Confirm preparation instructions on the original label."]
        },
        title: "Formula label draft",
        warnings: ["Confirm preparation instructions on the original label."]
      };
    case "vaccination_card_scan":
      return {
        confidence: "low",
        draftType: "vaccination_record",
        fields: {
          status: "Review needed",
          vaccineName: "Review needed",
          warnings: ["Confirm vaccine timing with your clinic or healthcare professional."]
        },
        title: "Vaccination record draft",
        warnings: ["Confirm vaccine timing with your clinic or healthcare professional."]
      };
    case "symptom_summary":
      return {
        confidence: "medium",
        draftType: "symptom_note",
        fields: {
          note: job.textInput ?? "Review symptom note.",
          warnings: ["This is not a diagnosis."]
        },
        title: "Symptom note draft",
        warnings: ["This is not a diagnosis.", ...commonWarnings]
      };
    case "care_note_summary":
      return {
        confidence: "medium",
        draftType: "care_note",
        fields: {
          note: job.textInput ?? "Review care note.",
          warnings: commonWarnings
        },
        title: "Care note draft",
        warnings: commonWarnings
      };
    default:
      return {
        confidence: "medium",
        draftType: "general_note",
        fields: {
          note: job.textInput ?? "Review organised note.",
          warnings: commonWarnings
        },
        title: "Organised note draft",
        warnings: commonWarnings
      };
  }
}
