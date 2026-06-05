import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { AppButton, AppCard, AppChip, AppScreen } from "@/components/ui";
import {
  approveContentCard,
  getContentReviewQueue,
  getExpiringContent,
  getHealthContentAuditLogs,
  getHealthContentDisclaimers,
  getTrustedHealthContentCards,
  getTrustedSources,
  publishContentCard,
  runHealthContentQualityCheck
} from "@/lib/trustedContentStorage";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  HealthContentAuditLog,
  HealthContentDisclaimer,
  HealthContentQualityCheck,
  TrustedHealthContentCard,
  TrustedSource
} from "@/types/trustedContent";

type LibraryState = {
  auditLogs: HealthContentAuditLog[];
  cards: TrustedHealthContentCard[];
  disclaimers: HealthContentDisclaimer[];
  expiring: TrustedHealthContentCard[];
  latestCheck?: HealthContentQualityCheck;
  reviewQueue: TrustedHealthContentCard[];
  sources: TrustedSource[];
};

export default function TrustedContentScreen() {
  const { theme } = useAppTheme();
  const [state, setState] = useState<LibraryState>({
    auditLogs: [],
    cards: [],
    disclaimers: [],
    expiring: [],
    reviewQueue: [],
    sources: []
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCard = useMemo(
    () => state.cards.find((card) => card.id === selectedCardId) ?? state.cards[0],
    [selectedCardId, state.cards]
  );

  const refresh = useCallback(async () => {
    const [sources, cards, reviewQueue, expiring, disclaimers, auditLogs] = await Promise.all([
      getTrustedSources(),
      getTrustedHealthContentCards(),
      getContentReviewQueue(),
      getExpiringContent(60),
      getHealthContentDisclaimers(),
      getHealthContentAuditLogs()
    ]);

    setState({ auditLogs, cards, disclaimers, expiring, reviewQueue, sources });
    setSelectedCardId((current) => current ?? cards[0]?.id ?? null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);

    return () => clearTimeout(timer);
  }, [refresh]);

  const runCheck = async (cardId?: string) => {
    if (!cardId) return;
    setLoading(true);
    try {
      const latestCheck = await runHealthContentQualityCheck(cardId);
      await refresh();
      setState((current) => ({ ...current, latestCheck }));
    } finally {
      setLoading(false);
    }
  };

  const approveAndRefresh = async (cardId?: string) => {
    if (!cardId) return;
    setLoading(true);
    try {
      await approveContentCard(cardId);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const publishAndRefresh = async (cardId?: string) => {
    if (!cardId) return;
    setLoading(true);
    try {
      await publishContentCard(cardId);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: theme.text, fontSize: 30, fontWeight: "900" }}>Trusted Content</Text>
        <Text style={{ color: theme.mutedText, fontSize: 15, lineHeight: 22 }}>
          Internal source governance for health education cards, disclaimers, quality checks, and assistant source usage.
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <SummaryChip label="Sources" value={state.sources.length} />
        <SummaryChip label="Published" value={state.cards.filter((card) => card.status === "published").length} />
        <SummaryChip label="Review" value={state.reviewQueue.length} />
        <SummaryChip label="Expiring" value={state.expiring.length} />
      </View>

      <AppCard>
        <SectionTitle title="Content Cards" subtitle={state.cards.length ? "Developer-managed Learn content cards." : "No content cards available yet."} />
        <View style={{ gap: spacing.sm }}>
          {state.cards.slice(0, 8).map((card) => (
            <Pressable
              key={card.id}
              onPress={() => setSelectedCardId(card.id)}
              style={{
                borderColor: selectedCard?.id === card.id ? theme.primary : theme.border,
                borderRadius: 12,
                borderWidth: 1,
                gap: spacing.xs,
                padding: spacing.md
              }}
            >
              <View style={{ alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                <Text style={{ color: theme.text, flex: 1, fontSize: 16, fontWeight: "900" }}>{card.title}</Text>
                <AppChip label={card.realm.replaceAll("_", " ")} variant="primary" />
                <AppChip label={card.riskLevel} variant={card.riskLevel === "high" || card.riskLevel === "critical" ? "warning" : "muted"} />
              </View>
              <Text style={{ color: theme.mutedText, lineHeight: 20 }}>{card.shortSummary}</Text>
              <Text style={{ color: theme.mutedText, fontSize: 12 }}>
                {card.status} · {card.sourceOrganization} · review by {card.nextReviewDate}
              </Text>
            </Pressable>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionTitle title="Selected Card" subtitle={selectedCard?.title ?? "Select a content card to review."} />
        {selectedCard ? (
          <View style={{ gap: spacing.md }}>
            <Text style={{ color: theme.text, lineHeight: 21 }}>{selectedCard.fullText}</Text>
            <Text style={{ color: theme.mutedText, fontSize: 13 }}>
              Source: {selectedCard.sourceOrganization} · {selectedCard.sourceUrl}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              <AppButton disabled={loading} label="Run Check" onPress={() => runCheck(selectedCard.id)} size="sm" variant="outline" />
              <AppButton disabled={loading} label="Approve" onPress={() => approveAndRefresh(selectedCard.id)} size="sm" variant="secondary" />
              <AppButton disabled={loading} label="Publish" onPress={() => publishAndRefresh(selectedCard.id)} size="sm" />
            </View>
            {state.latestCheck ? (
              <Text style={{ color: theme.mutedText, fontSize: 13 }}>
                Latest check: {state.latestCheck.overallStatus}
                {state.latestCheck.notes ? ` · ${state.latestCheck.notes}` : ""}
              </Text>
            ) : null}
          </View>
        ) : null}
      </AppCard>

      <AppCard>
        <SectionTitle title="Sources" subtitle={state.sources.length ? "Approved source registry." : "Trusted sources need to be added before publishing content."} />
        <View style={{ gap: spacing.sm }}>
          {state.sources.slice(0, 10).map((source) => (
            <Row
              key={source.id}
              detail={`${source.sourceTier} · ${source.sourceType.replaceAll("_", " ")} · ${source.trustStatus}`}
              title={source.sourceOrganization}
            />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionTitle title="Review Queue" subtitle={state.reviewQueue.length ? "Cards that need source, wording, or approval review." : "No source-backed content available for this topic yet."} />
        <ListOrEmpty items={state.reviewQueue} renderItem={(card) => <Row key={card.id} detail={`${card.realm} · ${card.status}`} title={card.title} />} />
      </AppCard>

      <AppCard>
        <SectionTitle title="Disclaimers" subtitle={state.disclaimers.length ? "Reusable safety copy by realm and risk level." : "No disclaimer assigned yet."} />
        <ListOrEmpty
          items={state.disclaimers}
          renderItem={(disclaimer) => <Row key={disclaimer.id} detail={disclaimer.text} title={disclaimer.title} />}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title="Audit Log" subtitle={state.auditLogs.length ? "Recent content governance events." : "No source review recorded yet."} />
        <ListOrEmpty
          items={state.auditLogs.slice(0, 8)}
          renderItem={(log) => <Row key={log.id} detail={new Date(log.createdAt).toLocaleString()} title={log.action.replaceAll("_", " ")} />}
        />
      </AppCard>

      <Text style={{ color: theme.mutedText, fontSize: 13, lineHeight: 20 }}>
        Trusted content supports education and tracking only. It does not replace healthcare professionals.
      </Text>
    </AppScreen>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return <AppChip label={`${label}: ${value}`} variant={value > 0 ? "primary" : "muted"} />;
}

function SectionTitle({ subtitle, title }: { subtitle: string; title: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: "900" }}>{title}</Text>
      <Text style={{ color: theme.mutedText, lineHeight: 20 }}>{subtitle}</Text>
    </View>
  );
}

function Row({ detail, title }: { detail: string; title: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ borderTopColor: theme.border, borderTopWidth: 1, gap: spacing.xs, paddingTop: spacing.sm }}>
      <Text style={{ color: theme.text, fontWeight: "900" }}>{title}</Text>
      <Text style={{ color: theme.mutedText, fontSize: 13, lineHeight: 19 }}>{detail}</Text>
    </View>
  );
}

function ListOrEmpty<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => ReactNode }) {
  const { theme } = useAppTheme();
  if (!items.length) {
    return <Text style={{ color: theme.mutedText }}>No source-backed content available for this topic yet.</Text>;
  }

  return <View style={{ gap: spacing.sm }}>{items.map(renderItem)}</View>;
}
