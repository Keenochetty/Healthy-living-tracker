import { StyleSheet, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill, type HealthOSPillVariant } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSRecordDisplay } from "./HealthOSRecordsTypes";
import { RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  onLongPress?: (record: HealthOSRecordDisplay) => void;
  onPress: (record: HealthOSRecordDisplay) => void;
  record: HealthOSRecordDisplay;
};

export function HealthOSRecordRow({ onLongPress, onPress, record }: Props) {
  return (
    <HealthOSCard
      onLongPress={() => onLongPress?.(record)}
      onPress={() => onPress(record)}
      variant="list"
    >
      <View style={styles.content}>
        <View style={recordsSharedStyles.splitRow}>
          <View style={styles.copy}>
            <RecordsText strong>{record.title}</RecordsText>
            <RecordsText muted>
              {[formatValue(record.type), record.dateLabel ? formatDate(record.dateLabel) : undefined, record.fileType]
                .filter(Boolean)
                .join(" - ")}
            </RecordsText>
          </View>
          <HealthOSPill label="Open" size="sm" variant="realm" />
        </View>
        <View style={recordsSharedStyles.actions}>
          <HealthOSPill label={record.source} size="sm" variant="glass" />
          <HealthOSPill label={record.reviewStatus} size="sm" variant={statusVariant(record.reviewStatus)} />
          <HealthOSPill label={record.privacyStatus} size="sm" variant={record.privacyStatus === "private" ? "default" : "success"} />
        </View>
        {record.linkedRealms.length ? (
          <RecordsText muted>{`Linked to ${record.linkedRealms.join(", ")}`}</RecordsText>
        ) : null}
      </View>
    </HealthOSCard>
  );
}

function statusVariant(value: HealthOSRecordDisplay["reviewStatus"]): HealthOSPillVariant {
  if (value === "needsReview") return "warning";
  if (value === "shared") return "success";
  if (value === "archived") return "default";
  return "glass";
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" }).format(new Date(value));
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.sm,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
});
