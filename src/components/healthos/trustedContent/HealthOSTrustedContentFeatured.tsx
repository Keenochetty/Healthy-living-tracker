import { StyleSheet, View } from "react-native";

import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import type { HealthOSTrustedContentItem } from "@/features/trustedContent";
import { healthOSSpacing } from "@/theme/healthos";
import { HealthOSContentEmptyState } from "./HealthOSContentEmptyState";
import { HealthOSTrustedContentCard } from "./HealthOSTrustedContentCard";

type Props = {
  item?: HealthOSTrustedContentItem;
  onOpen: (item: HealthOSTrustedContentItem) => void;
  onOpenSource: (item: HealthOSTrustedContentItem) => void;
  onSave: (item: HealthOSTrustedContentItem) => void;
};

export function HealthOSTrustedContentFeatured({
  item,
  onOpen,
  onOpenSource,
  onSave,
}: Props) {
  return (
    <View style={styles.stack}>
      <HealthOSSectionHeader
        subtitle="A source-linked article from the existing trusted content library."
        title="Featured content"
      />
      {item ? (
        <HealthOSTrustedContentCard
          featured
          item={item}
          onOpen={onOpen}
          onOpenSource={onOpenSource}
          onSave={onSave}
        />
      ) : (
        <HealthOSContentEmptyState text="Trusted articles will appear when content sources are connected." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.md,
  },
});
