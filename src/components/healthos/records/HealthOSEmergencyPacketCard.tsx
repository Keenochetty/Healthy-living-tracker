import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSRecordsData } from "./HealthOSRecordsTypes";
import { RecordsAction, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  onCreate: () => void;
  summary: HealthOSRecordsData["emergencyPacketSummary"];
};

export function HealthOSEmergencyPacketCard({ onCreate, summary }: Props) {
  return (
    <HealthOSCard title="Emergency packet" subtitle="User-selected records only.">
      <View style={recordsSharedStyles.row}>
        <RecordsText muted>{summary.status}</RecordsText>
        <RecordsText muted>
          Possible items include emergency contacts, allergies, current medication list, insurance, prescriptions, child vaccine cards, and pregnancy info only if the user chooses them.
        </RecordsText>
        <RecordsAction label="Create packet" onPress={onCreate} variant="warning" />
      </View>
    </HealthOSCard>
  );
}
