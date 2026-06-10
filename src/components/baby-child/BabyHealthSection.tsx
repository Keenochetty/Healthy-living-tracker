import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { VaccinationRecord } from "@/types/child";

const TIMELINE_NODES = ["Birth", "6w", "10w", "14w", "6m", "9m", "12m", "18m"];

export function BabyHealthSection({
  onAddVaccine,
  onMedicine,
  onRecords,
  onSchedule,
  vaccineRecords
}: {
  onAddVaccine: () => void;
  onMedicine: () => void;
  onRecords: () => void;
  onSchedule: () => void;
  vaccineRecords: VaccinationRecord[];
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.stack}>
      <AppCard style={[styles.hero, { backgroundColor: warmSurface(theme.background, theme.surface), borderColor: theme.border }]}>
        <View style={styles.heading}>
          <View style={[styles.heroIcon, { backgroundColor: theme.surface }]}>
            <AppIcon color={theme.primary} decorative name="health" size={25} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>Baby Health</Text>
            <Text style={[styles.subtitle, { color: theme.mutedText }]}>Keep care records and clinic notes organized.</Text>
          </View>
        </View>
      </AppCard>

      <View style={styles.grid}>
        <EntranceCard action="Add vaccine record" helper="Track received vaccines, clinic dates, and documents." icon="vaccines" onPress={onAddVaccine} status="Record from clinic card" title="Vaccines" />
        <EntranceCard action="View medicine" helper="Track medicine logs and notes." icon="medication" onPress={onMedicine} status="Follow label instructions" title="Medicine" />
        <EntranceCard action="View records" helper="Clinic cards, doctor notes, prescriptions, and documents." icon="records" onPress={onRecords} status="Baby health vault" title="Records" />
        <EntranceCard action="Schedule" helper="Add reminders to Calendar." icon="calendar" onPress={onSchedule} status="Plan care visits" title="Clinic Appointments" />
      </View>

      <View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Vaccines</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>Manual records first, based on your clinic card or healthcare provider.</Text>
      </View>

      <AppCard style={[styles.sourceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeading}>
          <View style={[styles.smallIcon, { backgroundColor: theme.primarySoft }]}>
            <AppIcon color={theme.primary} decorative name="source" size={19} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Schedule source</Text>
            <Text style={[styles.subtitle, { color: theme.mutedText }]}>Not selected</Text>
          </View>
        </View>
        <View style={styles.tags}>
          <Tag label="South Africa" />
          <Tag label="Custom" />
          <Tag label="Not selected" selected />
        </View>
        <Text style={[styles.helper, { color: theme.mutedText }]}>Add vaccine records from your clinic card or healthcare provider.</Text>
      </AppCard>

      <AppCard style={[styles.reviewCard, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Next review</Text>
        <Text style={[styles.helper, { color: theme.mutedText }]}>Review vaccine records and future dates with your clinic.</Text>
        <View style={[styles.reviewBadge, { backgroundColor: theme.surface }]}>
          <Text style={[styles.reviewBadgeText, { color: theme.text }]}>Review with clinic</Text>
        </View>
      </AppCard>

      <View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Vaccine timeline</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>Record-only age markers. No recommendations are generated.</Text>
      </View>
      <AppCard style={[styles.timelineCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.timeline}>
          {TIMELINE_NODES.map((node, index) => (
            <View key={node} style={styles.nodeWrap}>
              <View style={[styles.node, { backgroundColor: index === 0 ? theme.primary : theme.primarySoft, borderColor: theme.primary }]} />
              <Text style={[styles.nodeText, { color: theme.mutedText }]}>{node}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.helper, { color: theme.mutedText }]}>Status: {vaccineRecords.length ? "Recorded information available" : "Not added yet"}</Text>
      </AppCard>

      <View style={styles.sectionRow}>
        <View style={styles.copy}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recorded vaccines</Text>
          <Text style={[styles.subtitle, { color: theme.mutedText }]}>Information saved for this child only.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onAddVaccine} style={({ pressed }) => [styles.smallAction, { backgroundColor: theme.primary }, pressed ? styles.pressed : null]}>
          <Text style={styles.smallActionText}>Add record</Text>
        </Pressable>
      </View>
      {vaccineRecords.length ? (
        <AppCard padding="sm" style={[styles.records, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {vaccineRecords.slice(0, 8).map((record, index) => (
            <View key={record.id} style={[styles.recordRow, index < Math.min(vaccineRecords.length, 8) - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}>
              <View style={[styles.smallIcon, { backgroundColor: theme.primarySoft }]}>
                <AppIcon color={theme.primary} decorative name="vaccines" size={18} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.recordTitle, { color: theme.text }]}>{record.vaccineName}</Text>
                <Text style={[styles.recordMeta, { color: theme.mutedText }]}>{record.dateReceived ?? "Date not added"} · {record.recordSource ? sourceLabel(record.recordSource) : "Source to be added"}</Text>
              </View>
              <Text style={[styles.recordStatus, { color: theme.mutedText }]}>Recorded</Text>
            </View>
          ))}
        </AppCard>
      ) : (
        <AppCard style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Add vaccine records</Text>
          <Text style={[styles.helper, { color: theme.mutedText }]}>Record information from a clinic card or healthcare provider.</Text>
          <Pressable accessibilityRole="button" onPress={onAddVaccine} style={({ pressed }) => [styles.action, { backgroundColor: theme.primary }, pressed ? styles.pressed : null]}>
            <Text style={styles.actionText}>Add vaccine record</Text>
          </Pressable>
        </AppCard>
      )}

      <AppCard style={[styles.upload, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.uploadIcon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon color={theme.primary} decorative name="upload" size={24} />
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Clinic card or photo record</Text>
        <Text style={[styles.helper, { color: theme.mutedText }]}>Document linking will connect to Baby Records later.</Text>
        <Text style={[styles.sourceText, { color: theme.mutedText }]}>Trusted source to be added.</Text>
      </AppCard>

      <AppCard style={[styles.siteCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.bodyMap, { backgroundColor: theme.primarySoft }]}>
          <AppIcon color={theme.primary} decorative name="baby_child" size={42} />
          <View style={[styles.bodyDot, styles.leftDot, { backgroundColor: theme.primary }]} />
          <View style={[styles.bodyDot, styles.rightDot, { backgroundColor: theme.primary }]} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Record site, if known</Text>
          <Text style={[styles.helper, { color: theme.mutedText }]}>Left or right upper arm, left or right thigh, oral, other, or not sure.</Text>
          <Text style={[styles.sourceText, { color: theme.mutedText }]}>Record the site only if it appears on the clinic card or was given by your healthcare provider.</Text>
        </View>
      </AppCard>

      <AppCard padding="md" style={[styles.safety, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
        <Text style={[styles.safetyText, { color: theme.mutedText }]}>Use this to record vaccine information from your clinic card or healthcare provider. Vaccine schedules should be confirmed with your clinic, nurse, doctor, pharmacist, or healthcare professional.</Text>
      </AppCard>
      <AppCard padding="md" style={[styles.safety, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.safetyText, { color: theme.mutedText }]}>Always follow the medicine label or healthcare professional's instructions. This app does not calculate or recommend doses.</Text>
      </AppCard>
      <Text style={[styles.generalSafety, { color: theme.mutedText }]}>Baby and child tracking is for organization and education only. It is not medical advice and does not replace a pediatrician, doctor, nurse, clinic, or healthcare professional.</Text>
    </View>
  );
}

function EntranceCard({ action, helper, icon, onPress, status, title }: { action: string; helper: string; icon: string; onPress?: () => void; status: string; title: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard padding="md" style={[styles.entrance, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.smallIcon, { backgroundColor: theme.primarySoft }]}>
        <AppIcon color={theme.primary} decorative name={icon as never} size={20} />
      </View>
      <Text style={[styles.entranceTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.status, { color: theme.primary }]}>{status}</Text>
      <Text style={[styles.entranceHelper, { color: theme.mutedText }]}>{helper}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.link, pressed ? styles.pressed : null]}>
        <Text style={[styles.linkText, { color: theme.primary }]}>{action}</Text>
      </Pressable>
    </AppCard>
  );
}

function Tag({ label, selected }: { label: string; selected?: boolean }) {
  const { theme } = useAppTheme();
  return <View style={[styles.tag, { backgroundColor: selected ? theme.primary : theme.primarySoft }]}><Text style={[styles.tagText, { color: selected ? "#ffffff" : theme.text }]}>{label}</Text></View>;
}

function sourceLabel(source: NonNullable<VaccinationRecord["recordSource"]>) {
  return source.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function warmSurface(background: string, surface: string) {
  return background === "#0f172a" ? surface : "#edf8f7";
}

const styles = StyleSheet.create({
  action: { alignItems: "center", alignSelf: "flex-start", borderRadius: 18, justifyContent: "center", marginTop: 14, minHeight: 48, paddingHorizontal: 18 },
  actionText: { color: "#ffffff", fontWeight: "900" },
  bodyDot: { borderRadius: 999, height: 8, position: "absolute", width: 8 },
  bodyMap: { alignItems: "center", borderRadius: 24, height: 92, justifyContent: "center", width: 92 },
  cardHeading: { alignItems: "center", flexDirection: "row", gap: 10 },
  cardTitle: { fontSize: 17, fontWeight: "900" },
  copy: { flex: 1 },
  empty: { borderWidth: 1 },
  entrance: { borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 210 },
  entranceHelper: { flex: 1, fontSize: 12, lineHeight: 18, marginTop: 7 },
  entranceTitle: { fontSize: 17, fontWeight: "900", marginTop: 12 },
  generalSafety: { fontSize: 12, lineHeight: 19, paddingHorizontal: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  heading: { alignItems: "center", flexDirection: "row", gap: 12 },
  helper: { lineHeight: 20, marginTop: 7 },
  hero: { borderWidth: 1 },
  heroIcon: { alignItems: "center", borderRadius: 18, height: 48, justifyContent: "center", width: 48 },
  link: { alignSelf: "flex-start", marginTop: 12, minHeight: 36, paddingVertical: 8 },
  linkText: { fontWeight: "900" },
  leftDot: { left: 21, top: 31 },
  node: { borderRadius: 999, borderWidth: 1, height: 16, width: 16 },
  nodeText: { fontSize: 10, fontWeight: "800", marginTop: 6 },
  nodeWrap: { alignItems: "center", flex: 1 },
  pressed: { opacity: 0.76 },
  recordMeta: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  recordRow: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 70, padding: 10 },
  recordStatus: { fontSize: 11, fontWeight: "900" },
  recordTitle: { fontWeight: "900" },
  records: { borderWidth: 1 },
  reviewBadge: { alignSelf: "flex-start", borderRadius: 999, marginTop: 12, paddingHorizontal: 11, paddingVertical: 7 },
  reviewBadgeText: { fontSize: 12, fontWeight: "900" },
  reviewCard: { borderWidth: 1 },
  rightDot: { right: 21, top: 31 },
  safety: { borderWidth: 1 },
  safetyText: { fontSize: 12, lineHeight: 19 },
  sectionRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  sectionTitle: { fontSize: 21, fontWeight: "900" },
  smallAction: { borderRadius: 16, minHeight: 42, paddingHorizontal: 13, paddingVertical: 11 },
  smallActionText: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  smallIcon: { alignItems: "center", borderRadius: 15, height: 40, justifyContent: "center", width: 40 },
  sourceCard: { borderWidth: 1 },
  sourceText: { fontSize: 12, fontWeight: "800", marginTop: 12 },
  siteCard: { alignItems: "center", borderWidth: 1, flexDirection: "row", gap: 14 },
  stack: { gap: 16 },
  status: { fontSize: 12, fontWeight: "900", marginTop: 6 },
  subtitle: { lineHeight: 20, marginTop: 4 },
  tag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  tagText: { fontSize: 11, fontWeight: "900" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  timeline: { flexDirection: "row", gap: 2 },
  timelineCard: { borderWidth: 1 },
  title: { fontSize: 22, fontWeight: "900" },
  upload: { alignItems: "flex-start", borderStyle: "dashed", borderWidth: 1 },
  uploadIcon: { alignItems: "center", borderRadius: 18, height: 48, justifyContent: "center", marginBottom: 12, width: 48 }
});
