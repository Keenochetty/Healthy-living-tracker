import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  calculateTodayMedicationSchedule,
  calculateTodaySupplementSchedule,
  getDoseLogsByDate,
  getHealthDocumentsByItem,
  getMedicationAdherenceSummary,
  getMedications,
  getMedicationSupplementFoodTimingSummary,
  getNotesByDate,
  getSchedulesByItem,
  getSupplementAdherenceSummary,
  getSupplements,
} from "@/lib/medicationSupplementStorage";
import { getSafetyNotices } from "@/lib/medicationSafetyStorage";
import { getPublishedContentByRealm } from "@/lib/trustedContentStorage";
import type {
  DoseLog,
  HealthScheduleReminder,
  Medication,
  SafetyNotice,
  Supplement,
} from "@/types/medication";
import type { TrustedHealthContentCard } from "@/types/trustedContent";

import type {
  HealthOSMedicationCaution,
  HealthOSMedicationContentItem,
  HealthOSMedicationData,
  HealthOSMedicationDisplayItem,
  HealthOSMedicationKind,
  HealthOSMedicationPrivacyStatus,
  HealthOSMedicationStatus,
} from "./HealthOSMedicationTypes";

const EMPTY_ADHERENCE = { missed: 0, skipped: 0, taken: 0, total: 0 };

const INITIAL_DATA: HealthOSMedicationData = {
  activeFocus: "medication",
  adherence: {
    medication: EMPTY_ADHERENCE,
    supplement: EMPTY_ADHERENCE,
  },
  calendarStatus: "Medication and supplement calendar links are ready when reminders are confirmed.",
  cautions: [],
  contentPreview: [],
  documents: [],
  error: null,
  extractionReviewStatus: "Scanned labels and prescriptions must be reviewed before anything is saved.",
  foodTimingStatus: "Food timing guidance will appear from saved schedules only.",
  loading: true,
  medicationItems: [],
  missedAndSideEffects: {
    latestNotes: [],
    status: "No missed doses or side-effect notes logged today.",
  },
  privacyStatus: "unknown",
  refillSummary: {
    items: [],
    status: "No refill dates are saved yet.",
  },
  reminders: [],
  scanImportStatus: "Scan labels, prescriptions, doctor notes, or pharmacy notes for review.",
  sharingStatus: "Medication and supplement data stays private unless you choose to share selected details.",
  supplementItems: [],
  symptomSupportStatus: "Symptom notes can be attached for review. HealthSync does not change doses or give treatment advice.",
  todaySummary: {
    dueCount: 0,
    missedCount: 0,
    takenCount: 0,
    totalCount: 0,
  },
};

export function useHealthOSMedicationData(initialFocus: HealthOSMedicationKind = "medication") {
  const [data, setData] = useState<HealthOSMedicationData>({
    ...INITIAL_DATA,
    activeFocus: initialFocus,
  });

  const load = useCallback(async () => {
    setData((current) => ({ ...current, loading: true, error: null }));
    try {
      const today = new Date();
      const [
        medications,
        supplements,
        medicationToday,
        supplementToday,
        medicationAdherence,
        supplementAdherence,
        todayLogs,
        todayNotes,
        safetyNotices,
        medicationContent,
        supplementContent,
        foodTimingSummary,
      ] = await Promise.all([
        getMedications(),
        getSupplements(),
        calculateTodayMedicationSchedule(),
        calculateTodaySupplementSchedule(),
        getMedicationAdherenceSummary(),
        getSupplementAdherenceSummary(),
        getDoseLogsByDate(today),
        getNotesByDate(today),
        getSafetyNotices(),
        getPublishedContentByRealm("medication"),
        getPublishedContentByRealm("supplements"),
        getMedicationSupplementFoodTimingSummary(),
      ]);

      const medicationItems = await Promise.all(
        medications.map((item) => mapDisplayItem("medication", item, medicationToday.reminders)),
      );
      const supplementItems = await Promise.all(
        supplements.map((item) => mapDisplayItem("supplement", item, supplementToday.reminders)),
      );
      const documents = (
        await Promise.all([
          ...medications.map((item) => getHealthDocumentsByItem("medication", item.id)),
          ...supplements.map((item) => getHealthDocumentsByItem("supplement", item.id)),
        ])
      ).flat();
      const reminders = [...medicationToday.reminders, ...supplementToday.reminders].sort(
        (left, right) => toTime(left.scheduledAt) - toTime(right.scheduledAt),
      );
      const latestNotes = [
        ...todayLogs.filter((log) => log.status === "missed" || log.status === "skipped" || log.sideEffectNote),
        ...todayNotes,
      ].slice(0, 4);

      setData({
        ...INITIAL_DATA,
        activeFocus: initialFocus,
        adherence: {
          medication: medicationAdherence,
          supplement: supplementAdherence,
        },
        cautions: mapCautions(safetyNotices),
        contentPreview: [...medicationContent, ...supplementContent].slice(0, 4).map(mapContentCard),
        documents,
        foodTimingStatus: foodTimingSummary.message,
        loading: false,
        medicationItems,
        missedAndSideEffects: {
          latestNotes,
          status: latestNotes.length
            ? `${latestNotes.length} missed, skipped, or side-effect note item${latestNotes.length === 1 ? "" : "s"} today.`
            : "No missed doses or side-effect notes logged today.",
        },
        nextReminder: reminders.find((reminder) => reminder.status === "due" || reminder.status === "upcoming"),
        privacyStatus: mapOverallPrivacy([...medicationItems, ...supplementItems]),
        reminders,
        supplementItems,
        todaySummary: {
          dueCount: medicationToday.dueCount + supplementToday.dueCount,
          missedCount: medicationToday.missedCount + supplementToday.missedCount,
          takenCount: medicationToday.takenCount + supplementToday.takenCount,
          totalCount: medicationToday.totalCount + supplementToday.totalCount,
        },
      });
    } catch (error) {
      setData((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Medication and supplement data could not be loaded.",
        loading: false,
      }));
    }
  }, [initialFocus]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { ...data, reload: load };
}

async function mapDisplayItem(
  kind: HealthOSMedicationKind,
  item: Medication | Supplement,
  reminders: HealthScheduleReminder[],
): Promise<HealthOSMedicationDisplayItem> {
  const schedules = await getSchedulesByItem(kind, item.id);
  const reminder = reminders.find((entry) => entry.itemId === item.id);
  return {
    doseText: getDoseText(kind, item),
    foodTiming: schedules.find((schedule) => schedule.foodTiming !== "none")?.foodTiming,
    id: item.id,
    instructions: item.instructions,
    isActive: item.isActive,
    item,
    kind,
    name: item.name,
    privacyStatus: mapPrivacyStatus(item),
    scheduleTimes: schedules.flatMap((schedule) => schedule.times),
    source: "manual",
    status: mapStatus(item, reminder),
  };
}

function mapStatus(
  item: Medication | Supplement,
  reminder?: HealthScheduleReminder,
): HealthOSMedicationStatus {
  if (!item.isActive) return "inactive";
  if (item.safetyStatus === "needs_review" || item.safetyStatus === "professional_confirmation_recommended") {
    return "needsReview";
  }
  if (reminder?.status) return reminder.status;
  return "upcoming";
}

function getDoseText(kind: HealthOSMedicationKind, item: Medication | Supplement) {
  if (kind === "medication") {
    const medication = item as Medication;
    if (medication.doseAmount && medication.doseUnit) return `${medication.doseAmount} ${medication.doseUnit}`;
    return medication.strength;
  }
  const supplement = item as Supplement;
  if (supplement.servingAmount && supplement.servingUnit) return `${supplement.servingAmount} ${supplement.servingUnit}`;
  return supplement.strength;
}

function mapPrivacyStatus(item: Medication | Supplement): HealthOSMedicationPrivacyStatus {
  if (item.sharedWithFamily || item.sharedWithPartner) return "sharedSelected";
  if (item.sharedWithCaregiver) return "caregiverLimited";
  if (item.isPrivate || item.lockedPrivate) return "private";
  return "unknown";
}

function mapOverallPrivacy(items: HealthOSMedicationDisplayItem[]): HealthOSMedicationPrivacyStatus {
  if (!items.length) return "unknown";
  if (items.some((item) => item.privacyStatus === "sharedSelected")) return "sharedSelected";
  if (items.some((item) => item.privacyStatus === "caregiverLimited")) return "caregiverLimited";
  return "private";
}

function mapCautions(notices: SafetyNotice[]): HealthOSMedicationCaution[] {
  return notices
    .filter((notice) => !notice.isDismissed)
    .slice(0, 5)
    .map((notice) => ({
      description: notice.message,
      id: notice.id,
      severity: notice.type === "urgent_professional_help" ? "danger" : notice.type === "review" ? "warning" : "info",
      sourceNotice: notice,
      title: notice.title,
      type: mapCautionType(notice.category),
    }));
}

function mapCautionType(category: SafetyNotice["category"]) {
  if (category === "duplicate_ingredient") return "ingredientOverlap";
  if (category === "food_timing") return "foodTiming";
  if (category === "allergy") return "allergy";
  if (category === "profile_caution") return "needsProfessionalReview";
  return "medicationSupplement";
}

function mapContentCard(card: TrustedHealthContentCard): HealthOSMedicationContentItem {
  return {
    id: card.id,
    reviewedAt: card.reviewedDate ?? card.lastCheckedDate,
    sourceName: card.sourceOrganization,
    sourceUrl: card.sourceUrl,
    summary: card.shortSummary,
    title: card.title,
  };
}

function toTime(value?: string) {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}
