import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Bell, Check, Clock, MoreHorizontal } from "lucide-react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSReminderDisplayItem } from "@/features/reminders";

type Props = {
  item: HealthOSReminderDisplayItem;
  onDone: (item: HealthOSReminderDisplayItem) => void;
  onOpen: (item: HealthOSReminderDisplayItem) => void;
  onSnooze: (item: HealthOSReminderDisplayItem) => void;
};

export function HealthOSReminderRow({ item, onDone, onOpen, onSnooze }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <Pressable onPress={() => onOpen(item)} style={[styles.row, surfaces.listRow]}>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {item.title}
          </Text>
          {item.notificationEnabled ? <Bell color={palette.ai} size={14} /> : null}
        </View>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {item.categoryLabel} · {item.dueLabel}
        </Text>
        <View style={styles.pills}>
          <HealthOSPill label={item.statusLabel} size="sm" variant={item.status === "missed" ? "danger" : item.status === "completed" ? "success" : "glass"} />
          {item.isPrivate ? <HealthOSPill label="Private" size="sm" variant="glass" /> : null}
        </View>
      </View>
      <View style={styles.actions}>
        <IconAction label="Done" onPress={() => onDone(item)}>
          <Check color={palette.success} size={16} />
        </IconAction>
        <IconAction label="Snooze" onPress={() => onSnooze(item)}>
          <Clock color={palette.warning} size={16} />
        </IconAction>
        <MoreHorizontal color={palette.softText} size={18} />
      </View>
    </Pressable>
  );
}

function IconAction({
  children,
  label,
  onPress,
}: {
  children: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.iconAction}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.xs,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
    minWidth: 0,
  },
  iconAction: {
    alignItems: "center",
    minHeight: 36,
    justifyContent: "center",
    minWidth: 36,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.xs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.xs,
  },
});
