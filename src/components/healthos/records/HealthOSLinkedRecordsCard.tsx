import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";

import type { HealthOSRecordDisplay, HealthOSRecordLinkedRealm } from "./HealthOSRecordsTypes";
import { EmptyRecordsState, RecordsAction, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

const LINKED_REALMS: HealthOSRecordLinkedRealm[] = [
  "medication",
  "supplements",
  "pregnancy",
  "babyChild",
  "calendar",
  "family",
  "health",
  "nutrition",
  "fitness",
  "general",
];

type Props = {
  linkedRecords: HealthOSRecordDisplay[];
  onLinkRecord: () => void;
  onOpenRealm: (realm: HealthOSRecordLinkedRealm) => void;
};

export function HealthOSLinkedRecordsCard({ linkedRecords, onLinkRecord, onOpenRealm }: Props) {
  return (
    <HealthOSCard title="Linked records" subtitle="Links are shown only when saved data exists.">
      <View style={recordsSharedStyles.row}>
        <View style={recordsSharedStyles.actions}>
          {LINKED_REALMS.map((realm) => (
            <HealthOSPill key={realm} label={realm} onPress={() => onOpenRealm(realm)} size="sm" variant="glass" />
          ))}
        </View>
        {linkedRecords.length ? (
          linkedRecords.slice(0, 4).map((record) => (
            <RecordsText key={record.id} muted>
              {`${record.title} - ${record.linkedRealms.join(", ")}`}
            </RecordsText>
          ))
        ) : (
          <EmptyRecordsState text="No linked records are saved yet." />
        )}
        <RecordsAction label="Link record" onPress={onLinkRecord} variant="realm" />
      </View>
    </HealthOSCard>
  );
}
