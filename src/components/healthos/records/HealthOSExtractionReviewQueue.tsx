import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSRecordDisplay } from "./HealthOSRecordsTypes";
import { EmptyRecordsState, RecordsAction, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  onReview: (record: HealthOSRecordDisplay | null) => void;
  records: HealthOSRecordDisplay[];
};

export function HealthOSExtractionReviewQueue({ onReview, records }: Props) {
  return (
    <HealthOSCard title="AI extraction review queue" subtitle="Review-first imports only.">
      <View style={recordsSharedStyles.row}>
        {records.length ? (
          records.map((record) => (
            <View key={record.id} style={recordsSharedStyles.row}>
              <RecordsText strong>{record.title}</RecordsText>
              <RecordsText muted>{`${record.source} - ${record.type}`}</RecordsText>
              <RecordsAction label="Review" onPress={() => onReview(record)} variant="ai" />
            </View>
          ))
        ) : (
          <EmptyRecordsState text="AI extraction reviews will appear here after scans." />
        )}
      </View>
    </HealthOSCard>
  );
}
