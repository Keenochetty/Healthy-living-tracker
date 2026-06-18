import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSRecordDisplay } from "./HealthOSRecordsTypes";
import { EmptyRecordsState } from "./HealthOSRecordsShared";
import { HealthOSRecordRow } from "./HealthOSRecordRow";

type Props = {
  onLongPress?: (record: HealthOSRecordDisplay) => void;
  onOpenRecord: (record: HealthOSRecordDisplay) => void;
  records: HealthOSRecordDisplay[];
};

export function HealthOSRecentRecordsList({ onLongPress, onOpenRecord, records }: Props) {
  return (
    <HealthOSCard title="Recent records" subtitle="Latest stored, scanned, uploaded, or manual records.">
      <View>
        {records.length ? (
          records.map((record) => (
            <HealthOSRecordRow
              key={record.id}
              onLongPress={onLongPress}
              onPress={onOpenRecord}
              record={record}
            />
          ))
        ) : (
          <EmptyRecordsState text="Scanned and uploaded records will appear here." />
        )}
      </View>
    </HealthOSCard>
  );
}
