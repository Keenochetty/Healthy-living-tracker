import { Image, Linking, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
} from "@/theme/healthos";
import { useColorScheme } from "react-native";

import { HealthOSHealthSectionCard } from "./HealthOSHealthSectionCard";
import type { HealthOSHealthSectionMeta } from "./HealthOSHealthTypes";
import type { HealthOSTrustedContentArticle } from "./useHealthOSTrustedContentPreview";

type HealthOSTrustedContentSectionProps = {
  articles: HealthOSTrustedContentArticle[];
  emptyText: string;
  error: string | null;
  loading: boolean;
  onLongPress: () => void;
  section: HealthOSHealthSectionMeta;
};

export function HealthOSTrustedContentSection({
  articles,
  emptyText,
  error,
  loading,
  onLongPress,
  section,
}: HealthOSTrustedContentSectionProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="source" size={20} variant="primary" />}
      onLongPress={onLongPress}
      onPress={() => router.push("/trusted-content")}
      section={section}
    >
      {loading ? (
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Loading trusted content...
        </Text>
      ) : error ? (
        <Text style={[healthOSTypography.bodySmall, { color: palette.warning }]}>
          {error}
        </Text>
      ) : articles.length ? (
        <View style={styles.articleList}>
          {articles.map((article) => (
            <HealthOSCard key={article.id} variant="compact">
              <View style={styles.article}>
                {article.imageUrl ? (
                  <Image
                    accessibilityIgnoresInvertColors
                    source={{ uri: article.imageUrl }}
                    style={styles.image}
                  />
                ) : null}
                <View style={styles.articleCopy}>
                  <HealthOSPill label={article.topic} size="sm" variant="glass" />
                  <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                    {article.title}
                  </Text>
                  <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                    {article.summary}
                  </Text>
                  <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                    Source: {article.sourceName}
                  </Text>
                  <HealthOSPill
                    label="Open source"
                    onPress={() => void Linking.openURL(article.sourceUrl)}
                    size="sm"
                    variant="realm"
                  />
                </View>
              </View>
            </HealthOSCard>
          ))}
        </View>
      ) : (
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {emptyText}
        </Text>
      )}
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        For learning only. Review health changes with a professional.
      </Text>
    </HealthOSHealthSectionCard>
  );
}

const styles = StyleSheet.create({
  article: {
    gap: healthOSSpacing.sm,
  },
  articleCopy: {
    gap: healthOSSpacing.sm,
  },
  articleList: {
    gap: healthOSSpacing.sm,
  },
  image: {
    borderRadius: healthOSRadius.lg,
    height: 112,
    width: "100%",
  },
});

