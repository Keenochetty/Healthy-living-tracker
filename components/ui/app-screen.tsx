import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { layoutSpacing } from "@/constants/spacing";
import { layout } from "@/constants/layout";

type AppScreenProps = PropsWithChildren<{
  footer?: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}>;

export function AppScreen({ children, footer, scroll = true, style }: AppScreenProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = width < layout.breakpoints.phone ? layoutSpacing.screenPadding - 8 : layoutSpacing.screenPadding;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }, style]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentInner}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, { paddingHorizontal: horizontalPadding }, style]}>
      <View style={[styles.contentInner, styles.flex]}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      {content}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layoutSpacing.sectionGap,
    paddingBottom: layoutSpacing.screenPadding + layout.tabBarHeight,
    paddingTop: layoutSpacing.screenPadding
  },
  contentInner: {
    alignSelf: "center",
    gap: layoutSpacing.sectionGap,
    maxWidth: layout.contentMaxWidth,
    width: "100%"
  },
  flex: {
    flex: 1
  },
  footer: {
    backgroundColor: colors.background.app,
    borderTopColor: colors.border.soft,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: layoutSpacing.screenPadding
  },
  screen: {
    backgroundColor: colors.background.app,
    flex: 1
  }
});
