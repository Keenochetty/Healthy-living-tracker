import {
  getHealthOSChartTheme,
  getHealthOSPalette,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSCalendarEventCategory } from "./HealthOSCalendarTypes";

export function getCalendarCategoryColor(
  category: HealthOSCalendarEventCategory,
  mode: HealthOSColorMode,
) {
  const palette = getHealthOSPalette(mode);
  const charts = getHealthOSChartTheme(mode);

  switch (category) {
    case "ai":
      return charts.calendarEventColors.ai;
    case "baby":
    case "child":
      return charts.calendarEventColors.baby;
    case "cycle":
      return palette.women;
    case "family":
      return charts.calendarEventColors.family;
    case "fitness":
      return charts.calendarEventColors.fitness;
    case "health":
    case "appointment":
      return palette.skyBlue;
    case "medication":
      return palette.warning;
    case "nutrition":
      return charts.calendarEventColors.nutrition;
    case "pregnancy":
      return palette.pregnancy;
    case "records":
      return charts.calendarEventColors.records;
    case "supplement":
      return palette.success;
    case "warning":
      return palette.danger;
    case "work":
      return palette.softText;
    case "personal":
    default:
      return palette.medication;
  }
}

export function formatCalendarDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatEventTime(isoDate?: string) {
  if (!isoDate) return "All day";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}
