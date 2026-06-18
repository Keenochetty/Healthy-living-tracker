import { useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSFAQItem } from "./HealthOSWomenHealthTypes";

type Props = {
  items: HealthOSFAQItem[];
  onAskAI: () => void;
  onOpenSource: (url: string) => void;
};

export function HealthOSContraceptionFAQAccordion({ items, onAskAI, onOpenSource }: Props) {
  const [openId, setOpenId] = useState<string | undefined>(items[0]?.id);
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <>
      <HealthOSSectionHeader subtitle="High-level education only." title="Contraception FAQ" />
      <HealthOSCard variant="compact">
        <View style={styles.stack}>
          {items.map((item) => {
            const open = item.id === openId;
            return (
              <View key={item.id} style={[styles.item, { borderColor: palette.borderSubtle }]}>
                <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenId(open ? undefined : item.id)}>
                  <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                    {item.title}
                  </Text>
                </Pressable>
                {open ? (
                  <>
                    <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                      {item.body}
                    </Text>
                    <View style={styles.actions}>
                      {item.sourceUrl ? <HealthOSPill label="Open source" onPress={() => onOpenSource(item.sourceUrl!)} size="sm" variant="glass" /> : null}
                      <HealthOSPill label="Ask AI" onPress={onAskAI} size="sm" variant="ai" />
                    </View>
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
      </HealthOSCard>
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.sm,
  },
  item: {
    borderRadius: 18,
    borderWidth: 1,
    gap: healthOSSpacing.sm,
    padding: healthOSSpacing.md,
  },
  stack: {
    gap: healthOSSpacing.sm,
  },
});
