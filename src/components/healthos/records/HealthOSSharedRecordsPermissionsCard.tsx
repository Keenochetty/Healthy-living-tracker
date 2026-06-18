import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSRecordsData } from "./HealthOSRecordsTypes";
import { RecordsAction, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  onManageSharing: () => void;
  sharingSummary: HealthOSRecordsData["sharingSummary"];
};

export function HealthOSSharedRecordsPermissionsCard({ onManageSharing, sharingSummary }: Props) {
  return (
    <HealthOSCard title="Sharing and permissions" subtitle="Private unless explicitly shared.">
      <View style={recordsSharedStyles.row}>
        <RecordsText muted>{sharingSummary.status}</RecordsText>
        <RecordsText muted>You choose what family or caregivers can see. No records are shared automatically.</RecordsText>
        <RecordsAction label="Manage sharing" onPress={onManageSharing} variant="realm" />
      </View>
    </HealthOSCard>
  );
}
