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

export function HealthOSSupplementTimeline(props: Props) {
  return (
    <HealthOSCard title="Supplement timeline" subtitle="Saved supplement routines and confirmed reminders.">
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
          <EmptyState text="No supplement items are saved yet." />
        )}
      </View>
    </HealthOSCard>
  );
}
