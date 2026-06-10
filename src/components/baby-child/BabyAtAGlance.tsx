import { StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

export function BabyAtAGlance({
  diapers,
  dirtyDiapers,
  feeds,
  medicineDue,
  sleepMinutes,
  wetDiapers
}: {
  diapers: number;
  dirtyDiapers: number;
  feeds: number;
  medicineDue: number;
  sleepMinutes: number;
  wetDiapers: number;
}) {
  const items = [
    { icon: "nutrition", label: "Feeds", value: `${feeds}`, detail: "Total today" },
    { icon: "sleep", label: "Sleep", value: formatMinutes(sleepMinutes), detail: "Total today" },
    { icon: "baby_child", label: "Diapers", value: `${diapers}`, detail: diapers ? `${wetDiapers} wet · ${dirtyDiapers} dirty` : "Start when ready" },
    { icon: "medication", label: "Medicine", value: `${medicineDue}`, detail: medicineDue ? "Marked due today" : "Nothing marked due" }
  ];
  const { theme } = useAppTheme();

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <AppCard key={item.label} padding="sm" style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.header}>
            <AppIcon color={theme.primary} decorative name={item.icon as never} size={17} />
            <Text style={[styles.label, { color: theme.text }]}>{item.label}</Text>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.value, { color: theme.text }]}>{item.value}</Text>
          <Text style={[styles.detail, { color: theme.mutedText }]}>{item.detail}</Text>
          <View style={[styles.miniTrack, { backgroundColor: theme.primarySoft }]}>
            <View style={[styles.miniFill, { backgroundColor: theme.primary, width: `${Math.min(100, Math.max(16, Number.parseFloat(item.value) * 16 || 16))}%` }]} />
          </View>
        </AppCard>
      ))}
    </View>
  );
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return hours ? `${hours}h ${remaining}m` : `${remaining}m`;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 112 },
  detail: { fontSize: 12, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  header: { alignItems: "center", flexDirection: "row", gap: 6 },
  label: { fontSize: 13, fontWeight: "900" },
  miniFill: { borderRadius: 999, height: "100%" },
  miniTrack: { borderRadius: 999, height: 4, marginTop: 12, overflow: "hidden" },
  value: { fontSize: 23, fontWeight: "900", marginTop: 10 }
});
