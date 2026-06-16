import { Text, type TextRootProps } from "heroui-native/text";
import { twMerge } from "tailwind-merge";

export type AppTextVariant =
  | "display"
  | "title"
  | "subtitle"
  | "heading"
  | "body"
  | "bodyMuted"
  | "caption"
  | "label"
  | "danger"
  | "success";

export type AppTextProps = TextRootProps & {
  className?: string;
  variant?: AppTextVariant;
};

const variantClasses: Record<AppTextVariant, string> = {
  display: "text-4xl font-bold leading-tight",
  title: "text-3xl font-bold leading-tight",
  subtitle: "text-xl font-semibold leading-snug",
  heading: "text-xl font-semibold leading-snug",
  body: "text-base leading-relaxed",
  bodyMuted: "text-base leading-relaxed text-muted",
  caption: "text-sm leading-normal text-muted",
  label: "text-sm font-semibold leading-normal",
  danger: "text-sm font-medium text-danger",
  success: "text-sm font-medium text-success",
};

export function AppText({
  className,
  variant = "body",
  ...props
}: AppTextProps) {
  return (
    <Text
      className={twMerge(variantClasses[variant], className)}
      {...props}
    />
  );
}
