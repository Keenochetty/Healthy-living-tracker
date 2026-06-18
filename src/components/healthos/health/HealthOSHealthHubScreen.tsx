import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import { getVisibleBabyProfilesForViewer } from "@/lib/babyChildStorage";
import { getBiometricDashboardSummary } from "@/lib/biometricsStorage";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getRecordsOverviewSummary } from "@/lib/healthRecordsStorage";
import { calculateTodayMedicationSchedule } from "@/lib/medicationSupplementStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import {
  calculatePregnancyWeekSummary,
  getPregnancyProfile,
} from "@/lib/pregnancyStorage";
import {
  getWomensHealthSettings,
  getWomensHealthTodaySummary,
} from "@/lib/womensHealthStorage";
import {
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
} from "@/theme/healthos";

import { HealthOSHealthHero } from "./HealthOSHealthHero";
import { HealthOSHealthQuickActions } from "./HealthOSHealthQuickActions";
import { HealthOSHealthSectionGrid } from "./HealthOSHealthSectionGrid";
import type { HealthOSMetric } from "./HealthOSHealthTypes";
import { useHealthOSHealthSections } from "./useHealthOSHealthSections";
import { useHealthOSTrustedContentPreview } from "./useHealthOSTrustedContentPreview";

type HealthHubData = {
  babyChildProfileCount: number;
  biometrics: Awaited<ReturnType<typeof getBiometricDashboardSummary>> | null;
  fitness: Awaited<ReturnType<typeof getTodayFitnessSummary>> | null;
  medication: Awaited<ReturnType<typeof calculateTodayMedicationSchedule>> | null;
  nutrition: Awaited<ReturnType<typeof getTodayNutritionSummary>> | null;
  pregnancy: Awaited<ReturnType<typeof calculatePregnancyWeekSummary>> | null;
  records: Awaited<ReturnType<typeof getRecordsOverviewSummary>> | null;
  women: Awaited<ReturnType<typeof getWomensHealthTodaySummary>> | null;
};

const INITIAL_DATA: HealthHubData = {
  babyChildProfileCount: 0,
  biometrics: null,
  fitness: null,
  medication: null,
  nutrition: null,
  pregnancy: null,
  records: null,
  women: null,
};

export function HealthOSHealthHubScreen() {
  const [data, setData] = useState<HealthHubData>(INITIAL_DATA);
  const [relevance, setRelevance] = useState({
    babyChildRelevant: false,
    pregnancyRelevant: false,
    womenHealthRelevant: false,
  });
  const sections = useHealthOSHealthSections(relevance);
  const trustedContent = useHealthOSTrustedContentPreview();

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadHealthHubData() {
        const [
          biometrics,
          medication,
          fitness,
          nutrition,
          records,
          womenSettings,
          women,
          pregnancyProfile,
          babyProfiles,
        ] = await Promise.all([
          getBiometricDashboardSummary().catch(() => null),
          calculateTodayMedicationSchedule().catch(() => null),
          getTodayFitnessSummary().catch(() => null),
          getTodayNutritionSummary().catch(() => null),
          getRecordsOverviewSummary().catch(() => null),
          getWomensHealthSettings().catch(() => null),
          getWomensHealthTodaySummary().catch(() => null),
          getPregnancyProfile().catch(() => null),
          getVisibleBabyProfilesForViewer().catch(() => []),
        ]);
        const pregnancy = pregnancyProfile
          ? await calculatePregnancyWeekSummary(pregnancyProfile).catch(() => null)
          : null;

        if (!mounted) return;

        setRelevance({
          babyChildRelevant: babyProfiles.length > 0,
          pregnancyRelevant: Boolean(pregnancyProfile),
          womenHealthRelevant: Boolean(womenSettings?.trackingEnabled),
        });
        setData({
          babyChildProfileCount: babyProfiles.length,
          biometrics,
          fitness,
          medication,
          nutrition,
          pregnancy,
          records,
          women: womenSettings?.trackingEnabled ? women : null,
        });
      }

      void loadHealthHubData();

      return () => {
        mounted = false;
      };
    }, []),
  );

  const vitalsMetrics = useMemo(() => buildVitalsMetrics(data.biometrics, data.nutrition), [
    data.biometrics,
    data.nutrition,
  ]);
  const attentionCount =
    (data.medication?.dueCount ?? 0) +
    (data.medication?.missedCount ?? 0) +
    (data.records?.recordsNeedingAttention ?? 0);

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Modular health control center"
      title="Health"
      withBottomNavSpace={false}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <HealthOSHealthHero
            attentionCount={attentionCount}
            totalSectionCount={sections.sections.length}
            visibleSectionCount={sections.visibleSections.length}
          />
          <HealthOSHealthQuickActions />
          <HealthOSHealthSectionGrid
            activeSectionMenuKey={sections.activeSectionMenuKey}
            babyChildProfileCount={data.babyChildProfileCount}
            fitnessSummary={data.fitness}
            getSectionInfo={sections.getSectionInfo}
            hiddenSections={sections.hiddenSections}
            hideSection={sections.hideSection}
            medicationSummary={data.medication}
            menuMode={sections.menuMode}
            moveSectionDown={sections.moveSectionDown}
            moveSectionUp={sections.moveSectionUp}
            nutritionSummary={data.nutrition}
            pregnancySummary={data.pregnancy}
            recordsSummary={data.records}
            resetSections={sections.resetSections}
            setActiveSectionMenuKey={sections.setActiveSectionMenuKey}
            setMenuMode={sections.setMenuMode}
            setSectionFirst={sections.setSectionFirst}
            showSection={sections.showSection}
            trustedContent={trustedContent}
            visibleSections={sections.visibleSections}
            vitalsMetrics={vitalsMetrics}
            womenSummary={
              data.women
                ? {
                    contraceptionActiveCount: data.women.contraceptionStatus === "Not tracking" ? 0 : 1,
                    cycleDay: data.women.cycleDay,
                    todaySymptomsCount: data.women.symptomCountToday,
                  }
                : null
            }
          />
        </View>
      </ScrollView>
    </HealthOSAppShell>
  );
}

function buildVitalsMetrics(
  biometrics: HealthHubData["biometrics"],
  nutrition: HealthHubData["nutrition"],
): HealthOSMetric[] {
  const getDisplay = (title: string) =>
    biometrics?.items.find((item) => item.title === title)?.latestDisplay ?? "No log";

  return [
    { label: "Weight", value: getDisplay("Weight") },
    { label: "Heart rate", value: getDisplay("Heart Rate") },
    { label: "Sleep", value: getDisplay("Sleep") },
    {
      label: "Water",
      status: nutrition?.waterMl ? "good" : "default",
      value: nutrition?.waterMl ? `${Math.round(nutrition.waterMl)}ml` : "No log",
    },
    { label: "Mood", value: getDisplay("Mood") },
    { label: "Blood pressure", value: getDisplay("Blood Pressure") },
  ];
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: healthOSSpacing.lg,
    maxWidth: healthOSLayout.screenMaxWidth,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: healthOSSafeArea.bottomNavSpace + healthOSSpacing.xl,
  },
});
