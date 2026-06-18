import type { Href } from "expo-router";

export type HealthOSFamilyMemberRole =
  | "owner"
  | "partner"
  | "parent"
  | "child"
  | "elder"
  | "caregiver"
  | "doctor"
  | "nursingSister"
  | "familyMember";

export type HealthOSSharedModule =
  | "calendar"
  | "medication"
  | "records"
  | "fitness"
  | "nutrition"
  | "babyChild"
  | "pregnancy"
  | "womenHealth"
  | "mood"
  | "notes"
  | "caregiver";

export type HealthOSFamilyMemberDisplay = {
  avatarUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  id: string;
  initials: string;
  joinedAt?: string;
  name: string;
  notificationSummary?: string;
  permissionLabel?: string;
  relationshipLabel?: string;
  role: HealthOSFamilyMemberRole;
  sharedModules?: HealthOSSharedModule[];
  statusLine?: string;
};

export type HealthOSSharedUpdateDisplay = {
  id: string;
  memberId?: string;
  memberInitials?: string;
  memberName?: string;
  subtitle?: string;
  timeLabel?: string;
  title: string;
  type:
    | "mood"
    | "healthNote"
    | "medication"
    | "fitness"
    | "nutrition"
    | "babyChild"
    | "appointment"
    | "caregiver"
    | "record"
    | "note";
  visibility: "shared" | "limited" | "private";
};

export type HealthOSSharedEventDisplay = {
  category?: string;
  dateLabel?: string;
  id: string;
  memberInitials?: string;
  routeTarget?: Href;
  subtitle?: string;
  timeLabel?: string;
  title: string;
};

export type HealthOSCaregiverDisplay = {
  availabilityLabel?: string;
  contactEmail?: string;
  contactPhone?: string;
  id: string;
  initials: string;
  linkedMemberName?: string;
  name: string;
  notes?: string;
  rateLabel?: string;
  roleLabel?: string;
};

export type HealthOSFamilyCircleDisplay = {
  id?: string;
  name: string;
  privacyLabel: string;
  statusLine: string;
};

export type HealthOSMemberNotificationDisplay = {
  caregiverNotes?: string;
  moodUpdates?: string;
  recordShares?: string;
  sharedEvents?: string;
};

