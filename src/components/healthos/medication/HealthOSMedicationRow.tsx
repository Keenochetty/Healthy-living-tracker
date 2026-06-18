import { StyleSheet, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill, type HealthOSPillVariant } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSMedicationDisplayItem } from "./HealthOSMedicationTypes";
import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  item: HealthOSMedicationDisplayItem;
  onDetails: (item: HealthOSMedicationDisplayItem) => void;
  onSkip: (item: HealthOSMedicationDisplayItem) => void;
  onSnooze: (item: HealthOSMedicationDisplayItem) => void;
  onTaken: (item: HealthOSMedicationDisplayItem) => void;
};

export function HealthOSMedicationRow({ item, onDetails, onSkip, onSnooze, onTaken }: Props) {
  return (
    <HealthOSCard variant="list">
      <View style={styles.content}>
        <View style={medicationSharedStyles.splitRow}>
          <View style={styles.titleBlock}>
            <MedicationText strong>{item.name}</MedicationText>
            <MedicationText muted>
              {[item.kind, item.doseText, item.scheduleTimes.length ? item.scheduleTimes.join(", ") : "no confirmed time"]
                .filter(Boolean)
                .join(" - ")}
            </MedicationText>
          </View>
          <HealthOSPill label={formatStatus(item.status)} size="sm" variant={statusVariant(item.status)} />
        </View>
        {item.instructions ? <MedicationText muted>{item.instructions}</MedicationText> : null}
        <View style={medicationSharedStyles.actions}>
          <MedicationAction label="Taken" onPress={() => onTaken(item)} variant="success" />
          <MedicationAction label="Skip" onPress={() => onSkip(item)} variant="warning" />
          <MedicationAction label="Snooze" onPress={() => onSnooze(item)} />
          <MedicationAction label="Details" onPress={() => onDetails(item)} variant="realm" />
        </View>
      </View>
    </HealthOSCard>
  );
}

function formatStatus(value: HealthOSMedicationDisplayItem["status"]) {
  return value.replace(/([A-Z])/g, " $1").toLowerCase();
}

function statusVariant(value: HealthOSMedicationDisplayItem["status"]): HealthOSPillVariant {
  if (value === "taken") return "success";
  if (value === "missed" || value === "needsReview") return "warning";
  if (value === "due") return "realm";
  if (value === "inactive") return "default";
  return "glass";
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
});
