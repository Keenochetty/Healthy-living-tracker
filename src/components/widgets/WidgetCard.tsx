import { ReactNode } from "react";
import type { AppIconName } from "@/constants/appIcons";
import { AppWidgetCard } from "@/components/ui";

type WidgetCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  iconName?: AppIconName;
  backgroundColor?: string;
  variant?: "pink" | "blue" | "green" | "purple" | "orange" | "yellow" | "neutral" | "dark";
};

export function WidgetCard({
  title,
  value,
  helper,
  icon,
  iconName,
  variant = "neutral"
}: WidgetCardProps) {
  return <AppWidgetCard helper={helper} icon={icon} iconName={iconName} title={title} value={value} variant={variant} />;
}
