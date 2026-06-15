import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

import { typography } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppTextVariant = "body" | "caption" | "eyebrow" | "heading" | "title";

type AppTextProps = TextProps & {
  color?: string;
  variant?: AppTextVariant;
};

export function AppText({
  color,
  style,
  variant = "body",
  ...props
}: AppTextProps) {
  const { theme } = useAppTheme();

  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { color: color ?? theme.text },
        style,
      ]}
      {...props}
    />
  );
}

const variants: Record<AppTextVariant, TextStyle> = {
  body: typography.body,
  caption: typography.caption,
  eyebrow: {
    ...typography.caption,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heading: typography.sectionTitle,
  title: typography.screenTitle,
};

const styles = StyleSheet.create({
  base: {},
  ...variants,
});
