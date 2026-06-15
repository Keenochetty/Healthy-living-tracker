import type { PropsWithChildren, ReactNode } from "react";
import {
  ScrollView,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { layout } from "@/constants/layout";
import { layoutSpacing } from "@/constants/spacing";
import { useHealthTheme } from "@/constants/theme";

type AppScreenProps = PropsWithChildren<{
  footer?: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}>;

export function AppScreen({
  children,
  footer,
  scroll = true,
  style,
}: AppScreenProps) {
  const { width } = useWindowDimensions();
  const { colors } = useHealthTheme();
  const horizontalPadding =
    width < layout.breakpoints.phone
      ? layoutSpacing.compactScreenPadding
      : layoutSpacing.screenPadding;
  const contentStyle: ViewStyle = {
    flex: scroll ? undefined : 1,
    gap: layoutSpacing.sectionGap,
    paddingBottom: layout.screen.bottomClearance,
    paddingHorizontal: horizontalPadding,
    paddingTop: layout.screen.paddingTop,
  };

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[contentStyle, style]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentInner}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[contentStyle, style]}>
      <View style={[styles.contentInner, styles.flex]}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background.app, flex: 1 }}
    >
      {content}
      {footer ? (
        <View
          style={{
            backgroundColor: colors.background.app,
            borderTopColor: colors.border.soft,
            borderTopWidth: 1,
            padding: layoutSpacing.screenPadding,
          }}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = {
  contentInner: {
    alignSelf: "center",
    gap: layoutSpacing.sectionGap,
    maxWidth: layout.contentMaxWidth,
    width: "100%",
  } satisfies ViewStyle,
  flex: {
    flex: 1,
  } satisfies ViewStyle,
};
