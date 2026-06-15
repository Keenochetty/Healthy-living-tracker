import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AppHeader,
  AppIcon,
  AppScreen,
  SegmentedControl,
  SettingsRow,
  StatusPill,
  ToggleRow,
  WidgetCard,
} from "@/components/ui";
import {
  dateFormatOptions,
  distanceUnitOptions,
  heightUnitOptions,
  measurementSystemOptions,
  temperatureUnitOptions,
  timeFormatOptions,
  weightUnitOptions,
} from "@/constants/settings";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { useProfileContext } from "@/lib/profile-context";
import {
  getDeviceSettingsDefaults,
  getSettingsPreferences,
  updateSettingsPreferences,
} from "@/lib/settings";
import type { SettingsPreferences, UnitsPreferences } from "@/types/settings";

type UnitField<Key extends keyof UnitsPreferences> = {
  key: Key;
  label: string;
  options: Array<{ label: string; value: UnitsPreferences[Key] }>;
  subtitle: string;
};

const unitFields: Array<UnitField<keyof UnitsPreferences>> = [
  {
    key: "system",
    label: "Use device default",
    options: measurementSystemOptions,
    subtitle: "Use device default, metric, or imperial as the base preference.",
  },
  {
    key: "weight",
    label: "Weight kg/lb",
    options: weightUnitOptions,
    subtitle: "Choose kg or lb.",
  },
  {
    key: "height",
    label: "Height cm/ft-in",
    options: heightUnitOptions,
    subtitle: "Choose cm or ft/in.",
  },
  {
    key: "temperature",
    label: "Temperature °C/°F",
    options: temperatureUnitOptions,
    subtitle: "Choose Celsius or Fahrenheit.",
  },
  {
    key: "distance",
    label: "Distance km/miles",
    options: distanceUnitOptions,
    subtitle: "Choose km or miles.",
  },
  {
    key: "timeFormat",
    label: "Time format",
    options: timeFormatOptions,
    subtitle: "Use device default, 12-hour, or 24-hour time.",
  },
  {
    key: "dateFormat",
    label: "Date format",
    options: dateFormatOptions,
    subtitle: "Use device default, DD-MM-YYYY, or MM-DD-YYYY.",
  },
];

export default function UnitsSettingsScreen() {
  const { profile } = useProfileContext();
  const deviceDefaults = useMemo(() => getDeviceSettingsDefaults(), []);
  const [preferences, setPreferences] = useState<SettingsPreferences | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setPreferences(await getSettingsPreferences(profile?.id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load unit settings.",
      );
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

  function updateUnitPreference<Key extends keyof UnitsPreferences>(
    key: Key,
    value: UnitsPreferences[Key],
  ) {
    setPreferences((currentPreferences) =>
      currentPreferences
        ? {
            ...currentPreferences,
            units: {
              ...currentPreferences.units,
              [key]: value,
            },
          }
        : currentPreferences,
    );
  }

  function setDeviceDefaults(value: boolean) {
    if (!value) {
      return;
    }

    setPreferences((currentPreferences) =>
      currentPreferences
        ? {
            ...currentPreferences,
            units: {
              dateFormat: "device_default",
              distance: "device_default",
              height: "device_default",
              system: "device_default",
              temperature: "device_default",
              timeFormat: "device_default",
              weight: "device_default",
            },
          }
        : currentPreferences,
    );
  }

  async function handleSave() {
    if (!preferences) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      setPreferences(await updateSettingsPreferences(profile?.id, preferences));
      setNotice("Unit preferences saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save unit settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Settings"
        subtitle="Set device defaults, metric or imperial preferences, and individual conversions."
        title="Units & measurements"
      />

      <WidgetCard
        accentColor={colors.brand.primary}
        action={<StatusPill label={deviceDefaults.locale} />}
        title="Detected from device"
        subtitle="Use these defaults when you want the app to follow the phone."
      >
        <SettingsRow
          icon={
            <AppIcon color={colors.brand.primary} name="language" size={20} />
          }
          label="Device defaults"
          subtitle={`Region ${deviceDefaults.region ?? "Unknown"} - ${deviceDefaults.measurementSystem} - ${
            deviceDefaults.timeFormat === "24_hour" ? "24-hour" : "12-hour"
          } - ${deviceDefaults.dateFormat === "dd_mm_yyyy" ? "DD-MM-YYYY" : "MM-DD-YYYY"}`}
        />
      </WidgetCard>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {isLoading ? <ActivityIndicator /> : null}

      {preferences ? (
        <WidgetCard
          accentColor={colors.status.ai}
          title="Units & formats"
          subtitle="Metric, imperial, and individual display preferences."
        >
          <View style={styles.section}>
            <ToggleRow
              icon={
                <AppIcon color={colors.brand.primary} name="units" size={20} />
              }
              label="Use device default"
              onValueChange={setDeviceDefaults}
              subtitle="Set measurement, weight, height, temperature, distance, time, and date to device defaults."
              value={Object.values(preferences.units).every(
                (value) => value === "device_default",
              )}
            />
            <View style={styles.preferenceCard}>
              <View style={styles.preferenceCopy}>
                <Text style={styles.label}>Metric</Text>
                <Text style={styles.subtitle}>
                  Use metric as the base measurement system.
                </Text>
              </View>
              <SegmentedControl
                onChange={(value) => updateUnitPreference("system", value)}
                options={measurementSystemOptions}
                value={preferences.units.system}
              />
            </View>
            <View style={styles.preferenceCard}>
              <View style={styles.preferenceCopy}>
                <Text style={styles.label}>Imperial</Text>
                <Text style={styles.subtitle}>
                  Use imperial as the base measurement system.
                </Text>
              </View>
              <SegmentedControl
                onChange={(value) => updateUnitPreference("system", value)}
                options={measurementSystemOptions}
                value={preferences.units.system}
              />
            </View>
            {unitFields.slice(1).map((field) => (
              <View key={field.key} style={styles.preferenceCard}>
                <View style={styles.preferenceCopy}>
                  <Text style={styles.label}>{field.label}</Text>
                  <Text style={styles.subtitle}>{field.subtitle}</Text>
                </View>
                <SegmentedControl
                  onChange={(value) => updateUnitPreference(field.key, value)}
                  options={field.options}
                  value={preferences.units[field.key]}
                />
              </View>
            ))}
          </View>
        </WidgetCard>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSaving || !preferences}
        onPress={handleSave}
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.pressed,
          (isSaving || !preferences) && styles.disabled,
        ]}
      >
        <Text style={styles.saveText}>
          {isSaving ? "Saving..." : "Save unit settings"}
        </Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: colors.status.emergency,
    fontWeight: "700",
  },
  label: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  notice: {
    color: colors.status.success,
    fontWeight: "700",
  },
  preferenceCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  preferenceCopy: {
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.brand.primary,
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  saveText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "800",
  },
  section: {
    gap: spacing.md,
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
