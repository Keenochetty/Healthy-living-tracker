import DateTimePicker from "@react-native-community/datetimepicker";
import { X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  View
} from "react-native";

import { AppButton, AppChip, AppFormInput, AppIconButton, AppToggleRow } from "@/components/ui";
import { REMINDER_TYPES, PRIORITY_LABELS } from "@/constants/reminderTypes";
import { createReminder, updateReminder } from "@/lib/reminderStorage";
import { scheduleReminderNotification } from "@/lib/notifications";
import type { AppModuleKey } from "@/types/app";
import type { AppReminder, ReminderPriority, ReminderType } from "@/types/reminders";

type AddReminderSheetProps = {
  enabledModules: AppModuleKey[];
  onClose: () => void;
  onSaved: (reminder: AppReminder) => void;
  visible: boolean;
};

const PRIORITIES: ReminderPriority[] = ["low", "normal", "important", "urgent"];

export function AddReminderSheet({
  enabledModules,
  onClose,
  onSaved,
  visible
}: AddReminderSheetProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<ReminderType>("personal");
  const [priority, setPriority] = useState<ReminderPriority>("normal");
  const [date, setDate] = useState(new Date());
  const [notify, setNotify] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const availableTypes = useMemo(
    () =>
      REMINDER_TYPES.filter(
        (reminderType) =>
          !reminderType.moduleKey || enabledModules.includes(reminderType.moduleKey)
      ),
    [enabledModules]
  );

  async function saveReminder() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const reminder = await createReminder({
        dueAt: date.toISOString(),
        notes,
        notify: false,
        priority,
        title: trimmedTitle,
        type
      });
      const notificationId = notify
        ? await scheduleReminderNotification({ ...reminder, notify: true })
        : null;
      const savedReminder = await updateReminder(reminder.id, {
        notificationId: notificationId ?? undefined,
        notify: Boolean(notificationId)
      });

      onSaved(savedReminder ?? reminder);
      resetForm();
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setNotes("");
    setType("personal");
    setPriority("normal");
    setDate(new Date());
    setNotify(true);
  }

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View
        style={{
          backgroundColor: "rgba(15,23,42,0.35)",
          flex: 1,
          justifyContent: "flex-end"
        }}
      >
        <View
          style={{
            backgroundColor: "#fbf8ff",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            gap: 14,
            maxHeight: "92%",
            padding: 20
          }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <View>
              <Text style={{ color: "#0f172a", fontSize: 24, fontWeight: "900" }}>
                Add reminder
              </Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>
                Plan a useful, safe reminder.
              </Text>
            </View>
            <AppIconButton icon={<X size={20} />} onPress={onClose} />
          </View>

          <ScrollView
            contentContainerStyle={{ gap: 14, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <AppFormInput
              onChangeText={setTitle}
              placeholder="Reminder title"
              value={title}
            />
            <AppFormInput
              multiline
              onChangeText={setNotes}
              placeholder="Notes optional"
              value={notes}
            />

            <ChoiceSection title="Type">
              {availableTypes.map((reminderType) => (
                <ChoicePill
                  key={reminderType.key}
                  label={`${reminderType.emoji} ${reminderType.label}`}
                  onPress={() => setType(reminderType.key)}
                  selected={type === reminderType.key}
                />
              ))}
            </ChoiceSection>

            <ChoiceSection title="Priority">
              {PRIORITIES.map((nextPriority) => (
                <ChoicePill
                  key={nextPriority}
                  label={PRIORITY_LABELS[nextPriority]}
                  onPress={() => setPriority(nextPriority)}
                  selected={priority === nextPriority}
                />
              ))}
            </ChoiceSection>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Date</Text>
                <DateTimePicker
                  mode="date"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      const nextDate = new Date(date);

                      nextDate.setFullYear(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate()
                      );
                      setDate(nextDate);
                    }
                  }}
                  value={date}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Time</Text>
                <DateTimePicker
                  is24Hour
                  mode="time"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      const nextDate = new Date(date);

                      nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
                      setDate(nextDate);
                    }
                  }}
                  value={date}
                />
              </View>
            </View>

            <AppToggleRow
              description="Local notification only. Private health details stay out of alerts."
              onValueChange={setNotify}
              title="Notify me"
              value={notify}
            />

            {type === "medication" ? (
              <Text style={{ color: "#9a3412", fontSize: 12, lineHeight: 18 }}>
                Medication reminders will say: Follow your healthcare professional
                instructions.
              </Text>
            ) : null}

            <AppButton
              disabled={!title.trim() || isSaving}
              loading={isSaving}
              onPress={saveReminder}
              title={isSaving ? "Saving..." : "Save reminder"}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const labelStyle = {
  color: "#0f172a",
  fontWeight: "900" as const,
  marginBottom: 6
};

function ChoiceSection({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{title}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{children}</View>
    </View>
  );
}

function ChoicePill({
  label,
  onPress,
  selected
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <AppChip label={label} onPress={onPress} selected={selected} variant="primary" />
  );
}
