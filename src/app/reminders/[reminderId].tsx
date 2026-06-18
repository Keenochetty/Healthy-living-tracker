import { Href, router, useLocalSearchParams } from "expo-router";
import { Check, CircleSlash, Trash2 } from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { ReminderTypeChip } from "@/components/calendar/ReminderTypeChip";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { PRIORITY_LABELS } from "@/constants/reminderTypes";
import { cancelReminderNotification } from "@/lib/notifications";
import {
  completeReminder,
  deleteReminder,
  formatReminderDate,
  formatReminderTime,
  getReminderById,
  skipReminder,
} from "@/lib/reminderStorage";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { AppReminder } from "@/types/reminders";

export default function ReminderDetailScreen() {
  const { theme, themeKey } = useAppTheme();
  const isDarkTheme =
    themeKey === "calm_dark" || themeKey === "premium_dark_health";
  const { reminderId: reminderIdParam } = useLocalSearchParams<{
    reminderId?: string | string[];
  }>();
  const reminderId = Array.isArray(reminderIdParam)
    ? reminderIdParam[0]
    : reminderIdParam;
  const [reminder, setReminder] = useState<AppReminder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const reminderRequest = reminderId
      ? getReminderById(reminderId)
      : Promise.resolve(null);

    reminderRequest
      .then((storedReminder) => {
        if (isActive) {
          setReminder(storedReminder);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [reminderId]);

  async function handleComplete() {
    if (!reminder) {
      return;
    }

    const updatedReminder = await completeReminder(reminder.id);

    await cancelReminderNotification(reminder.notificationId);
    setReminder(updatedReminder);
  }

  async function handleSkip() {
    if (!reminder) {
      return;
    }

    const updatedReminder = await skipReminder(reminder.id);

    await cancelReminderNotification(reminder.notificationId);
    setReminder(updatedReminder);
  }

  async function handleDelete() {
    if (!reminder) {
      return;
    }

    await cancelReminderNotification(reminder.notificationId);
    await deleteReminder(reminder.id);
    router.replace("/(tabs)/calendar" as Href);
  }

  if (isLoading) {
    return (
      <ScreenWrapper backgroundColor={theme.background}>
        <ActivityIndicator color={theme.primary} />
      </ScreenWrapper>
    );
  }

  if (!reminder) {
    return (
      <ScreenWrapper backgroundColor={theme.background}>
        <Text style={{ color: theme.text, fontSize: 28, fontWeight: "900" }}>
          Reminder not found
        </Text>
        <AppCard>
          <Text style={{ color: theme.mutedText, lineHeight: 21 }}>
            This reminder may have been deleted.
          </Text>
        </AppCard>
        <SecondaryButton
          dark={isDarkTheme}
          label="Back to Calendar"
          onPress={() => router.replace("/(tabs)/calendar" as Href)}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={theme.background}>
      <View style={{ gap: 4 }}>
        <Text
          style={{
            color: theme.mutedText,
            fontSize: 14,
            fontWeight: "800",
            textTransform: "uppercase",
          }}
        >
          Reminder
        </Text>
        <Text style={{ color: theme.text, fontSize: 30, fontWeight: "900" }}>
          {reminder.title}
        </Text>
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <ReminderTypeChip type={reminder.type} />
          <InfoRow
            label="Date"
            muted={theme.mutedText}
            text={theme.text}
            value={formatReminderDate(reminder.dueAt)}
          />
          <InfoRow
            label="Time"
            muted={theme.mutedText}
            text={theme.text}
            value={formatReminderTime(reminder.dueAt)}
          />
          <InfoRow
            label="Priority"
            muted={theme.mutedText}
            text={theme.text}
            value={PRIORITY_LABELS[reminder.priority]}
          />
          <InfoRow
            label="Status"
            muted={theme.mutedText}
            text={theme.text}
            value={reminder.status}
          />
          <InfoRow
            label="Notification"
            muted={theme.mutedText}
            text={theme.text}
            value={reminder.notify ? "On" : "Off"}
          />
          {reminder.notes ? (
            <Text style={{ color: theme.mutedText, lineHeight: 21 }}>
              {reminder.notes}
            </Text>
          ) : null}
        </View>
      </AppCard>

      {reminder.type === "medication" ? (
        <AppCard
          backgroundColor={isDarkTheme ? "rgba(167,139,250,0.10)" : "#fff7ed"}
        >
          <Text
            style={{
              color: isDarkTheme ? "#ddd6fe" : "#9a3412",
              lineHeight: 21,
            }}
          >
            Medication reminder. Follow your healthcare professional
            instructions.
          </Text>
        </AppCard>
      ) : null}

      {reminder.status === "pending" ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton
            icon={<Check color="#ffffff" size={17} />}
            label="Complete"
            onPress={handleComplete}
            primary
            dark={isDarkTheme}
          />
          <ActionButton
            icon={<CircleSlash color="#7c3aed" size={17} />}
            label="Skip"
            onPress={handleSkip}
            dark={isDarkTheme}
          />
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleDelete}
        style={{
          alignItems: "center",
          backgroundColor: isDarkTheme ? "rgba(239,68,68,0.12)" : "#fee2e2",
          borderColor: isDarkTheme ? "rgba(239,68,68,0.24)" : "#fecaca",
          borderWidth: 1,
          borderRadius: 18,
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          minHeight: 50,
        }}
      >
        <Trash2 color="#dc2626" size={18} />
        <Text style={{ color: "#dc2626", fontWeight: "900" }}>
          Delete reminder
        </Text>
      </TouchableOpacity>

      <SecondaryButton
        dark={isDarkTheme}
        label="Back to Calendar"
        onPress={() => router.replace("/(tabs)/calendar" as Href)}
      />
    </ScreenWrapper>
  );
}

function InfoRow({
  label,
  muted,
  text,
  value,
}: {
  label: string;
  muted: string;
  text: string;
  value: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: muted }}>{label}</Text>
      <Text
        style={{ color: text, fontWeight: "900", textTransform: "capitalize" }}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  dark,
  icon,
  label,
  onPress,
  primary = false,
}: {
  dark: boolean;
  icon: ReactNode;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: primary
          ? "#6ee7c8"
          : dark
            ? "rgba(255,255,255,0.08)"
            : "#ede9fe",
        borderColor: primary
          ? "#6ee7c8"
          : dark
            ? "rgba(255,255,255,0.14)"
            : "#ddd6fe",
        borderWidth: 1,
        borderRadius: 18,
        flex: 1,
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
        minHeight: 50,
      }}
    >
      {icon}
      <Text
        style={{
          color: primary ? "#10201d" : dark ? "#e2e8f0" : "#6d28d9",
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  dark,
  label,
  onPress,
}: {
  dark: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#ffffff",
        borderColor: dark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.08)",
        borderWidth: 1,
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50,
      }}
    >
      <Text style={{ color: dark ? "#c4b5fd" : "#7c3aed", fontWeight: "800" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
