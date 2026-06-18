import type { Href } from "expo-router";

export type HealthOSCalendarEventCategory =
  | "health"
  | "medication"
  | "supplement"
  | "fitness"
  | "nutrition"
  | "family"
  | "baby"
  | "child"
  | "pregnancy"
  | "cycle"
  | "records"
  | "appointment"
  | "work"
  | "personal"
  | "ai"
  | "warning";

export type HealthOSCalendarPrivacy = "private" | "shared" | "public";

export type HealthOSCalendarDisplayEvent = {
  category: HealthOSCalendarEventCategory;
  date: string;
  endTime?: string;
  id: string;
  memberInitials?: string;
  privacy: HealthOSCalendarPrivacy;
  routeTarget?: Href;
  sharedBy?: string;
  source?: string;
  startTime?: string;
  subtitle?: string;
  title: string;
};

export type HealthOSCalendarFilter =
  | "all"
  | "health"
  | "medication"
  | "family"
  | "fitness"
  | "nutrition"
  | "babyChild"
  | "women"
  | "pregnancy"
  | "work"
  | "private";

export type HealthOSCalendarIndicator = {
  category: HealthOSCalendarEventCategory;
  count?: number;
  initials?: string;
  privacy: HealthOSCalendarPrivacy;
  warning?: boolean;
};

export type HealthOSQuickLogAction =
  | "addEvent"
  | "addMedication"
  | "logMeal"
  | "addWorkout"
  | "logSymptom"
  | "addBabyChildNote"
  | "addRecordReminder"
  | "askAI";
