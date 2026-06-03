import { Href, router, useLocalSearchParams } from "expo-router";
import { Check, CircleSlash, Trash2 } from "lucide-react-native";
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
  skipReminder
} from "@/lib/reminderStorage";
import type { AppReminder } from "@/types/reminders";

export default function ReminderDetailScreen() {
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
    const reminderRequest = reminderId ? getReminderById(reminderId) : Promise.resolve(null);

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
    router.replace("/calendar" as Href);
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator color="#7c3aed" />
      </ScreenWrapper>
    );
  }

  if (!reminder) {
    return (
      <ScreenWrapper>
        <Text style={{ color: "#0f172a", fontSize: 28, fontWeight: "900" }}>
          Reminder not found
        </Text>
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            This reminder may have been deleted.
          </Text>
        </AppCard>
        <SecondaryButton label="Back to Calendar" onPress={() => router.replace("/calendar" as Href)} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Reminder</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {reminder.title}
        </Text>
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <ReminderTypeChip type={reminder.type} />
          <InfoRow label="Date" value={formatReminderDate(reminder.dueAt)} />
          <InfoRow label="Time" value={formatReminderTime(reminder.dueAt)} />
          <InfoRow label="Priority" value={PRIORITY_LABELS[reminder.priority]} />
          <InfoRow label="Status" value={reminder.status} />
          <InfoRow label="Notification" value={reminder.notify ? "On" : "Off"} />
          {reminder.notes ? (
            <Text style={{ color: "#64748b", lineHeight: 21 }}>{reminder.notes}</Text>
          ) : null}
        </View>
      </AppCard>

      {reminder.type === "medication" ? (
        <AppCard backgroundColor="#fff7ed">
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>
            Medication reminder. Follow your healthcare professional instructions.
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
          />
          <ActionButton
            icon={<CircleSlash color="#7c3aed" size={17} />}
            label="Skip"
            onPress={handleSkip}
          />
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleDelete}
        style={{
          alignItems: "center",
          backgroundColor: "#fee2e2",
          borderRadius: 18,
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          minHeight: 50
        }}
      >
        <Trash2 color="#dc2626" size={18} />
        <Text style={{ color: "#dc2626", fontWeight: "900" }}>Delete reminder</Text>
      </TouchableOpacity>

      <SecondaryButton label="Back to Calendar" onPress={() => router.replace("/calendar" as Href)} />
    </ScreenWrapper>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between"
      }}
    >
      <Text style={{ color: "#64748b" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontWeight: "900", textTransform: "capitalize" }}>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  primary = false
}: {
  icon: React.ReactNode;
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
        backgroundColor: primary ? "#7c3aed" : "#ede9fe",
        borderRadius: 18,
        flex: 1,
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
        minHeight: 50
      }}
    >
      {icon}
      <Text style={{ color: primary ? "#ffffff" : "#6d28d9", fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50
      }}
    >
      <Text style={{ color: "#7c3aed", fontWeight: "800" }}>{label}</Text>
    </TouchableOpacity>
  );
}
