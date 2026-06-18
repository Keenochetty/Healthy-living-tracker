import { StyleSheet, Text, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSGlassMenu, type HealthOSGlassMenuItem } from "@/components/healthos/HealthOSGlassMenu";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
} from "@/theme/healthos";
import { useColorScheme } from "react-native";

import { HealthOSBabyChildSection } from "./HealthOSBabyChildSection";
import { HealthOSDeviceSyncSection } from "./HealthOSDeviceSyncSection";
import { HealthOSFitnessNutritionSection } from "./HealthOSFitnessNutritionSection";
import { HealthOSMedicationSupplementsSection } from "./HealthOSMedicationSupplementsSection";
import { HealthOSPregnancySection } from "./HealthOSPregnancySection";
import { HealthOSRecordsAccordionSection } from "./HealthOSRecordsAccordionSection";
import { HealthOSTrustedContentSection } from "./HealthOSTrustedContentSection";
import { HealthOSVitalsOverviewSection } from "./HealthOSVitalsOverviewSection";
import { HealthOSWomenHealthSection } from "./HealthOSWomenHealthSection";
import type {
  HealthOSHealthSectionKey,
  HealthOSHealthSectionMeta,
  HealthOSMetric,
} from "./HealthOSHealthTypes";
import type { HealthOSTrustedContentArticle } from "./useHealthOSTrustedContentPreview";

type HealthOSHealthSectionGridProps = {
  activeSectionMenuKey: HealthOSHealthSectionKey | null;
  babyChildProfileCount: number;
  fitnessSummary: {
    activeMinutesToday?: number;
    currentStreakDays?: number;
    stepsToday?: number;
    weeklyGoalProgress?: number;
    workoutsThisWeek?: number;
  } | null;
  getSectionInfo: (key: HealthOSHealthSectionKey) => HealthOSHealthSectionMeta | undefined;
  hiddenSections: HealthOSHealthSectionMeta[];
  hideSection: (key: HealthOSHealthSectionKey) => void;
  medicationSummary: {
    dueCount?: number;
    missedCount?: number;
    takenCount?: number;
    totalCount?: number;
  } | null;
  menuMode: "info" | "menu";
  moveSectionDown: (key: HealthOSHealthSectionKey) => void;
  moveSectionUp: (key: HealthOSHealthSectionKey) => void;
  nutritionSummary: {
    calories?: number;
    foodLogCount?: number;
    proteinGrams?: number;
    waterMl?: number;
  } | null;
  pregnancySummary: {
    daysUntilDueDate?: number;
    estimatedDueDate?: string;
    weekNumber?: number;
  } | null;
  recordsSummary: {
    pinnedRecords?: unknown[];
    recentRecords?: unknown[];
    recentVisits?: unknown[];
    recordsNeedingAttention?: number;
  } | null;
  resetSections: () => void;
  setActiveSectionMenuKey: (key: HealthOSHealthSectionKey | null) => void;
  setMenuMode: (mode: "info" | "menu") => void;
  setSectionFirst: (key: HealthOSHealthSectionKey) => void;
  showSection: (key: HealthOSHealthSectionKey) => void;
  trustedContent: {
    articles: HealthOSTrustedContentArticle[];
    emptyText: string;
    error: string | null;
    loading: boolean;
  };
  visibleSections: HealthOSHealthSectionMeta[];
  vitalsMetrics: HealthOSMetric[];
  womenSummary: {
    contraceptionActiveCount?: number;
    cycleDay?: number;
    todaySymptomsCount?: number;
  } | null;
};

export function HealthOSHealthSectionGrid({
  activeSectionMenuKey,
  babyChildProfileCount,
  fitnessSummary,
  getSectionInfo,
  hiddenSections,
  hideSection,
  medicationSummary,
  menuMode,
  moveSectionDown,
  moveSectionUp,
  nutritionSummary,
  pregnancySummary,
  recordsSummary,
  resetSections,
  setActiveSectionMenuKey,
  setMenuMode,
  setSectionFirst,
  showSection,
  trustedContent,
  visibleSections,
  vitalsMetrics,
  womenSummary,
}: HealthOSHealthSectionGridProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");
  const activeSection = activeSectionMenuKey
    ? getSectionInfo(activeSectionMenuKey)
    : undefined;
  const menuItems: HealthOSGlassMenuItem[] = activeSection
    ? [
        {
          closeOnPress: false,
          key: "information",
          label: "Information",
          onPress: () => setMenuMode("info"),
          subtitle: "What this section does",
        },
        {
          key: "move-up",
          label: "Move higher",
          onPress: () => moveSectionUp(activeSection.key),
        },
        {
          key: "move-down",
          label: "Move lower",
          onPress: () => moveSectionDown(activeSection.key),
        },
        {
          key: "set-first",
          label: "Set as first",
          onPress: () => setSectionFirst(activeSection.key),
        },
        {
          destructive: true,
          disabled: !activeSection.removable,
          key: "hide",
          label: "Hide section",
          onPress: () => hideSection(activeSection.key),
        },
        {
          closeOnPress: false,
          key: "manage",
          label: "Manage section",
          onPress: () => setMenuMode("info"),
          subtitle: "Full preferences will come later",
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      {visibleSections.map((section) =>
        renderSection({
          babyChildProfileCount,
          fitnessSummary,
          medicationSummary,
          nutritionSummary,
          onLongPress: () => {
            setActiveSectionMenuKey(section.key);
            setMenuMode("menu");
          },
          pregnancySummary,
          recordsSummary,
          section,
          trustedContent,
          vitalsMetrics,
          womenSummary,
        }),
      )}

      {hiddenSections.length ? (
        <HealthOSCard title="Hidden sections" subtitle="Session-only visibility controls" variant="compact">
          <View style={styles.hiddenPills}>
            {hiddenSections.map((section) => (
              <HealthOSPill
                key={section.key}
                label={`Show ${section.title}`}
                onPress={() => showSection(section.key)}
                size="sm"
                variant="glass"
              />
            ))}
            <HealthOSPill label="Reset" onPress={resetSections} size="sm" variant="realm" />
          </View>
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            Section order and visibility are local to this screen session in this phase.
          </Text>
        </HealthOSCard>
      ) : null}

      <HealthOSGlassMenu
        infoBody={
          activeSection
            ? `${activeSection.description}\nRelated realm: ${activeSection.realm}.`
            : undefined
        }
        infoTips={activeSection?.tips}
        infoTitle={activeSection?.title}
        items={menuItems}
        mode={menuMode}
        onClose={() => {
          setActiveSectionMenuKey(null);
          setMenuMode("menu");
        }}
        visible={Boolean(activeSection)}
      />
    </View>
  );
}

function renderSection({
  babyChildProfileCount,
  fitnessSummary,
  medicationSummary,
  nutritionSummary,
  onLongPress,
  pregnancySummary,
  recordsSummary,
  section,
  trustedContent,
  vitalsMetrics,
  womenSummary,
}: {
  babyChildProfileCount: number;
  fitnessSummary: HealthOSHealthSectionGridProps["fitnessSummary"];
  medicationSummary: HealthOSHealthSectionGridProps["medicationSummary"];
  nutritionSummary: HealthOSHealthSectionGridProps["nutritionSummary"];
  onLongPress: () => void;
  pregnancySummary: HealthOSHealthSectionGridProps["pregnancySummary"];
  recordsSummary: HealthOSHealthSectionGridProps["recordsSummary"];
  section: HealthOSHealthSectionMeta;
  trustedContent: HealthOSHealthSectionGridProps["trustedContent"];
  vitalsMetrics: HealthOSMetric[];
  womenSummary: HealthOSHealthSectionGridProps["womenSummary"];
}) {
  switch (section.key) {
    case "vitals":
      return (
        <HealthOSVitalsOverviewSection
          key={section.key}
          metrics={vitalsMetrics}
          onLongPress={onLongPress}
          section={section}
        />
      );
    case "medicationSupplements":
      return (
        <HealthOSMedicationSupplementsSection
          key={section.key}
          medicationSummary={medicationSummary}
          onLongPress={onLongPress}
          section={section}
        />
      );
    case "fitnessNutrition":
      return (
        <HealthOSFitnessNutritionSection
          key={section.key}
          fitnessSummary={fitnessSummary}
          nutritionSummary={nutritionSummary}
          onLongPress={onLongPress}
          section={section}
        />
      );
    case "womenHealth":
      return (
        <HealthOSWomenHealthSection
          key={section.key}
          onLongPress={onLongPress}
          section={section}
          summary={womenSummary}
        />
      );
    case "pregnancy":
      return (
        <HealthOSPregnancySection
          key={section.key}
          onLongPress={onLongPress}
          section={section}
          summary={pregnancySummary}
        />
      );
    case "babyChild":
      return (
        <HealthOSBabyChildSection
          key={section.key}
          childProfileCount={babyChildProfileCount}
          onLongPress={onLongPress}
          section={section}
        />
      );
    case "records":
      return (
        <HealthOSRecordsAccordionSection
          key={section.key}
          onLongPress={onLongPress}
          recordsSummary={recordsSummary}
          section={section}
        />
      );
    case "trustedContent":
      return (
        <HealthOSTrustedContentSection
          key={section.key}
          articles={trustedContent.articles}
          emptyText={trustedContent.emptyText}
          error={trustedContent.error}
          loading={trustedContent.loading}
          onLongPress={onLongPress}
          section={section}
        />
      );
    case "deviceSync":
      return (
        <HealthOSDeviceSyncSection
          key={section.key}
          onLongPress={onLongPress}
          section={section}
        />
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    gap: healthOSSpacing.md,
  },
  hiddenPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
