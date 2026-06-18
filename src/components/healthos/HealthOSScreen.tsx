import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
  type HealthOSSurfaceName,
} from "@/theme/healthos";

type HealthOSScreenProps = {
  backgroundVariant?: Extract<HealthOSSurfaceName, "appBackground" | "screenSurface" | "aiSurface">;
  children: ReactNode;
  padded?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  testID?: string;
  title?: string;
  withBottomNavSpace?: boolean;
  withHeaderSpace?: boolean;
};

export function HealthOSScreen({
  backgroundVariant = "appBackground",
  children,
  padded = true,
  scroll = true,
  style,
  subtitle,
  testID,
  title,
  withBottomNavSpace = true,
  withHeaderSpace = false,
}: HealthOSScreenProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  const contentStyle: StyleProp<ViewStyle> = [
    styles.content,
    padded && styles.padded,
    withHeaderSpace && styles.headerSpace,
    withBottomNavSpace && styles.bottomNavSpace,
    style,
  ];

  const header = title || subtitle ? (
    <View style={styles.header}>
      {title ? (
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  ) : null;

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[healthOSLayout.scrollScreen, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {header}
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>
      {header}
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={[styles.flex, surfaces[backgroundVariant]]}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={healthOSSafeArea.keyboardOffset}
        style={styles.flex}
      >
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomNavSpace: {
    paddingBottom: healthOSSafeArea.bottomNavSpace,
  },
  content: {
    alignSelf: "center",
    maxWidth: healthOSLayout.screenMaxWidth,
    width: "100%",
  },
  flex: {
    flex: 1,
  },
  header: {
    gap: healthOSSpacing.xs,
    marginBottom: healthOSSpacing.lg,
  },
  headerSpace: {
    paddingTop: healthOSSafeArea.headerSpace,
  },
  padded: {
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSafeArea.screenTop,
  },
});
