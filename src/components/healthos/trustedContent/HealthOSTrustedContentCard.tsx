import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { ExternalLink, FileText } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { categoryLabel, type HealthOSTrustedContentItem } from "@/features/trustedContent";
import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSContentSaveButton } from "./HealthOSContentSaveButton";
import { HealthOSContentSafetyDisclaimer } from "./HealthOSContentSafetyDisclaimer";
import { HealthOSSourceQualityBadge } from "./HealthOSSourceQualityBadge";

type Props = {
  featured?: boolean;
  item: HealthOSTrustedContentItem;
  onOpen: (item: HealthOSTrustedContentItem) => void;
  onOpenSource: (item: HealthOSTrustedContentItem) => void;
  onSave: (item: HealthOSTrustedContentItem) => void;
};

export function HealthOSTrustedContentCard({
  featured = false,
  item,
  onOpen,
  onOpenSource,
  onSave,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard onPress={() => onOpen(item)} variant={featured ? "elevated" : "compact"}>
      <View style={styles.stack}>
        <View style={styles.mediaRow}>
          {item.imageUrl ? (
            <Image
              accessibilityLabel={item.imageAlt ?? item.title}
              source={{ uri: item.imageUrl }}
              style={styles.thumbnail}
            />
          ) : (
            <View style={[styles.fallback, { borderColor: palette.borderSubtle }]}>
              <FileText color={palette.softText} size={22} />
            </View>
          )}
          <View style={styles.copy}>
            <View style={styles.chips}>
              <HealthOSPill label={categoryLabel(item.categories[0] ?? "other")} size="sm" variant="realm" realmColor={palette.ai} />
              <HealthOSSourceQualityBadge quality={item.source.sourceQuality} />
            </View>
            <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
              {item.title}
            </Text>
            {item.summary ? (
              <Text numberOfLines={featured ? 4 : 3} style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {item.summary}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            {item.source.sourceName}
            {item.updatedAt ? ` · Updated ${formatDate(item.updatedAt)}` : ""}
            {item.readingTimeLabel ? ` · ${item.readingTimeLabel}` : ""}
          </Text>
        </View>
        {item.medicalDisclaimerRequired ? <HealthOSContentSafetyDisclaimer item={item} /> : null}
        <View style={styles.actions}>
          <HealthOSContentSaveButton saved={item.saved || item.readLater} onPress={() => onSave(item)} />
          <HealthOSPill icon={<ExternalLink size={14} />} label="Open source" onPress={() => onOpenSource(item)} size="sm" variant="glass" />
        </View>
      </View>
    </HealthOSCard>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.xs,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.sm,
    minWidth: 0,
  },
  fallback: {
    alignItems: "center",
    borderRadius: healthOSRadius.lg,
    borderWidth: 1,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  mediaRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  meta: {
    gap: healthOSSpacing.xs,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
  thumbnail: {
    borderRadius: healthOSRadius.lg,
    height: 72,
    width: 72,
  },
});
