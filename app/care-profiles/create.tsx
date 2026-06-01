import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader, AppIcon, AppScreen, QuickActionButton, StatusPill, WidgetCard } from "@/components/ui";
import {
  CARE_PROFILE_TYPES,
  careProfilePrivacyLabels,
  careProfileTypeLabels,
  getDefaultPrivacyStatus
} from "@/constants/care-profiles";
import { CIRCLE_RELATIONSHIPS, ageAccessStageLabels, circleRelationshipLabels } from "@/constants/circles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { determineDefaultAgeAccessStage } from "@/lib/care-profiles";
import type { CareProfileType } from "@/types/care-profiles";
import type { CircleRelationship } from "@/types/circles";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

function parseAge(value: string) {
  const age = Number.parseInt(value, 10);

  return Number.isFinite(age) && age >= 0 ? age : null;
}

export default function CreateCareProfileScreen() {
  const { circleId } = useLocalSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [profileType, setProfileType] = useState<CareProfileType>("child");
  const [relationship, setRelationship] = useState<CircleRelationship>("other");
  const parsedAge = parseAge(age);
  const ageAccessStage = determineDefaultAgeAccessStage(parsedAge);
  const privacyStatus = getDefaultPrivacyStatus(ageAccessStage);
  const backRoute = typeof circleId === "string" ? `/circles/${circleId}` : "/circles";

  function handlePlaceholderCreate() {
    openRoute(backRoute);
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<QuickActionButton label="Back" onPress={() => openRoute(backRoute)} toneColor={colors.text.muted} />}
          eyebrow="Care Profile"
          subtitle="Create care profiles for children, teens, adult members, adult dependents, and elderly dependents. Backend creation comes later."
          title="Add Care Profile"
        />

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label="Placeholder" tone="ai" />}
          subtitle="Age controls the default access stage; adults default to private control unless they grant permission."
          title="Profile basics"
        >
          <View style={styles.form}>
            <TextInput
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={displayName}
            />
            <TextInput
              keyboardType="number-pad"
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={age}
            />

            <Text style={styles.groupTitle}>Care profile type</Text>
            <View style={styles.pillGrid}>
              {CARE_PROFILE_TYPES.map((item) => (
                <QuickActionButton
                  key={item}
                  icon={item === profileType ? <AppIcon color={colors.status.ai} name="sync" size={18} /> : undefined}
                  label={careProfileTypeLabels[item]}
                  onPress={() => setProfileType(item)}
                  toneColor={item === profileType ? colors.status.ai : colors.text.muted}
                />
              ))}
            </View>

            <Text style={styles.groupTitle}>Relationship to circle</Text>
            <View style={styles.pillGrid}>
              {CIRCLE_RELATIONSHIPS.map((item) => (
                <QuickActionButton
                  key={item}
                  icon={item === relationship ? <AppIcon color={colors.brand.primary} name="sync" size={18} /> : undefined}
                  label={circleRelationshipLabels[item]}
                  onPress={() => setRelationship(item)}
                  toneColor={item === relationship ? colors.brand.primary : colors.text.muted}
                />
              ))}
            </View>

            <View style={styles.previewPanel}>
              <Text style={styles.previewTitle}>{displayName.trim() || "New care profile"}</Text>
              <View style={styles.pillGrid}>
                <StatusPill label={ageAccessStageLabels[ageAccessStage]} tone={ageAccessStage === "adult_controlled" ? "success" : "warning"} />
                <StatusPill label={careProfilePrivacyLabels[privacyStatus]} tone={privacyStatus === "adult_private" ? "success" : "default"} />
                <StatusPill label={circleRelationshipLabels[relationship]} />
              </View>
            </View>

            <QuickActionButton
              icon={<AppIcon color={colors.status.ai} name="profiles" size={20} variant="filled" />}
              label="Save placeholder"
              onPress={handlePlaceholderCreate}
              toneColor={colors.status.ai}
            />
          </View>
        </WidgetCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  },
  groupTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  input: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 52,
    padding: spacing.md
  },
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  previewPanel: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  previewTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1
  }
});
