import { ScrollView, StyleSheet, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

type HealthOSFitnessQuickActionsProps = {
  onAddExercise: () => void;
  onBuildPlan: () => void;
  onLogRun: () => void;
  onScanMachine: () => void;
  onShareProgress: () => void;
  onStartWorkout: () => void;
  onViewProgress: () => void;
};

export function HealthOSFitnessQuickActions({
  onAddExercise,
  onBuildPlan,
  onLogRun,
  onScanMachine,
  onShareProgress,
  onStartWorkout,
  onViewProgress,
}: HealthOSFitnessQuickActionsProps) {
  const actions = [
    { icon: "fitness" as const, label: "Start workout", onPress: onStartWorkout },
    { icon: "add" as const, label: "Build plan", onPress: onBuildPlan },
    { icon: "scan" as const, label: "Scan machine", onPress: onScanMachine },
    { icon: "add" as const, label: "Add exercise", onPress: onAddExercise },
    { icon: "calendar_timeline" as const, label: "Log run", onPress: onLogRun },
    { icon: "biometrics" as const, label: "Progress", onPress: onViewProgress },
    { icon: "shared" as const, label: "Share", onPress: onShareProgress },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {actions.map((action) => (
          <HealthOSPill
            icon={<AppIcon decorative name={action.icon} size={16} variant="muted" />}
            key={action.label}
            label={action.label}
            onPress={action.onPress}
            variant="glass"
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});

