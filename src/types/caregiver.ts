export type CaregiverServiceType =
  | "child_care"
  | "baby_care"
  | "elder_care"
  | "special_needs"
  | "school_pickup"
  | "medication_reminder_support"
  | "meal_support"
  | "mobility_support"
  | "homework_support"
  | "overnight_care"
  | "general_care";

export type CaregiverRateType = "hourly" | "daily" | "weekly" | "monthly" | "custom";
export type CaregiverConnectionStatus =
  | "draft"
  | "pending"
  | "approved"
  | "declined"
  | "paused"
  | "removed";
export type CaregiverBookingStatus =
  | "requested"
  | "approved"
  | "declined"
  | "cancelled"
  | "completed";
export type CaregiverCheckInStatus = "checked_in" | "checked_out" | "missed" | "cancelled";

export type CaregiverProfile = {
  bio?: string;
  catersForAdults: boolean;
  catersForBabies: boolean;
  catersForChildren: boolean;
  catersForSpecialNeeds: boolean;
  country: string;
  createdAt: string;
  currency: string;
  displayName: string;
  email?: string;
  experienceYears?: number;
  id: string;
  phone?: string;
  photoUri?: string;
  schoolOrAgencyName?: string;
  services: CaregiverServiceType[];
  updatedAt: string;
  verified: boolean;
};

export type CaregiverRate = {
  active: boolean;
  amount: number;
  caregiverId: string;
  createdAt: string;
  currency: string;
  id: string;
  notes?: string;
  rateType: CaregiverRateType;
  updatedAt: string;
};

export type CaregiverAvailability = {
  available: boolean;
  caregiverId: string;
  createdAt: string;
  dayOfWeek: number;
  endTime: string;
  id: string;
  notes?: string;
  startTime: string;
  updatedAt: string;
};

export type CaregiverConnection = {
  approvedAt?: string;
  caregiverId: string;
  circleId?: string;
  id: string;
  notes?: string;
  permissions: string[];
  requestedAt: string;
  requesterName: string;
  status: CaregiverConnectionStatus;
  targetProfileId?: string;
  targetProfileType?: "child" | "elder" | "adult" | "family";
};

export type CaregiverBooking = {
  bookingDate: string;
  caregiverId: string;
  createdAt: string;
  endTime: string;
  id: string;
  notes?: string;
  requesterName: string;
  startTime: string;
  status: CaregiverBookingStatus;
  targetName?: string;
  updatedAt: string;
};

export type CaregiverCheckIn = {
  bookingId?: string;
  caregiverId: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt: string;
  id: string;
  notes?: string;
  status: CaregiverCheckInStatus;
  targetName?: string;
};

export type CaregiverUpdateNote = {
  caregiverId: string;
  createdAt: string;
  id: string;
  note: string;
  noteType:
    | "general"
    | "meal"
    | "medication"
    | "incident"
    | "milestone"
    | "mood"
    | "activity"
    | "pickup"
    | "dropoff";
  photoUri?: string;
  targetName?: string;
  title: string;
  updatedAt: string;
};

export type CaregiverSummary = {
  availability: CaregiverAvailability[];
  caregiver: CaregiverProfile;
  connectionStatus?: CaregiverConnectionStatus;
  latestBooking?: CaregiverBooking;
  latestCheckIn?: CaregiverCheckIn;
  latestUpdate?: CaregiverUpdateNote;
  rates: CaregiverRate[];
};
