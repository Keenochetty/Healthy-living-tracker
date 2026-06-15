export type MensHealthStatus = "disabled" | "enabled" | "shared_view_only";

export type MensHealthCheckInFrequency = "daily" | "weekly" | "custom";

export type MensHealthSymptomKey =
  | "testicular_lump_note"
  | "testicular_pain"
  | "groin_pain"
  | "urinary_frequency"
  | "burning_urination"
  | "weak_stream"
  | "blood_in_urine_note"
  | "pelvic_pain"
  | "erectile_difficulty_note"
  | "low_libido_note"
  | "fatigue"
  | "mood_stress"
  | "sleep_issue"
  | "body_changes"
  | "other";

export type MensHealthReminderType =
  | "check_in"
  | "testicular_check"
  | "prostate_discussion"
  | "fertility_appointment"
  | "sexual_health_appointment"
  | "sti_testing"
  | "doctor_question"
  | "medication_review"
  | "custom";

export interface MensHealthSettings {
  checkInFrequency?: MensHealthCheckInFrequency;
  createdAt: string;
  defaultPrivacy: "private" | "shared_selected";
  enabledAt?: string;
  fertilityTrackingEnabled: boolean;
  id: string;
  profileId: string;
  prostateDiscussionReminderEnabled: boolean;
  sexualHealthNotesEnabled: boolean;
  status: MensHealthStatus;
  testicularCheckReminderEnabled: boolean;
  updatedAt: string;
  userId: string;
}

export interface MensHealthCheckIn {
  createdAt: string;
  energy?: "very_low" | "low" | "okay" | "good" | "great";
  fertilityNote?: string;
  id: string;
  isPrivate: boolean;
  libidoNote?: string;
  loggedAt: string;
  mood?: string;
  notes?: string;
  painDiscomfortNote?: string;
  profileId: string;
  sexualHealthNote?: string;
  sleepQuality?: "poor" | "okay" | "good" | "great";
  stress?: "low" | "moderate" | "high";
  updatedAt: string;
  urinaryNote?: string;
  userId: string;
  workoutRecoveryNote?: string;
}

export interface MensHealthSymptomLog {
  createdAt: string;
  id: string;
  isPrivate: boolean;
  loggedAt: string;
  notes?: string;
  profileId: string;
  severity?: "mild" | "moderate" | "severe";
  severityScore?: number;
  symptomKey: MensHealthSymptomKey;
  updatedAt: string;
  userId: string;
}

export interface MensHealthReminder {
  createdAt: string;
  id: string;
  isPrivate: boolean;
  notes?: string;
  profileId: string;
  reminderType: MensHealthReminderType;
  repeatFrequency?: "none" | "daily" | "weekly" | "monthly" | "custom";
  scheduledAt: string;
  status: "upcoming" | "completed" | "snoozed" | "dismissed";
  title: string;
  updatedAt: string;
  userId: string;
}

export interface MensHealthQuestion {
  answerNotes?: string;
  category:
    | "symptoms"
    | "fertility"
    | "sexual_health"
    | "prostate"
    | "testicular_health"
    | "medication"
    | "supplements"
    | "mental_wellness"
    | "workout_nutrition"
    | "other";
  createdAt: string;
  id: string;
  profileId: string;
  question: string;
  relatedMedicationId?: string;
  relatedSupplementId?: string;
  relatedSymptomId?: string;
  status: "draft" | "asked" | "answered";
  updatedAt: string;
  userId: string;
}

export interface MensHealthSharePermission {
  category:
    | "check_in_summary"
    | "appointment_reminders"
    | "fertility_notes"
    | "symptom_notes"
    | "sexual_health_notes"
    | "prostate_testicular_reminders"
    | "doctor_questions"
    | "reports";
  createdAt: string;
  id: string;
  ownerProfileId: string;
  permissionLevel: "none" | "view" | "add" | "edit" | "manage";
  sharedWithProfileId?: string;
  sharedWithUserId?: string;
  updatedAt: string;
}

export interface MensHealthLearnCard {
  authorOrReviewer?: string;
  disclaimer: string;
  id: string;
  lastCheckedAt: string;
  publishedOrReviewedAt?: string;
  sourceOrganization: string;
  sourceUrl: string;
  summary: string;
  title: string;
}

export interface MensHealthReportSummary {
  checkInCount: number;
  fertilityNoteCount: number;
  generatedAt: string;
  privateReminderCount: number;
  profileId: string;
  questionCount: number;
  range: "today" | "7_days" | "30_days";
  sexualHealthNoteCount: number;
  symptomCount: number;
}
