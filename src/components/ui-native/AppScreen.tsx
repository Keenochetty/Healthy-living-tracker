import type { ReactNode } from "react";
import { ScrollView, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";

export type AppScreenProps = ViewProps & {
  centered?: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  padded?: boolean;
  scroll?: boolean;
};

export function AppScreen({
  centered = true,
  children,
  className,
  contentClassName,
  padded = true,
  scroll = true,
  ...props
}: AppScreenProps) {
  const contentClasses = twMerge(
    "w-full gap-6",
    centered && "max-w-3xl self-center",
    padded && "px-5",
    contentClassName,
  );

  return (
    <SafeAreaView
      className={twMerge("flex-1 bg-background", className)}
      edges={["top", "right", "bottom", "left"]}
      {...props}
    >
      {scroll ? (
        <ScrollView
          contentContainerClassName="grow py-5 pb-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className={contentClasses}>{children}</View>
        </ScrollView>
      ) : (
        <View className={twMerge("flex-1 py-5", contentClasses)}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
