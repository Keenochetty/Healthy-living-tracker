import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSMedicationDisplayItem } from "./HealthOSMedicationTypes";
import { EmptyState } from "./HealthOSMedicationShared";
import { HealthOSMedicationRow } from "./HealthOSMedicationRow";

type Props = {
  items: HealthOSMedicationDisplayItem[];
  onDetails: (item: HealthOSMedicationDisplayItem) => void;
  onSkip: (item: HealthOSMedicationDisplayItem) => void;
  onSnooze: (item: HealthOSMedicationDisplayItem) => void;
  onTaken: (item: HealthOSMedicationDisplayItem) => void;
};

export function HealthOSMedicationTimeline(props: Props) {
  return (
    <HealthOSCard title="Medication timeline" subtitle="Confirmed medication routines only.">
      <View>
        {props.items.length ? (
          props.items.map((item) => (
            <HealthOSMedicationRow
              item={item}
              key={item.id}
              onDetails={props.onDetails}
              onSkip={props.onSkip}
              onSnooze={props.onSnooze}
              onTaken={props.onTaken}
            />
          ))
        ) : (
          <EmptyState text="No medication items are saved yet." />
        )}
      </View>
    </HealthOSCard>
  );
}
