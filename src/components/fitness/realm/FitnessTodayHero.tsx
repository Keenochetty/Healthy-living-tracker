import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";

type FitnessTodayHeroProps = {
  focusMuscles: string[];
  minutes: number;
  movementTitle: string;
  onQuickLog: () => void;
  onStart: () => void;
  onSwap: () => void;
  readiness: string;
  weeklyProgress: number;
  workoutsThisWeek: number;
};

export function FitnessTodayHero({
  focusMuscles,
  minutes,
  movementTitle,
  onQuickLog,
  onStart,
  onSwap,
  readiness,
  weeklyProgress,
  workoutsThisWeek,
}: FitnessTodayHeroProps) {
  const progress = Math.max(0, Math.min(100, Math.round(weeklyProgress)));
  return (
    <AppCard style={styles.card}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.topRow}>
        <View style={styles.icon}>
          <AppIcon color="#172554" decorative name="fitness" size={27} />
        </View>
        <View style={styles.badge}>
          <AppIcon color="#dbeafe" decorative name="success" size={14} />
          <Text style={styles.badgeText}>
            {workoutsThisWeek} workouts this week
          </Text>
        </View>
      </View>
      <Text style={styles.kicker}>Weekly fitness</Text>
      <Text style={styles.title}>Your movement is building</Text>
      <Text style={styles.subtitle}>
        Keep your plan clean and focused. Your next session is {movementTitle}.
      </Text>
      <View
        accessible
        accessibilityLabel={`${progress} percent of weekly fitness goal complete`}
        style={styles.progressBlock}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Weekly progress</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
      <View style={styles.metaRow}>
        <Meta icon="today" label={`${minutes} min`} />
        <Meta icon="fitness" label={focusMuscles.slice(0, 2).join(" + ")} />
        <Meta icon="health" label={readiness} />
      </View>
      <View style={styles.chipRow}>
        {focusMuscles.slice(0, 3).map((muscle) => (
          <View key={muscle} style={styles.chip}>
            <Text style={styles.chipText}>{muscle}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <Action icon="fitness" label="Start" onPress={onStart} primary />
        <Action icon="sync" label="Swap" onPress={onSwap} />
        <Action icon="edit" label="Quick Log" onPress={onQuickLog} />
      </View>
    </AppCard>
  );
}

function Meta({
  icon,
  label,
}: {
  icon: "fitness" | "health" | "today";
  label: string;
}) {
  return (
    <View style={styles.meta}>
      <AppIcon color="#93c5fd" decorative name={icon} size={15} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function Action({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: "edit" | "fitness" | "sync";
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.action, primary && styles.actionPrimary]}
    >
      <AppIcon
        color={primary ? "#172554" : "#f8fafc"}
        decorative
        name={icon}
        size={17}
      />
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  actionPrimary: {
    backgroundColor: "#bfdbfe",
    borderColor: "#bfdbfe",
    flexGrow: 1,
    justifyContent: "center",
  },
  actionText: { color: "#f8fafc", fontSize: 13, fontWeight: "900" },
  actionTextPrimary: { color: "#172554" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 8 },
  badge: {
    alignItems: "center",
    backgroundColor: "rgba(37,99,235,0.34)",
    borderColor: "rgba(219,234,254,0.32)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  badgeText: { color: "#dbeafe", fontSize: 11, fontWeight: "900" },
  card: {
    backgroundColor: "#172554",
    borderColor: "#2563eb",
    borderWidth: 1,
    overflow: "hidden",
    padding: 20,
  },
  chip: {
    backgroundColor: "rgba(191,219,254,0.12)",
    borderColor: "rgba(191,219,254,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  chipText: { color: "#dbeafe", fontSize: 11, fontWeight: "800" },
  glowOne: {
    backgroundColor: "rgba(96,165,250,0.24)",
    borderRadius: 120,
    height: 180,
    position: "absolute",
    right: -70,
    top: -80,
    width: 180,
  },
  glowTwo: {
    backgroundColor: "rgba(129,140,248,0.16)",
    borderRadius: 90,
    bottom: -95,
    height: 180,
    left: -65,
    position: "absolute",
    width: 180,
  },
  icon: {
    alignItems: "center",
    backgroundColor: "#bfdbfe",
    borderRadius: 18,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  kicker: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginTop: 22,
    textTransform: "uppercase",
  },
  meta: { alignItems: "center", flexDirection: "row", gap: 5 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 13, marginTop: 15 },
  metaText: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  progressBlock: { marginTop: 18 },
  progressFill: {
    backgroundColor: "#60a5fa",
    borderRadius: 999,
    height: "100%",
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: { color: "#dbeafe", fontSize: 11, fontWeight: "900" },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 999,
    height: 9,
    marginTop: 8,
    overflow: "hidden",
  },
  progressValue: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  subtitle: {
    color: "#bfdbfe",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 390,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: 7,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
