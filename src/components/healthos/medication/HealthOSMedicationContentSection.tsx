import { Linking, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSMedicationContentItem } from "./HealthOSMedicationTypes";
import { CompactLink, EmptyState, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  items: HealthOSMedicationContentItem[];
};

export function HealthOSMedicationContentSection({ items }: Props) {
  return (
    <HealthOSCard title="Trusted content" subtitle="Source-backed education only.">
      <View style={medicationSharedStyles.row}>
        {items.length ? (
          items.map((item) => (
            <View key={item.id} style={medicationSharedStyles.row}>
              <MedicationText strong>{item.title}</MedicationText>
              <MedicationText muted>{item.summary}</MedicationText>
              <CompactLink label={item.sourceName} onPress={() => void Linking.openURL(item.sourceUrl)} />
            </View>
          ))
        ) : (
          <EmptyState text="No published medication or supplement content is available yet." />
        )}
      </View>
    </HealthOSCard>
  );
}
