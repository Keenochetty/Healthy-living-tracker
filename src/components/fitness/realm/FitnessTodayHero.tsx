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
};

export function FitnessTodayHero({
  focusMuscles,
  minutes,
  movementTitle,
  onQuickLog,
  onStart,
  onSwap,
  readiness,
}: FitnessTodayHeroProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.topRow}>
        <View style={styles.icon}>
          <AppIcon color="#06231c" decorative name="fitness" size={27} />
        </View>
        <View style={styles.badge}>
          <AppIcon color="#bbf7d0" decorative name="safety" size={14} />
          <Text style={styles.badgeText}>Beginner friendly</Text>
        </View>
      </View>
      <Text style={styles.kicker}>Today's Fitness</Text>
      <Text style={styles.title}>{movementTitle}</Text>
      <Text style={styles.subtitle}>
        A calm, focused session that builds momentum without overdoing it.
      </Text>
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
      <AppIcon color="#99f6e4" decorative name={icon} size={15} />
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
        color={primary ? "#06231c" : "#f8fafc"}
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
    backgroundColor: "#6ee7c8",
    borderColor: "#6ee7c8",
    flexGrow: 1,
    justifyContent: "center",
  },
  actionText: { color: "#f8fafc", fontSize: 13, fontWeight: "900" },
  actionTextPrimary: { color: "#06231c" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 8 },
  badge: {
    alignItems: "center",
    backgroundColor: "rgba(22,101,52,0.6)",
    borderColor: "rgba(187,247,208,0.35)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  badgeText: { color: "#dcfce7", fontSize: 11, fontWeight: "900" },
  card: {
    backgroundColor: "#06231c",
    borderColor: "#115e59",
    borderWidth: 1,
    overflow: "hidden",
    padding: 20,
  },
  chip: {
    backgroundColor: "rgba(153,246,228,0.12)",
    borderColor: "rgba(153,246,228,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  chipText: { color: "#ccfbf1", fontSize: 11, fontWeight: "800" },
  glowOne: {
    backgroundColor: "rgba(45,212,191,0.18)",
    borderRadius: 120,
    height: 180,
    position: "absolute",
    right: -70,
    top: -80,
    width: 180,
  },
  glowTwo: {
    backgroundColor: "rgba(96,165,250,0.12)",
    borderRadius: 90,
    bottom: -95,
    height: 180,
    left: -65,
    position: "absolute",
    width: 180,
  },
  icon: {
    alignItems: "center",
    backgroundColor: "#6ee7c8",
    borderRadius: 18,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  kicker: {
    color: "#99f6e4",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginTop: 22,
    textTransform: "uppercase",
  },
  meta: { alignItems: "center", flexDirection: "row", gap: 5 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 13, marginTop: 15 },
  metaText: {
    color: "#d1fae5",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  subtitle: {
    color: "#a7f3d0",
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
