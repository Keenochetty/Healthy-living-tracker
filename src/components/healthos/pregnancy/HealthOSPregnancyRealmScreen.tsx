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

import { HealthOSAfterBirthPlanCard } from "./HealthOSAfterBirthPlanCard";
import { HealthOSBabyProfileCreationCard } from "./HealthOSBabyProfileCreationCard";
import { HealthOSCareTeamAccessCard } from "./HealthOSCareTeamAccessCard";
import { HealthOSDueDateProgressHero } from "./HealthOSDueDateProgressHero";
import { HealthOSHospitalBagChecklist } from "./HealthOSHospitalBagChecklist";
import { HealthOSMomChecklistSection } from "./HealthOSMomChecklistSection";
import { HealthOSMotherHealthSummary } from "./HealthOSMotherHealthSummary";
import { HealthOSPartnerChecklistSection } from "./HealthOSPartnerChecklistSection";
import { HealthOSPregnancyAIQuestionCard } from "./HealthOSPregnancyAIQuestionCard";
import { HealthOSPregnancyAppointmentsCard } from "./HealthOSPregnancyAppointmentsCard";
import { HealthOSPregnancyCalendarPrivacyRecordsCard } from "./HealthOSPregnancyCalendarPrivacyRecordsCard";
import { HealthOSPregnancyContentSection } from "./HealthOSPregnancyContentSection";
import { HealthOSPregnancyFamilyUpdatesCard } from "./HealthOSPregnancyFamilyUpdatesCard";
import { HealthOSPregnancyHeader } from "./HealthOSPregnancyHeader";
import { HealthOSPregnancyQuickActions } from "./HealthOSPregnancyQuickActions";
import { HealthOSPregnancyQuickLogSheet } from "./HealthOSPregnancyQuickLogSheet";
import { HealthOSPregnancySetupCard } from "./HealthOSPregnancySetupCard";
import { HealthOSPregnancySupplementsCard } from "./HealthOSPregnancySupplementsCard";
import { HealthOSPregnancyWeekOverview } from "./HealthOSPregnancyWeekOverview";
import type { HealthOSPregnancyLogType } from "./HealthOSPregnancyTypes";
import { HealthOSWeeklyBabyGrowthCard } from "./HealthOSWeeklyBabyGrowthCard";
import { useHealthOSPregnancyActions } from "./useHealthOSPregnancyActions";
import { useHealthOSPregnancyData } from "./useHealthOSPregnancyData";

export function HealthOSPregnancyRealmScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const pregnancy = useHealthOSPregnancyData();
  const [quickLogType, setQuickLogType] = useState<HealthOSPregnancyLogType | null>(null);
  const [toast, setToast] = useState("");
  const actions = useHealthOSPregnancyActions({
    onOpenQuickLog: setQuickLogType,
    onRefresh: pregnancy.reload,
  });

  function toggleChecklistItem(id: string) {
    setToast(actions.toggleChecklistItem(id));
  }

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Private pregnancy planning"
      title="Pregnancy"
      withBottomNavSpace={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <HealthOSPregnancyHeader
            onManagePrivacy={actions.managePrivacy}
            pregnancyStatus={pregnancy.pregnancyStatus}
            privacyStatus={pregnancy.privacyStatus}
            setupState={pregnancy.setupState}
            weekSummary={pregnancy.weekOverview.week}
          />
          {pregnancy.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {pregnancy.error}
              </Text>
            </HealthOSCard>
          ) : null}
          {toast ? <HealthOSCard title={toast} variant="compact" /> : null}
          {pregnancy.pregnancyStatus !== "active" ? (
            <HealthOSPregnancySetupCard
              onLearnFirst={actions.askAI}
              onStart={actions.savePregnancySetup}
            />
          ) : null}
          <HealthOSDueDateProgressHero
            currentTrimester={pregnancy.currentTrimester}
            currentWeek={pregnancy.currentWeek}
            dueDate={pregnancy.dueDate}
            progress={pregnancy.progress}
          />
          <HealthOSPregnancyWeekOverview overview={pregnancy.weekOverview} />
          <HealthOSWeeklyBabyGrowthCard
            babyGrowth={pregnancy.babyGrowth}
            onOpenSource={actions.openArticleSource}
          />
          <HealthOSPregnancyQuickActions
            onAddAppointment={actions.addAppointment}
            onAddSupplement={actions.openSupplements}
            onAskAI={actions.askAI}
            onOpenChecklist={() => setToast("Hospital bag checklist is available below.")}
            onOpenLog={actions.openQuickLog}
            onUpdateFamily={actions.shareFamilyUpdate}
            onUploadRecord={actions.uploadRecord}
          />
          <HealthOSMotherHealthSummary summary={pregnancy.motherHealthSummary} />
          <HealthOSPregnancyAppointmentsCard
            appointments={pregnancy.appointments}
            onAddAppointment={actions.addAppointment}
            onAddReminder={actions.addReminder}
            onUploadRecord={actions.uploadRecord}
            onViewCalendar={actions.openCalendar}
          />
          <HealthOSPregnancySupplementsCard
            onAskAI={actions.askAI}
            onOpenMedication={actions.openMedication}
            onOpenSupplements={actions.openSupplements}
            onScanScript={actions.scanScript}
            supplements={pregnancy.supplements}
          />
          <HealthOSMomChecklistSection
            checklist={pregnancy.momChecklist}
            onToggle={toggleChecklistItem}
          />
          <HealthOSPartnerChecklistSection
            checklist={pregnancy.partnerChecklist}
            onToggle={toggleChecklistItem}
          />
          <HealthOSHospitalBagChecklist
            checklist={pregnancy.hospitalBagChecklist}
            onToggle={toggleChecklistItem}
          />
          <HealthOSAfterBirthPlanCard
            checklist={pregnancy.afterBirthPlan}
            onToggle={toggleChecklistItem}
          />
          <HealthOSBabyProfileCreationCard
            babyProfile={pregnancy.babyProfile}
            onCreateBabyProfile={actions.createBabyProfile}
            onOpenBabyProfile={actions.openBabyProfile}
          />
          <HealthOSPregnancyFamilyUpdatesCard
            familyUpdates={pregnancy.familyUpdates}
            onShareFamilyUpdate={actions.shareFamilyUpdate}
          />
          <HealthOSCareTeamAccessCard
            careTeamAccess={pregnancy.careTeamAccess}
            onInvite={actions.inviteCareProfessional}
            onManage={actions.manageCareTeamAccess}
          />
          <HealthOSPregnancyContentSection
            items={pregnancy.contentPreview}
            onOpenSource={actions.openArticleSource}
          />
          <HealthOSPregnancyAIQuestionCard onAskAI={actions.askAI} />
          <HealthOSPregnancyCalendarPrivacyRecordsCard
            onManagePrivacy={actions.managePrivacy}
            onOpenBabyProfile={actions.openBabyProfile}
            onOpenMedication={actions.openMedication}
            onUploadRecord={actions.uploadRecord}
            onViewCalendar={actions.openCalendar}
          />
          <HealthOSCard variant="compact">
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              Pregnancy tracking is for organization and education only. It is not medical advice and does not replace a doctor, midwife, nurse, clinic, pharmacist, or healthcare professional.
            </Text>
          </HealthOSCard>
        </View>
      </ScrollView>
      <HealthOSPregnancyQuickLogSheet
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
