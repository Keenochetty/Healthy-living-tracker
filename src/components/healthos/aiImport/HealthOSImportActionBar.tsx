import { View } from "react-native";

import type { HealthOSAIImportTarget } from "@/features/aiImport";

import { AIImportAction, AIImportText, aiImportStyles } from "./HealthOSAIImportShared";

type Props = {
  blockingReasons: string[];
  canImport: boolean;
  onAddToCalendar: () => void;
  onDiscard: () => void;
  onImport: () => void;
  onSaveToRecords: () => void;
  selectedTarget: HealthOSAIImportTarget;
};

export function HealthOSImportActionBar({
  blockingReasons,
  canImport,
  onAddToCalendar,
  onDiscard,
  onImport,
  onSaveToRecords,
  selectedTarget,
}: Props) {
  return (
    <View style={aiImportStyles.row}>
      {blockingReasons.length ? <AIImportText muted>{blockingReasons[0]}</AIImportText> : null}
      <View style={aiImportStyles.actions}>
        <AIImportAction label="Discard" onPress={onDiscard} variant="danger" />
        <AIImportAction disabled={!canImport} label="Save to Records" onPress={onSaveToRecords} variant="realm" />
        <AIImportAction disabled={!canImport} label={`Import to ${selectedTarget}`} onPress={onImport} variant="ai" />
        <AIImportAction disabled={!canImport || selectedTarget !== "calendar"} label="Add to Calendar" onPress={onAddToCalendar} />
      </View>
    </View>
  );
}
