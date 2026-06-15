import { Text, View } from "react-native";

import { AppCard } from "@/components/ui";
import {
  appColors,
  appRadius,
  appShadows,
  appSpacing,
  typography,
} from "@/theme/designSystem";

type BottomSheetProps = {
  children: React.ReactNode;
  title: string;
};

export function BottomSheet({ children, title }: BottomSheetProps) {
  return (
    <View
      style={{
        backgroundColor: appColors.surface,
        borderTopLeftRadius: appRadius["2xl"],
        borderTopRightRadius: appRadius["2xl"],
        gap: appSpacing.md,
        padding: appSpacing.xl,
        ...appShadows.floating,
      }}
    >
      <View
        style={{
          alignSelf: "center",
          backgroundColor: appColors.border,
          borderRadius: appRadius.pill,
          height: 4,
          width: 42,
        }}
      />
      <Text style={[typography.sectionTitle, { color: appColors.text }]}>
        {title}
      </Text>
      <AppCard variant="soft">{children}</AppCard>
    </View>
  );
}
