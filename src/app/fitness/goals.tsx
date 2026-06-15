import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppIcon } from "@/components/ui";
import { FITNESS_GOAL_FEATURES } from "@/constants/featurePreferenceConfig";
import { FITNESS_GOAL_PATHS } from "@/constants/fitnessRealmConfig";
import { getFitnessGoalDetail } from "@/constants/fitnessGoalDetails";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import {
  getUserFeaturePreferences,
  shouldShowFeature,
  type UserFeaturePreference,
} from "@/services/userFeaturePreferencesService";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function GoalsScreen() {
  const { activeProfile } = useActiveProfile();
  const { theme } = useAppTheme();
  const [preferences, setPreferences] = useState<UserFeaturePreference[]>([]);
  useFocusEffect(
    useCallback(() => {
      getUserFeaturePreferences(activeProfile?.id)
        .then(setPreferences)
        .catch(() => undefined);
    }, [activeProfile?.id]),
  );
  const goals = FITNESS_GOAL_PATHS.filter((item) =>
    shouldShowFeature(FITNESS_GOAL_FEATURES[item.id] ?? "fitness", {
      preferences,
      profileType: activeProfile?.profileType,
    }),
  );
  return (
    <AppMainLayout
      subtitle="Build a safe step-by-step path toward your fitness goal."
      title="Goal Paths"
    >
      <Pressable onPress={() => router.push("/fitness/preferences" as Href)}>
        <Text style={[styles.customize, { color: theme.primary }]}>
          Customize highlighted goals
        </Text>
      </Pressable>
      <View style={styles.stack}>
        {goals.map((item) => (
          <GoalCard goalId={item.id} key={item.id} />
        ))}
      </View>
    </AppMainLayout>
  );
}

export function GoalCard({ goalId }: { goalId: string }) {
  const { theme } = useAppTheme();
  const goal = getFitnessGoalDetail(goalId);
  return (
    <AppCard style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon
            color={goal.accentColor}
            decorative
            name={goal.icon}
            size={22}
          />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>
            {goal.title}
          </Text>
          <Text style={[styles.body, { color: theme.mutedText }]}>
            {goal.subtitle}
          </Text>
        </View>
      </View>
      <Text style={[styles.meta, { color: theme.mutedText }]}>
        {goal.goalType} · {goal.difficulty} · {goal.timeline}
      </Text>
      {goal.safetyBadge ? (
        <Text style={[styles.safety, { color: theme.warning }]}>
          {goal.safetyBadge} · general guidance
        </Text>
      ) : null}
      <AppButton
        onPress={() => router.push(`/fitness/goal/${goal.id}` as Href)}
        size="sm"
        title="View path"
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  card: { borderWidth: 1, gap: 12 },
  copy: { flex: 1 },
  customize: { alignSelf: "flex-end", fontSize: 11, fontWeight: "900" },
  icon: {
    alignItems: "center",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  meta: { fontSize: 11, fontWeight: "800" },
  safety: { fontSize: 10, fontWeight: "900" },
  stack: { gap: 12 },
  title: { fontSize: 18, fontWeight: "900" },
  top: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
});
