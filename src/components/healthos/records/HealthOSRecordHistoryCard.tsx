import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSRecordsData } from "./HealthOSRecordsTypes";
import { EmptyRecordsState, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  history: HealthOSRecordsData["recordHistory"];
};

export function HealthOSRecordHistoryCard({ history }: Props) {
  return (
    <HealthOSCard title="Record history" subtitle="Foundation audit trail.">
      <View style={recordsSharedStyles.row}>
        {history.length ? (
          history.map((event) => (
            <RecordsText key={event.id} muted>
              {event.timestamp ? `${event.label} - ${formatDate(event.timestamp)}` : event.label}
            </RecordsText>
          ))
        ) : (
          <EmptyRecordsState text="Record history will appear as you add and review documents." />
        )}
      </View>
    </HealthOSCard>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" }).format(new Date(value));
}
