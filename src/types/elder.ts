export type ElderConsentStatus =
  | "not_requested"
  | "requested"
  | "granted"
  | "declined";

export type ElderProfile = {
  allergies?: string[];
  avatarEmoji?: string;
  consentStatus: ElderConsentStatus;
  createdAt: string;
  dateOfBirth?: string;
  displayName: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  id: string;
  livesAlone?: boolean;
  medicalNotes?: string;
  primaryDoctor?: string;
  relationship?: string;
  updatedAt: string;
};

export type ElderCheckInStatus =
  | "okay"
  | "needs_attention"
  | "missed"
  | "urgent"
  | "not_sure";

export type ElderCareQuality = "poor" | "okay" | "good";

export type ElderCheckIn = {
  appetite?: ElderCareQuality;
  checkedInBy?: string;
  createdAt: string;
  elderId: string;
  hydration?: ElderCareQuality;
  id: string;
  loggedAt: string;
  mobility?: ElderCareQuality;
  mood?: string;
  notes?: string;
  status: ElderCheckInStatus;
};

export type ElderVitalsLog = {
  bloodPressureDiastolic?: number;
  bloodPressureSystolic?: number;
  bloodSugar?: number;
  createdAt: string;
  elderId: string;
  heartRate?: number;
  id: string;
  loggedAt: string;
  notes?: string;
  oxygenSaturation?: number;
  temperature?: number;
};

export type ElderMedicationItem = {
  active: boolean;
  createdAt: string;
  dosage?: string;
  elderId: string;
  id: string;
  instructions?: string;
  name: string;
  updatedAt: string;
};

export type ElderMedicationTakenLog = {
  createdAt: string;
  elderId: string;
  id: string;
  medicationId: string;
  note?: string;
  takenAt: string;
};

export type ElderCareNoteType =
  | "general"
  | "meal"
  | "medication"
  | "mobility"
  | "incident"
  | "appointment"
  | "caregiver";

export type ElderCareNote = {
  createdAt: string;
  createdBy?: string;
  elderId: string;
  id: string;
  note: string;
  noteType: ElderCareNoteType;
  title: string;
  updatedAt: string;
};

export type ElderAppointment = {
  appointmentDate: string;
  createdAt: string;
  elderId: string;
  id: string;
  location?: string;
  notes?: string;
  reminderId?: string;
  title: string;
  updatedAt: string;
};

export type ElderSummary = {
  activeMedicationCount: number;
  elder: ElderProfile;
  latestCareNote?: ElderCareNote;
  latestCheckIn?: ElderCheckIn;
  latestVitals?: ElderVitalsLog;
  needsAttention: boolean;
  nextAppointment?: ElderAppointment;
};
