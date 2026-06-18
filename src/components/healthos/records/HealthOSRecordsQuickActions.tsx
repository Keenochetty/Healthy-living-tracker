import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import { RecordsAction, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  onAddNote: () => void;
  onAskAI: () => void;
  onCreateEmergencyPacket: () => void;
  onImportFromAI: () => void;
  onLinkRecord: () => void;
  onScan: () => void;
  onUploadFile: () => void;
  onUploadPhoto: () => void;
};

export function HealthOSRecordsQuickActions({
  onAddNote,
  onAskAI,
  onCreateEmergencyPacket,
  onImportFromAI,
  onLinkRecord,
  onScan,
  onUploadFile,
  onUploadPhoto,
}: Props) {
  return (
    <HealthOSCard title="Quick actions" subtitle="No upload or extraction runs until you choose it.">
      <View style={recordsSharedStyles.actions}>
        <RecordsAction label="Scan document" onPress={onScan} variant="realm" />
        <RecordsAction label="Upload file" onPress={onUploadFile} />
        <RecordsAction label="Upload photo" onPress={onUploadPhoto} />
        <RecordsAction label="Add note" onPress={onAddNote} />
        <RecordsAction label="Import from AI" onPress={onImportFromAI} variant="ai" />
        <RecordsAction label="Emergency packet" onPress={onCreateEmergencyPacket} />
        <RecordsAction label="Link record" onPress={onLinkRecord} />
        <RecordsAction label="Ask AI" onPress={onAskAI} variant="ai" />
      </View>
    </HealthOSCard>
  );
}
