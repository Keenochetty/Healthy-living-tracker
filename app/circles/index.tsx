import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { CircleCard } from "@/components/circles/CircleCard";
import { CircleSwitcher } from "@/components/circles/CircleSwitcher";
import { AppHeader, AppIcon, AppScreen, QuickActionButton, StatusPill, WidgetCard } from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { listMyCirclesFromContext } from "@/lib/circles";
import { useProfileContext } from "@/lib/profile-context";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function CirclesScreen() {
  const { families, isLoading, selectedFamily, switchFamily } = useProfileContext();
  const [isSwitching, setIsSwitching] = useState(false);
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const selectedCircleId = selectedFamily?.id ?? circles[0]?.id ?? null;

  async function handleSelectCircle(circleId: string) {
    const circle = circles.find((item) => item.id === circleId);

    if (!circle || circle.source === "placeholder") {
      openRoute(`/circles/${circleId}`);
      return;
    }

    setIsSwitching(true);

    try {
      await switchFamily(circleId);
    } finally {
      setIsSwitching(false);
    }
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <QuickActionButton
              icon={<AppIcon color={colors.brand.primary} name="family" size={20} variant="filled" />}
              label="Create"
              onPress={() => openRoute("/circles/create")}
              toneColor={colors.brand.primary}
            />
          }
          eyebrow="Family Circle"
          subtitle="One account can belong to multiple household and care circles, each with its own roles and permissions."
          title="My Circles"
        />

        {isLoading ? <ActivityIndicator /> : null}

        <CircleSwitcher
          circles={circles}
          onManage={() => openRoute(selectedCircleId ? `/circles/${selectedCircleId}` : "/circles/create")}
          onSelectCircle={handleSelectCircle}
          selectedCircleId={selectedCircleId}
        />

        {isSwitching ? <Text style={styles.muted}>Switching selected circle...</Text> : null}

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label={`${circles.length} circles`} tone="success" />}
          subtitle="Database tables can keep the family naming while the app uses Family Circle language."
          title="Circle list"
        >
          <View style={styles.list}>
            {circles.map((circle) => (
              <CircleCard
                actionLabel="Details"
                circle={circle}
                key={circle.id}
                onPress={() => openRoute(`/circles/${circle.id}`)}
                selected={circle.id === selectedCircleId}
              />
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label="Foundation" tone="ai" />}
          subtitle="Members, dependents, caregivers, relationship-per-circle, and permissions are modeled here before full health records."
          title="What this enables"
        >
          <View style={styles.pillRow}>
            <StatusPill label="Owners and admins" tone="success" />
            <StatusPill label="Dependents" tone="ai" />
            <StatusPill label="Care profiles" />
            <StatusPill label="Circle permissions" />
            <StatusPill label="Age access stages" tone="warning" />
          </View>
        </WidgetCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1
  }
});
