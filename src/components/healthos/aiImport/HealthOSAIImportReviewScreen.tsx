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
import type { HealthOSAIImportEnvelope } from "@/features/aiImport";

import { HealthOSAIImportFieldReviewList } from "./HealthOSAIImportFieldReviewList";
import { HealthOSAIImportHeader } from "./HealthOSAIImportHeader";
import { HealthOSAIImportTargetPicker } from "./HealthOSAIImportTargetPicker";
import { HealthOSImportActionBar } from "./HealthOSImportActionBar";
import { HealthOSImportHistoryCard } from "./HealthOSImportHistoryCard";
import { HealthOSImportSafetyNotice } from "./HealthOSImportSafetyNotice";
import { HealthOSImportWarningsCard } from "./HealthOSImportWarningsCard";
import { HealthOSMissingFieldsCard } from "./HealthOSMissingFieldsCard";
import { HealthOSSourceEvidenceList } from "./HealthOSSourceEvidenceList";
import { useHealthOSAIImportReview } from "./useHealthOSAIImportReview";

type Props = {
  envelope: HealthOSAIImportEnvelope | null;
};

export function HealthOSAIImportReviewScreen({ envelope }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const review = useHealthOSAIImportReview(envelope);

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Review before saving"
      title="AI Import"
      withBottomNavSpace={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <HealthOSAIImportHeader envelope={review.envelope} />
          {review.message ? (
            <HealthOSCard variant={review.message.kind === "warning" ? "danger" : "compact"}>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>{review.message.text}</Text>
            </HealthOSCard>
          ) : null}
          <HealthOSImportWarningsCard warnings={review.warnings} />
          <HealthOSSourceEvidenceList envelope={review.envelope} />
          <HealthOSAIImportTargetPicker
            envelope={review.envelope}
            onSelect={review.setTarget}
            selectedTarget={review.selectedTarget}
          />
          <HealthOSMissingFieldsCard missingFields={review.missingFields} />
          <HealthOSAIImportFieldReviewList
            envelope={review.envelope}
            onConfirmField={review.confirmField}
            onRejectField={review.rejectField}
          />
          <HealthOSImportSafetyNotice safety={review.envelope?.safety} />
          <HealthOSImportActionBar
            blockingReasons={review.blockingReasons}
            canImport={review.canImport}
            onAddToCalendar={review.addToCalendar}
            onDiscard={review.discardImport}
            onImport={review.importToTarget}
            onSaveToRecords={review.saveToRecords}
            selectedTarget={review.selectedTarget}
          />
          <HealthOSImportHistoryCard envelope={review.envelope} selectedTarget={review.selectedTarget} />
        </View>
      </ScrollView>
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
