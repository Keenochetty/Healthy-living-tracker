import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import { GeneralHealthActivityTimeline } from "@/components/health/GeneralHealthActivityTimeline";
import { useGeneralHealthActivity } from "@/components/health/GeneralHealthActivityProvider";
import { HealthScreenContainer } from "@/components/health/HealthScreenContainer";
import { GeneralHealthLogSheet } from "@/components/health/GeneralHealthLogSheet";
import type { AppIconName } from "@/constants/appIcons";
import {
  GENERAL_HEALTH_BODY_METRICS,
  GENERAL_HEALTH_QUICK_ACTIONS,
  GENERAL_HEALTH_SNAPSHOT,
  GENERAL_HEALTH_VITALS,
  GENERAL_HEALTH_WEEK,
  MOCK_GENERAL_HEALTH_STATE,
  type GeneralHealthActivityEntry,
  type GeneralHealthBodyMetric,
  type GeneralHealthLogDraft,
  type GeneralHealthLogType,
  type GeneralHealthSnapshotItem,
  type GeneralHealthVital
} from "@/lib/generalHealthMockData";
import { createGeneralHealthActivity } from "@/lib/generalHealthActivity";
import { useAppTheme } from "@/theme/ThemeProvider";

const ACCENT = "#0f766e";

export function GeneralHealthScreen() {
  const { width } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { activities, addActivity, selectedProfileId, selectedProfileName } = useGeneralHealthActivity();
  const stacked = width < 400;
  const stackedSnapshot = width < 350;
  const [activeLogType, setActiveLogType] = useState<GeneralHealthLogType | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [savedMessageProfileId, setSavedMessageProfileId] = useState("");
  const [bodyMetrics, setBodyMetrics] = useState(() => GENERAL_HEALTH_BODY_METRICS.map((item) => ({ ...item })));
  const [bodyMetricsProfileId, setBodyMetricsProfileId] = useState("");
  const [vitals, setVitals] = useState(() => GENERAL_HEALTH_VITALS.map((item) => ({ ...item })));
  const [vitalsProfileId, setVitalsProfileId] = useState("");
  const visibleBodyMetrics = bodyMetricsProfileId === selectedProfileId ? bodyMetrics : GENERAL_HEALTH_BODY_METRICS;
  const visibleVitals = vitalsProfileId === selectedProfileId ? vitals : GENERAL_HEALTH_VITALS;
  const visibleSavedMessage = savedMessageProfileId === selectedProfileId ? savedMessage : "";

  useEffect(() => {
    if (!savedMessage) return;
    const timer = setTimeout(() => setSavedMessage(""), 3200);
    return () => clearTimeout(timer);
  }, [savedMessage]);

  function saveLocalLog(draft: GeneralHealthLogDraft) {
    const labels: Record<GeneralHealthLogType, string> = {
      note: "Health note",
      temperature: "Temperature reading",
      vitals: "Vitals reading",
      weight: "Weight entry"
    };
    const updated = "Updated just now";

    if (draft.logType === "vitals") {
      setVitalsProfileId(selectedProfileId);
      setVitals((current) => current.map((item) => {
        if (item.label === "Heart rate" && draft.heartRate) return { ...item, status: "saved", updated, value: `${draft.heartRate} bpm` };
        if (item.label === "Blood pressure" && draft.systolic && draft.diastolic) return { ...item, status: "saved", updated, value: `${draft.systolic} / ${draft.diastolic} mmHg` };
        if (item.label === "Oxygen saturation" && draft.oxygen) return { ...item, status: "saved", updated, value: `${draft.oxygen}%` };
        return item;
      }));
    }
    if (draft.logType === "temperature" && draft.temperature) {
      setVitalsProfileId(selectedProfileId);
      setVitals((current) => current.map((item) => item.label === "Temperature"
        ? { ...item, status: "saved", updated, value: `${draft.temperature} \u00B0C` }
        : item));
    }
    if (draft.logType === "weight" && draft.weight) {
      setBodyMetricsProfileId(selectedProfileId);
      setBodyMetrics((current) => current.map((item) => item.label === "Weight"
        ? { ...item, status: "saved", value: `${draft.weight} kg` }
        : item));
    }
    addActivity(createGeneralHealthActivity(draft, selectedProfileId, selectedProfileName));

    setSavedMessage(`${labels[draft.logType]} saved locally for now.`);
    setSavedMessageProfileId(selectedProfileId);
    setActiveLogType(null);
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HealthScreenContainer bottomSpacing={120} contentStyle={styles.content}>
        <GeneralHealthHeader profileName={selectedProfileName} />
        {visibleSavedMessage ? <SavedConfirmation message={visibleSavedMessage} /> : null}
        {MOCK_GENERAL_HEALTH_STATE === "loading" ? <GeneralHealthLoadingState /> : null}
        {MOCK_GENERAL_HEALTH_STATE === "empty" ? <GeneralHealthEmptyState onAction={() => setActiveLogType("note")} /> : null}
        {MOCK_GENERAL_HEALTH_STATE === "error" ? <GeneralHealthErrorState /> : null}
        {MOCK_GENERAL_HEALTH_STATE === "ready" ? <GeneralHealthReadyContent activity={activities} bodyMetrics={visibleBodyMetrics} onOpenLog={setActiveLogType} profileId={selectedProfileId} stacked={stacked} stackedSnapshot={stackedSnapshot} vitals={visibleVitals} /> : null}
      </HealthScreenContainer>
      <GeneralHealthLogSheet key={activeLogType ?? "closed"} logType={activeLogType} onCancel={() => setActiveLogType(null)} onSave={saveLocalLog} profileName={selectedProfileName} />
    </View>
  );
}

function GeneralHealthHeader({ profileName }: { profileName: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable accessibilityHint="Returns to the Health overview" accessibilityLabel="Back to Health" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}>
          <Text style={[styles.backText, { color: theme.text }]}>{"<"}</Text>
        </Pressable>
        <View style={[styles.profile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.profileIcon, { backgroundColor: `${ACCENT}16` }]}>
            <AppIcon color={ACCENT} decorative name="profile" size={18} />
          </View>
          <View>
            <Text style={[styles.profileLabel, { color: theme.mutedText }]}>ACTIVE PROFILE</Text>
            <Text style={[styles.profileName, { color: theme.text }]}>{profileName}</Text>
          </View>
        </View>
      </View>
      <View style={styles.heading}>
        <View style={[styles.statusBadge, { backgroundColor: `${ACCENT}12`, borderColor: `${ACCENT}35` }]}>
          <Text style={styles.statusText}>Personal overview</Text>
        </View>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>General Health</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>Vitals, body metrics, notes, and trends</Text>
      </View>
    </View>
  );
}

function GeneralHealthReadyContent({
  activity,
  bodyMetrics,
  onOpenLog,
  profileId,
  stacked,
  stackedSnapshot,
  vitals
}: {
  activity: GeneralHealthActivityEntry[];
  bodyMetrics: GeneralHealthBodyMetric[];
  onOpenLog: (logType: GeneralHealthLogType) => void;
  profileId: string;
  stacked: boolean;
  stackedSnapshot: boolean;
  vitals: GeneralHealthVital[];
}) {
  return (
    <>
      <HealthSnapshotCard stacked={stackedSnapshot} />
      <QuickLogActions onOpenLog={onOpenLog} stacked={stacked} />
      <AppSection subtitle="Simple reading previews with no medical interpretation." title="Vitals">
        <View style={styles.grid}>
          {vitals.map((item) => <VitalPreviewCard item={item} key={item.label} stacked={stacked} />)}
        </View>
      </AppSection>
      <AppSection subtitle="Saved measurements and future calculated fields." title="Body metrics">
        <View style={styles.grid}>
          {bodyMetrics.map((item) => <BodyMetricCard item={item} key={item.label} stacked={stacked} />)}
        </View>
      </AppSection>
      <WeeklyTrendPreviewCard />
      <RecentHealthNotesPreview activity={activity} profileId={profileId} />
      <GeneralHealthActivityTimeline
        actionAccessibilityHint="Opens the complete activity history for the selected profile"
        actionAccessibilityLabel="View all general health activity"
        actionLabel="View all"
        entries={activity}
        onActionPress={() => router.push("/health/general/history")}
        profileId={profileId}
      />
      <SafeHealthNote />
    </>
  );
}

function RecentHealthNotesPreview({ activity, profileId }: { activity: GeneralHealthActivityEntry[]; profileId: string }) {
  const { theme } = useAppTheme();
  const notes = activity
    .filter((entry): entry is Extract<GeneralHealthActivityEntry, { type: "note" }> => entry.profileId === profileId && entry.type === "note")
    .filter((entry) => Boolean(entry.details.noteTitle?.trim()))
    .filter((entry) => Number.isFinite(new Date(entry.createdAt).getTime()))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  const latest = notes[0];
  const latestTitle = latest?.details.noteTitle?.trim();

  return (
    <AppSection
      actionAccessibilityHint="Opens saved health notes for the selected profile"
      actionAccessibilityLabel="Open health notes"
      actionLabel="View all"
      onActionPress={() => router.push("/health/general/notes")}
      subtitle="Personal notes and saved context."
      title="Recent notes"
    >
      <Pressable
        accessibilityHint="Opens saved health notes for the selected profile"
        accessibilityLabel="Open health notes"
        accessibilityRole="button"
        onPress={() => router.push("/health/general/notes")}
        style={({ pressed }) => [styles.notesPreview, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}
      >
        <View style={[styles.notesPreviewIcon, { backgroundColor: `${ACCENT}14` }]}>
          <AppIcon color={ACCENT} decorative name="edit" size={20} />
        </View>
        <View style={styles.notesPreviewCopy}>
          <Text style={[styles.notesPreviewTitle, { color: theme.text }]}>Health notes</Text>
          <Text style={[styles.notesPreviewMeta, { color: theme.mutedText }]}>{notes.length ? `${notes.length} saved ${notes.length === 1 ? "note" : "notes"}` : "No saved notes yet"}</Text>
          {latestTitle ? <Text numberOfLines={2} style={[styles.notesPreviewLatest, { color: theme.text }]}>{latestTitle}</Text> : null}
        </View>
        <Text style={[styles.notesPreviewArrow, { color: theme.mutedText }]}>{">"}</Text>
      </Pressable>
    </AppSection>
  );
}

function HealthSnapshotCard({ stacked }: { stacked: boolean }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.snapshot, { backgroundColor: `${ACCENT}12`, borderColor: `${ACCENT}40` }]}>
      <View style={styles.snapshotHeading}>
        <View style={styles.snapshotCopy}>
          <Text style={[styles.snapshotEyebrow, { color: ACCENT }]}>TODAY</Text>
          <Text accessibilityRole="header" style={[styles.snapshotTitle, { color: theme.text }]}>Today{"'"}s health snapshot</Text>
          <Text style={[styles.snapshotSubtitle, { color: theme.mutedText }]}>4 items tracked - 1 reminder later</Text>
        </View>
        <View style={[styles.snapshotIcon, { backgroundColor: theme.surface }]}>
          <AppIcon color={ACCENT} decorative name="health" size={24} />
        </View>
      </View>
      <View style={styles.snapshotGrid}>
        {GENERAL_HEALTH_SNAPSHOT.map((item) => <SnapshotItem item={item} key={item.label} stacked={stacked} />)}
      </View>
    </AppCard>
  );
}

function SnapshotItem({ item, stacked }: { item: GeneralHealthSnapshotItem; stacked: boolean }) {
  const { theme } = useAppTheme();
  return (
    <View accessible accessibilityLabel={`${item.label}, ${item.value}, ${item.status}`} style={[styles.snapshotItem, stacked ? styles.fullWidth : null, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <AppIcon color={ACCENT} decorative name={item.icon} size={18} />
      <Text style={[styles.snapshotLabel, { color: theme.mutedText }]}>{item.label}</Text>
      <Text style={[styles.snapshotValue, { color: theme.text }]}>{item.value}</Text>
      <Text style={[styles.snapshotStatus, { color: ACCENT }]}>{item.status}</Text>
    </View>
  );
}

function QuickLogActions({ onOpenLog, stacked }: { onOpenLog: (logType: GeneralHealthLogType) => void; stacked: boolean }) {
  const { theme } = useAppTheme();
  return (
    <AppSection subtitle="Add a local entry for the active profile." title="Quick log">
      <View style={styles.grid}>
        {GENERAL_HEALTH_QUICK_ACTIONS.map((action) => (
          <Pressable
            accessibilityHint={action.accessibilityHint}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityRole="button"
            key={action.label}
            onPress={() => onOpenLog(action.logType)}
            style={({ pressed }) => [styles.quickAction, stacked ? styles.fullWidth : null, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}
          >
            <View style={[styles.quickIcon, { backgroundColor: `${ACCENT}14` }]}><AppIcon color={ACCENT} decorative name={action.icon} size={20} /></View>
            <Text style={[styles.quickLabel, { color: theme.text }]}>{action.label}</Text>
            <Text style={[styles.quickArrow, { color: ACCENT }]}>{">"}</Text>
          </Pressable>
        ))}
      </View>
    </AppSection>
  );
}

function VitalPreviewCard({ item, stacked }: { item: GeneralHealthVital; stacked: boolean }) {
  const { theme } = useAppTheme();
  const isHeartRate = item.label === "Heart rate";
  const isBloodPressure = item.label === "Blood pressure";
  const isTemperature = item.label === "Temperature";
  const isOxygenSaturation = item.label === "Oxygen saturation";
  const interactive = isHeartRate || isBloodPressure || isTemperature || isOxygenSaturation;
  const route = isHeartRate ? "/health/general/heart-rate" : isBloodPressure ? "/health/general/blood-pressure" : isTemperature ? "/health/general/temperature" : "/health/general/oxygen-saturation";
  const accessibilityLabel = isHeartRate ? "Open heart rate trends" : isBloodPressure ? "Open blood pressure trends" : isTemperature ? "Open temperature trends" : "Open oxygen saturation trends";
  const accessibilityHint = isHeartRate ? "Opens saved heart rate readings and trends for the selected profile" : isBloodPressure ? "Opens saved blood pressure readings and trends for the selected profile" : isTemperature ? "Opens saved temperature readings and trends for the selected profile" : "Opens saved oxygen saturation readings and trends for the selected profile";
  const content = (
    <View accessible={!interactive} accessibilityLabel={`${item.label}, ${item.value}, ${item.status}, ${item.updated}`} style={styles.cardContent}>
      <View style={styles.previewTop}>
        <View style={[styles.previewIcon, { backgroundColor: `${ACCENT}14` }]}><AppIcon color={ACCENT} decorative name={item.icon} size={20} /></View>
        <View style={[styles.cardStatusBadge, { backgroundColor: `${ACCENT}12` }]}><Text style={[styles.previewStatus, { color: ACCENT }]}>{item.status}</Text></View>
      </View>
      <Text style={[styles.previewLabel, { color: theme.mutedText }]}>{item.label}</Text>
      <Text style={[styles.previewValue, { color: theme.text }]}>{item.value}</Text>
      <Text style={[styles.updated, { color: theme.mutedText }]}>{item.updated}</Text>
    </View>
  );
  return (
    <AppCard style={[styles.previewCard, stacked ? styles.fullWidth : null, { borderColor: theme.border }]}>
      {interactive ? (
        <Pressable accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={() => router.push(route)} style={({ pressed }) => pressed ? styles.pressed : null}>
          {content}
        </Pressable>
      ) : content}
    </AppCard>
  );
}

function BodyMetricCard({ item, stacked }: { item: GeneralHealthBodyMetric; stacked: boolean }) {
  const { theme } = useAppTheme();
  const isWeight = item.label === "Weight";
  const content = (
    <View accessible={!isWeight} accessibilityLabel={`${item.label}, ${item.value}, ${item.status}`} style={styles.cardContent}>
      <View style={[styles.previewIcon, { backgroundColor: `${ACCENT}14` }]}><AppIcon color={ACCENT} decorative name={item.icon} size={20} /></View>
      <Text style={[styles.previewLabel, { color: theme.mutedText }]}>{item.label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]}>{item.value}</Text>
      <View style={[styles.cardStatusBadge, styles.metricStatusBadge, { backgroundColor: `${ACCENT}12` }]}><Text style={[styles.previewStatus, { color: ACCENT }]}>{item.status}</Text></View>
    </View>
  );
  return (
    <AppCard style={[styles.metricCard, stacked ? styles.fullWidth : null, { borderColor: theme.border }]}>
      {isWeight ? <Pressable accessibilityHint="Opens saved weight entries and personal trends for the selected profile" accessibilityLabel="Open weight trends" accessibilityRole="button" onPress={() => router.push("/health/general/weight")} style={({ pressed }) => pressed ? styles.pressed : null}>{content}</Pressable> : content}
    </AppCard>
  );
}

function WeeklyTrendPreviewCard() {
  const { theme } = useAppTheme();
  return (
    <AppSection subtitle="A lightweight preview of saved general health activity." title="Weekly trends">
      <AppCard style={[styles.trendCard, { borderColor: theme.border }]}>
        <Text style={[styles.trendSummary, { color: theme.text }]}>4 of 7 days have saved health activity.</Text>
        <View accessible accessibilityLabel="Monday, Wednesday, Thursday, and Saturday have saved health activity. Four of seven days saved." style={styles.bars}>
          {GENERAL_HEALTH_WEEK.map((item) => (
            <View key={item.day} style={styles.barColumn}>
              <View style={[styles.barTrack, { backgroundColor: theme.primarySoft }]}>
                <View style={[styles.barFill, { backgroundColor: item.logged ? ACCENT : theme.border, height: `${item.value}%` }]} />
              </View>
              <Text style={[styles.barDay, { color: theme.mutedText }]}>{item.day}</Text>
              <Text style={[styles.barState, { color: item.logged ? ACCENT : theme.mutedText }]}>{item.logged ? "Saved" : "None"}</Text>
            </View>
          ))}
        </View>
      </AppCard>
    </AppSection>
  );
}

function SafeHealthNote() {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.safeNote, { borderColor: `${ACCENT}45` }]}>
      <AppIcon color={ACCENT} decorative name="health" size={18} />
      <Text style={[styles.safeNoteText, { color: theme.mutedText }]}>This app helps you organize health information. Contact a healthcare professional if you are worried about symptoms or readings.</Text>
    </View>
  );
}

function GeneralHealthLoadingState() {
  const { theme } = useAppTheme();
  return (
    <View accessible accessibilityLabel="Loading General Health" accessibilityRole="progressbar" style={styles.stateStack}>
      {[220, 130, 180].map((height) => <View key={height} style={[styles.skeleton, { backgroundColor: theme.surface, borderColor: theme.border, height }]} />)}
    </View>
  );
}

function GeneralHealthEmptyState({ onAction }: { onAction: () => void }) {
  return <GeneralHealthState icon="add" message="Start with a quick note, weight entry, or vital reading." title="No general health logs yet" action="Add first log" onAction={onAction} />;
}

function GeneralHealthErrorState() {
  return <GeneralHealthState icon="warning" message="Your local General Health preview could not be shown." title="We couldn't load general health" />;
}

function GeneralHealthState({ action, icon, message, onAction, title }: { action?: string; icon: AppIconName; message: string; onAction?: () => void; title: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.stateCard, { borderColor: theme.border }]}>
      <View style={[styles.stateIcon, { backgroundColor: `${ACCENT}14` }]}><AppIcon color={ACCENT} decorative name={icon} size={26} /></View>
      <Text accessibilityRole="header" style={[styles.stateTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.stateMessage, { color: theme.mutedText }]}>{message}</Text>
      {action && onAction ? <AppButton accessibilityLabel={action} label={action} onPress={onAction} /> : null}
    </AppCard>
  );
}

function SavedConfirmation({ message }: { message: string }) {
  const { theme } = useAppTheme();
  return (
    <View accessibilityLiveRegion="polite" accessible accessibilityLabel={message} style={[styles.savedConfirmation, { backgroundColor: `${ACCENT}12`, borderColor: `${ACCENT}35` }]}>
      <AppIcon color={ACCENT} decorative name="save" size={18} />
      <Text style={[styles.savedConfirmationText, { color: theme.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "center", borderRadius: 16, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  backText: { fontSize: 22, fontWeight: "900", lineHeight: 24 },
  barColumn: { alignItems: "center", flex: 1, gap: 6 },
  barDay: { fontSize: 12, fontWeight: "900" },
  barFill: { borderRadius: 999, bottom: 0, position: "absolute", width: "100%" },
  bars: { alignItems: "flex-end", flexDirection: "row", gap: 7, height: 132, marginTop: 8 },
  barState: { fontSize: 10, fontWeight: "800" },
  barTrack: { borderRadius: 999, height: 82, overflow: "hidden", position: "relative", width: 11 },
  content: { gap: 26 },
  cardStatusBadge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  cardContent: { flex: 1 },
  fullWidth: { flexBasis: "100%", maxWidth: "100%" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  header: { gap: 18 },
  headerTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  heading: { alignItems: "flex-start" },
  metricCard: { borderWidth: 1, flexBasis: "46%", flexGrow: 1, maxWidth: "48.5%", minHeight: 170 },
  metricValue: { fontSize: 18, fontWeight: "900", marginTop: 5 },
  metricStatusBadge: { marginTop: "auto" },
  notesPreview: { alignItems: "center", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 92, padding: 14 },
  notesPreviewArrow: { fontSize: 18, fontWeight: "900", marginLeft: "auto" },
  notesPreviewCopy: { flex: 1, gap: 4, minWidth: 0 },
  notesPreviewIcon: { alignItems: "center", borderRadius: 15, height: 42, justifyContent: "center", width: 42 },
  notesPreviewLatest: { fontSize: 14, fontWeight: "900", lineHeight: 20 },
  notesPreviewMeta: { fontSize: 12, fontWeight: "800", lineHeight: 18 },
  notesPreviewTitle: { fontSize: 16, fontWeight: "900" },
  pressed: { opacity: 0.74 },
  previewCard: { borderWidth: 1, flexBasis: "46%", flexGrow: 1, maxWidth: "48.5%", minHeight: 188 },
  previewIcon: { alignItems: "center", borderRadius: 15, height: 40, justifyContent: "center", width: 40 },
  previewLabel: { fontSize: 12, fontWeight: "900", marginTop: 13, textTransform: "uppercase" },
  previewStatus: { fontSize: 11, fontWeight: "900" },
  previewTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  previewValue: { fontSize: 20, fontWeight: "900", lineHeight: 26, marginTop: 5 },
  profile: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 44, paddingHorizontal: 11 },
  profileIcon: { alignItems: "center", borderRadius: 12, height: 30, justifyContent: "center", width: 30 },
  profileLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  profileName: { fontSize: 13, fontWeight: "900" },
  quickAction: { alignItems: "center", borderRadius: 20, borderWidth: 1, flexBasis: "46%", flexDirection: "row", flexGrow: 1, gap: 10, maxWidth: "48.5%", minHeight: 64, padding: 12 },
  quickArrow: { fontSize: 16, fontWeight: "900" },
  quickIcon: { alignItems: "center", borderRadius: 14, height: 38, justifyContent: "center", width: 38 },
  quickLabel: { flex: 1, fontSize: 13, fontWeight: "900" },
  safeNote: { alignItems: "flex-start", borderLeftWidth: 3, flexDirection: "row", gap: 10, paddingHorizontal: 14 },
  safeNoteText: { flex: 1, fontSize: 12, lineHeight: 19 },
  savedConfirmation: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 9, paddingHorizontal: 13, paddingVertical: 11 },
  savedConfirmationText: { flex: 1, fontSize: 13, fontWeight: "800", lineHeight: 19 },
  screen: { flex: 1 },
  skeleton: { borderRadius: 26, borderWidth: 1 },
  snapshot: { borderWidth: 1, gap: 18, padding: 18 },
  snapshotCopy: { flex: 1 },
  snapshotEyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  snapshotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  snapshotHeading: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  snapshotIcon: { alignItems: "center", borderRadius: 17, height: 46, justifyContent: "center", width: 46 },
  snapshotItem: { borderRadius: 18, borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 116, padding: 12 },
  snapshotLabel: { fontSize: 11, fontWeight: "900", marginTop: 8, textTransform: "uppercase" },
  snapshotStatus: { fontSize: 11, fontWeight: "900", marginTop: 4 },
  snapshotSubtitle: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  snapshotTitle: { fontSize: 22, fontWeight: "900", lineHeight: 28, marginTop: 5 },
  snapshotValue: { fontSize: 17, fontWeight: "900", marginTop: 3 },
  stateCard: { alignItems: "center", borderWidth: 1, gap: 13, padding: 22 },
  stateIcon: { alignItems: "center", borderRadius: 20, height: 56, justifyContent: "center", width: 56 },
  stateMessage: { lineHeight: 21, maxWidth: 310, textAlign: "center" },
  stateStack: { gap: 14 },
  stateTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  statusBadge: { borderRadius: 999, borderWidth: 1, marginBottom: 8, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: ACCENT, fontSize: 11, fontWeight: "900" },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 5 },
  title: { fontSize: 28, fontWeight: "900", lineHeight: 34 },
  trendCard: { borderWidth: 1, gap: 10 },
  trendSummary: { fontSize: 15, fontWeight: "900" },
  updated: { fontSize: 11, lineHeight: 17, marginTop: "auto", paddingTop: 10 }
});
