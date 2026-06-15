import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon, AppSection } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  ChildMilestone,
  GrowthMeasurement,
  VaccinationRecord,
} from "@/types/child";

const BABY = "#0e7490";
const BABY_SOFT = "#e0f2fe";

export function BabyRealmOverviewSections({
  growthLogs,
  milestones,
  nextReminder,
  onAddGrowth,
  onAddVaccine,
  onOpenGrowth,
  onOpenHealth,
  onOpenMilestones,
  onOpenRecords,
  vaccines,
}: {
  growthLogs: GrowthMeasurement[];
  milestones: ChildMilestone[];
  nextReminder?: string;
  onAddGrowth: () => void;
  onAddVaccine: () => void;
  onOpenGrowth: () => void;
  onOpenHealth: () => void;
  onOpenMilestones: () => void;
  onOpenRecords: () => void;
  vaccines: VaccinationRecord[];
}) {
  return (
    <>
      <GrowthOverview
        latest={growthLogs[0]}
        onAdd={onAddGrowth}
        onOpen={onOpenGrowth}
      />
      <VaccineReminder
        nextReminder={nextReminder}
        onAdd={onAddVaccine}
        onOpen={onOpenHealth}
        vaccines={vaccines}
      />
      <MilestoneTimeline milestones={milestones} onOpen={onOpenMilestones} />
      <RecordsShortcut onOpen={onOpenRecords} />
    </>
  );
}

function GrowthOverview({
  latest,
  onAdd,
  onOpen,
}: {
  latest?: GrowthMeasurement;
  onAdd: () => void;
  onOpen: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      actionLabel="View growth"
      onActionPress={onOpen}
      subtitle="Measurements stay organized by child profile."
      title="Growth"
    >
      <AppCard style={[styles.growthCard, { borderColor: "#bae6fd" }]}>
        <View style={styles.growthHeader}>
          <View style={styles.growthIcon}>
            <AppIcon color={BABY} decorative name="weight" size={23} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {latest ? "Latest measurement" : "Start growth tracking"}
            </Text>
            <Text style={[styles.cardBody, { color: theme.mutedText }]}>
              {latest
                ? formatDate(latest.loggedAt)
                : "Add home or clinic measurements when useful."}
            </Text>
          </View>
        </View>
        <View style={styles.growthMetrics}>
          <Metric
            label="Weight"
            value={
              latest?.weight
                ? `${latest.weight} ${latest.weightUnit}`
                : "Not added"
            }
          />
          <Metric
            label="Height"
            value={
              latest?.height
                ? `${latest.height} ${latest.heightUnit}`
                : "Not added"
            }
          />
        </View>
        <SmallButton label="Add measurement" onPress={onAdd} />
      </AppCard>
    </AppSection>
  );
}

function VaccineReminder({
  nextReminder,
  onAdd,
  onOpen,
  vaccines,
}: {
  nextReminder?: string;
  onAdd: () => void;
  onOpen: () => void;
  vaccines: VaccinationRecord[];
}) {
  const { theme } = useAppTheme();
  const nextVaccine = vaccines.find(
    (record) => record.nextDoseDate || record.scheduledDate,
  );
  return (
    <AppSection
      actionLabel="Health records"
      onActionPress={onOpen}
      subtitle="Important reminders remain visible without giving medical recommendations."
      title="Vaccines and reminders"
    >
      <View style={styles.rowStack}>
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={({ pressed }) => [
            styles.vaccineRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.vaccineIcon}>
            <AppIcon color={BABY} decorative name="vaccines" size={21} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>
              {nextVaccine?.vaccineName ?? "Vaccine records"}
            </Text>
            <Text style={[styles.rowBody, { color: theme.mutedText }]}>
              {nextVaccine
                ? `Next saved date: ${nextVaccine.nextDoseDate ?? nextVaccine.scheduledDate}`
                : `${vaccines.length} records saved. Confirm schedules with your clinic.`}
            </Text>
          </View>
          <Text style={styles.rowAction}>Open</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={({ pressed }) => [
            styles.vaccineRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.reminderIcon}>
            <AppIcon color="#7c3aed" decorative name="reminder" size={21} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>
              Next care reminder
            </Text>
            <Text style={[styles.rowBody, { color: theme.mutedText }]}>
              {nextReminder ?? "No saved care reminder yet."}
            </Text>
          </View>
          <Text style={styles.rowAction}>View</Text>
        </Pressable>
        {!vaccines.length ? (
          <SmallButton label="Add vaccine record" onPress={onAdd} />
        ) : null}
      </View>
    </AppSection>
  );
}

function MilestoneTimeline({
  milestones,
  onOpen,
}: {
  milestones: ChildMilestone[];
  onOpen: () => void;
}) {
  const { theme } = useAppTheme();
  const visible = milestones.slice(0, 3);
  return (
    <AppSection
      actionLabel="View all"
      onActionPress={onOpen}
      subtitle="A gentle timeline of observations and parent notes."
      title="Milestones"
    >
      <AppCard style={[styles.milestoneCard, { borderColor: theme.border }]}>
        {visible.length ? (
          visible.map((milestone, index) => (
            <Pressable
              accessibilityRole="button"
              key={milestone.id}
              onPress={onOpen}
              style={[
                styles.milestoneRow,
                index < visible.length - 1
                  ? { borderBottomColor: theme.border, borderBottomWidth: 1 }
                  : null,
              ]}
            >
              <View style={styles.timelineMarker}>
                <View style={styles.timelineDot} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>
                  {milestone.title}
                </Text>
                <Text style={[styles.rowBody, { color: theme.mutedText }]}>
                  {formatLabel(milestone.status ?? "observed")} |{" "}
                  {formatLabel(milestone.category)}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <Pressable accessibilityRole="button" onPress={onOpen}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Start a milestone timeline
            </Text>
            <Text style={[styles.cardBody, { color: theme.mutedText }]}>
              Add calm observations or questions when you notice them.
            </Text>
          </Pressable>
        )}
      </AppCard>
    </AppSection>
  );
}

function RecordsShortcut({ onOpen }: { onOpen: () => void }) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      subtitle="Clinic cards, documents, appointments, and notes."
      title="Child records"
    >
      <Pressable accessibilityRole="button" onPress={onOpen}>
        <AppCard style={[styles.recordsCard, { borderColor: theme.border }]}>
          <View style={styles.recordsIcon}>
            <AppIcon color="#6d28d9" decorative name="records" size={23} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Open this child's records
            </Text>
            <Text style={[styles.cardBody, { color: theme.mutedText }]}>
              Keep family care connected to records and appointments.
            </Text>
          </View>
          <Text style={styles.recordsAction}>Open</Text>
        </AppCard>
      </Pressable>
    </AppSection>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.metric, { backgroundColor: theme.surface }]}>
      <Text style={[styles.metricLabel, { color: theme.mutedText }]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function SmallButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.smallButton}
    >
      <Text style={styles.smallButtonText}>{label}</Text>
    </Pressable>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  cardBody: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  cardTitle: { fontSize: 16, fontWeight: "900" },
  copy: { flex: 1 },
  growthCard: { backgroundColor: "#f0f9ff", borderWidth: 1, padding: 16 },
  growthHeader: { alignItems: "center", flexDirection: "row", gap: 12 },
  growthIcon: {
    alignItems: "center",
    backgroundColor: BABY_SOFT,
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  growthMetrics: { flexDirection: "row", gap: 9, marginTop: 14 },
  metric: { borderRadius: 17, flex: 1, minHeight: 76, padding: 11 },
  metricLabel: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  metricValue: { fontSize: 14, fontWeight: "900", marginTop: 5 },
  milestoneCard: { borderWidth: 1, padding: 10 },
  milestoneRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 68,
    padding: 8,
  },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  recordsAction: { color: "#6d28d9", fontSize: 12, fontWeight: "900" },
  recordsCard: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  recordsIcon: {
    alignItems: "center",
    backgroundColor: "#ede9fe",
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  reminderIcon: {
    alignItems: "center",
    backgroundColor: "#ede9fe",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  rowAction: { color: BABY, fontSize: 11, fontWeight: "900" },
  rowBody: { fontSize: 11, lineHeight: 17, marginTop: 3 },
  rowStack: { gap: 9 },
  rowTitle: { fontSize: 14, fontWeight: "900" },
  smallButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: BABY,
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 43,
    paddingHorizontal: 15,
  },
  smallButtonText: { color: "#ffffff", fontSize: 11, fontWeight: "900" },
  timelineDot: {
    backgroundColor: BABY,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  timelineMarker: {
    alignItems: "center",
    backgroundColor: BABY_SOFT,
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  vaccineIcon: {
    alignItems: "center",
    backgroundColor: BABY_SOFT,
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  vaccineRow: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 82,
    padding: 13,
  },
});
