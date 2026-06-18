import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

import {
  calculateBabySleepSummary,
  calculateFeedingSummary,
  calculateGrowthTrend,
  generateBabyCalendarEvents,
  getAllergenWatchSummary,
  getBabyCareSummary,
  getBabyChildProfiles,
  getBabyDiaperLogsByDate,
  getBabyEventsForChildByDate,
  getBabyGrowthLogs,
  getBabyMedicineLogs,
  getBabyMilestoneLogs,
  getBabyReportSummary,
  getBabySleepLogsByDate,
  getBabySolidFoodLogs,
  getBabyVaccineRecords,
  getMilestoneChecklistByAge,
  getTrustedBabyLearnCards,
} from "@/lib/babyChildStorage";
import { getPregnancyProfile } from "@/lib/pregnancyStorage";
import type { BabyChildProfile, BabyLearnCard } from "@/types/child";

import type {
  HealthOSBabyChildData,
  HealthOSChildContentItem,
  HealthOSChildProfileType,
} from "./HealthOSBabyChildTypes";

const TODAY = new Date().toISOString().slice(0, 10);

const QUICK_LOG_OPTIONS = [
  { key: "feed", label: "Feed" },
  { key: "sleep", label: "Sleep" },
  { key: "diaper", label: "Diaper" },
  { key: "medicine", label: "Medicine" },
  { key: "symptom", label: "Symptom" },
  { key: "temperature", label: "Temperature" },
  { key: "milestone", label: "Milestone" },
  { key: "solidFood", label: "Solid food" },
  { key: "note", label: "Note" },
  { key: "appointment", label: "Appointment" },
] satisfies HealthOSBabyChildData["quickLogOptions"];

const INITIAL_DATA: HealthOSBabyChildData = {
  activeChild: null,
  caregiverNotes: { count: 0, status: "Caregiver notes will appear here when shared." },
  careTimeline: [],
  childProfiles: [],
  contentPreview: [],
  diaperSummary: { countToday: 0, status: "Diaper logs will appear here." },
  emptyState: "Create a baby or child profile.",
  error: null,
  familySharing: { sharedCount: 0, status: "You choose what family can see." },
  feedingSummary: { countToday: 0, status: "Log the first feed when you're ready.", totalAmountMl: 0 },
  growthSummary: {
    sourceStatus: "Percentiles are not shown until source-backed growth standards are implemented.",
    status: "Add growth measurements to see trends.",
    totalCount: 0,
  },
  loading: true,
  medicationSymptomsSummary: {
    medicineDueCount: 0,
    status: "Medication, symptom, and temperature notes will appear when logged.",
    temperatureStatus: "No temperature logs connected yet.",
  },
  milestoneSummary: {
    checklist: [],
    logs: [],
    observedCount: 0,
    status: "Milestones will appear when a child profile and trusted content are connected.",
    totalCount: 0,
  },
  parentControls: {
    controlState: "parentControlled",
    status: "Parent/guardian controlled. Teen participation and adult ownership transfer are UI foundation only.",
  },
  pregnancyConnection: {
    status: "Connect from pregnancy when you are ready to create a baby profile.",
  },
  profileState: {
    ageLabel: "No child profile",
    privacyLabel: "Private status unknown",
    profileType: "unknown",
    relationshipLabel: "Parent controlled",
  },
  quickLogOptions: QUICK_LOG_OPTIONS,
  recordsSummary: { status: "Vaccine cards, doctor notes, prescriptions, and growth reports can be opened from Records." },
  report: null,
  sleepSummary: { napCount: 0, status: "Sleep logs will appear here.", totalMinutes: 0 },
  solidsSummary: {
    logs: [],
    reactionCount: 0,
    status: "Solid food tracking will appear when you start logging foods.",
    triedCount: 0,
  },
  todaySummary: {
    caregiverUpdate: "No caregiver update",
    lastDiaper: "No diaper log",
    lastFeed: "No feed log",
    lastSleep: "No sleep log",
    medicationDue: "No medication due",
    milestonePrompt: "No milestone prompt",
    vaccineOrAppointment: "No vaccine or appointment due",
  },
  trustedCards: [],
  vaccineTimeline: { records: [], status: "Add vaccine reminders or scan a vaccine card." },
};

export function useHealthOSBabyChildData() {
  const params = useLocalSearchParams<{ childId?: string }>();
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(
    typeof params.childId === "string" ? params.childId : undefined,
  );
  const [data, setData] = useState<HealthOSBabyChildData>(INITIAL_DATA);

  const load = useCallback(async () => {
    setData((current) => ({ ...current, loading: true, error: null }));
    try {
      const [profiles, trustedCards, pregnancy] = await Promise.all([
        getBabyChildProfiles(),
        getTrustedBabyLearnCards(),
        getPregnancyProfile().catch(() => null),
      ]);
      const activeChild =
        profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0] ?? null;
      if (!activeChild) {
        setData({
          ...INITIAL_DATA,
          contentPreview: mapLearnCards(trustedCards),
          loading: false,
          pregnancyConnection: {
            dueDate: pregnancy?.estimatedDueDate,
            status: pregnancy
              ? "Pregnancy data is available for a future baby profile handoff."
              : "Connect from pregnancy when you are ready to create a baby profile.",
          },
          trustedCards,
        });
        return;
      }

      const ageMonths = getAgeMonths(activeChild.dateOfBirth);
      const [
        care,
        feeding,
        sleep,
        diapers,
        growth,
        growthTrend,
        milestones,
        milestoneChecklist,
        solids,
        allergenSummary,
        medicine,
        vaccines,
        report,
        events,
        timeline,
      ] = await Promise.all([
        getBabyCareSummary(activeChild.id),
        calculateFeedingSummary(activeChild.id, TODAY),
        calculateBabySleepSummary(activeChild.id, TODAY),
        getBabyDiaperLogsByDate(activeChild.id, TODAY),
        getBabyGrowthLogs(activeChild.id),
        calculateGrowthTrend(activeChild.id),
        getBabyMilestoneLogs(activeChild.id),
        getMilestoneChecklistByAge(activeChild.id, ageMonths || 2),
        getBabySolidFoodLogs(activeChild.id),
        getAllergenWatchSummary(activeChild.id),
        getBabyMedicineLogs(activeChild.id),
        getBabyVaccineRecords(activeChild.id),
        getBabyReportSummary(activeChild.id, "today"),
        getBabyEventsForChildByDate(activeChild.id, TODAY),
        generateBabyCalendarEvents(addDays(new Date(), -7), new Date()),
      ]);

      setSelectedProfileId(activeChild.id);
      setData({
        ...INITIAL_DATA,
        activeChild,
        careTimeline: timeline.filter((event) => event.childProfileId === activeChild.id).slice(0, 12),
        childProfiles: profiles,
        contentPreview: mapLearnCards(trustedCards),
        diaperSummary: {
          countToday: diapers.length,
          latest: diapers[0] ?? care.diaper,
          status: diapers.length ? `${diapers.length} diaper logs today.` : "Diaper logs will appear here.",
        },
        emptyState: null,
        feedingSummary: {
          countToday: feeding.count,
          latest: feeding.latest,
          status: feeding.latest ? `Last feed ${relativeTime(feeding.latest.loggedAt)}` : "Log the first feed when you're ready.",
          totalAmountMl: feeding.totalAmountMl,
        },
        growthSummary: {
          latest: growthTrend.latest,
          sourceStatus: "Percentiles are not shown until source-backed growth standards are implemented.",
          status: growthTrend.latest ? `${growthTrend.totalCount} growth measurements logged.` : "Add growth measurements to see trends.",
          totalCount: growth.length,
        },
        loading: false,
        medicationSymptomsSummary: {
          medicineDueCount: care.medicineDueCount,
          recentMedicine: medicine[0],
          status: medicine.length ? `${medicine.length} medication notes saved.` : "Medication, symptom, and temperature notes will appear when logged.",
          temperatureStatus: "Temperature-specific storage is foundation only in this phase.",
        },
        milestoneSummary: {
          checklist: milestoneChecklist,
          logs: milestones,
          observedCount: care.milestone.observedCount,
          status: milestones.length
            ? `${care.milestone.observedCount} milestones observed.`
            : "Milestones will appear when a child profile and trusted content are connected.",
          totalCount: care.milestone.totalCount,
        },
        pregnancyConnection: {
          dueDate: activeChild.dueDate ?? pregnancy?.estimatedDueDate,
          status: activeChild.dueDate
            ? "This child profile has a due-date connection."
            : pregnancy
              ? "Pregnancy data is available for future profile connection."
              : "No pregnancy connection yet.",
        },
        profileState: mapProfileState(activeChild),
        recordsSummary: {
          status: report.vaccineRecordsCount
            ? `${report.vaccineRecordsCount} vaccine records connected.`
            : "Vaccine cards, doctor notes, prescriptions, and growth reports can be opened from Records.",
        },
        report,
        selectedProfileId: activeChild.id,
        sleepSummary: {
          latest: sleep.latest,
          napCount: sleep.napCount,
          status: sleep.latest ? `Last sleep ${relativeTime(sleep.latest.loggedAt)}` : "Sleep logs will appear here.",
          totalMinutes: sleep.totalMinutes,
        },
        solidsSummary: {
          logs: solids,
          reactionCount: allergenSummary.reactionCount,
          status: solids.length ? `${allergenSummary.triedCount} foods tried.` : "Solid food tracking will appear when you start logging foods.",
          triedCount: allergenSummary.triedCount,
        },
        todaySummary: {
          caregiverUpdate: "No caregiver update",
          lastDiaper: care.diaper ? `${formatValue(care.diaper.diaperType)} · ${relativeTime(care.diaper.loggedAt)}` : "No diaper log",
          lastFeed: feeding.latest ? `${formatValue(feeding.latest.feedingType ?? feeding.latest.feedType)} · ${relativeTime(feeding.latest.loggedAt)}` : "No feed log",
          lastSleep: sleep.latest ? `${Math.round(sleep.latest.durationMinutes / 60 * 10) / 10}h · ${relativeTime(sleep.latest.loggedAt)}` : "No sleep log",
          medicationDue: care.medicineDueCount ? `${care.medicineDueCount} due` : "No medication due",
          milestonePrompt: care.milestone.totalCount ? `${care.milestone.observedCount}/${care.milestone.totalCount} milestones` : "No milestone prompt",
          vaccineOrAppointment: events.find((event) => event.type === "vaccine" || event.type === "appointment")?.label ?? "No vaccine or appointment due",
        },
        trustedCards,
        vaccineTimeline: {
          records: vaccines,
          status: vaccines.length ? `${vaccines.length} vaccine records saved.` : "Add vaccine reminders or scan a vaccine card.",
        },
      });
    } catch (error) {
      setData((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Baby/Child data could not be loaded.",
        loading: false,
      }));
    }
  }, [selectedProfileId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { ...data, reload: load, selectProfile: setSelectedProfileId };
}

function mapProfileState(profile: BabyChildProfile): HealthOSBabyChildData["profileState"] {
  return {
    ageLabel: formatAge(profile.dateOfBirth),
    privacyLabel: profile.privacy === "shared_selected" ? "Shared with selected people" : "Private",
    profileType: mapProfileType(profile),
    relationshipLabel: profile.parentControlled ? "Parent controlled" : "Shared care",
  };
}

function mapProfileType(profile: BabyChildProfile): HealthOSChildProfileType {
  const ageMonths = getAgeMonths(profile.dateOfBirth);
  if (!profile.dateOfBirth) return "unknown";
  if (ageMonths < 24) return "baby";
  if (ageMonths < 60) return "toddler";
  if (ageMonths < 156) return "child";
  if (ageMonths < 216) return "teen";
  return "adultChild";
}

function mapLearnCards(cards: BabyLearnCard[]): HealthOSChildContentItem[] {
  return cards
    .filter((card) => Boolean(card.sourceUrl))
    .map((card) => ({
      id: card.id,
      publishedAt: card.publishedAt ?? card.lastCheckedAt,
      sourceName: card.sourceOrganization,
      sourceUrl: card.sourceUrl,
      summary: card.summary,
      title: card.title,
      topic: formatValue(card.category),
    }));
}

function getAgeMonths(dateOfBirth?: string) {
  if (!dateOfBirth) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 2629800000));
}

function formatAge(dateOfBirth?: string) {
  if (!dateOfBirth) return "Age not added";
  const months = getAgeMonths(dateOfBirth);
  if (months < 2) return `${Math.max(0, Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 604800000))} weeks old`;
  if (months < 24) return `${months} months old`;
  return `${Math.floor(months / 12)} years old`;
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
