import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  calculateCycleEstimate,
  getCalendarHaloOverlaysForDateRange,
  getContraceptionLogs,
  getContraceptionMethods,
  getMoodEnergyLogs,
  getPeriodLogs,
  getSymptomLogs,
  getTrustedHealthContentCards,
  getWomensHealthSettings,
  getWomensHealthSharePermissions,
  getWomensHealthTodaySummary,
} from "@/lib/womensHealthStorage";
import type { ContraceptionLog, CycleEstimate, FlowLevel, PeriodLog } from "@/types/womensHealth";

import type {
  HealthOSCycleDay,
  HealthOSCyclePhase,
  HealthOSWomenHealthData,
  HealthOSWomenPrivacyStatus,
} from "./HealthOSWomenHealthTypes";

const todayKey = toDateKey(new Date());

const emptyData: HealthOSWomenHealthData = {
  contentPreview: [],
  contraceptionLogs: [],
  contraceptionSummary: {
    cautionCount: 0,
    status: "Add contraception tracking if it helps your routine.",
  },
  cycleDays: [],
  cycleSummary: {
    activePeriod: false,
    contraceptionStatus: "Not tracking",
    currentPhase: "unknown",
    fertileWindowText: "No estimate yet",
    hasCycleData: false,
    nextPeriodText: "No estimate yet",
    symptomCountToday: 0,
  },
  emptyState: "Start tracking when you're ready.",
  error: null,
  estimate: null,
  faqItems: [],
  loading: true,
  moodSymptomSummary: {
    recentSymptoms: [],
    status: "Mood and symptoms will appear here after you log them.",
  },
  overlays: [],
  patternCharts: [],
  periodLogs: [],
  pregnancyTransitionStatus: "Transformation logic pending. Opening Pregnancy will not erase cycle data.",
  privacyStatus: "private",
  quickLogOptions: [
    { key: "period", label: "Period" },
    { key: "symptom", label: "Symptom" },
    { key: "mood", label: "Mood" },
    { key: "sex", label: "Sex" },
    { key: "contraception", label: "Contraception" },
    { key: "note", label: "Note" },
  ],
  selectedDate: todayKey,
  settings: null,
  sexLogSummary: {
    count: 0,
    status: "Sex-day logs stay private unless you choose otherwise.",
  },
};

export function useHealthOSWomenHealthData(): HealthOSWomenHealthData {
  const [data, setData] = useState<HealthOSWomenHealthData>(emptyData);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setData((current) => ({ ...current, loading: true, error: null }));
        try {
          const monthStart = startOfMonth(new Date());
          const monthEnd = endOfMonth(new Date());
          const [
            settings,
            summary,
            estimate,
            periodLogs,
            symptomLogs,
            moodLogs,
            methods,
            contraceptionLogs,
            shares,
            overlays,
            contentCards,
          ] = await Promise.all([
            getWomensHealthSettings(),
            getWomensHealthTodaySummary(),
            calculateCycleEstimate(),
            getPeriodLogs(),
            getSymptomLogs(),
            getMoodEnergyLogs(),
            getContraceptionMethods(),
            getContraceptionLogs(),
            getWomensHealthSharePermissions(),
            getCalendarHaloOverlaysForDateRange(monthStart, monthEnd),
            getTrustedHealthContentCards(),
          ]);

          if (cancelled) return;

          const hasCycleData = Boolean(estimate.cycleDay || periodLogs.length);
          const activeMethod = methods[0];
          const cautionLogs = contraceptionLogs.filter(
            (log) => log.eventType === "late" || log.eventType === "missed",
          );

          setData({
            contentPreview: contentCards.slice(0, 3).map((card) => ({
              id: card.id,
              publishedAt: card.lastCheckedAt,
              sourceName: card.sourceName,
              sourceUrl: card.url,
              summary: card.summary,
              title: card.title,
              topic: card.title.toLowerCase().includes("contraception")
                ? "Contraception"
                : "Cycle",
            })),
            contraceptionLogs,
            contraceptionSummary: {
              activeMethod,
              cautionCount: cautionLogs.length,
              latestLog: contraceptionLogs[0],
              nextReminder: summary.contraceptionReminder,
              status: activeMethod
                ? `${activeMethod.name} is tracked privately.`
                : "Add contraception tracking if it helps your routine.",
            },
            cycleDays: buildCycleDays(estimate, periodLogs, overlays),
            cycleSummary: {
              activePeriod: summary.activePeriod,
              contraceptionStatus: summary.contraceptionStatus,
              currentPhase: getPhase(estimate, summary.activePeriod),
              cycleDay: estimate.cycleDay,
              fertileWindowText: estimate.fertileWindowStart
                ? `Estimated ${estimate.fertileWindowStart} to ${estimate.fertileWindowEnd}`
                : "No estimate yet",
              hasCycleData,
              nextPeriodText: estimate.nextPeriodStart
                ? `Estimated ${estimate.nextPeriodStart}`
                : "No estimate yet",
              symptomCountToday: summary.symptomCountToday,
            },
            emptyState: hasCycleData ? null : "Add your last period to start predictions.",
            error: null,
            estimate,
            faqItems: buildFaqItems(contentCards),
            loading: false,
            moodSymptomSummary: {
              latestMood: moodLogs[0],
              recentSymptoms: symptomLogs.slice(0, 4),
              status:
                moodLogs.length || symptomLogs.length
                  ? `${symptomLogs.length} symptom logs and ${moodLogs.length} mood logs saved privately.`
                  : "Mood and symptoms will appear here after you log them.",
            },
            overlays,
            patternCharts: buildPatternCharts(periodLogs, symptomLogs.length, moodLogs.length, contraceptionLogs),
            periodLogs,
            pregnancyTransitionStatus:
              "Pregnancy mode opens separately. Cycle data is not erased by this foundation card.",
            privacyStatus: getPrivacyStatus(settings, shares.length),
            quickLogOptions: emptyData.quickLogOptions,
            selectedDate: todayKey,
            settings,
            sexLogSummary: {
              count: 0,
              status: "Sex-day logs stay private. Dedicated persistence is pending.",
            },
          });
        } catch {
          if (cancelled) return;
          setData((current) => ({
            ...current,
            error: "Women health data could not be loaded right now.",
            loading: false,
          }));
        }
      }

      void load();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return data;
}

function buildCycleDays(
  estimate: CycleEstimate,
  periodLogs: PeriodLog[],
  overlays: HealthOSWomenHealthData["overlays"],
): HealthOSCycleDay[] {
  const start = addDays(new Date(), -3);
  return Array.from({ length: 14 }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = toDateKey(date);
    const markers = overlays
      .filter((overlay) => overlay.date === dateKey)
      .map((overlay) => overlay.label);
    const flow = periodLogs.find((log) => log.date === dateKey)?.flowLevel;
    return {
      date: dateKey,
      dayLabel: String(date.getDate()),
      isEstimatedFertile: isBetween(dateKey, estimate.fertileWindowStart, estimate.fertileWindowEnd),
      isEstimatedPeriod: isBetween(dateKey, estimate.nextPeriodStart, estimate.nextPeriodEnd),
      isLoggedPeriod: Boolean(flow && flow !== "none"),
      isSelected: dateKey === todayKey,
      isToday: dateKey === todayKey,
      markers,
    };
  });
}

function buildPatternCharts(
  periods: PeriodLog[],
  symptomCount: number,
  moodCount: number,
  contraceptionLogs: ContraceptionLog[],
) {
  const flowScores: Record<FlowLevel, number> = {
    heavy: 4,
    light: 2,
    medium: 3,
    none: 0,
    spotting: 1,
    very_heavy: 5,
  };
  return [
    {
      id: "cycle-length",
      label: "Cycle length trend",
      status: periods.length >= 2 ? `${periods.length} period logs available.` : "Log two cycles to see patterns.",
      values: periods.slice(0, 6).map((_, index) => index + 1),
    },
    {
      id: "symptoms",
      label: "Symptom frequency",
      status: symptomCount ? `${symptomCount} symptom logs saved privately.` : "Symptom trends appear after a few check-ins.",
      values: symptomCount ? [symptomCount] : [],
    },
    {
      id: "mood",
      label: "Mood pattern",
      status: moodCount ? `${moodCount} mood logs saved privately.` : "Mood trends will appear after a few check-ins.",
      values: moodCount ? [moodCount] : [],
    },
    {
      id: "flow",
      label: "Flow intensity",
      status: periods.length ? "Based on saved period flow logs." : "Flow patterns appear after period logs.",
      values: periods.slice(0, 6).map((period) => flowScores[period.flowLevel]),
    },
    {
      id: "contraception",
      label: "Contraception adherence",
      status: contraceptionLogs.length ? `${contraceptionLogs.length} contraception notes saved.` : "Contraception adherence appears after notes.",
      values: contraceptionLogs.length ? [contraceptionLogs.length] : [],
    },
    {
      id: "confidence",
      label: "Prediction confidence",
      status: periods.length >= 3 ? "Medium estimate confidence from repeated logs." : "More cycle logs improve estimate confidence.",
      values: periods.length >= 3 ? [2] : [],
    },
  ];
}

function buildFaqItems(cards: Array<{ id: string; summary: string; title: string; url: string }>) {
  const source = (term: string) => cards.find((card) => card.title.toLowerCase().includes(term));
  return [
    {
      body: source("pill")?.summary ?? "Timing guidance depends on the method. Check your leaflet, prescription label, clinic, pharmacist, or healthcare professional.",
      id: "pills",
      sourceUrl: source("pill")?.url,
      title: "Pills",
    },
    {
      body: "Injection, implant, patch, ring, IUD, and IUS schedules vary by method. Use this app for reminders and notes only.",
      id: "methods",
      title: "Methods and reminders",
    },
    {
      body: "Missed or late dose guidance can vary. This app does not decide what to do.",
      id: "missed-dose",
      sourceUrl: source("contraception")?.url,
      title: "Missed dose basics",
    },
    {
      body: "Seek professional help for severe pain, heavy bleeding, concerning symptoms, or urgent worries.",
      id: "seek-care",
      title: "When to seek help",
    },
  ];
}

function getPhase(estimate: CycleEstimate, activePeriod: boolean): HealthOSCyclePhase {
  if (!estimate.cycleDay) return "unknown";
  if (activePeriod || estimate.cycleDay <= 5) return "period";
  if (estimate.estimatedOvulationDate === todayKey) return "ovulation";
  if (estimate.cycleDay < 14) return "follicular";
  return "luteal";
}

function getPrivacyStatus(settings: { sharedWithCaregiver: boolean; sharedWithFamily: boolean; sharedWithPartner: boolean } | null, shareCount: number): HealthOSWomenPrivacyStatus {
  if (!settings) return "unknown";
  if (settings.sharedWithCaregiver || settings.sharedWithFamily || settings.sharedWithPartner || shareCount > 0) {
    return "sharedSelected";
  }
  return "private";
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function isBetween(date: string, start?: string, end?: string) {
  if (!start || !end) return false;
  return date >= start && date <= end;
}
