export type MedicationFrequency =
  | "once"
  | "daily"
  | "twice_daily"
  | "three_times_daily"
  | "custom";

export type MedicationReminderTime = {
  enabled: boolean;
  id: string;
  notificationId?: string;
  time: string;
};

export type MedicationItem = {
  active: boolean;
  createdAt: string;
  dosage?: string;
  id: string;
  instructions?: string;
  name: string;
  updatedAt: string;
};

export type MedicationTakenLog = {
  id: string;
  medicationId: string;
  note?: string;
  takenAt: string;
};

export type MedicationSchedule = {
  active: boolean;
  createdAt: string;
  endDate?: string;
  frequency: MedicationFrequency;
  id: string;
  instructions?: string;
  medicationId: string;
  reminderTimes: MedicationReminderTime[];
  startDate?: string;
  takeWithFood?: boolean;
  updatedAt: string;
};

export type MedicationDetail = {
  medication: MedicationItem;
  schedule?: MedicationSchedule;
  takenLogs: MedicationTakenLog[];
};
