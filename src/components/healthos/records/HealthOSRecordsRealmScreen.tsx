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

import { HealthOSEmergencyPacketCard } from "./HealthOSEmergencyPacketCard";
import { HealthOSExtractionReviewQueue } from "./HealthOSExtractionReviewQueue";
import { HealthOSLinkedRecordsCard } from "./HealthOSLinkedRecordsCard";
import { HealthOSRecentRecordsList } from "./HealthOSRecentRecordsList";
import { HealthOSRecordCategoryGrid } from "./HealthOSRecordCategoryGrid";
import { HealthOSRecordDetailSheet } from "./HealthOSRecordDetailSheet";
import { HealthOSRecordExtractionReview } from "./HealthOSRecordExtractionReview";
import { HealthOSRecordHistoryCard } from "./HealthOSRecordHistoryCard";
import { HealthOSRecordUploadSheet } from "./HealthOSRecordUploadSheet";
import { HealthOSRecordsContentSection } from "./HealthOSRecordsContentSection";
import { HealthOSRecordsHeader } from "./HealthOSRecordsHeader";
import { HealthOSRecordsQuickActions } from "./HealthOSRecordsQuickActions";
import { HealthOSRecordsSearchFilter } from "./HealthOSRecordsSearchFilter";
import { HealthOSRecordsVaultHero } from "./HealthOSRecordsVaultHero";
import { HealthOSSharedRecordsPermissionsCard } from "./HealthOSSharedRecordsPermissionsCard";
import type { HealthOSRecordDisplay } from "./HealthOSRecordsTypes";
import { useHealthOSRecordsActions } from "./useHealthOSRecordsActions";
import { useHealthOSRecordsData } from "./useHealthOSRecordsData";

export function HealthOSRecordsRealmScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const records = useHealthOSRecordsData();
  const [selectedRecord, setSelectedRecord] = useState<HealthOSRecordDisplay | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [reviewRecord, setReviewRecord] = useState<HealthOSRecordDisplay | null>(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [toast, setToast] = useState("");
  const actions = useHealthOSRecordsActions({
    onOpenDetail: setSelectedRecord,
    onOpenExtractionReview: (record) => {
      setReviewRecord(record);
      setReviewVisible(true);
    },
    onOpenUpload: () => setUploadVisible(true),
    onToast: setToast,
  });

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Private document vault"
      title="Records"
      withBottomNavSpace={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <HealthOSRecordsHeader
            onManagePrivacy={actions.manageSharing}
            privacyStatus={records.privacyStatus}
            recordCount={records.records.length}
          />
          {records.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {records.error}
              </Text>
            </HealthOSCard>
          ) : null}
          {toast ? <HealthOSCard title={toast} variant="compact" /> : null}
          <HealthOSRecordsSearchFilter
            activeFilters={records.activeFilters}
            onClear={records.clearFilters}
            onQueryChange={records.setSearchQuery}
            onToggleFilter={records.toggleFilter}
            query={records.searchQuery}
          />
          <HealthOSRecordsVaultHero data={records} />
          <HealthOSRecordsQuickActions
            onAddNote={actions.addManualNote}
            onAskAI={actions.importFromAI}
            onCreateEmergencyPacket={actions.createEmergencyPacket}
            onImportFromAI={actions.importFromAI}
            onLinkRecord={actions.linkRecord}
            onScan={actions.scanDocument}
            onUploadFile={actions.uploadFile}
            onUploadPhoto={actions.uploadPhoto}
          />
          <HealthOSRecordCategoryGrid
            activeFilters={records.activeFilters}
            categories={records.categories}
            onToggleFilter={records.toggleFilter}
          />
          <HealthOSRecentRecordsList
            onLongPress={actions.openRecord}
            onOpenRecord={actions.openRecord}
            records={records.recentRecords}
          />
          <HealthOSExtractionReviewQueue
            onReview={actions.reviewExtraction}
            records={records.reviewQueue}
          />
          <HealthOSLinkedRecordsCard
            linkedRecords={records.linkedRecords}
            onLinkRecord={actions.linkRecord}
            onOpenRealm={actions.openLinkedRealm}
          />
          <HealthOSEmergencyPacketCard
            onCreate={actions.createEmergencyPacket}
            summary={records.emergencyPacketSummary}
          />
          <HealthOSSharedRecordsPermissionsCard
            onManageSharing={actions.manageSharing}
            sharingSummary={records.sharingSummary}
          />
          <HealthOSRecordHistoryCard history={records.recordHistory} />
          <HealthOSRecordsContentSection items={records.contentPreview} />
          <HealthOSCard variant="compact">
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              Records can contain sensitive health information. Review extracted information before saving. AI extraction can make mistakes. You choose what family or caregivers can see.
            </Text>
          </HealthOSCard>
        </View>
      </ScrollView>
      <HealthOSRecordDetailSheet
        onAddToEmergencyPacket={actions.addToEmergencyPacket}
        onClose={() => setSelectedRecord(null)}
        onDelete={actions.deleteRecord}
        onExtractWithAI={actions.extractWithAI}
        onLink={actions.linkRecord}
        onOpenFile={actions.openFile}
        onShare={actions.shareRecord}
        record={selectedRecord}
      />
      <HealthOSRecordUploadSheet
        onClose={() => setUploadVisible(false)}
        onScan={actions.scanDocument}
        onSelected={(message) => setToast(message)}
        uploadStatus={records.uploadStatus}
        visible={uploadVisible}
      />
      <HealthOSRecordExtractionReview
        onClose={() => setReviewVisible(false)}
        onSavePreview={actions.saveReviewedExtraction}
        record={reviewRecord}
        visible={reviewVisible}
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
