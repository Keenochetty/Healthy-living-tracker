import { Href, router } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { formatCalendarDate } from "./calendarVisuals";
import type { HealthOSQuickLogAction } from "./HealthOSCalendarTypes";

type QuickAction = {
  action: HealthOSQuickLogAction;
  icon: AppIconName;
  label: string;
  route: Href;
};

const quickActions: QuickAction[] = [
  { action: "addEvent", icon: "calendar", label: "Add event", route: "/(tabs)/calendar" as Href },
  { action: "addMedication", icon: "medication", label: "Add medication", route: "/medication/add" as Href },
  { action: "logMeal", icon: "food", label: "Log meal", route: "/(tabs)/food" as Href },
  { action: "addWorkout", icon: "fitness", label: "Add workout", route: "/(tabs)/fitness" as Href },
  { action: "logSymptom", icon: "health", label: "Log symptom", route: "/health/general/notes" as Href },
  { action: "addBabyChildNote", icon: "child_baby", label: "Baby/child note", route: "/baby-child" as Href },
  { action: "addRecordReminder", icon: "records", label: "Record reminder", route: "/records" as Href },
  { action: "askAI", icon: "ai", label: "Ask AI", route: "/ai" as Href },
];

type HealthOSQuickLogSheetProps = {
  date: Date;
  onAction?: (action: HealthOSQuickLogAction) => void;
  onClose: () => void;
  testID?: string;
  visible: boolean;
};

export function HealthOSQuickLogSheet({
  date,
  onAction,
  onClose,
  testID,
  visible,
}: HealthOSQuickLogSheetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  function handleAction(action: QuickAction) {
    onAction?.(action.action);
    onClose();
    router.push(action.route);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, surfaces.glassPanel]} testID={testID}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                Quick log
              </Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {formatCalendarDate(date)}
              </Text>
            </View>
            <HealthOSPill label="Close" onPress={onClose} size="sm" variant="glass" />
          </View>
          <View style={styles.grid}>
            {quickActions.map((action) => (
              <HealthOSCard
                key={action.action}
                onPress={() => handleAction(action)}
                style={styles.actionCard}
                variant="compact"
              >
                <AppIcon color={palette.skyBlue} decorative name={action.icon} size={20} />
                <Text style={[healthOSTypography.buttonLabel, styles.actionText, { color: palette.inkText }]}>
                  {action.label}
                </Text>
              </HealthOSCard>
            ))}
          </View>
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            These actions route to existing screens only. This sheet does not create records directly.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    alignItems: "center",
    flexBasis: "47%",
    flexGrow: 1,
    gap: healthOSSpacing.sm,
    minHeight: 92,
  },
  actionText: {
    textAlign: "center",
  },
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.5)",
    borderRadius: 999,
    height: 4,
    width: 44,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: healthOSSpacing.md,
    paddingBottom: healthOSSafeArea.screenBottom + healthOSSpacing.lg,
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
});
