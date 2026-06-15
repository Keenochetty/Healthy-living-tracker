import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

import { theme } from "@/constants/themes";

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
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        color ? { color } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

const variants: Record<AppTextVariant, TextStyle> = {
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
};

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text,
  },
  ...variants,
});
