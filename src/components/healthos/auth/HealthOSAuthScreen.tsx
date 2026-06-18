import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { HeartPulse } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSLayout,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSAuthScreenProps = {
  children: ReactNode;
  subtitle?: string;
  testID?: string;
  title?: string;
};

export function HealthOSAuthScreen({
  children,
  subtitle = "Your private family health companion",
  testID,
  title = "HealthOS",
}: HealthOSAuthScreenProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <SafeAreaView style={[styles.safe, surfaces.appBackground]} testID={testID}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.safe}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <View style={[styles.mark, surfaces.glassPill]}>
              <HeartPulse color={palette.skyBlue} size={28} strokeWidth={2.4} />
            </View>
            <Text style={[healthOSTypography.display, { color: palette.inkText }]}>
              {title}
            </Text>
            <Text style={[healthOSTypography.bodySmall, styles.tagline, { color: palette.softText }]}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.content}>{children}</View>
          <Text style={[healthOSTypography.caption, styles.privacyNote, { color: palette.softText }]}>
            Private by default. You choose what to sync, share, or import.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brandBlock: {
    alignItems: "center",
    gap: healthOSSpacing.xs,
    marginBottom: healthOSSpacing.xl,
  },
  content: {
    alignSelf: "center",
    maxWidth: 390,
    width: "100%",
  },
  mark: {
    alignItems: "center",
    height: 58,
    justifyContent: "center",
    marginBottom: healthOSSpacing.xs,
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 58,
  },
  privacyNote: {
    alignSelf: "center",
    marginTop: healthOSSpacing.xl,
    maxWidth: healthOSLayout.contentMaxWidth,
    textAlign: "center",
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: healthOSSpacing.xl,
  },
  tagline: {
    maxWidth: 280,
    textAlign: "center",
  },
});
