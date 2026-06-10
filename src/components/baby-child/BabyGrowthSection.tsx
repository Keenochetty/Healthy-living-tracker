import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { GrowthMeasurement } from "@/types/child";

export function BabyGrowthSection({ logs, onAdd }: { logs: GrowthMeasurement[]; onAdd: () => void }) {
  const { theme } = useAppTheme();
  const latest = logs[0];

  return (
    <View style={styles.stack}>
      <AppCard style={[styles.hero, { backgroundColor: warmSurface(theme.background, theme.surface), borderColor: theme.border }]}>
        <View style={styles.headingRow}>
          <View style={[styles.heroIcon, { backgroundColor: theme.surface }]}>
            <AppIcon color={theme.primary} decorative name="weight" size={24} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>Growth Records</Text>
            <Text style={[styles.subtitle, { color: theme.mutedText }]}>Track measurements over time.</Text>
          </View>
        </View>
        {latest ? (
          <>
            <View style={styles.metrics}>
              <Metric label="Latest weight" value={latest.weight ? `${latest.weight} kg` : "Not added yet"} />
              <Metric label="Length / height" value={latest.height ? `${latest.height} cm` : "Not added yet"} />
              <Metric label="Head circumference" value={latest.headCircumference ? `${latest.headCircumference} cm` : "Not added yet"} />
              <Metric label="Last measured" value={formatDate(latest.loggedAt)} />
            </View>
            <View style={[styles.tag, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.tagText, { color: theme.text }]}>{formatValue(latest.measurementSource ?? "home")}</Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyCopy}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Add growth measurements</Text>
            <Text style={[styles.subtitle, { color: theme.mutedText }]}>Track home or clinic measurements over time.</Text>
          </View>
        )}
        <PrimaryAction label="Add measurement" onPress={onAdd} />
      </AppCard>

      <SectionHeading subtitle="A simple view of measurements you have recorded." title="Your records" />
      <AppCard style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.chart}>
          {[24, 42, 34, 58, 52, 70].map((height, index) => (
            <View key={`${height}-${index}`} style={styles.chartColumn}>
              <View style={[styles.chartLine, { backgroundColor: theme.primarySoft, height }]} />
              <View style={[styles.chartDot, { backgroundColor: theme.primary }]} />
            </View>
          ))}
        </View>
        <Text style={[styles.chartNote, { color: theme.mutedText }]}>No percentiles or interpretation are shown.</Text>
      </AppCard>

      <SectionHeading title="Recent measurements" />
      {logs.length ? (
        <AppCard padding="sm" style={[styles.listCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {logs.slice(0, 8).map((log, index) => (
            <View key={log.id} style={[styles.row, index < Math.min(logs.length, 8) - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}>
              <View style={[styles.rowIcon, { backgroundColor: theme.primarySoft }]}>
                <AppIcon color={theme.primary} decorative name="weight" size={18} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{formatDate(log.loggedAt)}</Text>
                <Text style={[styles.rowText, { color: theme.mutedText }]}>
                  {measurementSummary(log)}
                </Text>
              </View>
              <Text style={[styles.source, { color: theme.mutedText }]}>{formatValue(log.measurementSource ?? "home")}</Text>
            </View>
          ))}
        </AppCard>
      ) : (
        <AppCard style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your measurements will appear here</Text>
          <Text style={[styles.subtitle, { color: theme.mutedText }]}>Add at least one measurement when you are ready.</Text>
        </AppCard>
      )}

      <EducationNote text="Growth records are tracking tools. A pediatrician or healthcare professional should interpret growth concerns." />
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.metric, { backgroundColor: theme.surface }]}>
      <Text style={[styles.metricLabel, { color: theme.mutedText }]}>{label}</Text>
      <Text numberOfLines={2} style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function SectionHeading({ subtitle, title }: { subtitle?: string; title: string }) {
  const { theme } = useAppTheme();
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.mutedText }]}>{subtitle}</Text> : null}
    </View>
  );
}

function PrimaryAction({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, { backgroundColor: theme.primary }, pressed ? styles.pressed : null]}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function EducationNote({ text }: { text: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard padding="md" style={[styles.note, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
      <AppIcon color={theme.primary} decorative name="source" size={18} />
      <Text style={[styles.noteText, { color: theme.mutedText }]}>{text}</Text>
    </AppCard>
  );
}

function measurementSummary(log: GrowthMeasurement) {
  const values = [
    log.weight ? `${log.weight} kg` : "",
    log.height ? `${log.height} cm length / height` : "",
    log.headCircumference ? `${log.headCircumference} cm head` : ""
  ].filter(Boolean);
  return values.join(" · ") || "Measurement recorded";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function warmSurface(background: string, surface: string) {
  return background === "#0f172a" ? surface : "#fff3ec";
}

const styles = StyleSheet.create({
  action: { alignItems: "center", alignSelf: "flex-start", borderRadius: 18, justifyContent: "center", marginTop: 18, minHeight: 48, paddingHorizontal: 18 },
  actionText: { color: "#ffffff", fontWeight: "900" },
  chart: { alignItems: "flex-end", flexDirection: "row", gap: 12, height: 100, justifyContent: "space-around" },
  chartCard: { borderWidth: 1 },
  chartColumn: { alignItems: "center", flex: 1, justifyContent: "flex-end" },
  chartDot: { borderRadius: 999, height: 10, marginTop: -5, width: 10 },
  chartLine: { borderRadius: 999, width: 5 },
  chartNote: { fontSize: 12, lineHeight: 18, marginTop: 14 },
  copy: { flex: 1 },
  emptyCard: { borderWidth: 1 },
  emptyCopy: { marginTop: 18 },
  emptyTitle: { fontSize: 17, fontWeight: "900" },
  headingRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  hero: { borderWidth: 1 },
  heroIcon: { alignItems: "center", borderRadius: 18, height: 48, justifyContent: "center", width: 48 },
  listCard: { borderWidth: 1 },
  metric: { borderRadius: 18, flexBasis: "46%", flexGrow: 1, minHeight: 94, padding: 12 },
  metricLabel: { fontSize: 12, fontWeight: "800" },
  metricValue: { fontSize: 16, fontWeight: "900", marginTop: 7 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 },
  note: { alignItems: "flex-start", borderWidth: 1, flexDirection: "row", gap: 10 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 19 },
  pressed: { opacity: 0.76 },
  row: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 72, padding: 10 },
  rowIcon: { alignItems: "center", borderRadius: 15, height: 38, justifyContent: "center", width: 38 },
  rowText: { lineHeight: 19, marginTop: 3 },
  rowTitle: { fontWeight: "900" },
  sectionTitle: { fontSize: 21, fontWeight: "900" },
  source: { fontSize: 11, fontWeight: "800", maxWidth: 80, textAlign: "right" },
  stack: { gap: 16 },
  subtitle: { lineHeight: 20, marginTop: 4 },
  tag: { alignSelf: "flex-start", borderRadius: 999, marginTop: 12, paddingHorizontal: 11, paddingVertical: 7 },
  tagText: { fontSize: 12, fontWeight: "900" },
  title: { fontSize: 22, fontWeight: "900" }
});
