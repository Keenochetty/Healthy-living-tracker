export type CycleFlowLevel =
  | "none"
  | "spotting"
  | "light"
  | "medium"
  | "heavy"
  | "very_heavy";

export type CycleSymptomType =
  | "cramps"
  | "headache"
  | "bloating"
  | "breast_tenderness"
  | "acne"
  | "nausea"
  | "back_pain"
  | "fatigue"
  | "cravings"
  | "mood_changes"
  | "sleep_changes"
  | "other";

export type CycleMood =
  | "calm"
  | "happy"
  | "emotional"
  | "irritated"
  | "anxious"
  | "low"
  | "stressed"
  | "tired";

export type CycleLog = {
  createdAt: string;
  date: string;
  energyLevel?: number;
  flowLevel: CycleFlowLevel;
  id: string;
  mood?: CycleMood;
  notes?: string;
  painLevel?: number;
  private: true;
  symptoms: CycleSymptomType[];
  updatedAt: string;
};

export type CycleSettings = {
  averageCycleLengthDays: number;
  averagePeriodLengthDays: number;
  lastPeriodStartDate?: string;
  partnerSharingEnabled: false;
  predictionEnabled: boolean;
  privateMode: true;
  trackingEnabled: boolean;
};

export type CyclePrediction = {
  confidence: "low" | "medium" | "high";
  estimatedOvulationDate?: string;
  estimateOnly: true;
  fertileWindowEnd?: string;
  fertileWindowStart?: string;
  nextPeriodEnd?: string;
  nextPeriodStart?: string;
};

export type PregnancyStatus =
  | "not_tracking"
  | "possible"
  | "trying"
  | "pregnant"
  | "postpartum"
  | "not_sure";

export type PregnancyProfile = {
  allergies?: string[];
  createdAt: string;
  currentWeek?: number;
  estimatedDueDate?: string;
  id: string;
  lastPeriodStartDate?: string;
  medicalNotes?: string;
  pregnancyStartDate?: string;
  private: true;
  sharingEnabled: false;
  status: PregnancyStatus;
  updatedAt: string;
};

export type PregnancySymptomSeverity = "mild" | "moderate" | "strong" | "urgent";

export type PregnancySymptomLog = {
  createdAt: string;
  id: string;
  loggedAt: string;
  notes?: string;
  pregnancyProfileId: string;
  severity: PregnancySymptomSeverity;
  symptom: string;
};

export type PregnancyAppointment = {
  appointmentDate: string;
  createdAt: string;
  id: string;
  notes?: string;
  pregnancyProfileId: string;
  reminderId?: string;
  title: string;
  updatedAt: string;
};

export type PregnancyNote = {
  createdAt: string;
  id: string;
  note: string;
  pregnancyProfileId: string;
  title: string;
  updatedAt: string;
};

export type PregnancySummary = {
  appointmentCount: number;
  latestSymptom?: PregnancySymptomLog;
  noteCount: number;
  profile: PregnancyProfile | null;
};
