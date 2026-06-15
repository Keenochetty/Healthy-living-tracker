import { Href, router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import {
  AppButton,
  AppCard,
  AppChip,
  AppIcon,
  AppSection,
} from "@/components/ui";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import {
  normalizePlanFromSearchResult,
  searchExternalPlans,
  storePreview,
  type AiPlanContext,
  type AiPlanSearchResult,
} from "@/services/fitnessAiImportService";
import { useAppTheme } from "@/theme/ThemeProvider";

const QUICK = [
  "Run 5km",
  "Lose weight safely",
  "Gain muscle",
  "Pregnancy mobility",
  "Postpartum core",
  "Home workouts",
  "Gym strength",
  "Vegan meal plan",
  "Keto meal plan",
  "Mental reset",
  "Recovery",
  "Family fitness",
  "Child movement",
  "Teen fitness",
];

export default function FitnessAiImportScreen() {
  const { theme } = useAppTheme();
  const { activeProfile } = useActiveProfile();
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<AiPlanContext>({
    audience: "Adults",
    intensity: "Beginner",
    profileId:
      activeProfile?.profileType === "self" ? activeProfile.id : undefined,
    timeAvailable: "30 min",
  });
  const [results, setResults] = useState<AiPlanSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function search(nextQuery = query) {
    if (!nextQuery.trim()) return;
    setQuery(nextQuery);
    setLoading(true);
    setMessage("");
    const next = await searchExternalPlans(nextQuery, context);
    setResults(next);
    setLoading(false);
    if (!next.length)
      setMessage("No plans found. Try a broader goal or routine.");
  }
  async function preview(result: AiPlanSearchResult) {
    const normalized = await normalizePlanFromSearchResult(result, context);
    await storePreview(normalized);
    router.push("/fitness/ai-import/preview" as Href);
  }

  return (
    <AppMainLayout
      subtitle="Search for workout, nutrition or wellness plans and turn them into a safe editable plan."
      title="Find or Import a Plan"
    >
      <AppCard style={[styles.search, { borderColor: theme.border }]}>
        <View style={styles.searchRow}>
          <AppIcon color={theme.mutedText} decorative name="search" size={20} />
          <TextInput
            onChangeText={setQuery}
            onSubmitEditing={() => search()}
            placeholder="Search for a goal, plan, diet type, workout style or routine"
            placeholderTextColor={theme.mutedText}
            style={[styles.input, { color: theme.text }]}
            value={query}
          />
        </View>
        <AppButton
          loading={loading}
          onPress={() => search()}
          title="Search plans"
        />
      </AppCard>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {QUICK.map((item) => (
          <AppChip key={item} label={item} onPress={() => search(item)} />
        ))}
      </ScrollView>
      <AppSection
        title="Optional context"
        subtitle="These filters help flag plans that need extra review."
      />
      <AppCard style={styles.context}>
        <Filter
          label="Audience"
          options={["Adults", "Pregnancy", "Postpartum", "Children", "Teens"]}
          selected={context.audience}
          set={(value) => setContext({ ...context, audience: value })}
        />
        <Filter
          label="Intensity"
          options={["Beginner", "Moderate", "Advanced"]}
          selected={context.intensity}
          set={(value) => setContext({ ...context, intensity: value })}
        />
        <Filter
          label="Time"
          options={["15 min", "30 min", "45 min", "60 min"]}
          selected={context.timeAvailable}
          set={(value) => setContext({ ...context, timeAvailable: value })}
        />
        <Filter
          label="Diet"
          options={["None", "Vegan", "Vegetarian", "Keto"]}
          selected={context.dietPreference}
          set={(value) => setContext({ ...context, dietPreference: value })}
        />
        <Filter
          label="Safety flags"
          options={[
            "None",
            "Injury / pain caution",
            "Medical condition review",
          ]}
          selected={context.safetyFlags?.[0]}
          set={(value) =>
            setContext({
              ...context,
              safetyFlags: value === "None" ? [] : [value],
            })
          }
        />
      </AppCard>
      <AppCard style={{ borderColor: theme.warning, borderWidth: 1 }}>
        <Text style={[styles.warning, { color: theme.warning }]}>
          This is general guidance, not medical advice. Review sources,
          warnings, exercises, meals, and ingredients before importing.
        </Text>
      </AppCard>
      {message ? (
        <AppCard variant="soft">
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            {message}
          </Text>
        </AppCard>
      ) : null}
      {results.length ? (
        <>
          <AppSection
            title="Search results"
            subtitle="Review the source and normalized preview before importing."
          />
          <View style={styles.stack}>
            {results.map((result) => (
              <ResultCard
                key={result.id}
                onPreview={() => preview(result)}
                result={result}
              />
            ))}
          </View>
        </>
      ) : null}
      <AppButton
        onPress={() => router.push("/fitness/imported-plans" as Href)}
        title="View imported drafts"
        variant="secondary"
      />
    </AppMainLayout>
  );
}

function ResultCard({
  onPreview,
  result,
}: {
  onPreview: () => void;
  result: AiPlanSearchResult;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.result, { borderColor: theme.border }]}>
      <View style={styles.resultTop}>
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon color={theme.primary} decorative name="planning" size={21} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>
            {result.title}
          </Text>
          <Text style={[styles.body, { color: theme.mutedText }]}>
            {result.description}
          </Text>
        </View>
      </View>
      <View style={styles.chips}>
        <Pill label={result.planType} />
        <Pill label={`${result.durationDays} days`} />
        <Pill label={result.difficulty} />
        <Pill label={result.audience} />
      </View>
      <Text style={[styles.meta, { color: theme.mutedText }]}>
        Source: {result.sourceTitle ?? "Structured source"} ·{" "}
        {result.sourceDomain ?? "No domain"}
      </Text>
      <Text
        style={[
          styles.meta,
          { color: result.reviewRequired ? theme.warning : theme.success },
        ]}
      >
        {result.reviewStatus} · Confidence{" "}
        {Math.round((result.aiConfidence ?? 0.7) * 100)}%
      </Text>
      <AppButton onPress={onPreview} size="sm" title="Preview" />
    </AppCard>
  );
}
function Filter({
  label,
  options,
  selected,
  set,
}: {
  label: string;
  options: string[];
  selected?: string;
  set: (value: string) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.filter}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={styles.chips}>
        {options.map((item) => (
          <AppChip
            key={item}
            label={item}
            onPress={() => set(item)}
            selected={selected === item}
          />
        ))}
      </View>
    </View>
  );
}
function Pill({ label }: { label: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.primarySoft }]}>
      <Text style={{ color: theme.primary, fontSize: 10, fontWeight: "900" }}>
        {label.replace(/_/g, " ")}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  body: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  context: { gap: 15 },
  copy: { flex: 1 },
  filter: { gap: 3 },
  icon: {
    alignItems: "center",
    borderRadius: 15,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  input: { flex: 1, minHeight: 46 },
  label: { fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  meta: { fontSize: 10, fontWeight: "800", marginTop: 4 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  rail: { gap: 7, paddingRight: 12 },
  result: { borderWidth: 1, gap: 10 },
  resultTop: { alignItems: "flex-start", flexDirection: "row", gap: 11 },
  search: { borderWidth: 1, gap: 10 },
  searchRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  stack: { gap: 10 },
  title: { fontSize: 17, fontWeight: "900" },
  warning: { fontSize: 12, fontWeight: "800", lineHeight: 18 },
});
