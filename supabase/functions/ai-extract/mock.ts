const commonWarnings = [
  "Review this carefully before saving.",
  "Contact a healthcare professional if anything is unclear."
];

export function createMockDraft(jobType: string, textInput?: string) {
  switch (jobType) {
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
        remindersDraft: [],
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
            id: crypto.randomUUID(),
            requiresUserConfirmation: true,
            title: "Medication reminder draft"
          }
        ],
        suggestedActions: ["Confirm medication name and instructions from the original source."],
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
        estimateOnly: true,
        fields: {
          estimateOnly: true,
          foodName: "Food estimate needs review",
          warnings: ["Nutrition values are estimates."]
        },
        remindersDraft: [],
        suggestedActions: ["Review portion estimate before saving."],
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
        remindersDraft: [],
        suggestedActions: ["Check the original label."],
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
        remindersDraft: [],
        suggestedActions: ["Confirm record with your clinic if unsure."],
        title: "Vaccination record draft",
        warnings: ["Confirm vaccine timing with your clinic or healthcare professional."]
      };
    case "symptom_summary":
      return {
        confidence: "medium",
        draftType: "symptom_note",
        fields: {
          note: textInput ?? "Review symptom note.",
          warnings: ["This is not a diagnosis."]
        },
        remindersDraft: [],
        suggestedActions: ["Contact a healthcare professional for concerns."],
        title: "Symptom note draft",
        warnings: ["This is not a diagnosis.", ...commonWarnings]
      };
    default:
      return {
        confidence: "medium",
        draftType: "general_note",
        fields: {
          note: textInput ?? "Review organised note.",
          warnings: commonWarnings
        },
        remindersDraft: [],
        suggestedActions: ["Review before saving."],
        title: "Organised note draft",
        warnings: commonWarnings
      };
  }
}
