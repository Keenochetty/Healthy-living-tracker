import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AppHeader,
  AppIcon,
  AppScreen,
  SettingsRow,
  StatusPill,
  ToggleRow,
  WidgetCard,
  type AppIconName,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type DetailRow = {
  icon?: AppIconName;
  label: string;
  status?: string;
  subtitle: string;
};

type DetailToggle = {
  icon?: AppIconName;
  label: string;
  subtitle: string;
  value: boolean;
};

type SettingsDetailScreenProps = {
  eyebrow?: string;
  note?: string;
  rows?: DetailRow[];
  subtitle: string;
  title: string;
  toggles?: DetailToggle[];
};

export function SettingsDetailScreen({
  eyebrow = "Settings",
  note,
  rows = [],
  subtitle,
  title,
  toggles = [],
}: SettingsDetailScreenProps) {
  const [toggleValues, setToggleValues] = useState(
    () =>
      Object.fromEntries(
        toggles.map((toggle) => [toggle.label, toggle.value]),
      ) as Record<string, boolean>,
  );
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <AppScreen>
      <AppHeader
        action={<StatusPill label="Placeholder save" />}
        eyebrow={eyebrow}
        subtitle={subtitle}
        title={title}
      />

      {note ? <Text style={styles.note}>{note}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {toggles.length ? (
        <WidgetCard
          accentColor={colors.brand.primary}
          title="Preferences"
          subtitle="These controls are ready for backend persistence."
        >
          <View style={styles.section}>
            {toggles.map((toggle) => (
              <ToggleRow
                icon={
                  <AppIcon
                    color={colors.brand.primary}
                    name={toggle.icon ?? "settings"}
                    size={20}
                  />
                }
                key={toggle.label}
                label={toggle.label}
                onValueChange={(value) => {
                  setToggleValues((current) => ({
                    ...current,
                    [toggle.label]: value,
                  }));
                  setNotice(null);
                }}
                subtitle={toggle.subtitle}
                value={toggleValues[toggle.label] ?? toggle.value}
              />
            ))}
          </View>
        </WidgetCard>
      ) : null}

      {rows.length ? (
        <WidgetCard
          accentColor={colors.status.ai}
          title="Settings"
          subtitle="Clear grouped controls with safe placeholder behavior."
        >
          <View style={styles.section}>
            {rows.map((row) => (
              <SettingsRow
                accessory={
                  row.status ? <StatusPill label={row.status} /> : undefined
                }
                icon={
                  <AppIcon
                    color={colors.status.ai}
                    name={row.icon ?? "settings"}
                    size={20}
                  />
                }
                key={row.label}
                label={row.label}
                subtitle={row.subtitle}
              />
            ))}
          </View>
        </WidgetCard>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => setNotice(`${title} preferences saved locally for now.`)}
        style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
      >
        <Text style={styles.saveText}>Save changes</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  note: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  notice: {
    color: colors.status.success,
    fontSize: 15,
    fontWeight: "800",
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
    fontWeight: "900",
  },
  section: {
    gap: spacing.md,
  },
});
