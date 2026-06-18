import { StyleSheet, View } from "react-native";

import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import {
  HEALTHOS_REALM_CONTENT_TITLES,
  HEALTHOS_TRUSTED_CONTENT_EMPTY_STATES,
  type HealthOSTrustedContentItem,
  type HealthOSTrustedContentRealm,
} from "@/features/trustedContent";
import { healthOSSpacing } from "@/theme/healthos";
import { HealthOSContentEmptyState } from "./HealthOSContentEmptyState";
import { HealthOSTrustedContentCard } from "./HealthOSTrustedContentCard";

type Props = {
  emptyState?: string;
  items: HealthOSTrustedContentItem[];
  loading?: boolean;
  maxItems?: number;
  onOpenItem: (item: HealthOSTrustedContentItem) => void;
  onOpenSource: (item: HealthOSTrustedContentItem) => void;
  onSaveItem: (item: HealthOSTrustedContentItem) => void;
  realm: HealthOSTrustedContentRealm;
  showImages?: boolean;
  showSafetyFlags?: boolean;
  showSourceQuality?: boolean;
  subtitle?: string;
  title?: string;
};

export function HealthOSTrustedContentSection({
  emptyState,
  items,
  maxItems = 3,
  onOpenItem,
  onOpenSource,
  onSaveItem,
  realm,
  subtitle,
  title,
}: Props) {
  const meta = HEALTHOS_REALM_CONTENT_TITLES[realm];
  const visibleItems = items.slice(0, maxItems);

  return (
    <View style={styles.stack}>
      <HealthOSSectionHeader
        subtitle={subtitle ?? meta.subtitle}
        title={title ?? meta.title}
      />
      {visibleItems.length ? (
        visibleItems.map((item) => (
          <HealthOSTrustedContentCard
            key={item.id}
            item={item}
            onOpen={onOpenItem}
            onOpenSource={onOpenSource}
            onSave={onSaveItem}
          />
        ))
      ) : (
        <HealthOSContentEmptyState
          text={emptyState ?? HEALTHOS_TRUSTED_CONTENT_EMPTY_STATES.realm}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.md,
  },
});
