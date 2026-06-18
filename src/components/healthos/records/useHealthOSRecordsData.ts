import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  getHealthRecords,
  getRecordsOverviewSummary,
  getUpcomingRecordReminders,
  prepareHealthRecordUpload,
} from "@/lib/healthRecordsStorage";
import { getPublishedContentByRealm } from "@/lib/trustedContentStorage";
import type { HealthRecord, HealthRecordType } from "@/types/healthRecords";
import type { TrustedHealthContentCard } from "@/types/trustedContent";

import type {
  HealthOSRecordCategory,
  HealthOSRecordCategorySummary,
  HealthOSRecordContentItem,
  HealthOSRecordDisplay,
  HealthOSRecordLinkedRealm,
  HealthOSRecordPrivacyStatus,
  HealthOSRecordReviewStatus,
  HealthOSRecordSource,
  HealthOSRecordsData,
} from "./HealthOSRecordsTypes";

const CATEGORY_CONFIG: HealthOSRecordCategorySummary[] = [
  { category: "prescription", count: 0, label: "Prescriptions / Scripts", types: ["prescription"] },
  { category: "medicationLabel", count: 0, label: "Medication labels", types: ["medication_label"] },
  { category: "supplementLabel", count: 0, label: "Supplement labels", types: ["supplement_label"] },
  { category: "doctorNote", count: 0, label: "Doctor notes", types: ["doctor_note"] },
  { category: "labReport", count: 0, label: "Lab reports", types: ["lab_result", "imaging"] },
  { category: "vaccineCard", count: 0, label: "Vaccine cards", types: ["vaccine_record"] },
  { category: "pregnancy", count: 0, label: "Pregnancy documents", types: ["pregnancy_record"] },
  { category: "babyChild", count: 0, label: "Baby / Child documents", types: ["birth_record", "child_clinic_card"] },
  { category: "medicalAid", count: 0, label: "Medical aid", types: ["insurance"] },
  { category: "appointment", count: 0, label: "Appointments", types: ["doctor_note"] },
  { category: "emergency", count: 0, label: "Emergency", types: ["general_document"] },
  { category: "other", count: 0, label: "Other", types: ["health_note", "other", "general_document"] },
];

const INITIAL_DATA: HealthOSRecordsData = {
  activeFilters: [],
  categories: CATEGORY_CONFIG,
  contentPreview: [],
  emergencyPacketSummary: { count: 0, status: "Emergency packet is not configured yet." },
  emptyState: "Scanned and uploaded records will appear here.",
  error: null,
  linkedRecords: [],
  loading: true,
  privacyStatus: "unknown",
  recentRecords: [],
  recordHistory: [],
  records: [],
  recordsByCategory: {},
  reviewQueue: [],
  searchQuery: "",
  sharingSummary: { sharedCount: 0, status: "No records are shared." },
  summary: null,
  uploadStatus: "Upload storage will be connected in a later phase.",
  reminders: [],
};

export function useHealthOSRecordsData() {
  const [data, setData] = useState<HealthOSRecordsData>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<HealthOSRecordCategory[]>([]);

  const load = useCallback(async () => {
    setData((current) => ({ ...current, loading: true, error: null }));
    try {
      const [records, summary, reminders, content, upload] = await Promise.all([
        getHealthRecords(),
        getRecordsOverviewSummary(),
        getUpcomingRecordReminders(8),
        getPublishedContentByRealm("records"),
        prepareHealthRecordUpload("unknown"),
      ]);
      const mapped = records.map(mapRecord);
      const filtered = filterRecords(mapped, searchQuery, activeFilters);
      const categories = CATEGORY_CONFIG.map((category) => ({
        ...category,
        count: mapped.filter((record) => category.types.includes(record.type)).length,
      }));
      const linkedRecords = mapped.filter((record) => record.linkedRealms.length);
      const sharedCount = mapped.filter((record) => record.privacyStatus !== "private").length;

      setData({
        activeFilters,
        categories,
        contentPreview: content.slice(0, 4).map(mapContent),
        emergencyPacketSummary: {
          count: 0,
          status: "Choose what to include. Emergency packet data stays private unless you share it.",
        },
        emptyState: mapped.length ? null : "Scanned and uploaded records will appear here.",
        error: null,
        linkedRecords,
        loading: false,
        privacyStatus: mapOverallPrivacy(mapped),
        recentRecords: filtered.slice(0, 8),
        recordHistory: mapped.slice(0, 5).map((record) => ({
          id: record.id,
          label: `${record.title} saved`,
          timestamp: record.createdAt,
        })),
        records: filtered,
        recordsByCategory: groupByCategory(filtered),
        reviewQueue: filtered.filter((record) => record.reviewStatus === "needsReview"),
        searchQuery,
        sharingSummary: {
          sharedCount,
          status: sharedCount ? `${sharedCount} record${sharedCount === 1 ? "" : "s"} shared with selected access.` : "No records are shared.",
        },
        summary,
        uploadStatus: upload.message,
        reminders,
      });
    } catch (error) {
      setData((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Records could not be loaded.",
        loading: false,
      }));
    }
  }, [activeFilters, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return useMemo(
    () => ({
      ...data,
      clearFilters: () => setActiveFilters([]),
      reload: load,
      setSearchQuery,
      toggleFilter: (category: HealthOSRecordCategory) =>
        setActiveFilters((current) =>
          current.includes(category)
            ? current.filter((item) => item !== category)
            : [...current, category],
        ),
    }),
    [data, load],
  );
}

function mapRecord(record: HealthRecord): HealthOSRecordDisplay {
  const category = toCategory(record.type);
  const linkedRealms = mapLinkedRealms(record);
  return {
    category,
    createdAt: record.createdAt,
    dateLabel: record.documentDate ?? record.createdAt,
    fileType: record.fileType,
    id: record.id,
    linkedRealms,
    original: record,
    privacyStatus: mapPrivacy(record),
    reviewStatus: mapReviewStatus(record, linkedRealms),
    source: mapSource(record),
    title: record.title,
    type: record.type,
  };
}

function filterRecords(
  records: HealthOSRecordDisplay[],
  query: string,
  filters: HealthOSRecordCategory[],
) {
  const normalized = query.trim().toLowerCase();
  return records.filter((record) => {
    const matchesQuery =
      !normalized ||
      [record.title, record.type, record.original.notes, ...record.original.tags]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    const matchesFilter = !filters.length || filters.includes(record.category);
    return matchesQuery && matchesFilter;
  });
}

function groupByCategory(records: HealthOSRecordDisplay[]) {
  return records.reduce<Partial<Record<HealthOSRecordCategory, HealthOSRecordDisplay[]>>>((groups, record) => {
    groups[record.category] = [...(groups[record.category] ?? []), record];
    return groups;
  }, {});
}

function toCategory(type: HealthRecordType): HealthOSRecordCategory {
  if (type === "prescription") return "prescription";
  if (type === "medication_label") return "medicationLabel";
  if (type === "supplement_label") return "supplementLabel";
  if (type === "doctor_note") return "doctorNote";
  if (type === "lab_result" || type === "imaging") return "labReport";
  if (type === "vaccine_record") return "vaccineCard";
  if (type === "pregnancy_record") return "pregnancy";
  if (type === "birth_record" || type === "child_clinic_card") return "babyChild";
  if (type === "insurance") return "medicalAid";
  return "other";
}

function mapSource(record: HealthRecord): HealthOSRecordSource {
  if (record.fileUrl && record.fileType === "image") return "gallery";
  if (record.fileUrl && record.fileType === "pdf") return "documentPicker";
  if (record.relatedMedicationId || record.relatedSupplementId || record.relatedVisitId) return "linkedRealm";
  if (record.fileType === "note") return "manual";
  return "unknown";
}

function mapReviewStatus(
  record: HealthRecord,
  linkedRealms: HealthOSRecordLinkedRealm[],
): HealthOSRecordReviewStatus {
  if (record.sharedWithCaregiver || record.sharedWithFamily || record.sharedWithPartner || record.allowedViewerIds.length) return "shared";
  if (linkedRealms.length) return "linked";
  if (record.reminderDate || record.expiryDate) return "needsReview";
  return "saved";
}

function mapLinkedRealms(record: HealthRecord): HealthOSRecordLinkedRealm[] {
  const realms: HealthOSRecordLinkedRealm[] = [];
  if (record.relatedMedicationId) realms.push("medication");
  if (record.relatedSupplementId) realms.push("supplements");
  if (record.relatedVisitId) realms.push("health");
  if (record.type === "pregnancy_record") realms.push("pregnancy");
  if (record.type === "birth_record" || record.type === "child_clinic_card") realms.push("babyChild");
  if (record.reminderDate) realms.push("calendar");
  return realms;
}

function mapPrivacy(record: HealthRecord): HealthOSRecordPrivacyStatus {
  if (record.sharedWithFamily || record.sharedWithPartner || record.allowedViewerIds.length) return "sharedSelected";
  if (record.sharedWithCaregiver) return "caregiverLimited";
  if (record.isPrivate || record.lockedPrivate) return "private";
  return "unknown";
}

function mapOverallPrivacy(records: HealthOSRecordDisplay[]): HealthOSRecordPrivacyStatus {
  if (!records.length) return "unknown";
  if (records.some((record) => record.privacyStatus === "sharedSelected")) return "sharedSelected";
  if (records.some((record) => record.privacyStatus === "caregiverLimited")) return "caregiverLimited";
  return "private";
}

function mapContent(card: TrustedHealthContentCard): HealthOSRecordContentItem {
  return {
    id: card.id,
    publishedAt: card.reviewedDate ?? card.lastCheckedDate,
    sourceName: card.sourceOrganization,
    sourceUrl: card.sourceUrl,
    summary: card.shortSummary,
    title: card.title,
    topic: card.topicTags[0] ?? "Records",
  };
}
