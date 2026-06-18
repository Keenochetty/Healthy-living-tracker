import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppIcon } from "@/components/ui";
import {
  DEFAULT_FITNESS_FEATURES,
  FEATURE_PREFERENCE_CONFIG,
  FITNESS_PREFERENCE_KEYS,
  type FeaturePreferenceKey,
} from "@/constants/featurePreferenceConfig";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import {
  getUserFeaturePreferences,
  setManyUserFeaturePreferences,
  shouldShowFeature,
} from "@/services/userFeaturePreferencesService";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function FitnessPreferencesScreen() {
  const { activeProfile } = useActiveProfile();
  const { theme } = useAppTheme();
  const [selected, setSelected] = useState<Set<FeaturePreferenceKey>>(
    () => new Set(DEFAULT_FITNESS_FEATURES),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const preferences = await getUserFeaturePreferences(activeProfile?.id);
    setSelected(
      new Set(
        FITNESS_PREFERENCE_KEYS.filter((featureKey) =>
          shouldShowFeature(featureKey, {
            preferences,
            profileType: activeProfile?.profileType,
          }),
        ),
      ),
    );
  }, [activeProfile?.id, activeProfile?.profileType]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  const options = useMemo(
    () => FITNESS_PREFERENCE_KEYS.map((key) => FEATURE_PREFERENCE_CONFIG[key]),
    [],
  );

  function toggle(key: FeaturePreferenceKey) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setMessage("");
  }

  async function save() {
    setSaving(true);
    await setManyUserFeaturePreferences(
      FITNESS_PREFERENCE_KEYS.map((featureKey) => ({
        enabled: selected.has(featureKey),
        featureKey,
      })),
      activeProfile?.id,
    );
    setSaving(false);
    setMessage("Fitness preferences saved.");
  }

  return (
    <AppMainLayout
      subtitle="Choose what Fitness highlights for this profile."
      title="Customize Fitness"
    >
      <AppCard style={[styles.intro, { borderColor: theme.border }]}>
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon color={theme.primary} decorative name="settings" size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.introTitle, { color: theme.text }]}>
            Keep Fitness relevant
          </Text>
          <Text style={[styles.body, { color: theme.mutedText }]}>
            These are app goals, not medical identity. You can change this
            anytime.
          </Text>
        </View>
      </AppCard>

      <View style={styles.grid}>
        {options.map((option) => {
          const enabled = selected.has(option.key);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: enabled }}
              key={option.key}
              onPress={() => toggle(option.key)}
              style={[
                styles.pill,
                {
                  backgroundColor: enabled
                    ? theme.primarySoft
                    : (theme.card ?? theme.surface),
                  borderColor: enabled ? theme.primary : theme.border,
                },
              ]}
            >
              <Text style={[styles.pillTitle, { color: theme.text }]}>
                {option.label}
              </Text>
              {option.safetyLevel !== "standard" ? (
                <Text style={[styles.badge, { color: theme.warning }]}>
                  {option.safetyLevel.replace("-", " ")}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {message ? (
        <Text style={[styles.message, { color: theme.primary }]}>
          {message}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <AppButton
          onPress={() => router.back()}
          title="Skip for now"
          variant="secondary"
        />
        <AppButton
          disabled={saving}
          onPress={save}
          title={saving ? "Saving..." : "Save"}
        />
      </View>
      <Pressable onPress={() => router.push("/(tabs)/fitness" as Href)}>
        <Text style={[styles.link, { color: theme.mutedText }]}>
          Return to Fitness
        </Text>
      </Pressable>
    </AppMainLayout>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 10 },
  badge: {
    fontSize: 8,
    fontWeight: "900",
    marginTop: 5,
    textTransform: "uppercase",
  },
  body: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  copy: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  icon: {
    alignItems: "center",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  intro: {
    alignItems: "flex-start",
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  introTitle: { fontSize: 17, fontWeight: "900" },
  link: { fontSize: 11, fontWeight: "800", textAlign: "center" },
  message: { fontSize: 12, fontWeight: "800" },
  pill: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 66,
    padding: 13,
    width: "47%",
  },
  pillTitle: { fontSize: 13, fontWeight: "900", lineHeight: 17 },
});
