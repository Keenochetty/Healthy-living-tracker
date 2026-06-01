export const profileTypes = [
  "parent_guardian",
  "caregiver",
  "woman",
  "man",
  "child",
  "baby",
  "elderly_dependent",
  "adult_male",
  "adult_female",
  "pregnant_mother",
  "postpartum_mother",
  "elderly_family_member"
] as const;

export const genders = ["male", "female", "other", "prefer_not_to_say"] as const;

export const privacyLevels = ["private", "family_shared", "partner_shared", "caregiver_shared"] as const;

export const userRoles = ["parent_guardian", "caregiver", "woman", "man", "child", "baby", "elderly_dependent"] as const;

export const caregiverModes = ["personal", "work"] as const;

export const notificationUrgencies = ["normal", "schedule", "attention", "important", "emergency"] as const;

export const caregiverActivityTypes = [
  "feed",
  "nap",
  "medication_given",
  "bathroom",
  "mood",
  "activity",
  "incident",
  "photo_update",
  "note_to_parent",
  "emergency_alert"
] as const;

export const calendarEventTypes = [
  "family_event",
  "doctor_visit",
  "medication_reminder",
  "school_event",
  "sports_day",
  "caregiver_schedule",
  "feeding_schedule",
  "baby_routine",
  "parent_appointment",
  "child_submitted"
] as const;

export const trackingCategories = [
  "symptom",
  "medicine",
  "temperature",
  "blood_pressure",
  "weight",
  "mood",
  "pain",
  "sleep",
  "feeding",
  "diaper",
  "vaccination",
  "doctor_visit"
] as const;

export const documentCategories = [
  "doctor_report",
  "lab_result",
  "prescription",
  "scan_image",
  "vaccination_card",
  "medical_note",
  "general_document"
] as const;

export const profileTypeLabels: Record<(typeof profileTypes)[number], string> = {
  parent_guardian: "Parent / Guardian",
  caregiver: "Caregiver",
  woman: "Woman",
  man: "Man",
  child: "Child",
  baby: "Baby",
  elderly_dependent: "Elderly dependent",
  adult_male: "Adult male",
  adult_female: "Adult female",
  pregnant_mother: "Pregnant mother",
  postpartum_mother: "Postpartum mother",
  elderly_family_member: "Elderly family member"
};

export const userRoleLabels: Record<(typeof userRoles)[number], string> = {
  parent_guardian: "Parent / Guardian",
  caregiver: "Caregiver",
  woman: "Woman",
  man: "Man",
  child: "Child",
  baby: "Baby",
  elderly_dependent: "Elderly dependent"
};

export const privacyLevelLabels: Record<(typeof privacyLevels)[number], string> = {
  private: "Private",
  family_shared: "Family shared",
  partner_shared: "Partner shared",
  caregiver_shared: "Caregiver shared"
};

export const notificationUrgencyLabels: Record<(typeof notificationUrgencies)[number], string> = {
  normal: "Normal update",
  schedule: "Schedule/activity",
  attention: "Needs attention",
  important: "Important care",
  emergency: "Emergency"
};

export const notificationUrgencyClasses: Record<(typeof notificationUrgencies)[number], string> = {
  normal: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  schedule: "border-sky-300/25 bg-sky-400/10 text-sky-100",
  attention: "border-yellow-300/25 bg-yellow-400/10 text-yellow-100",
  important: "border-orange-300/25 bg-orange-400/10 text-orange-100",
  emergency: "border-red-300/25 bg-red-500/10 text-red-100"
};

export const caregiverActivityLabels: Record<(typeof caregiverActivityTypes)[number], string> = {
  feed: "Feed",
  nap: "Nap",
  medication_given: "Medication given",
  bathroom: "Bathroom",
  mood: "Mood",
  activity: "Activity",
  incident: "Incident",
  photo_update: "Photo update",
  note_to_parent: "Note to parent",
  emergency_alert: "Emergency alert"
};

export const calendarEventTypeLabels: Record<(typeof calendarEventTypes)[number], string> = {
  family_event: "Family event",
  doctor_visit: "Doctor visit",
  medication_reminder: "Medication reminder",
  school_event: "School event",
  sports_day: "Sports day",
  caregiver_schedule: "Caregiver schedule",
  feeding_schedule: "Feeding schedule",
  baby_routine: "Baby routine",
  parent_appointment: "Parent appointment",
  child_submitted: "Child submitted"
};

export const trackingCategoryLabels: Record<(typeof trackingCategories)[number], string> = {
  symptom: "Symptom",
  medicine: "Medicine",
  temperature: "Temperature",
  blood_pressure: "Blood pressure",
  weight: "Weight",
  mood: "Mood",
  pain: "Pain",
  sleep: "Sleep",
  feeding: "Feeding",
  diaper: "Diaper",
  vaccination: "Vaccination",
  doctor_visit: "Doctor visit"
};

export const documentCategoryLabels: Record<(typeof documentCategories)[number], string> = {
  doctor_report: "Doctor report",
  lab_result: "Lab result",
  prescription: "Prescription",
  scan_image: "Scan image",
  vaccination_card: "Vaccination card",
  medical_note: "Medical note",
  general_document: "General document"
};
