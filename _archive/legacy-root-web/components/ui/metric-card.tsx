import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/app-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { spacing } from "@/constants/spacing";
import { typography, useHealthTheme } from "@/constants/theme";

type MetricCardProps = {
  accentColor?: string;
  delta?: string;
  label: string;
  progress?: number;
  unit?: string;
  value: string;
};

export function MetricCard({
  accentColor,
  delta,
  label,
  progress,
  unit,
  value,
}: MetricCardProps) {
  const { colors } = useHealthTheme();

  return (
    <AppCard accentColor={accentColor} variant="compact">
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: spacing.md,
          justifyContent: "space-between",
          minHeight: 84,
        }}
      >
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text
            style={{
              color: colors.text.muted,
              textTransform: "uppercase",
              ...typography.kicker,
            }}
          >
            {label}
          </Text>
          <Text style={{ color: colors.text.primary, ...typography.metric }}>
            {value}
            {unit ? (
              <Text
                style={{
                  color: colors.text.secondary,
                  ...typography.bodySmall,
                }}
              >
                {unit}
              </Text>
            ) : null}
          </Text>
          {delta ? (
            <Text
              style={{
                color: accentColor ?? colors.brand.primary,
                ...typography.caption,
              }}
            >
              {delta}
            </Text>
          ) : null}
        </View>
        {progress !== undefined ? (
          <ProgressRing
            color={accentColor}
            progress={progress}
            size={60}
            strokeWidth={7}
          />
        ) : null}
      </View>
    </AppCard>
  );
}
