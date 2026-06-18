import { useCallback, useEffect, useState } from "react";

import { getTrustedHealthContentCards } from "@/lib/trustedContentStorage";

export type HealthOSTrustedContentArticle = {
  id: string;
  imageUrl?: string;
  publishedAt?: string;
  routeTarget?: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  title: string;
  topic: string;
};

export function useHealthOSTrustedContentPreview(limit = 3) {
  const [articles, setArticles] = useState<HealthOSTrustedContentArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cards = await getTrustedHealthContentCards();
      setArticles(
        cards
          .filter((card) => card.status === "published" && card.sourceUrl)
          .slice(0, limit)
          .map((card) => ({
            id: card.id,
            publishedAt: card.publishedDate,
            sourceName: card.sourceOrganization,
            sourceUrl: card.sourceUrl,
            summary: card.shortSummary,
            title: card.title,
            topic: card.topicTags[0] ?? card.realm,
          })),
      );
    } catch {
      setArticles([]);
      setError("Trusted content is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    articles,
    emptyText:
      "Trusted health articles will appear here when your interests are connected.",
    error,
    loading,
    refresh,
  };
}

