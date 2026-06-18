import { useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import {
  getHealthOSPalette,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSBabyChildQuickActions } from "./HealthOSBabyChildQuickActions";
import { HealthOSBabyChildQuickLogSheet } from "./HealthOSBabyChildQuickLogSheet";
import { HealthOSBabyChildSetupCard } from "./HealthOSBabyChildSetupCard";
import { HealthOSCareTimeline } from "./HealthOSCareTimeline";
import { HealthOSCaregiverNotesCard } from "./HealthOSCaregiverNotesCard";
import { HealthOSChildAIQuestionCard } from "./HealthOSChildAIQuestionCard";
import { HealthOSChildContentSection } from "./HealthOSChildContentSection";
import { HealthOSChildFamilySharingCard } from "./HealthOSChildFamilySharingCard";
import { HealthOSChildMedicationSymptomsCard } from "./HealthOSChildMedicationSymptomsCard";
import { HealthOSChildProfileHeader } from "./HealthOSChildProfileHeader";
import { HealthOSChildRecordsShortcutCard } from "./HealthOSChildRecordsShortcutCard";
import { HealthOSChildTodaySummary } from "./HealthOSChildTodaySummary";
import { HealthOSDiaperTrackerCard } from "./HealthOSDiaperTrackerCard";
import { HealthOSFeedingTrackerCard } from "./HealthOSFeedingTrackerCard";
import { HealthOSGrowthChartCard } from "./HealthOSGrowthChartCard";
import { HealthOSMilestoneTrackerCard } from "./HealthOSMilestoneTrackerCard";
import { HealthOSParentControlsCard } from "./HealthOSParentControlsCard";
import { HealthOSPregnancyToBabyCard } from "./HealthOSPregnancyToBabyCard";
import { HealthOSSleepTrackerCard } from "./HealthOSSleepTrackerCard";
import { HealthOSSolidsIntroCard } from "./HealthOSSolidsIntroCard";
import { HealthOSVaccineTimelineCard } from "./HealthOSVaccineTimelineCard";
import type { HealthOSChildCareLogType } from "./HealthOSBabyChildTypes";
import { useHealthOSBabyChildActions } from "./useHealthOSBabyChildActions";
import { useHealthOSBabyChildData } from "./useHealthOSBabyChildData";

export function HealthOSBabyChildRealmScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const babyChild = useHealthOSBabyChildData();
  const [quickLogType, setQuickLogType] = useState<HealthOSChildCareLogType | null>(null);
  const [toast, setToast] = useState("");
  const actions = useHealthOSBabyChildActions({
    activeChildId: babyChild.activeChild?.id,
    onOpenQuickLog: setQuickLogType,
    onRefresh: babyChild.reload,
  });

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Parent-controlled care"
      title="Baby / Child"
      withBottomNavSpace={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {babyChild.activeChild ? (
            <HealthOSChildProfileHeader
              activeChild={babyChild.activeChild}
              onManageProfile={actions.manageProfile}
              onSelectProfile={babyChild.selectProfile}
              profileState={babyChild.profileState}
              profiles={babyChild.childProfiles}
            />
          ) : (
            <HealthOSBabyChildSetupCard
              onConnectPregnancy={actions.createProfileFromPregnancy}
              onCreateProfile={actions.createProfile}
              onLearnPrivacy={actions.manageParentControls}
            />
          )}
          {babyChild.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {babyChild.error}
              </Text>
            </HealthOSCard>
          ) : null}
          {toast ? <HealthOSCard title={toast} variant="compact" /> : null}
          <HealthOSChildTodaySummary
            onPrimaryAction={() => setQuickLogType("feed")}
            summary={babyChild.todaySummary}
          />
          <HealthOSBabyChildQuickActions
            onOpenLog={actions.openQuickLog}
            onScanRecord={actions.scanRecord}
          />
          <HealthOSCareTimeline events={babyChild.careTimeline} />
          <HealthOSFeedingTrackerCard onAddFeed={() => setQuickLogType("feed")} summary={babyChild.feedingSummary} />
          <HealthOSSleepTrackerCard onAddSleep={() => setQuickLogType("sleep")} summary={babyChild.sleepSummary} />
          <HealthOSDiaperTrackerCard onAddDiaper={() => setQuickLogType("diaper")} summary={babyChild.diaperSummary} />
          <HealthOSGrowthChartCard onAddGrowth={() => setToast("Growth logging stays in the existing Baby/Child detail flow for now.")} summary={babyChild.growthSummary} />
          <HealthOSVaccineTimelineCard onAddReminder={actions.openCalendar} onScanCard={actions.scanRecord} timeline={babyChild.vaccineTimeline} />
          <HealthOSMilestoneTrackerCard onAddMilestone={() => setQuickLogType("milestone")} summary={babyChild.milestoneSummary} />
          <HealthOSSolidsIntroCard onAddFood={() => setQuickLogType("solidFood")} onOpenNutrition={actions.openNutrition} summary={babyChild.solidsSummary} />
          <HealthOSChildMedicationSymptomsCard
            onAddMedication={() => setQuickLogType("medicine")}
            onLogSymptom={() => setQuickLogType("symptom")}
            onLogTemperature={() => setQuickLogType("temperature")}
            onScanScript={actions.scanScript}
            onUploadRecord={actions.uploadRecord}
            summary={babyChild.medicationSymptomsSummary}
          />
          <HealthOSCaregiverNotesCard caregiverNotes={babyChild.caregiverNotes} onContactCaregiver={actions.contactCaregiver} />
          <HealthOSChildRecordsShortcutCard onOpenRecords={actions.openRecords} onScanDocument={actions.scanRecord} onUploadFile={actions.uploadRecord} recordsSummary={babyChild.recordsSummary} />
          <HealthOSParentControlsCard onManage={actions.manageParentControls} parentControls={babyChild.parentControls} />
          <HealthOSChildFamilySharingCard familySharing={babyChild.familySharing} onManageSharing={actions.manageSharing} />
          <HealthOSPregnancyToBabyCard onCreateFromPregnancy={actions.createBabyFromPregnancy} pregnancyConnection={babyChild.pregnancyConnection} />
          <HealthOSChildContentSection items={babyChild.contentPreview} onOpenSource={actions.openArticleSource} />
          <HealthOSChildAIQuestionCard onAskAI={actions.askAI} />
          <HealthOSCard variant="compact">
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              Baby and child tracking is for organization and education only. It is not medical advice and does not replace a pediatrician, doctor, nurse, clinic, or healthcare professional.
            </Text>
          </HealthOSCard>
        </View>
      </ScrollView>
      <HealthOSBabyChildQuickLogSheet
        activeChildId={babyChild.activeChild?.id}
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
