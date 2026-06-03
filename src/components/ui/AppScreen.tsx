import { ReactNode } from "react";
import { ScrollView, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppScreenProps = {
  backgroundColor?: string;
  children: ReactNode;
  padded?: boolean;
  safeBottom?: boolean;
  safeTop?: boolean;
  scroll?: boolean;
  style?: ViewStyle;
};

export function AppScreen({
  backgroundColor,
  children,
  padded = true,
  safeBottom = true,
  safeTop = true,
  scroll = true,
  style
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const contentStyle: ViewStyle = {
    gap: spacing.xl,
    paddingBottom: (safeBottom ? insets.bottom : 0) + 120,
    paddingHorizontal: padded ? spacing.xl : 0,
    paddingTop: (safeTop ? insets.top : 0) + spacing.lg,
    ...style
  };

  return (
    <View style={{ backgroundColor: backgroundColor ?? theme.background, flex: 1 }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      )}
    </View>
  );
}
