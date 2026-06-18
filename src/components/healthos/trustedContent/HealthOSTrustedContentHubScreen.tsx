import type { ReactNode } from "react";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import type { HealthOSTrustedContentItem } from "@/features/trustedContent";
import {
  HEALTHOS_DEFAULT_MEDICAL_DISCLAIMER,
  type HealthOSTrustedContentFilterKey,
} from "@/features/trustedContent";
import {
  getHealthOSPalette,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSContentEmptyState } from "./HealthOSContentEmptyState";
import { HealthOSRealmContentBlocks } from "./HealthOSRealmContentBlocks";
import { HealthOSSourceQualityBadge } from "./HealthOSSourceQualityBadge";
import { HealthOSTrustedContentDetailSheet } from "./HealthOSTrustedContentDetailSheet";
import { HealthOSTrustedContentFeatured } from "./HealthOSTrustedContentFeatured";
import { HealthOSTrustedContentHeader } from "./HealthOSTrustedContentHeader";
import { HealthOSTrustedContentRow } from "./HealthOSTrustedContentRow";
import { HealthOSTrustedContentSearchFilter } from "./HealthOSTrustedContentSearchFilter";
import { useHealthOSTrustedContentActions } from "./useHealthOSTrustedContentActions";
import { useHealthOSTrustedContentData } from "./useHealthOSTrustedContentData";

export function HealthOSTrustedContentHubScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const data = useHealthOSTrustedContentData();
  const actions = useHealthOSTrustedContentActions({
    activeFilters: data.activeFilters,
    allContent: data.allContent,
    onRefresh: data.refresh,
    setActiveFilters: data.setActiveFilters,
  });
  const [selectedItem, setSelectedItem] =
    useState<HealthOSTrustedContentItem | null>(null);

  function openItem(item: HealthOSTrustedContentItem) {
    actions.openContent(item);
    setSelectedItem(item);
  }

  function clearSearch() {
    data.setSearchQuery("");
    data.setActiveFilters(["all"]);
  }

  return (
    <HealthOSAppShell
      activeNavKey="health"
      aiPlaceholder="Ask about source-linked health education"
      showBottomNav={false}
      subtitle="Source-linked education"
      testID="healthos-trusted-content-screen"
      title="Trusted Content"
      withBottomNavSpace={false}
    >
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <HealthOSTrustedContentHeader hasContent={data.allContent.length > 0} />
          <HealthOSTrustedContentSearchFilter
            activeFilters={data.activeFilters}
            onClear={clearSearch}
            onQueryChange={data.setSearchQuery}
            onToggleFilter={(filter) =>
              actions.toggleFilter(filter as HealthOSTrustedContentFilterKey)
            }
            query={data.searchQuery}
          />
          {data.loading ? (
            <HealthOSCard>
              <View style={styles.loading}>
                <ActivityIndicator color={palette.ai} />
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  Loading trusted content...
                </Text>
              </View>
            </HealthOSCard>
          ) : null}
          {data.error ? (
            <HealthOSCard title="Trusted content unavailable" variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {data.error}
              </Text>
            </HealthOSCard>
          ) : null}
          <HealthOSTrustedContentFeatured
            item={data.featuredContent}
            onOpen={openItem}
            onOpenSource={actions.openSource}
            onSave={actions.saveContent}
          />
          <SectionBlock title="Latest and recommended" subtitle="Filtered from the existing source-backed content library.">
            {data.filteredContent.length ? (
              data.filteredContent.slice(0, 8).map((item) => (
                <HealthOSTrustedContentRow key={item.id} item={item} onOpen={openItem} />
              ))
            ) : (
              <HealthOSContentEmptyState text={data.emptyState} />
            )}
          </SectionBlock>
          <HealthOSRealmContentBlocks
            contentByRealm={data.contentByRealm}
            onOpenItem={openItem}
            onOpenSource={actions.openSource}
            onSaveItem={actions.saveContent}
          />
          <SectionBlock title="Saved / read later" subtitle="Local read-later foundation. Database persistence is deferred.">
            {data.savedContent.length ? (
              data.savedContent.map((item) => (
                <HealthOSTrustedContentRow key={item.id} item={item} onOpen={openItem} />
              ))
            ) : (
              <HealthOSContentEmptyState text="Saved and read-later articles will appear here." />
            )}
          </SectionBlock>
          <HealthOSCard title="Source quality explainer" subtitle="Unknown sources are not treated as trusted. AI summaries are not sources.">
            <View style={styles.summaryGrid}>
              {data.sourceQualitySummary.length ? (
                data.sourceQualitySummary.map((item) => (
                  <View key={item.quality} style={styles.summaryItem}>
                    <HealthOSSourceQualityBadge quality={item.quality} />
                    <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                      {item.total} item{item.total === 1 ? "" : "s"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  Source quality will appear when trusted content is connected.
                </Text>
              )}
            </View>
          </HealthOSCard>
          <HealthOSCard title="Medical disclaimer" variant="ai">
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              {HEALTHOS_DEFAULT_MEDICAL_DISCLAIMER} HealthOS summarizes and links sources for organization only. It does not diagnose, prescribe, or replace professional care.
            </Text>
          </HealthOSCard>
        </ScrollView>
      </View>
      <HealthOSTrustedContentDetailSheet
        item={selectedItem}
        onAskAI={actions.askAIAboutContent}
        onClose={() => setSelectedItem(null)}
        onOpenSource={actions.openSource}
        onReportIssue={actions.reportSourceIssue}
        onSave={actions.saveContent}
        visible={Boolean(selectedItem)}
      />
    </HealthOSAppShell>
  );
}

function SectionBlock({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <HealthOSSectionHeader subtitle={subtitle} title={title} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.xl,
    paddingBottom: healthOSSafeArea.bottomNavSpace,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSpacing.md,
  },
  loading: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  screen: {
    alignSelf: "center",
    flex: 1,
    maxWidth: healthOSLayout.screenMaxWidth,
    width: "100%",
  },
  section: {
    gap: healthOSSpacing.md,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.md,
  },
  summaryItem: {
    gap: healthOSSpacing.xs,
  },
});
