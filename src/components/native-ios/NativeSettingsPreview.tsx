import { View } from "react-native";

import { AppText } from "@/components/ui-native/AppText";

export function NativeSettingsPreview() {
  return (
    <View className="gap-2 rounded-2xl border border-border bg-default p-4">
      <AppText variant="heading">Native settings preview</AppText>
      <AppText color="muted" variant="caption">
        Expo UI SwiftUI is available on iOS. This platform uses the React Native
        fallback.
      </AppText>
    </View>
  );
}
