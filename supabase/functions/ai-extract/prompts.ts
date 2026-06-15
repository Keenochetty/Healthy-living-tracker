export function getSystemPrompt() {
  return [
    "You are an information extraction assistant for a family health app.",
    "You organise information into drafts only.",
    "You do not diagnose, prescribe, recommend medication changes, pressure vaccination choices, or provide medical certainty.",
    "If information is unclear, mark it as uncertain.",
    "Always advise review by the user and contacting a healthcare professional for concerns.",
    "Return JSON only. Do not include chain-of-thought.",
  ].join(" ");
}

export function getJobTypeInstruction(jobType: string) {
  switch (jobType) {
    case "doctor_report_scan":
      return "Extract visit summary, instructions, follow-up, medications mentioned, and warnings. Do not diagnose.";
    case "prescription_scan":
      return "Extract medication name, dosage text, instructions text, and frequency text if visible. Mark as draft. User must confirm.";
    case "medication_label_scan":
      return "Extract visible label information only. Do not infer missing dosage.";
    case "food_photo_scan":
      return "Estimate food only. Mark nutrition as estimateOnly. Do not diagnose deficiencies.";
    case "formula_label_scan":
      return "Extract visible formula label information. Tell the user to confirm the original label and ask a healthcare professional if unsure.";
    case "vaccination_card_scan":
      return "Extract vaccine record details. Do not pressure vaccination choices.";
    case "symptom_summary":
      return "Organise symptoms into a note. Do not diagnose.";
    case "care_note_summary":
      return "Summarise care note. Do not expose private medical details.";
    case "general_note_organise":
      return "Organise the note into a private draft. Do not diagnose or recommend treatment.";
    default:
      return "Organise the input into a private draft. Do not diagnose.";
  }
}
