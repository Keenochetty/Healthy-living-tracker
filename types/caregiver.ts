export type CaregiverCareType = "children" | "adults" | "both";

export type CaregiverAvailabilityDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type CaregiverRate = {
  hourlyRate?: number | null;
  dailyRate?: number | null;
  rateNotes?: string | null;
};

export type CaregiverAvailability = {
  days: CaregiverAvailabilityDay[];
  availableFromTime?: string | null;
  availableToTime?: string | null;
};

export type CaregiverProfile = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  profilePhotoUrl?: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
  email: string;
  cellNumber: string;
  serviceArea: string;
  yearsOfExperience: number;
  careType: CaregiverCareType;
  experienceSummary: string;
  referencesStatus: "placeholder" | "available_on_request" | "verified";
  availability: CaregiverAvailability;
  rate: CaregiverRate;
};
