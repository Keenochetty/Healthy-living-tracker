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

import { HealthOSAdherenceSummaryCard } from "./HealthOSAdherenceSummaryCard";
import { HealthOSMedicationAIQuestionCard } from "./HealthOSMedicationAIQuestionCard";
import { HealthOSMedicationCalendarCard } from "./HealthOSMedicationCalendarCard";
import { HealthOSMedicationCautionsCard } from "./HealthOSMedicationCautionsCard";
import { HealthOSMedicationContentSection } from "./HealthOSMedicationContentSection";
import { HealthOSMedicationDetailSheet } from "./HealthOSMedicationDetailSheet";
import { HealthOSMedicationExtractionReview } from "./HealthOSMedicationExtractionReview";
import { HealthOSMedicationHeader } from "./HealthOSMedicationHeader";
import { HealthOSMedicationQuickActions } from "./HealthOSMedicationQuickActions";
import { HealthOSMedicationRecordsCard } from "./HealthOSMedicationRecordsCard";
import { HealthOSMedicationScanImportCard } from "./HealthOSMedicationScanImportCard";
import { HealthOSMedicationSharingCard } from "./HealthOSMedicationSharingCard";
import { HealthOSMedicationTimeline } from "./HealthOSMedicationTimeline";
import { HealthOSMedicationTodayHero } from "./HealthOSMedicationTodayHero";
import { HealthOSMissedSideEffectNotesCard } from "./HealthOSMissedSideEffectNotesCard";
import { HealthOSRefillReminderCard } from "./HealthOSRefillReminderCard";
import { HealthOSSymptomSupportPlanCard } from "./HealthOSSymptomSupportPlanCard";
import { HealthOSSupplementTimeline } from "./HealthOSSupplementTimeline";
import type { HealthOSMedicationDisplayItem, HealthOSMedicationKind } from "./HealthOSMedicationTypes";
import { useHealthOSMedicationActions } from "./useHealthOSMedicationActions";
import { useHealthOSMedicationData } from "./useHealthOSMedicationData";

type Props = {
  initialFocus?: HealthOSMedicationKind;
};

export function HealthOSMedicationRealmScreen({ initialFocus = "medication" }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const [activeFocus, setActiveFocus] = useState<HealthOSMedicationKind>(initialFocus);
  const [selectedItem, setSelectedItem] = useState<HealthOSMedicationDisplayItem | null>(null);
  const [extractionReviewVisible, setExtractionReviewVisible] = useState(false);
  const [toast, setToast] = useState("");
  const medication = useHealthOSMedicationData(activeFocus);
  const actions = useHealthOSMedicationActions({
    onOpenDetail: setSelectedItem,
    onOpenExtractionReview: () => setExtractionReviewVisible(true),
    onRefresh: medication.reload,
    onToast: setToast,
  });

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Medication + Supplements"
      title={activeFocus === "medication" ? "Medication" : "Supplements"}
      withBottomNavSpace={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <HealthOSMedicationHeader
            activeFocus={activeFocus}
            medicationCount={medication.medicationItems.length}
            onSetFocus={setActiveFocus}
            privacyStatus={medication.privacyStatus}
            supplementCount={medication.supplementItems.length}
          />
          {medication.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {medication.error}
              </Text>
            </HealthOSCard>
          ) : null}
          {toast ? <HealthOSCard title={toast} variant="compact" /> : null}
          <HealthOSMedicationTodayHero
            nextReminder={medication.nextReminder}
            onAddReminder={() => actions.addItem(activeFocus)}
            summary={medication.todaySummary}
          />
          <HealthOSMedicationQuickActions
            activeFocus={activeFocus}
            onAddItem={actions.addItem}
            onAskAI={actions.askAI}
            onLogSideEffect={actions.logSideEffect}
            onOpenRecords={actions.openRecords}
            onScanLabel={actions.scanLabel}
          />
          {activeFocus === "medication" ? (
            <HealthOSMedicationTimeline
              items={medication.medicationItems}
              onDetails={actions.openDetail}
              onSkip={actions.markSkipped}
              onSnooze={actions.snooze}
              onTaken={actions.markTaken}
            />
          ) : (
            <HealthOSSupplementTimeline
              items={medication.supplementItems}
              onDetails={actions.openDetail}
              onSkip={actions.markSkipped}
              onSnooze={actions.snooze}
              onTaken={actions.markTaken}
            />
          )}
          <HealthOSMedicationScanImportCard
            onOpenExtractionReview={actions.openExtractionReview}
            onScan={actions.importFromScan}
            status={medication.scanImportStatus}
          />
          <HealthOSAdherenceSummaryCard adherence={medication.adherence} />
          <HealthOSRefillReminderCard onOpenRecords={actions.openRecords} refillSummary={medication.refillSummary} />
          <HealthOSMissedSideEffectNotesCard
            notes={medication.missedAndSideEffects}
            onLogSideEffect={actions.logSideEffect}
          />
          <HealthOSMedicationCautionsCard cautions={medication.cautions} />
          <HealthOSSymptomSupportPlanCard
            onLogSideEffect={actions.logSideEffect}
            status={medication.symptomSupportStatus}
          />
          <HealthOSMedicationRecordsCard
            documents={medication.documents}
            onOpenRecords={actions.openRecords}
            onScan={actions.scanLabel}
          />
          <HealthOSMedicationCalendarCard
            onOpenCalendar={actions.addToCalendar}
            status={medication.calendarStatus}
          />
          <HealthOSMedicationSharingCard
            onManageSharing={actions.manageSharing}
            status={medication.sharingStatus}
          />
          <HealthOSMedicationContentSection items={medication.contentPreview} />
          <HealthOSMedicationAIQuestionCard onAskAI={actions.askAI} />
          <HealthOSCard variant="compact">
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              HealthSync helps organize medication and supplement information. It does not replace prescription labels, product labels, pharmacists, doctors, nurses, clinics, or healthcare professionals.
            </Text>
          </HealthOSCard>
        </View>
      </ScrollView>
      <HealthOSMedicationDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenRecords={actions.openRecords}
        onOpenSharing={actions.manageSharing}
      />
      <HealthOSMedicationExtractionReview
        onClose={() => setExtractionReviewVisible(false)}
        onSavePreview={actions.saveReviewedExtraction}
        status={medication.extractionReviewStatus}
        visible={extractionReviewVisible}
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
