export const doctorVisitDraftSchema = {
  additionalProperties: false,
  properties: {
    confidence: { enum: ["low", "medium", "high"], type: "string" },
    doctorName: { type: ["string", "null"] },
    draftType: { const: "doctor_visit" },
    followUpDate: { type: ["string", "null"] },
    instructions: { type: ["string", "null"] },
    medicationsMentioned: { items: { type: "string" }, type: "array" },
    reason: { type: ["string", "null"] },
    summary: { type: "string" },
    title: { type: "string" },
    visitDate: { type: ["string", "null"] },
    warnings: { items: { type: "string" }, type: "array" },
  },
  required: ["draftType", "title", "summary", "warnings", "confidence"],
  type: "object",
};

export const medicationScheduleDraftSchema = {
  additionalProperties: false,
  properties: {
    confidence: { enum: ["low", "medium", "high"], type: "string" },
    dosageText: { type: ["string", "null"] },
    draftType: { const: "medication_schedule" },
    frequencyText: { type: ["string", "null"] },
    instructionsText: { type: ["string", "null"] },
    medicationName: { type: ["string", "null"] },
    reminderTimes: { items: { type: "string" }, type: "array" },
    requiresUserReview: { const: true },
    takeWithFood: { type: ["boolean", "null"] },
    warnings: { items: { type: "string" }, type: "array" },
  },
  required: ["draftType", "warnings", "confidence", "requiresUserReview"],
  type: "object",
};

export const foodLogDraftSchema = {
  additionalProperties: false,
  properties: {
    caloriesEstimate: { type: ["number", "null"] },
    carbsEstimate: { type: ["number", "null"] },
    confidence: { enum: ["low", "medium", "high"], type: "string" },
    draftType: { const: "food_log" },
    estimateOnly: { const: true },
    fatEstimate: { type: ["number", "null"] },
    foodName: { type: ["string", "null"] },
    mealType: { type: ["string", "null"] },
    portionEstimate: { type: ["string", "null"] },
    proteinEstimate: { type: ["number", "null"] },
    warnings: { items: { type: "string" }, type: "array" },
  },
  required: ["draftType", "estimateOnly", "warnings", "confidence"],
  type: "object",
};

export const formulaInfoDraftSchema = {
  additionalProperties: false,
  properties: {
    allergensMentioned: { items: { type: "string" }, type: "array" },
    confidence: { enum: ["low", "medium", "high"], type: "string" },
    draftType: { const: "formula_info" },
    formulaName: { type: ["string", "null"] },
    preparationInstructions: { type: ["string", "null"] },
    servingInfo: { type: ["string", "null"] },
    warnings: { items: { type: "string" }, type: "array" },
  },
  required: ["draftType", "warnings", "confidence"],
  type: "object",
};

export const vaccinationRecordDraftSchema = {
  additionalProperties: false,
  properties: {
    batchNumber: { type: ["string", "null"] },
    clinic: { type: ["string", "null"] },
    confidence: { enum: ["low", "medium", "high"], type: "string" },
    date: { type: ["string", "null"] },
    draftType: { const: "vaccination_record" },
    status: { type: ["string", "null"] },
    vaccineName: { type: ["string", "null"] },
    warnings: { items: { type: "string" }, type: "array" },
  },
  required: ["draftType", "warnings", "confidence"],
  type: "object",
};

export const symptomNoteDraftSchema = {
  additionalProperties: false,
  properties: {
    confidence: { enum: ["low", "medium", "high"], type: "string" },
    draftType: { const: "symptom_note" },
    suggestedActions: { items: { type: "string" }, type: "array" },
    summary: { type: "string" },
    symptomsMentioned: { items: { type: "string" }, type: "array" },
    timeline: { type: ["string", "null"] },
    title: { type: "string" },
    warnings: { items: { type: "string" }, type: "array" },
  },
  required: ["draftType", "title", "summary", "warnings", "confidence"],
  type: "object",
};
