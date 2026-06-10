import { type ReactNode } from "react";
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HealthScreenContainerProps = {
  bottomSpacing?: number;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  maxWidth?: number;
  topSpacing?: number;
};

export function HealthScreenContainer({
  bottomSpacing = 36,
  children,
  contentStyle,
  maxWidth = 480,
  topSpacing = 14
}: HealthScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        {
          maxWidth,
          paddingBottom: Math.max(insets.bottom, 20) + bottomSpacing,
          paddingTop: Math.max(insets.top, topSpacing)
        },
        contentStyle
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: 24,
    paddingHorizontal: 18,
    width: "100%"
  }
});
