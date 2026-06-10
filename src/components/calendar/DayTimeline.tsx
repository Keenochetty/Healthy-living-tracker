import { Check, ChevronRight, CircleSlash } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getReminderTypeDefinition } from "@/constants/reminderTypes";
import { formatDateLabel, formatReminderTime } from "@/lib/reminderStorage";
import type { AppReminder } from "@/types/reminders";
import { ReminderCard } from "./ReminderCard";
import { ReminderTypeChip } from "./ReminderTypeChip";

type DayTimelineProps = {
  date: Date;
  onComplete: (reminder: AppReminder) => void;
  onOpen: (reminder: AppReminder) => void;
  onSkip: (reminder: AppReminder) => void;
  reminders: AppReminder[];
  showSummary?: boolean;
  variant?: "dark" | "light" | "notebook" | "notebook-light";
};

export function DayTimeline({
  date,
  onComplete,
  onOpen,
  onSkip,
  reminders,
  showSummary = true,
  variant = "dark"
}: DayTimelineProps) {
  const groupedReminders = reminders.reduce<Record<string, AppReminder[]>>(
    (groups, reminder) => {
      const time = formatReminderTime(reminder.dueAt);

      return {
        ...groups,
        [time]: [...(groups[time] ?? []), reminder]
      };
    },
    {}
  );
  const times = Object.keys(groupedReminders);

  if (variant === "notebook" || variant === "notebook-light") {
    const light = variant === "notebook-light";

    return (
      <View style={[styles.notebookList, light ? styles.notebookListLight : null]}>
        {reminders.map((reminder, index) => (
          <NotebookReminderRow
            key={reminder.id}
            last={index === reminders.length - 1}
            light={light}
            onComplete={() => onComplete(reminder)}
            onOpen={() => onOpen(reminder)}
            onSkip={() => onSkip(reminder)}
            reminder={reminder}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {showSummary ? (
        <View>
          <Text style={{ color: variant === "light" ? "#0f172a" : "#f8fafc", fontSize: 21, fontWeight: "900" }}>
            {formatDateLabel(date)}
          </Text>
          <Text style={{ color: variant === "light" ? "#64748b" : "#94a3b8", marginTop: 3 }}>
            {reminders.length} item{reminders.length === 1 ? "" : "s"} planned
          </Text>
        </View>
      ) : null}

      {times.length ? (
        times.map((time) => (
          <View key={time} style={{ gap: 8 }}>
            <Text style={{ color: variant === "light" ? "#0f766e" : "#6ee7c8", fontSize: 13, fontWeight: "900" }}>
              {time}
            </Text>
            <View style={{ gap: 8 }}>
              {groupedReminders[time].map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  onComplete={() => onComplete(reminder)}
                  onOpen={() => onOpen(reminder)}
                  onSkip={() => onSkip(reminder)}
                  reminder={reminder}
                  variant={variant}
                />
              ))}
            </View>
          </View>
        ))
      ) : (
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            borderColor: variant === "light" ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.12)",
            borderRadius: 24,
            borderWidth: 1,
            padding: 18
          }}
        >
          <Text style={{ color: variant === "light" ? "#475569" : "#cbd5e1", lineHeight: 21 }}>
            Nothing planned. Add a reminder when you are ready.
          </Text>
        </View>
      )}
    </View>
  );
}

function NotebookReminderRow({
  last,
  light,
  onComplete,
  onOpen,
  onSkip,
  reminder
}: {
  last: boolean;
  light: boolean;
  onComplete: () => void;
  onOpen: () => void;
  onSkip: () => void;
  reminder: AppReminder;
}) {
  const type = getReminderTypeDefinition(reminder.type);
  const pending = reminder.status === "pending";

  return (
    <View style={[styles.notebookRow, light ? styles.notebookRowLight : null, last ? styles.notebookRowLast : null]}>
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [styles.notebookEntry, pressed ? styles.notebookPressed : null]}
      >
        <View style={[styles.notebookIcon, { backgroundColor: `${type.colour}18` }]}>
          <View style={[styles.notebookIconDot, { backgroundColor: type.colour }]} />
        </View>
        <View style={styles.notebookCopy}>
          <View style={styles.notebookTitleRow}>
            <Text numberOfLines={2} style={[styles.notebookTitle, light ? styles.notebookTitleLight : null]}>{reminder.title}</Text>
            <ChevronRight color="#64748b" size={17} />
          </View>
          <Text style={[styles.notebookTime, { color: type.colour }]}>{formatReminderTime(reminder.dueAt)}</Text>
          {reminder.notes ? <Text numberOfLines={2} style={[styles.notebookNotes, light ? styles.notebookNotesLight : null]}>{reminder.notes}</Text> : null}
          <View style={styles.notebookMeta}>
            <ReminderTypeChip type={reminder.type} />
            <Text style={[styles.notebookStatus, light ? styles.notebookStatusLight : null]}>{pending ? "Planned" : reminder.status}</Text>
          </View>
        </View>
      </Pressable>
      {pending ? (
        <View style={styles.notebookActions}>
          <NotebookAction icon={<Check color="#0f766e" size={14} />} label="Complete" light={light} onPress={onComplete} />
          <NotebookAction icon={<CircleSlash color={light ? "#64748b" : "#94a3b8"} size={14} />} label="Skip" light={light} onPress={onSkip} />
        </View>
      ) : null}
    </View>
  );
}

function NotebookAction({
  icon,
  label,
  light,
  onPress
}: {
  icon: ReactNode;
  label: string;
  light: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [
      styles.notebookAction,
      light ? styles.notebookActionLight : null,
      pressed ? styles.notebookPressed : null
    ]}>
      {icon}
      <Text style={[styles.notebookActionText, light ? styles.notebookActionTextLight : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  notebookAction: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    minHeight: 30,
    paddingHorizontal: 9
  },
  notebookActionText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800"
  },
  notebookActionLight: {
    borderColor: "rgba(15,23,42,0.12)"
  },
  notebookActionTextLight: {
    color: "#475569"
  },
  notebookActions: {
    flexDirection: "row",
    gap: 7,
    marginLeft: 48,
    marginTop: 8
  },
  notebookCopy: {
    flex: 1,
    minWidth: 0
  },
  notebookEntry: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 11
  },
  notebookIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  notebookIconDot: {
    borderRadius: 999,
    height: 9,
    width: 9
  },
  notebookList: {
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden"
  },
  notebookListLight: {
    borderColor: "rgba(15,23,42,0.10)"
  },
  notebookMeta: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 8
  },
  notebookNotes: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  notebookNotesLight: {
    color: "#64748b"
  },
  notebookPressed: {
    opacity: 0.72
  },
  notebookRow: {
    backgroundColor: "rgba(255,255,255,0.025)",
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: 1,
    padding: 12
  },
  notebookRowLight: {
    backgroundColor: "#ffffff",
    borderBottomColor: "rgba(15,23,42,0.08)"
  },
  notebookRowLast: {
    borderBottomWidth: 0
  },
  notebookStatus: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  notebookStatusLight: {
    color: "#64748b"
  },
  notebookTime: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3
  },
  notebookTitle: {
    color: "#f8fafc",
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19
  },
  notebookTitleLight: {
    color: "#0f172a"
  },
  notebookTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8
  }
});
