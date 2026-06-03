import { Text, View } from "react-native";

type OnboardingProgressProps = {
  primaryColor?: string;
  step: number;
  totalSteps: number;
};

export function OnboardingProgress({
  primaryColor = "#8b5cf6",
  step,
  totalSteps
}: OnboardingProgressProps) {
  const progress = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "#64748b", fontWeight: "800" }}>
        Step {step} of {totalSteps}
      </Text>
      <View
        style={{
          backgroundColor: "#ede9fe",
          borderRadius: 999,
          height: 10,
          overflow: "hidden"
        }}
      >
        <View
          style={{
            backgroundColor: primaryColor,
            borderRadius: 999,
            height: "100%",
            width: `${progress}%` as `${number}%`
          }}
        />
      </View>
    </View>
  );
}
