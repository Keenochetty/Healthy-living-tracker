import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppChip, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { getDevicePermissionStates } from "@/lib/devicePermissions";
import { healthRealmAccents, realmAccentWithOpacity } from "@/theme/healthTheme";
import { useAppTheme } from "@/theme/ThemeProvider";
import { fontSizes, radius, spacing } from "@/theme/tokens";
import type { DevicePermissionStatus } from "@/types/devicePermissions";

type ScanModeKey =
  | "food"
  | "medication"
  | "record"
  | "workout"
  | "symptom"
  | "baby"
  | "circle";

type ScanMode = {
  accent: keyof typeof healthRealmAccents;
  description: string;
  guidance: string;
  icon: AppIconName;
  key: ScanModeKey;
  label: string;
  primaryLabel: string;
  route: Href;
};

const SCAN_MODES: ScanMode[] = [
  {
    accent: "food",
    description: "Scan a product barcode and review it before logging.",
    guidance: "Keep the barcode flat and inside the frame.",
    icon: "scan_barcode",
    key: "food",
    label: "Food",
    primaryLabel: "Open barcode scanner",
    route: "/food/barcode-scanner",
  },
  {
    accent: "meds",
    description: "Review medication and add label details safely.",
    guidance: "Medication label capture is reviewed before anything is saved.",
    icon: "medication",
    key: "medication",
    label: "Medication",
    primaryLabel: "Check medication",
    route: "/medication",
  },
  {
    accent: "records",
    description: "Open private records and document capture options.",
    guidance: "Place the full document inside the frame with clear lighting.",
    icon: "documents",
    key: "record",
    label: "Record",
    primaryLabel: "Open records",
    route: "/records",
  },
  {
    accent: "fitness",
    description: "Open workout tools and body-scan records.",
    guidance: "Workout visual recognition is not connected yet.",
    icon: "fitness",
    key: "workout",
    label: "Workout",
    primaryLabel: "Open fitness",
    route: "/fitness",
  },
  {
    accent: "health",
    description: "Capture a private symptom or health note.",
    guidance: "Describe what changed and when it started.",
    icon: "health",
    key: "symptom",
    label: "Symptom",
    primaryLabel: "Add health note",
    route: "/health/general/notes",
  },
  {
    accent: "baby",
    description: "Open baby and child-care logging.",
    guidance: "Baby visual recognition is not connected yet.",
    icon: "child_baby",
    key: "baby",
    label: "Baby",
    primaryLabel: "Open baby log",
    route: "/baby-child",
  },
  {
    accent: "family",
    description: "Scan a trusted Family Circle invite QR code.",
    guidance: "Only scan invite codes shared by someone you trust.",
    icon: "scan",
    key: "circle",
    label: "Circle QR",
    primaryLabel: "Scan Circle invite",
    route: "/scan-invite",
  },
];

const FALLBACK_ACTIONS: Array<{
  icon: AppIconName;
  label: string;
  route: Href;
}> = [
  { icon: "ai", label: "AI-assisted scan", route: "/ai" },
  { icon: "upload", label: "Upload document", route: "/records" },
  {
    icon: "scan_barcode",
    label: "Enter barcode",
    route: "/food/barcode-scanner",
  },
  { icon: "medication", label: "Add medication", route: "/medication/add" },
  { icon: "food", label: "Log meal", route: "/food/smart-log" },
  { icon: "note", label: "Health note", route: "/health/general/notes" },
  { icon: "records", label: "Open records", route: "/records" },
];

export default function ScanScreen() {
  const [modeKey, setModeKey] = useState<ScanModeKey>("food");
  const [permissionStatus, setPermissionStatus] =
    useState<DevicePermissionStatus | null>(null);
  const mode = SCAN_MODES.find((item) => item.key === modeKey) ?? SCAN_MODES[0];

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getDevicePermissionStates()
        .then((states) => {
          if (!active) return;
          setPermissionStatus(
            states.find((state) => state.key === "camera")?.status ??
              "unavailable",
          );
        })
        .catch(() => active && setPermissionStatus("unavailable"));
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <AppMainLayout subtitle="Review before anything is saved" title="Scan">
      <View style={styles.stack}>
        <ScanModeSelector modeKey={modeKey} onChange={setModeKey} />
        <ScanCameraFrame mode={mode} permissionStatus={permissionStatus} />
        <PermissionNotice permissionStatus={permissionStatus} />
        <ScanFallbackActions />
        <RecentScans />
      </View>
    </AppMainLayout>
  );
}

function ScanModeSelector({
  modeKey,
  onChange,
}: {
  modeKey: ScanModeKey;
  onChange: (mode: ScanModeKey) => void;
}) {
  return (
    <AppSection subtitle="Choose what you want to capture or check." title="Scan mode">
      <View style={styles.chipRow}>
        {SCAN_MODES.map((mode) => (
          <AppChip
            icon={<AppIcon decorative name={mode.icon} size={13} variant="primary" />}
            key={mode.key}
            label={mode.label}
            onPress={() => onChange(mode.key)}
            selected={mode.key === modeKey}
          />
        ))}
      </View>
    </AppSection>
  );
}

function ScanCameraFrame({
  mode,
  permissionStatus,
}: {
  mode: ScanMode;
  permissionStatus: DevicePermissionStatus | null;
}) {
  const { theme } = useAppTheme();
  const accent = healthRealmAccents[mode.accent];

  return (
    <AppCard padding="md" style={[styles.cameraCard, { borderColor: accent }]}>
      <View style={styles.cameraTop}>
        <View style={[styles.modeIcon, { backgroundColor: realmAccentWithOpacity(mode.accent, 0.18) }]}>
          <AppIcon color={accent} decorative name={mode.icon} size={20} />
        </View>
        <View style={styles.cameraCopy}>
          <Text style={[styles.cameraTitle, { color: theme.text }]}>{mode.label} scan</Text>
          <Text style={[styles.statusText, { color: accent }]}>
            {getScanStatus(permissionStatus)}
          </Text>
        </View>
        <AppChip label="Review first" variant="private" />
      </View>

      <View style={[styles.preview, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={[styles.targetFrame, { borderColor: accent }]}>
          <AppIcon color={accent} decorative name={mode.icon} size={34} />
        </View>
        <View style={[styles.guideOverlay, { backgroundColor: theme.surface }]}>
          <Text style={[styles.guideText, { color: theme.mutedText }]}>{mode.guidance}</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: theme.mutedText }]}>{mode.description}</Text>
      <AppButton
        fullWidth
        iconLeft={<AppIcon color="#ffffff" decorative name="scan" size={17} />}
        onPress={() => router.push(mode.route)}
        title={mode.primaryLabel}
      />
    </AppCard>
  );
}

function PermissionNotice({
  permissionStatus,
}: {
  permissionStatus: DevicePermissionStatus | null;
}) {
  const { theme } = useAppTheme();
  const copy = getPermissionCopy(permissionStatus);
  return (
    <AppCard padding="sm" variant="soft">
      <View style={styles.permissionRow}>
        <AppIcon decorative name="safety" size={18} variant={permissionStatus === "denied" ? "warning" : "primary"} />
        <View style={styles.permissionCopy}>
          <Text style={[styles.permissionTitle, { color: theme.text }]}>{copy.title}</Text>
          <Text style={[styles.permissionText, { color: theme.mutedText }]}>{copy.text}</Text>
        </View>
        <AppChip
          label="Permissions"
          onPress={() => router.push("/settings/device-permissions" as Href)}
          variant="muted"
        />
      </View>
    </AppCard>
  );
}

function ScanFallbackActions() {
  const { theme } = useAppTheme();
  return (
    <AppSection subtitle="Continue without using the camera." title="Manual options">
      <View style={styles.fallbackGrid}>
        {FALLBACK_ACTIONS.map((action) => (
          <Pressable
            accessibilityRole="button"
            key={action.label}
            onPress={() => router.push(action.route)}
            style={({ pressed }) => [styles.fallbackAction, pressed && styles.pressed]}
          >
            <AppIcon container decorative name={action.icon} size={17} variant="primary" />
            <Text style={[styles.fallbackLabel, { color: theme.mutedText }]}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </AppSection>
  );
}

function RecentScans() {
  const { theme } = useAppTheme();
  // TODO: Connect this section when a shared scan-history source is approved.
  return (
    <AppSection subtitle="Reviewed captures will appear here." title="Recent scans">
      <AppCard padding="sm">
        <View style={styles.emptyRow}>
          <AppIcon decorative name="scan" size={20} variant="muted" />
          <View style={styles.permissionCopy}>
            <Text style={[styles.permissionTitle, { color: theme.text }]}>No shared scan history yet</Text>
            <Text style={[styles.permissionText, { color: theme.mutedText }]}>
              Barcode and invite results continue to open in their existing result flows.
            </Text>
          </View>
        </View>
      </AppCard>
    </AppSection>
  );
}

function getScanStatus(status: DevicePermissionStatus | null) {
  if (!status) return "Checking camera permission";
  if (status === "allowed" || status === "limited") return "Camera ready when opened";
  if (status === "denied") return "Camera access denied · manual options available";
  if (status === "not_requested") return "Permission requested only when needed";
  return "Camera unavailable · manual options available";
}

function getPermissionCopy(status: DevicePermissionStatus | null) {
  if (!status) return { text: "Checking the current device permission state.", title: "Camera permission loading" };
  if (status === "allowed" || status === "limited") return { text: "Supported scanner routes can open the camera when selected.", title: "Camera access available" };
  if (status === "denied") return { text: "Camera routes retain their request and settings flows. Manual actions remain available.", title: "Camera access denied" };
  if (status === "not_requested") return { text: "The app asks only after you open a feature that needs the camera.", title: "Camera not requested" };
  return { text: "Use manual entry, upload, and connected realm actions instead.", title: "Camera unavailable" };
}

const styles = StyleSheet.create({
  cameraCard: { borderWidth: 1, gap: spacing.md, overflow: "hidden" },
  cameraCopy: { flex: 1 },
  cameraTitle: { fontSize: fontSizes.md, fontWeight: "900" },
  cameraTop: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  description: { fontSize: fontSizes.sm, lineHeight: 19 },
  emptyRow: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  fallbackAction: { alignItems: "center", flexBasis: "30%", flexGrow: 1, gap: spacing.sm, minHeight: 88, padding: spacing.sm },
  fallbackGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  fallbackLabel: { fontSize: fontSizes.xs, fontWeight: "800", textAlign: "center" },
  guideOverlay: { borderRadius: radius.md, bottom: spacing.md, left: spacing.md, padding: spacing.sm, position: "absolute", right: spacing.md },
  guideText: { fontSize: fontSizes.xs, fontWeight: "800", textAlign: "center" },
  modeIcon: { alignItems: "center", borderRadius: radius.md, height: 38, justifyContent: "center", width: 38 },
  permissionCopy: { flex: 1 },
  permissionRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  permissionText: { fontSize: fontSizes.xs, lineHeight: 16, marginTop: 2 },
  permissionTitle: { fontSize: fontSizes.sm, fontWeight: "900" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  preview: { alignItems: "center", borderRadius: radius.xl, borderWidth: 1, height: 260, justifyContent: "center", overflow: "hidden" },
  stack: { gap: spacing["2xl"] },
  statusText: { fontSize: fontSizes.xs, fontWeight: "800", marginTop: 2 },
  targetFrame: { alignItems: "center", borderRadius: radius.xl, borderStyle: "dashed", borderWidth: 2, height: 132, justifyContent: "center", width: "72%" },
});
