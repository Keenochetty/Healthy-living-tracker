import { Linking, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSRecordContentItem } from "./HealthOSRecordsTypes";
import { EmptyRecordsState, RecordsLink, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  items: HealthOSRecordContentItem[];
};

export function HealthOSRecordsContentSection({ items }: Props) {
  return (
    <HealthOSCard title="Record organization tips" subtitle="Trusted content only.">
      <View style={recordsSharedStyles.row}>
        {items.length ? (
          items.map((item) => (
            <View key={item.id} style={recordsSharedStyles.row}>
              <RecordsText strong>{item.title}</RecordsText>
              <RecordsText muted>{item.summary}</RecordsText>
              <RecordsLink label={item.sourceName} onPress={() => void Linking.openURL(item.sourceUrl)} />
            </View>
          ))
        ) : (
          <EmptyRecordsState text="Record organization tips will appear when trusted content is connected." />
        )}
      </View>
    </HealthOSCard>
  );
}
