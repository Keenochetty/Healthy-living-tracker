import { colors } from "@/constants/theme";
import type {
  CalendarApprovalStatus,
  CalendarEventColour,
  CalendarEventSource,
  CalendarEventType,
  CalendarFilterKey
} from "@/types/calendar";

export const calendarViewModes = ["week", "month"] as const;

export const calendarEventTypes = [
  "personal",
  "family",
  "medical",
  "medication",
  "school",
  "sport",
  "caregiver",
  "baby_routine",
  "women_health",
  "men_health",
  "emergency",
  "ai_suggestion",
  "synced",
  "other"
] as const satisfies readonly CalendarEventType[];

export const calendarEventSources = [
  "manual",
  "caregiver",
  "parent",
  "profile_owner",
  "ai",
  "google_sync_placeholder",
  "apple_sync_placeholder",
  "system"
] as const satisfies readonly CalendarEventSource[];

export const calendarFilters = [
  "all",
  "personal",
  "circle",
  "care_profiles",
  "medical",
  "caregiver",
  "private"
] as const satisfies readonly CalendarFilterKey[];

export const calendarApprovalStatuses = [
  "pending",
  "approved",
  "declined",
  "postponed",
  "none"
] as const satisfies readonly CalendarApprovalStatus[];

export const calendarSourceLabels = {
  ai: "AI",
  apple_sync_placeholder: "Apple sync",
  caregiver: "Caregiver",
  google_sync_placeholder: "Google sync",
  manual: "Manual",
  parent: "Parent",
  profile_owner: "Profile owner",
  system: "System"
} as const satisfies Record<CalendarEventSource, string>;

export const calendarEventTypeLabels = {
  ai_suggestion: "AI suggestion",
  baby_routine: "Baby routine",
  caregiver: "Caregiver",
  emergency: "Emergency",
  family: "Family",
  medical: "Medical",
  medication: "Medication",
  men_health: "Men's health",
  other: "Other",
  personal: "Personal",
  school: "School",
  sport: "Sport",
  synced: "Synced",
  women_health: "Women's health"
} as const satisfies Record<CalendarEventType, string>;

export const calendarFilterLabels = {
  all: "All",
  care_profiles: "Care Profiles",
  caregiver: "Caregiver",
  circle: "Circle",
  medical: "Medical",
  personal: "Personal",
  private: "Private"
} as const satisfies Record<CalendarFilterKey, string>;

export const calendarApprovalStatusLabels = {
  approved: "Approved",
  declined: "Declined",
  none: "No approval",
  pending: "Pending",
  postponed: "Postponed"
} as const satisfies Record<CalendarApprovalStatus, string>;

export const calendarColorLabels = {
  blue: "Normal schedule / school / sport",
  coral: "Women's health",
  green: "Family or caregiver update",
  grey: "Synced/system",
  navy: "Personal/private",
  orange: "Medical/important",
  pink: "Women's health private",
  purple: "AI-created/suggested",
  red: "Emergency",
  teal: "Baby/child care"
} as const satisfies Record<CalendarEventColour, string>;

export const calendarColorTokens = {
  blue: colors.accent.sky,
  coral: colors.accent.coral,
  green: colors.status.success,
  grey: colors.status.system,
  navy: colors.brand.primary,
  orange: colors.status.warning,
  pink: colors.accent.coral,
  purple: colors.status.ai,
  red: colors.status.emergency,
  teal: colors.brand.secondary
} as const satisfies Record<CalendarEventColour, string>;

export const calendarColorSoftTokens = {
  blue: "#E0F2FE",
  coral: colors.accent.peach,
  green: colors.status.successSoft,
  grey: colors.status.systemSoft,
  navy: colors.brand.primarySoft,
  orange: colors.status.warningSoft,
  pink: colors.accent.peach,
  purple: colors.status.aiSoft,
  red: colors.status.emergencySoft,
  teal: "#CCFBF1"
} as const satisfies Record<CalendarEventColour, string>;
