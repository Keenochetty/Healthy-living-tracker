import { getHealthOSPalette, type HealthOSColorMode } from "./palette";

export type SegmentedRingChartSegment = {
  color?: string;
  id: string;
  label: string;
  value: number;
};

export type MiniSparklinePoint = {
  label?: string;
  timestamp?: string;
  value: number;
};

export type ProgressCircleConfig = {
  color?: string;
  label?: string;
  max: number;
  value: number;
};

export type MacroRingData = {
  carbs: number;
  fat: number;
  protein: number;
};

export type CalendarHeatmapCell = {
  date: string;
  intensity: 0 | 1 | 2 | 3 | 4;
  value?: number;
};

export type MuscleMapRegion = {
  id: string;
  intensity: number;
  label: string;
};

export type WellnessRadarAxis = {
  id: string;
  label: string;
  max: number;
  value: number;
};

export function createHealthOSChartTheme(mode: HealthOSColorMode = "light") {
  const palette = getHealthOSPalette(mode);
  const isDark = mode === "dark";

  return {
    background: isDark ? "rgba(15, 23, 42, 0.62)" : "rgba(255, 255, 255, 0.82)",
    gridLine: isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.28)",
    axisLabel: palette.softText,
    tooltipSurface: isDark ? palette.glassDark : palette.glassWhite,
    crosshair: palette.skyBlue,
    primaryLine: palette.skyBlue,
    secondaryLine: palette.family,
    areaFill: isDark ? "rgba(125, 211, 252, 0.16)" : "rgba(56, 189, 248, 0.14)",
    barFill: palette.skyBlue,
    ringTrack: isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.22)",
    ringSegments: [palette.skyBlue, palette.family, palette.fitness, palette.nutrition],
    macroColors: {
      carbs: palette.nutrition,
      fat: palette.warning,
      protein: palette.fitness,
    },
    muscleMapColors: {
      low: isDark ? "rgba(96, 165, 250, 0.22)" : "rgba(37, 99, 235, 0.16)",
      medium: palette.fitness,
      high: palette.skyBlue,
    },
    cycleColors: {
      follicular: palette.women,
      luteal: palette.pregnancy,
      menstrual: palette.danger,
      ovulation: palette.skyBlue,
    },
    pregnancyProgressColors: {
      current: palette.pregnancy,
      completed: palette.success,
      upcoming: palette.borderSubtle,
    },
    medicationAdherenceColors: {
      missed: palette.danger,
      scheduled: palette.warning,
      taken: palette.medication,
    },
    calendarEventColors: {
      ai: palette.ai,
      baby: palette.baby,
      family: palette.family,
      fitness: palette.fitness,
      medication: palette.medication,
      nutrition: palette.nutrition,
      records: palette.records,
    },
  } as const;
}

export const healthOSLightChartTheme = createHealthOSChartTheme("light");
export const healthOSDarkChartTheme = createHealthOSChartTheme("dark");

export const healthOSCharts = {
  dark: healthOSDarkChartTheme,
  light: healthOSLightChartTheme,
} as const;

export function getHealthOSChartTheme(mode: HealthOSColorMode = "light") {
  return mode === "dark" ? healthOSDarkChartTheme : healthOSLightChartTheme;
}
