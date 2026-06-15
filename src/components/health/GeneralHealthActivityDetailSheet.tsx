import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton, AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import type {
  GeneralHealthActivityEntry,
  GeneralHealthActivityType,
} from "@/lib/generalHealthMockData";
import { useAppTheme } from "@/theme/ThemeProvider";

const ACTIVITY_CONFIG: Record<
  GeneralHealthActivityType,
  { icon: AppIconName; label: string }
> = {
  note: { icon: "edit", label: "Health note" },
  temperature: { icon: "biometrics", label: "Temperature" },
  vitals: { icon: "vitals", label: "Vitals" },
  weight: { icon: "weight", label: "Weight" },
};

export function GeneralHealthActivityDetailSheet({
  activity,
  onClose,
}: {
  activity: GeneralHealthActivityEntry | null;
  onClose: () => void;
}) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  if (!activity) return null;

  const config = ACTIVITY_CONFIG[activity.type];
  const activityTitle = getActivityTitle(activity);

  function close() {
    Keyboard.dismiss();
    onClose();
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={close}
      statusBarTranslucent
      transparent
      visible
    >
      <View style={styles.modal}>
        <Pressable
          accessibilityLabel="Close activity details"
          accessibilityRole="button"
          onPress={close}
          style={styles.scrim}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              maxHeight: height - Math.max(insets.top, 16),
              width: Math.min(width, 500),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View
                style={[
                  styles.headerIcon,
                  { backgroundColor: theme.primarySoft },
                ]}
              >
                <AppIcon
                  color={theme.primary}
                  decorative
                  name={config.icon}
                  size={22}
                />
              </View>
              <View style={styles.headerCopy}>
                <Text style={[styles.typeLabel, { color: theme.primary }]}>
                  {config.label}
                </Text>
                <Text
                  accessibilityRole="header"
                  style={[styles.title, { color: theme.text }]}
                >
                  {activityTitle}
                </Text>
                <Text style={[styles.date, { color: theme.mutedText }]}>
                  {formatActivityDate(activity.createdAt)}
                </Text>
              </View>
            </View>

            <View
              accessibilityLabel={`Profile: ${activity.profileName}, personal health entry`}
              accessible
              style={[
                styles.profile,
                {
                  backgroundColor: theme.primarySoft,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[styles.profileIcon, { backgroundColor: theme.surface }]}
              >
                <AppIcon
                  color={theme.primary}
                  decorative
                  name="profile"
                  size={17}
                />
              </View>
              <View>
                <Text style={[styles.profileName, { color: theme.text }]}>
                  {activity.profileName}
                </Text>
                <Text style={[styles.profileMeta, { color: theme.mutedText }]}>
                  Personal health entry
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.details,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <ActivityDetails activity={activity} />
              <ActivityDetailRow
                label={
                  activity.type === "note" || activity.type === "weight"
                    ? "Entry time"
                    : "Reading time"
                }
                value={formatActivityDate(activity.createdAt)}
              />
            </View>

            <ActivityDetailRow label="Source" value="Added manually" />

            {activity.type === "note" ? (
              <View style={[styles.safety, { borderColor: theme.border }]}>
                <AppIcon
                  color={theme.primary}
                  decorative
                  name="edit"
                  size={17}
                />
                <View style={styles.safetyCopy}>
                  <Text style={[styles.safetyLabel, { color: theme.text }]}>
                    Context
                  </Text>
                  <Text style={[styles.safetyText, { color: theme.mutedText }]}>
                    This note contains information entered by the user and is
                    not a medical finding.
                  </Text>
                </View>
              </View>
            ) : null}

            {activity.type === "vitals" || activity.type === "temperature" ? (
              <View style={[styles.safety, { borderColor: theme.border }]}>
                <AppIcon
                  color={theme.primary}
                  decorative
                  name="health"
                  size={17}
                />
                <Text style={[styles.safetyText, { color: theme.mutedText }]}>
                  This app stores the information you enter and does not
                  interpret medical readings. Contact a healthcare professional
                  if you are worried.
                </Text>
              </View>
            ) : null}
          </ScrollView>
          <View
            style={[
              styles.footer,
              {
                borderTopColor: theme.border,
                paddingBottom: Math.max(insets.bottom, 12) + 8,
              },
            ]}
          >
            <AppButton
              accessibilityLabel="Close activity details"
              fullWidth
              label="Close"
              onPress={close}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ActivityDetails({
  activity,
}: {
  activity: GeneralHealthActivityEntry;
}) {
  if (activity.type === "vitals") {
    return (
      <>
        <ActivityDetailRow
          label="Heart rate"
          value={
            activity.details.heartRate
              ? `${activity.details.heartRate} bpm`
              : undefined
          }
        />
        <ActivityDetailRow
          label="Blood pressure"
          value={
            activity.details.systolic && activity.details.diastolic
              ? `${activity.details.systolic} / ${activity.details.diastolic} mmHg`
              : undefined
          }
        />
        <ActivityDetailRow
          label="Oxygen level"
          value={
            activity.details.oxygen ? `${activity.details.oxygen}%` : undefined
          }
        />
        <ActivityDetailRow label="Notes" value={activity.details.notes} />
      </>
    );
  }
  if (activity.type === "weight") {
    return (
      <>
        <ActivityDetailRow
          label="Weight"
          value={
            activity.details.weight
              ? `${activity.details.weight} kg`
              : undefined
          }
        />
        <ActivityDetailRow label="Notes" value={activity.details.notes} />
      </>
    );
  }
  if (activity.type === "temperature") {
    return (
      <>
        <ActivityDetailRow
          label="Temperature"
          value={
            activity.details.temperature
              ? `${activity.details.temperature} °C`
              : undefined
          }
        />
        <ActivityDetailRow
          label="Reading method"
          value={activity.details.method}
        />
        <ActivityDetailRow label="Notes" value={activity.details.notes} />
      </>
    );
  }
  return (
    <>
      <ActivityDetailRow
        label="Category"
        value={formatNoteCategory(activity.details.category)}
      />
      <ActivityDetailRow
        fullText
        label="Full note"
        value={activity.details.details}
      />
    </>
  );
}

function getActivityTitle(activity: GeneralHealthActivityEntry) {
  if (activity.type === "note") {
    return (
      activity.details.noteTitle?.trim() || activity.summary || activity.title
    );
  }
  return activity.title;
}

function ActivityDetailRow({
  fullText = false,
  label,
  value,
}: {
  fullText?: boolean;
  label: string;
  value?: string;
}) {
  const { theme } = useAppTheme();
  if (!value?.trim()) return null;
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={styles.row}
    >
      <Text style={[styles.rowLabel, { color: theme.mutedText }]}>{label}</Text>
      <Text
        style={[
          fullText ? styles.fullNoteValue : styles.rowValue,
          { color: theme.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function formatNoteCategory(value?: string) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "symptom") return "Symptom";
  if (normalized === "energy") return "Energy";
  if (normalized === "sleep") return "Sleep";
  if (normalized === "medication") return "Medication";
  if (normalized === "appointment") return "Appointment";
  return "General";
}

function formatActivityDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: 20,
    maxWidth: 500,
    padding: 20,
    width: "100%",
  },
  date: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  details: { borderRadius: 18, borderWidth: 1, gap: 17, padding: 15 },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12 },
  fullNoteValue: { fontSize: 15, fontWeight: "700", lineHeight: 24 },
  handle: {
    alignSelf: "center",
    borderRadius: 999,
    height: 4,
    marginTop: 10,
    width: 46,
  },
  header: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  headerCopy: { flex: 1 },
  headerIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  modal: { flex: 1, justifyContent: "flex-end" },
  profile: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 60,
    padding: 11,
  },
  profileIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  profileMeta: { fontSize: 12, marginTop: 2 },
  profileName: { fontSize: 14, fontWeight: "900" },
  row: { gap: 5 },
  rowLabel: { fontSize: 12, fontWeight: "800" },
  rowValue: { fontSize: 15, fontWeight: "800", lineHeight: 22 },
  safety: {
    alignItems: "flex-start",
    borderLeftWidth: 3,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 13,
  },
  safetyCopy: { flex: 1, gap: 4 },
  safetyLabel: { fontSize: 12, fontWeight: "900" },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 19 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.58)" },
  sheet: {
    alignSelf: "center",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  title: { fontSize: 21, fontWeight: "900", lineHeight: 27, marginTop: 3 },
  typeLabel: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
});
