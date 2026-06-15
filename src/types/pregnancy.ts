import type { WidgetKey } from "@/types/app";

export type PregnancyStatus =
  | "disabled"
  | "active"
  | "shared_view_only"
  | "ended";
export type PregnancyDateBasis =
  | "last_menstrual_period"
  | "estimated_due_date"
  | "conception_date"
  | "ivf_date"
  | "manual";

export type PregnancyAppointmentType =
  | "first_appointment"
  | "routine_checkup"
  | "scan_ultrasound"
  | "blood_test_lab"
  | "midwife"
  | "doctor"
  | "specialist"
  | "other";

export type PregnancyEventType =
  | "appointment"
  | "scan"
  | "lab"
  | "symptom"
  | "medication_review"
  | "supplement_review"
  | "question"
  | "record"
  | "weekly_milestone"
  | "due_date"
  | "custom";

export type PregnancyProfile = {
  activatedAt?: string;
  clinicName?: string;
  conceptionDate?: string;
  createdAt: string;
  dateBasis: PregnancyDateBasis;
  endedAt?: string;
  estimatedDueDate?: string;
  id: string;
  ivfDate?: string;
  lastMenstrualPeriodDate?: string;
  pregnancyType?: "single" | "twins_multiple" | "unsure" | "prefer_not_to_say";
  privacy: "private" | "shared_selected";
  profileId: string;
  providerName?: string;
  status: PregnancyStatus;
  updatedAt: string;
  userId: string;
};

export type PregnancyWeekSummary = {
  daysUntilDueDate?: number;
  estimatedDueDate?: string;
  generatedAt: string;
  pregnancyProfileId: string;
  trimester: "first" | "second" | "third" | "unknown";
  sourceBasis: PregnancyDateBasis;
  weekNumber: number;
  dayNumber: number;
};

export type PregnancyAppointment = {
  appointmentType: PregnancyAppointmentType;
  createdAt: string;
  followUpDate?: string;
  id: string;
  instructionsReceived?: string;
  isPrivate: boolean;
  location?: string;
  notes?: string;
  practitioner?: string;
  pregnancyProfileId: string;
  profileId: string;
  provider?: string;
  questionsToAsk?: string;
  relatedDocumentIds?: string[];
  scheduledAt: string;
  title: string;
  updatedAt: string;
  userId: string;
};

export type PregnancySymptomLog = {
  createdAt: string;
  id: string;
  loggedAt: string;
  notes?: string;
  pregnancyProfileId: string;
  profileId: string;
  severity?: "mild" | "moderate" | "severe";
  severityScore?: number;
  symptomKey: string;
  updatedAt: string;
  userId: string;
};

export type PregnancyQuestion = {
  answerNotes?: string;
  category:
    | "symptoms"
    | "medication"
    | "supplements"
    | "nutrition"
    | "exercise"
    | "baby_development"
    | "appointments"
    | "birth_plan"
    | "other";
  createdAt: string;
  id: string;
  pregnancyProfileId: string;
  profileId: string;
  question: string;
  relatedAppointmentId?: string;
  relatedMedicationId?: string;
  relatedSupplementId?: string;
  status: "draft" | "asked" | "answered";
  updatedAt: string;
  userId: string;
};

export type PregnancySharePermission = {
  category:
    | "pregnancy_week"
    | "due_date"
    | "appointments"
    | "symptoms"
    | "records"
    | "questions"
    | "medication_review"
    | "baby_development_cards";
  createdAt: string;
  id: string;
  ownerProfileId: string;
  permissionLevel: "none" | "view" | "add" | "edit" | "manage";
  sharedWithProfileId?: string;
  sharedWithUserId?: string;
  updatedAt: string;
};

export type PregnancyTrustedLearnCard = {
  authorOrReviewer?: string;
  category: string;
  disclaimer: string;
  id: string;
  lastCheckedAt: string;
  publishedOrReviewedAt?: string;
  sourceName: string;
  summary: string;
  title: string;
  url: string;
};

export type PregnancyCalendarOverlay = {
  color: string;
  date: string;
  id: string;
  isShared: boolean;
  label: string;
  profileAvatarLabel?: string;
  profileId: string;
  relatedId?: string;
  type: PregnancyEventType;
};

export type PregnancyWidgetKey = Extract<
  WidgetKey,
  | "pregnancy_week"
  | "pregnancy_due_date"
  | "pregnancy_next_appointment"
  | "pregnancy_symptom_log"
  | "pregnancy_medication_review"
  | "pregnancy_question"
  | "pregnancy_record"
  | "pregnancy_privacy_status"
>;
