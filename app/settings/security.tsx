import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader, AppIcon, AppScreen, SegmentedControl, StatusPill, ToggleRow, WidgetCard } from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { useProfileContext } from "@/lib/profile-context";
import {
  defaultSecurityPreferences,
  getSecurityPreferences,
  updateSecurityPreferences,
  type SecurityPreferences
} from "@/lib/security-settings";

const timeoutOptions = [
  { label: "5 min", value: "5" },
  { label: "15 min", value: "15" },
  { label: "30 min", value: "30" },
  { label: "60 min", value: "60" }
];

export default function SecuritySettingsScreen() {
  const { profile } = useProfileContext();
  const [preferences, setPreferences] = useState<SecurityPreferences>(defaultSecurityPreferences);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Checking biometric availability...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextPreferences, hasHardware, isEnrolled, supportedTypes] = await Promise.all([
        getSecurityPreferences(profile?.id),
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync()
      ]);

      setPreferences(nextPreferences);
      setBiometricAvailable(hasHardware && isEnrolled);
      setBiometricLabel(
        hasHardware && isEnrolled
          ? `Available (${supportedTypes.length} supported type${supportedTypes.length === 1 ? "" : "s"})`
          : "Not available on this device or not enrolled"
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load security settings.");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      loadSettings();
    }, 0);

    return () => {
      clearTimeout(loadTimer);
    };
  }, [loadSettings]);

  function updatePreference<Key extends keyof SecurityPreferences>(key: Key, value: SecurityPreferences[Key]) {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: value
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      setPreferences(await updateSecurityPreferences(profile?.id, preferences));
      setNotice("Security preferences saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save security settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppScreen>
      <AppHeader
        action={<StatusPill label={biometricAvailable ? "Biometric ready" : "Biometric off"} />}
        eyebrow="Settings"
        subtitle="Placeholder preferences for app lock, sensitive notifications, emergency logging, and AI permissions."
        title="Security"
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {isLoading ? <ActivityIndicator /> : null}

      <WidgetCard accentColor={colors.brand.primary} title="App lock" subtitle="Protect the app without making the screen feel scary.">
        <ToggleRow
          icon={<AppIcon color={colors.brand.primary} name="lock" size={20} />}
          label="App lock"
          onValueChange={(value) => updatePreference("appPinEnabled", value)}
          subtitle="Placeholder preference for a future PIN lock."
          value={preferences.appPinEnabled}
        />
        <ToggleRow
          disabled={!biometricAvailable}
          icon={<AppIcon color={colors.status.success} name="shield" size={20} />}
          label="Biometric unlock"
          onValueChange={(value) => updatePreference("biometricUnlockEnabled", value)}
          subtitle={biometricLabel}
          value={preferences.biometricUnlockEnabled && biometricAvailable}
        />
        <ToggleRow
          icon={<AppIcon color={colors.status.system} name="notifications" size={20} />}
          label="Lock sensitive notifications"
          onValueChange={(value) => updatePreference("lockSensitiveNotifications", value)}
          subtitle="Require the future security check before sensitive notification detail."
          value={preferences.lockSensitiveNotifications}
        />
        <ToggleRow
          icon={<AppIcon color={colors.status.ai} name="privacy" size={20} />}
          label="Hide sensitive previews"
          onValueChange={(value) => updatePreference("hideSensitivePreviews", value)}
          subtitle="Prefer safe previews for sensitive content."
          value={preferences.hideSensitivePreviews}
        />
      </WidgetCard>

      <WidgetCard accentColor={colors.status.system} title="Session timeout" subtitle="Choose when the future lock screen should require re-checking.">
        <Text style={styles.label}>Session timeout</Text>
        <SegmentedControl
          onChange={(value) => updatePreference("sessionTimeoutMinutes", Number(value))}
          options={timeoutOptions}
          value={String(preferences.sessionTimeoutMinutes)}
        />
      </WidgetCard>

      <WidgetCard accentColor={colors.status.ai} title="Access logging and AI" subtitle="Keep emergency and assistant access auditable.">
        <ToggleRow
          icon={<AppIcon color={colors.status.emergency} name="emergency" size={20} />}
          label="Emergency access logging"
          onValueChange={(value) => updatePreference("emergencyAccessLoggingEnabled", value)}
          subtitle="Placeholder preference for auditing emergency access."
          value={preferences.emergencyAccessLoggingEnabled}
        />
        <ToggleRow
          icon={<AppIcon color={colors.status.ai} name="ai" size={20} />}
          label="AI access permissions"
          onValueChange={(value) => updatePreference("aiAccessPermissionsEnabled", value)}
          subtitle="Placeholder preference for future assistant data controls."
          value={preferences.aiAccessPermissionsEnabled}
        />
      </WidgetCard>

      <Pressable
        accessibilityRole="button"
        disabled={isSaving}
        onPress={handleSave}
        style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, isSaving && styles.disabled]}
      >
        <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save security settings"}</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  disabled: {
    opacity: 0.5
  },
  error: {
    color: colors.status.emergency,
    fontWeight: "700"
  },
  label: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800"
  },
  notice: {
    color: colors.status.success,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.82
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg
  },
  saveText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "800"
  },
  section: {
    gap: spacing.md
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
