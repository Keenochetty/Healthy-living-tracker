import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  AppHeader,
  AppIcon,
  AppScreen,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import {
  CIRCLE_RELATIONSHIPS,
  circleRelationshipLabels,
} from "@/constants/circles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { createCircle } from "@/lib/circles";
import { useProfileContext } from "@/lib/profile-context";
import type { CircleRelationship } from "@/types/circles";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function CreateCircleScreen() {
  const { refreshProfileContext } = useProfileContext();
  const [name, setName] = useState("");
  const [relationship, setRelationship] =
    useState<CircleRelationship>("guardian");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateCircle() {
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const circle = await createCircle({ name, relationship });
      await refreshProfileContext();
      router.replace(
        `/circles/${circle.id}` as Parameters<typeof router.replace>[0],
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create this Family Circle.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <QuickActionButton
              label="Back"
              onPress={() => openRoute("/circles")}
              toneColor={colors.text.muted}
            />
          }
          eyebrow="New Circle"
          subtitle="Create a household or care circle now. Members, dependents, and caregivers can be managed from the detail screen later."
          title="Create Family Circle"
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label="Owner" tone="success" />}
          subtitle="The current signed-in user becomes the owner of this circle."
          title="Circle details"
        >
          <View style={styles.form}>
            <TextInput
              onChangeText={setName}
              placeholder="Example: Dad's Care Circle"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={name}
            />

            <View style={styles.relationships}>
              {CIRCLE_RELATIONSHIPS.map((item) => (
                <QuickActionButton
                  key={item}
                  icon={
                    item === relationship ? (
                      <AppIcon
                        color={colors.brand.primary}
                        name="sync"
                        size={18}
                      />
                    ) : undefined
                  }
                  label={circleRelationshipLabels[item]}
                  onPress={() => setRelationship(item)}
                  toneColor={
                    item === relationship
                      ? colors.brand.primary
                      : colors.text.muted
                  }
                />
              ))}
            </View>

            {isCreating ? (
              <ActivityIndicator />
            ) : (
              <QuickActionButton
                icon={
                  <AppIcon
                    color={colors.brand.primary}
                    name="family"
                    size={20}
                    variant="filled"
                  />
                }
                label="Create Circle"
                onPress={handleCreateCircle}
                toneColor={colors.brand.primary}
              />
            )}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label="Placeholder ready" />}
          subtitle="If the backend is unavailable, the app still shows demo circles in list and detail screens."
          title="Foundation scope"
        >
          <Text style={styles.muted}>
            Full health records, caregiver work profiles, and calendar workflows
            are intentionally left for later phases.
          </Text>
        </WidgetCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.status.emergency,
    fontSize: 15,
    fontWeight: "800",
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 52,
    padding: spacing.md,
  },
  muted: {
    color: colors.text.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  relationships: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
});
