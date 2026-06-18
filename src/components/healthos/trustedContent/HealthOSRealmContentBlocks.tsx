import { StyleSheet, View } from "react-native";

import type {
  HealthOSTrustedContentItem,
  HealthOSTrustedContentRealm,
} from "@/features/trustedContent";
import { healthOSSpacing } from "@/theme/healthos";
import { HealthOSTrustedContentSection } from "./HealthOSTrustedContentSection";

type Props = {
  contentByRealm: Record<HealthOSTrustedContentRealm, HealthOSTrustedContentItem[]>;
  onOpenItem: (item: HealthOSTrustedContentItem) => void;
  onOpenSource: (item: HealthOSTrustedContentItem) => void;
  onSaveItem: (item: HealthOSTrustedContentItem) => void;
};

const REALMS: HealthOSTrustedContentRealm[] = [
  "health",
  "nutrition",
  "medication",
  "pregnancy",
  "babyChild",
  "womensHealth",
  "fitness",
  "records",
  "family",
];

export function HealthOSRealmContentBlocks({
  contentByRealm,
  onOpenItem,
  onOpenSource,
  onSaveItem,
}: Props) {
  return (
    <View style={styles.stack}>
      {REALMS.map((realm) => (
        <HealthOSTrustedContentSection
          key={realm}
          items={contentByRealm[realm] ?? []}
          maxItems={2}
          onOpenItem={onOpenItem}
          onOpenSource={onOpenSource}
          onSaveItem={onSaveItem}
          realm={realm}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.xl,
  },
});
