import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppIcon } from "@/components/ui";
import { getImportedPlans } from "@/services/fitnessAiImportService";
import { useAppTheme } from "@/theme/ThemeProvider";

type ImportedPlanRow = {
  id: string;
  title: string;
  description?: string;
  status: string;
  plan_type?: string;
  review_required?: boolean;
  source_domain?: string;
  difficulty?: string;
};

export default function ImportedPlansScreen() {
  const { theme } = useAppTheme();
  const [plans, setPlans] = useState<ImportedPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getImportedPlans()
        .then(({ data }) => setPlans((data ?? []) as ImportedPlanRow[]))
        .finally(() => setLoading(false));
    }, []),
  );
  return (
    <AppMainLayout
      subtitle="Review, edit, and activate imported drafts when you are ready."
      title="Imported Plans"
    >
      {loading ? (
        <AppCard variant="soft">
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            Loading imported drafts...
          </Text>
        </AppCard>
      ) : null}
      {!loading && !plans.length ? (
        <AppCard style={styles.empty}>
          <AppIcon decorative name="planning" size={28} />
          <Text style={[styles.title, { color: theme.text }]}>
            No imported drafts yet
          </Text>
          <Text style={[styles.body, { color: theme.mutedText }]}>
            Search for a plan, review its sources and safety flags, then import
            it as an editable draft.
          </Text>
          <AppButton
            onPress={() => router.push("/fitness/ai-import" as Href)}
            title="Find a plan"
          />
        </AppCard>
      ) : null}
      <View style={styles.stack}>
        {plans.map((plan) => (
          <AppCard
            key={plan.id}
            style={[styles.card, { borderColor: theme.border }]}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              {plan.title}
            </Text>
            <Text style={[styles.body, { color: theme.mutedText }]}>
              {plan.description ?? "Editable imported plan draft"}
            </Text>
            <Text style={[styles.meta, { color: theme.mutedText }]}>
              {plan.plan_type ?? "plan"} · {plan.difficulty ?? "adaptable"} ·{" "}
              {plan.source_domain ?? "structured source"}
            </Text>
            {plan.review_required ? (
              <Text style={[styles.meta, { color: theme.warning }]}>
                Review required before activation
              </Text>
            ) : null}
            <AppButton
              onPress={() =>
                router.push(`/fitness/imported-plan/${plan.id}` as Href)
              }
              size="sm"
              title="Edit draft"
            />
          </AppCard>
        ))}
      </View>
      <AppButton
        onPress={() => router.push("/fitness/ai-import" as Href)}
        title="Find another plan"
        variant="secondary"
      />
    </AppMainLayout>
  );
}
const styles = StyleSheet.create({
  body: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  card: { borderWidth: 1, gap: 9 },
  empty: { alignItems: "center", gap: 10 },
  meta: { fontSize: 10, fontWeight: "800" },
  stack: { gap: 10 },
  title: { fontSize: 17, fontWeight: "900", textAlign: "center" },
});
