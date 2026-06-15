import { Text, View } from "react-native";
import { useAppTheme } from "@/theme/ThemeProvider";

type OnboardingProgressProps = {
  primaryColor?: string;
  step: number;
  totalSteps: number;
};

export function OnboardingProgress({
  primaryColor,
  step,
  totalSteps,
}: OnboardingProgressProps) {
  const { theme } = useAppTheme();
  const progress = Math.min(100, Math.max(0, (step / totalSteps) * 100));
  const accent = primaryColor ?? theme.primary;

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: theme.mutedText, fontWeight: "800" }}>
        Step {step} of {totalSteps}
      </Text>
      <View
        style={{
          backgroundColor: theme.primarySoft,
          borderRadius: 999,
          height: 8,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            backgroundColor: accent,
            borderRadius: 999,
            height: "100%",
            width: `${progress}%` as `${number}%`,
          }}
        />
      </View>
    </View>
  );
}
