// Future Structured Output schema placeholders.
// These are comments/objects only; no mobile OpenAI API calls are implemented here.

export const doctorVisitSchema = {
  fields: ["doctorName", "visitDate", "reason", "summary", "instructions", "followUpDate"]
};

export const medicationScheduleSchema = {
  fields: ["medicationName", "dosageText", "instructionsText", "frequencyText", "reminderTimes"]
};

export const foodLogSchema = {
  fields: ["foodName", "mealType", "portionEstimate", "caloriesEstimate"],
  estimateOnly: true
};

export const formulaInfoSchema = {
  fields: ["formulaName", "preparationInstructions", "allergensMentioned", "servingInfo"]
};

export const vaccinationRecordSchema = {
  fields: ["vaccineName", "date", "batchNumber", "clinic", "status"]
};
