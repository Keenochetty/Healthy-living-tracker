import { Modal, StyleSheet, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSRecordDisplay } from "./HealthOSRecordsTypes";
import { RecordsAction, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  onAddToEmergencyPacket: () => void;
  onClose: () => void;
  onDelete: () => void;
  onExtractWithAI: (record: HealthOSRecordDisplay) => void;
  onLink: () => void;
  onOpenFile: (record: HealthOSRecordDisplay) => void;
  onShare: () => void;
  record: HealthOSRecordDisplay | null;
};

export function HealthOSRecordDetailSheet({
  onAddToEmergencyPacket,
  onClose,
  onDelete,
  onExtractWithAI,
  onLink,
  onOpenFile,
  onShare,
  record,
}: Props) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={Boolean(record)}>
      <View style={styles.overlay}>
        <HealthOSCard title={record?.title ?? "Record detail"} subtitle={record ? formatValue(record.type) : undefined}>
          {record ? (
            <View style={recordsSharedStyles.row}>
              <View style={recordsSharedStyles.actions}>
                <HealthOSPill label={record.privacyStatus} size="sm" variant="glass" />
                <HealthOSPill label={record.reviewStatus} size="sm" variant={record.reviewStatus === "needsReview" ? "warning" : "default"} />
              </View>
              <RecordsText muted>{`File type: ${record.fileType ?? "unknown"}`}</RecordsText>
              <RecordsText muted>{`Source: ${record.source}`}</RecordsText>
              <RecordsText muted>{record.dateLabel ? `Date added: ${formatDate(record.dateLabel)}` : "Date added is not available."}</RecordsText>
              <RecordsText muted>{record.original.fileUrl ? "Original file is linked. Storage path is hidden." : "No original file is linked."}</RecordsText>
              <RecordsText muted>
                {record.linkedRealms.length ? `Linked to: ${record.linkedRealms.join(", ")}` : "No linked realms yet."}
              </RecordsText>
              <RecordsText muted>AI extracted fields appear here only after review. No extracted data is auto-saved.</RecordsText>
              <View style={recordsSharedStyles.actions}>
                <RecordsAction label="Open file" onPress={() => onOpenFile(record)} />
                <RecordsAction label="Link" onPress={onLink} />
                <RecordsAction label="Extract AI" onPress={() => onExtractWithAI(record)} variant="ai" />
                <RecordsAction label="Share" onPress={onShare} />
                <RecordsAction label="Emergency" onPress={onAddToEmergencyPacket} />
                <RecordsAction label="Delete" onPress={onDelete} variant="danger" />
                <RecordsAction label="Close" onPress={onClose} variant="realm" />
              </View>
            </View>
          ) : null}
        </HealthOSCard>
      </View>
    </Modal>
  );
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: healthOSSpacing.lg,
  },
});
