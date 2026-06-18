import type { Href } from "expo-router";

import type {
  CalendarHaloOverlay,
  ContraceptionLog,
  ContraceptionMethod,
  CycleEstimate,
  MoodEnergyLog,
  PeriodLog,
  WomensHealthSettings,
  WomensSymptomLog,
} from "@/types/womensHealth";

export type HealthOSCyclePhase =
  | "period"
  | "follicular"
  | "ovulation"
  | "luteal"
  | "unknown";

export type HealthOSPeriodFlow = "spotting" | "light" | "medium" | "heavy";

export type HealthOSWomenLogType =
  | "period"
  | "symptom"
  | "mood"
  | "sex"
  | "contraception"
  | "note";

export type HealthOSContraceptionType =
  | "pill"
  | "monthlyInjection"
  | "implant"
  | "patch"
  | "ring"
  | "iud"
  | "other"
  | "notTracking";

export type HealthOSWomenPrivacyStatus =
  | "private"
  | "sharedSelected"
  | "unknown";

export type HealthOSCycleSummary = {
  activePeriod: boolean;
  contraceptionStatus: string;
  currentPhase: HealthOSCyclePhase;
  cycleDay?: number;
  fertileWindowText: string;
  hasCycleData: boolean;
  nextPeriodText: string;
  symptomCountToday: number;
};

export type HealthOSCycleDay = {
  date: string;
  dayLabel: string;
  isEstimatedFertile: boolean;
  isEstimatedPeriod: boolean;
  isLoggedPeriod: boolean;
  isSelected: boolean;
  isToday: boolean;
  markers: string[];
};

export type HealthOSPatternChart = {
  id: string;
  label: string;
  status: string;
  values: number[];
};

export type HealthOSMoodSymptomSummary = {
  latestMood?: MoodEnergyLog;
  recentSymptoms: WomensSymptomLog[];
  status: string;
};

export type HealthOSSexLogSummary = {
  count: number;
  status: string;
};

export type HealthOSContraceptionSummary = {
  activeMethod?: ContraceptionMethod;
  cautionCount: number;
  latestLog?: ContraceptionLog;
  nextReminder?: string;
  status: string;
};

export type HealthOSFAQItem = {
  body: string;
  id: string;
  sourceUrl?: string;
  title: string;
};

export type HealthOSWomenContentItem = {
  id: string;
  publishedAt?: string;
  routeTarget?: Href;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  title: string;
  topic: string;
};

export type HealthOSWomenHealthData = {
  contentPreview: HealthOSWomenContentItem[];
  contraceptionLogs: ContraceptionLog[];
  contraceptionSummary: HealthOSContraceptionSummary;
  cycleDays: HealthOSCycleDay[];
  cycleSummary: HealthOSCycleSummary;
  emptyState: string | null;
  error: string | null;
  estimate: CycleEstimate | null;
  faqItems: HealthOSFAQItem[];
  loading: boolean;
  moodSymptomSummary: HealthOSMoodSymptomSummary;
  overlays: CalendarHaloOverlay[];
  patternCharts: HealthOSPatternChart[];
  periodLogs: PeriodLog[];
  pregnancyTransitionStatus: string;
  privacyStatus: HealthOSWomenPrivacyStatus;
  quickLogOptions: Array<{ key: HealthOSWomenLogType; label: string }>;
  selectedDate: string;
  settings: WomensHealthSettings | null;
  sexLogSummary: HealthOSSexLogSummary;
};
