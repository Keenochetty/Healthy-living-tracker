import { ScrollView, StyleSheet, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { AppIcon } from "@/components/ui/AppIcon";
import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSWomenLogType } from "./HealthOSWomenHealthTypes";

type Props = {
  onAskAI: () => void;
  onOpenQuickLog: (type: HealthOSWomenLogType) => void;
};

export function HealthOSWomenQuickActions({ onAskAI, onOpenQuickLog }: Props) {
  const actions: Array<{ icon: "calendar_timeline" | "warning" | "mood" | "privacy" | "contraception" | "note"; label: string; type: HealthOSWomenLogType }> = [
    { icon: "calendar_timeline", label: "Period", type: "period" },
    { icon: "warning", label: "Symptom", type: "symptom" },
    { icon: "mood", label: "Mood", type: "mood" },
    { icon: "privacy", label: "Sex", type: "sex" },
    { icon: "contraception", label: "Contraception", type: "contraception" },
    { icon: "note", label: "Note", type: "note" },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {actions.map((action) => (
          <HealthOSPill
            icon={<AppIcon decorative name={action.icon} size={16} variant="muted" />}
            key={action.label}
            label={action.label}
            onPress={() => onOpenQuickLog(action.type)}
            variant="glass"
          />
        ))}
        <HealthOSPill
          icon={<AppIcon decorative name="ai" size={16} variant="muted" />}
          label="Ask AI"
          onPress={onAskAI}
          variant="ai"
        />
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
