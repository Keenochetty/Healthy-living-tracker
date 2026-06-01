import type { AppIconName } from "@/components/ui";
import type { PrivacyLevel } from "@/types/permissions";

export type CalendarViewMode = "month" | "week";

export type CalendarEventType =
  | "personal"
  | "family"
  | "medical"
  | "medication"
  | "school"
  | "sport"
  | "caregiver"
  | "baby_routine"
  | "women_health"
  | "men_health"
  | "emergency"
  | "ai_suggestion"
  | "synced"
  | "other";

export type CalendarEventSource =
  | "manual"
  | "caregiver"
  | "parent"
  | "profile_owner"
  | "ai"
  | "google_sync_placeholder"
  | "apple_sync_placeholder"
  | "system";

export type CalendarEventColour =
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "purple"
  | "grey"
  | "coral"
  | "pink"
  | "teal"
  | "navy";

export type CalendarApprovalStatus = "pending" | "approved" | "declined" | "postponed" | "none";

export type CalendarFilterKey =
  | "all"
  | "personal"
  | "circle"
  | "care_profiles"
  | "medical"
  | "caregiver"
  | "private";

export type CalendarEvent = {
  id: string;
  circleId?: string | null;
  circleName?: string | null;
  careProfileId?: string | null;
  careProfileName?: string | null;
  profileId?: string | null;
  profileName?: string | null;
  caregiverAssignmentId?: string | null;
  title: string;
  description?: string | null;
  safePreview: string;
  startTime: string;
  endTime?: string | null;
  allDay: boolean;
  eventType: CalendarEventType;
  eventSource: CalendarEventSource;
  privacyLevel: PrivacyLevel;
  colour: CalendarEventColour;
  icon: AppIconName;
  location?: string | null;
  requiresApproval: boolean;
  approvalStatus: CalendarApprovalStatus;
  isSensitive: boolean;
  createdByProfileId: string;
  createdAt: string;
  updatedAt: string;
};

export type AppCalendarEvent = CalendarEvent;

export type CalendarFilter = {
  key: CalendarFilterKey;
  circleId?: string | null;
  careProfileId?: string | null;
  profileId?: string | null;
};

export type SmartRouteEventInput = {
  text?: string;
  title?: string;
  description?: string;
  eventType?: CalendarEventType;
  eventSource?: CalendarEventSource;
  circleId?: string | null;
  careProfileId?: string | null;
  profileId?: string | null;
  linkedProfileType?: "child" | "teen" | "adult_member" | "adult_dependent" | "elderly_dependent" | "personal";
};

export type CreateCalendarEventInput = Omit<
  CalendarEvent,
  "id" | "safePreview" | "colour" | "icon" | "approvalStatus" | "isSensitive" | "createdAt" | "updatedAt"
> & {
  approvalStatus?: CalendarApprovalStatus;
};
