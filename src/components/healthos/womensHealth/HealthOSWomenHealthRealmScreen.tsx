import { useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import { getHealthOSPalette, healthOSLayout, healthOSSafeArea, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import { HealthOSContraceptionFAQAccordion } from "./HealthOSContraceptionFAQAccordion";
import { HealthOSContraceptionSection } from "./HealthOSContraceptionSection";
import { HealthOSCycleOverviewHero } from "./HealthOSCycleOverviewHero";
import { HealthOSCyclePhaseVisual } from "./HealthOSCyclePhaseVisual";
import { HealthOSMoodSymptomSection } from "./HealthOSMoodSymptomSection";
import { HealthOSPregnancyTransitionCard } from "./HealthOSPregnancyTransitionCard";
import { HealthOSSexDayLogSection } from "./HealthOSSexDayLogSection";
import { HealthOSWomenAIQuestionCard } from "./HealthOSWomenAIQuestionCard";
import { HealthOSWomenCalendarPrivacyCard } from "./HealthOSWomenCalendarPrivacyCard";
import { HealthOSWomenContentSection } from "./HealthOSWomenContentSection";
import { HealthOSWomenHealthHeader } from "./HealthOSWomenHealthHeader";
import type { HealthOSWomenLogType } from "./HealthOSWomenHealthTypes";
import { HealthOSWomenPatternCharts } from "./HealthOSWomenPatternCharts";
import { HealthOSWomenQuickActions } from "./HealthOSWomenQuickActions";
import { HealthOSWomenQuickLogSheet } from "./HealthOSWomenQuickLogSheet";
import { useHealthOSWomenHealthActions } from "./useHealthOSWomenHealthActions";
import { useHealthOSWomenHealthData } from "./useHealthOSWomenHealthData";

export function HealthOSWomenHealthRealmScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const women = useHealthOSWomenHealthData();
  const [quickLogType, setQuickLogType] = useState<HealthOSWomenLogType | null>(null);
  const [toast, setToast] = useState("");
  const actions = useHealthOSWomenHealthActions({ onOpenQuickLog: setQuickLogType });

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Private cycle tools"
      title="Women's Health"
      withBottomNavSpace={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <HealthOSWomenHealthHeader
            cycleSummary={women.cycleSummary}
            onManage={actions.openPrivacy}
            privacyStatus={women.privacyStatus}
          />
          {women.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {women.error}
              </Text>
            </HealthOSCard>
          ) : null}
          {toast ? (
            <HealthOSCard variant="compact" title={toast} />
          ) : null}
          <HealthOSCycleOverviewHero summary={women.cycleSummary} />
          <HealthOSCyclePhaseVisual days={women.cycleDays} onOpenQuickLog={actions.openQuickLog} />
          <HealthOSWomenQuickActions onAskAI={actions.askAI} onOpenQuickLog={actions.openQuickLog} />
          <HealthOSWomenPatternCharts charts={women.patternCharts} onOpenDetails={actions.openPatternDetails} />
          <HealthOSMoodSymptomSection onOpenQuickLog={actions.openQuickLog} summary={women.moodSymptomSummary} />
          <HealthOSSexDayLogSection onAddLog={() => actions.openQuickLog("sex")} summary={women.sexLogSummary} />
          <HealthOSContraceptionSection
            onAdd={actions.openContraception}
            onLearn={actions.openPatternDetails}
            onLogMissed={() => actions.openQuickLog("contraception")}
            onSetReminder={actions.setContraceptionReminder}
            summary={women.contraceptionSummary}
          />
          <HealthOSContraceptionFAQAccordion
            items={women.faqItems}
            onAskAI={actions.askAI}
            onOpenSource={actions.openArticleSource}
          />
          <HealthOSWomenContentSection items={women.contentPreview} onOpenSource={actions.openArticleSource} />
          <HealthOSWomenAIQuestionCard onAskAI={actions.askAI} />
          <HealthOSPregnancyTransitionCard
            onLearnFirst={actions.openPregnancy}
            onOpenPregnancy={actions.openPregnancy}
            onStartPregnancyMode={actions.startPregnancyMode}
            status={women.pregnancyTransitionStatus}
          />
          <HealthOSWomenCalendarPrivacyCard
            onAddReminder={actions.setContraceptionReminder}
            onManagePrivacy={actions.manageSharing}
            onViewCalendar={actions.openCalendar}
          />
        </View>
      </ScrollView>
      <HealthOSWomenQuickLogSheet
        logType={quickLogType}
        onClose={() => setQuickLogType(null)}
        onSave={(draft) => {
          void actions.saveQuickLog(draft).then((message) => {
            setToast(message);
            setQuickLogType(null);
          });
        }}
      />
    </HealthOSAppShell>
  );
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
