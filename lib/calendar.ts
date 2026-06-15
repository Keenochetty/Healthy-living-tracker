import type { AppIconName } from "@/components/ui";
import type { FamilyCircle } from "@/types/circles";
import type {
  CalendarEvent,
  CalendarEventColour,
  CalendarEventSource,
  CalendarEventType,
  CalendarFilter,
  SmartRouteEventInput,
} from "@/types/calendar";
import type { PermissionCategory, PrivacyLevel } from "@/types/permissions";

const sensitiveKeywords = [
  "diagnosis",
  "mental health",
  "pregnancy",
  "prescription",
  "private",
  "test result",
  "therapy",
  "cycle",
];

function atLocalTime(date: Date, hours: number, minutes = 0) {
  const nextDate = new Date(date);
  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate.toISOString();
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function containsSensitiveText(text: string) {
  return sensitiveKeywords.some((keyword) =>
    text.toLowerCase().includes(keyword),
  );
}

export function getEventColour(
  eventType: CalendarEventType,
  eventSource: CalendarEventSource,
  privacyLevel: PrivacyLevel,
): CalendarEventColour {
  if (eventType === "emergency" || privacyLevel === "emergency_only") {
    return "red";
  }

  if (eventSource === "ai" || eventType === "ai_suggestion") {
    return "purple";
  }

  if (
    eventType === "synced" ||
    eventSource === "google_sync_placeholder" ||
    eventSource === "apple_sync_placeholder" ||
    eventSource === "system"
  ) {
    return "grey";
  }

  if (eventType === "women_health") {
    return "coral";
  }

  if (eventType === "baby_routine") {
    return "teal";
  }

  if (
    eventType === "caregiver" ||
    eventSource === "caregiver" ||
    eventType === "family"
  ) {
    return "green";
  }

  if (
    eventType === "medical" ||
    eventType === "medication" ||
    eventType === "men_health"
  ) {
    return "orange";
  }

  if (eventType === "personal" || privacyLevel === "private") {
    return "navy";
  }

  return "blue";
}

export function getEventIcon(eventType: CalendarEventType): AppIconName {
  if (
    eventType === "medical" ||
    eventType === "medication" ||
    eventType === "women_health" ||
    eventType === "men_health"
  ) {
    return "doctor";
  }

  if (eventType === "caregiver") {
    return "caregiver";
  }

  if (
    eventType === "baby_routine" ||
    eventType === "school" ||
    eventType === "sport"
  ) {
    return "child";
  }

  if (eventType === "emergency") {
    return "emergency";
  }

  if (eventType === "ai_suggestion") {
    return "ai";
  }

  if (eventType === "synced") {
    return "sync";
  }

  if (eventType === "personal") {
    return "privacy";
  }

  return "calendar";
}

export function getDefaultEventPrivacy(
  eventType: CalendarEventType,
  linkedProfileType?: SmartRouteEventInput["linkedProfileType"],
): PrivacyLevel {
  if (eventType === "emergency") {
    return "emergency_only";
  }

  if (eventType === "medical" && linkedProfileType === "personal") {
    return "private";
  }

  if (
    eventType === "women_health" ||
    eventType === "men_health" ||
    eventType === "personal"
  ) {
    return "private";
  }

  if (eventType === "caregiver") {
    return "caregiver_shared";
  }

  if (
    eventType === "school" ||
    eventType === "sport" ||
    eventType === "baby_routine"
  ) {
    return "circle_shared";
  }

  return "circle_shared";
}

export function getSafeEventPreview(
  event: Pick<
    CalendarEvent,
    "description" | "isSensitive" | "privacyLevel" | "safePreview"
  >,
) {
  if (event.isSensitive || event.privacyLevel === "private") {
    return event.safePreview || "Private event details hidden";
  }

  return event.description?.trim() || event.safePreview || "No details added";
}

export function canViewerSeeEventDetails(
  event: CalendarEvent,
  viewerPermissions: readonly PermissionCategory[],
) {
  if (event.privacyLevel === "private") {
    return viewerPermissions.includes("manage_privacy");
  }

  if (event.privacyLevel === "caregiver_shared") {
    return viewerPermissions.includes("view_calendar");
  }

  if (event.privacyLevel === "emergency_only") {
    return viewerPermissions.includes("view_emergency_info");
  }

  return viewerPermissions.includes("view_calendar");
}

export function smartRouteEvent(input: SmartRouteEventInput) {
  const text =
    `${input.text ?? ""} ${input.title ?? ""} ${input.description ?? ""}`.toLowerCase();
  let eventType = input.eventType ?? "other";

  if (eventType === "other") {
    if (text.includes("soccer") || text.includes("sport")) eventType = "sport";
    else if (text.includes("doctor") || text.includes("appointment"))
      eventType = "medical";
    else if (text.includes("baby") || text.includes("feeding"))
      eventType = "baby_routine";
    else if (text.includes("cycle")) eventType = "women_health";
    else if (text.includes("caregiver") || text.includes("shift"))
      eventType = "caregiver";
    else if (text.includes("school")) eventType = "school";
    else if (text.includes("medication") || text.includes("medicine"))
      eventType = "medication";
  }

  const eventSource =
    input.eventSource ?? (text.includes("ai") ? "ai" : "manual");
  const privacyLevel = getDefaultEventPrivacy(
    eventType,
    input.linkedProfileType,
  );
  const colour = getEventColour(eventType, eventSource, privacyLevel);
  const icon = getEventIcon(eventType);
  const isSensitive = containsSensitiveText(text) || privacyLevel === "private";

  return {
    colour,
    eventSource,
    eventType,
    icon,
    isSensitive,
    privacyLevel,
    requiresApproval: eventType === "caregiver" || eventType === "emergency",
  };
}

export function groupEventsByDay(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>(
    (accumulator, event) => {
      const key = toCalendarDateKey(event.startTime);
      accumulator[key] = [...(accumulator[key] ?? []), event];
      return accumulator;
    },
    {},
  );
}

export function sortEventsByTime(events: CalendarEvent[]) {
  return [...events].sort((first, second) => {
    if (first.allDay !== second.allDay) {
      return first.allDay ? -1 : 1;
    }

    return first.startTime.localeCompare(second.startTime);
  });
}

export function filterEvents(events: CalendarEvent[], filter: CalendarFilter) {
  if (filter.key === "all") return events;
  if (filter.key === "personal")
    return events.filter(
      (event) => event.eventType === "personal" || Boolean(event.profileId),
    );
  if (filter.key === "circle")
    return events.filter((event) =>
      filter.circleId
        ? event.circleId === filter.circleId
        : Boolean(event.circleId),
    );
  if (filter.key === "care_profiles")
    return events.filter((event) =>
      filter.careProfileId
        ? event.careProfileId === filter.careProfileId
        : Boolean(event.careProfileId),
    );
  if (filter.key === "medical")
    return events.filter(
      (event) =>
        event.eventType === "medical" ||
        event.eventType === "medication" ||
        event.eventType === "women_health" ||
        event.eventType === "men_health",
    );
  if (filter.key === "caregiver")
    return events.filter(
      (event) =>
        event.eventType === "caregiver" || event.eventSource === "caregiver",
    );
  if (filter.key === "private")
    return events.filter((event) => event.privacyLevel === "private");

  return events;
}

export function toCalendarDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatCalendarTime(value?: string | null, allDay = false) {
  if (allDay || !value) {
    return "All day";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function isSensitiveCalendarEvent(
  event: Pick<CalendarEvent, "eventType" | "privacyLevel" | "isSensitive">,
) {
  return (
    event.isSensitive ||
    event.privacyLevel === "private" ||
    event.privacyLevel === "emergency_only" ||
    event.eventType === "women_health" ||
    event.eventType === "men_health"
  );
}

export function getCalendarSmartRoutePlaceholder(eventType: CalendarEventType) {
  if (eventType === "emergency") return "/settings/emergency-contacts";
  if (
    eventType === "medical" ||
    eventType === "medication" ||
    eventType === "women_health" ||
    eventType === "men_health"
  )
    return "/health/records";
  if (eventType === "caregiver" || eventType === "baby_routine")
    return "/tabs/care";
  return "/tabs/calendar";
}

export function listEventsForDay(events: CalendarEvent[], date: Date) {
  const dateKey = toCalendarDateKey(date);
  return sortEventsByTime(
    events.filter((event) => toCalendarDateKey(event.startTime) === dateKey),
  );
}

export function getEventCountByDay(events: CalendarEvent[]) {
  return events.reduce<Record<string, number>>((accumulator, event) => {
    const key = toCalendarDateKey(event.startTime);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function buildMockEvent(
  input: Omit<
    CalendarEvent,
    "colour" | "icon" | "safePreview" | "createdAt" | "updatedAt"
  > & { safePreview?: string },
): CalendarEvent {
  const colour = getEventColour(
    input.eventType,
    input.eventSource,
    input.privacyLevel,
  );
  const icon = getEventIcon(input.eventType);
  const now = new Date().toISOString();

  return {
    ...input,
    colour,
    createdAt: now,
    icon,
    safePreview:
      input.safePreview ??
      (input.isSensitive
        ? "Private event details hidden"
        : (input.description ?? "No details added")),
    updatedAt: now,
  };
}

export function getMockCalendarEvents(
  circles: FamilyCircle[],
  personalProfile?: { id?: string | null; name?: string | null },
): CalendarEvent[] {
  const today = new Date();
  const primaryCircle = circles[0];
  const careCircle =
    circles.find((circle) => circle.kind === "care_circle") ?? primaryCircle;
  const childProfile =
    primaryCircle?.careProfiles.find(
      (profile) => profile.profileType === "child",
    ) ?? primaryCircle?.careProfiles[0];
  const adultCareProfile = careCircle?.careProfiles[0];
  const createdByProfileId = personalProfile?.id ?? "placeholder-profile";

  return [
    buildMockEvent({
      allDay: false,
      approvalStatus: "none",
      careProfileId: childProfile?.id ?? null,
      careProfileName: childProfile?.displayName ?? "Tommy",
      circleId: primaryCircle?.id ?? null,
      circleName: primaryCircle?.name ?? "My Household",
      createdByProfileId,
      description: "Soccer practice and pickup window.",
      endTime: atLocalTime(today, 17, 30),
      eventSource: "parent",
      eventType: "sport",
      id: "mock-tommy-soccer",
      isSensitive: false,
      privacyLevel: "circle_shared",
      requiresApproval: false,
      startTime: atLocalTime(today, 16),
      title: "Tommy soccer practice",
    }),
    buildMockEvent({
      allDay: false,
      approvalStatus: "pending",
      caregiverAssignmentId: "placeholder-caregiver-assignment",
      careProfileId: adultCareProfile?.id ?? null,
      careProfileName: adultCareProfile?.displayName ?? "Dad",
      circleId: careCircle?.id ?? null,
      circleName: careCircle?.name ?? "Dad's Care Circle",
      createdByProfileId: "placeholder-caregiver-profile",
      description: "Caregiver shift with care notes ready for admin review.",
      endTime: atLocalTime(today, 11, 30),
      eventSource: "caregiver",
      eventType: "caregiver",
      id: "mock-caregiver-shift",
      isSensitive: false,
      privacyLevel: "caregiver_shared",
      requiresApproval: true,
      startTime: atLocalTime(today, 9),
      title: "Caregiver shift",
    }),
    buildMockEvent({
      allDay: false,
      approvalStatus: "none",
      careProfileId: adultCareProfile?.id ?? null,
      careProfileName: adultCareProfile?.displayName ?? "Dad",
      circleId: careCircle?.id ?? null,
      circleName: careCircle?.name ?? "Dad's Care Circle",
      createdByProfileId,
      description:
        "Doctor appointment. Sensitive details stay inside the full record.",
      endTime: atLocalTime(addDays(today, 1), 10, 45),
      eventSource: "manual",
      eventType: "medical",
      id: "mock-doctor",
      isSensitive: true,
      privacyLevel: "circle_shared",
      requiresApproval: false,
      safePreview: "Doctor appointment",
      startTime: atLocalTime(addDays(today, 1), 10),
      title: "Doctor appointment",
    }),
    buildMockEvent({
      allDay: false,
      approvalStatus: "none",
      careProfileId: childProfile?.id ?? null,
      careProfileName: childProfile?.displayName ?? "Baby profile",
      circleId: primaryCircle?.id ?? null,
      circleName: primaryCircle?.name ?? "My Household",
      createdByProfileId,
      description: "Baby feeding reminder and nap routine.",
      endTime: atLocalTime(today, 14, 30),
      eventSource: "parent",
      eventType: "baby_routine",
      id: "mock-baby-routine",
      isSensitive: false,
      privacyLevel: "circle_shared",
      requiresApproval: false,
      startTime: atLocalTime(today, 14),
      title: "Baby feeding reminder",
    }),
    buildMockEvent({
      allDay: false,
      approvalStatus: "none",
      createdByProfileId,
      description:
        "Cycle reminder. Hidden from shared summaries unless explicitly shared.",
      endTime: atLocalTime(addDays(today, 2), 9, 30),
      eventSource: "profile_owner",
      eventType: "women_health",
      id: "mock-cycle",
      isSensitive: true,
      privacyLevel: "private",
      profileId: personalProfile?.id ?? null,
      profileName: personalProfile?.name ?? "Personal profile",
      requiresApproval: false,
      safePreview: "Private health event",
      startTime: atLocalTime(addDays(today, 2), 9),
      title: "Cycle reminder",
    }),
    buildMockEvent({
      allDay: false,
      approvalStatus: "none",
      circleId: primaryCircle?.id ?? null,
      circleName: primaryCircle?.name ?? "My Household",
      createdByProfileId,
      description: "Google sync placeholder. Real sync is not connected yet.",
      endTime: atLocalTime(addDays(today, 3), 13),
      eventSource: "google_sync_placeholder",
      eventType: "synced",
      id: "mock-google-sync",
      isSensitive: false,
      privacyLevel: "circle_shared",
      requiresApproval: false,
      startTime: atLocalTime(addDays(today, 3), 12),
      title: "Synced calendar placeholder",
    }),
    buildMockEvent({
      allDay: false,
      approvalStatus: "pending",
      circleId: primaryCircle?.id ?? null,
      circleName: primaryCircle?.name ?? "My Household",
      createdByProfileId: "system",
      description:
        "Emergency placeholder event with emergency-only visibility.",
      endTime: atLocalTime(addDays(today, -1), 8, 30),
      eventSource: "system",
      eventType: "emergency",
      id: "mock-emergency",
      isSensitive: true,
      privacyLevel: "emergency_only",
      requiresApproval: true,
      safePreview: "Emergency-only details",
      startTime: atLocalTime(addDays(today, -1), 8),
      title: "Emergency contact review",
    }),
  ];
}

export function createCalendarEventPlaceholder(
  input: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  return {
    ...input,
    createdAt: now,
    id: `placeholder-event-${Date.now().toString(36)}`,
    updatedAt: now,
  } satisfies CalendarEvent;
}
