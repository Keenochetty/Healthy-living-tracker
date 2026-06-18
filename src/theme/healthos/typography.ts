import type { TextStyle } from "react-native";

import { healthOSTypographyScale } from "./tokens";

export const healthOSTypography = {
  display: {
    fontSize: healthOSTypographyScale.display,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  screenTitle: {
    fontSize: healthOSTypographyScale.screenTitle,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  sectionTitle: {
    fontSize: healthOSTypographyScale.sectionTitle,
    fontWeight: "700",
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  cardTitle: {
    fontSize: healthOSTypographyScale.cardTitle,
    fontWeight: "700",
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  body: {
    fontSize: healthOSTypographyScale.body,
    fontWeight: "400",
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: healthOSTypographyScale.bodySmall,
    fontWeight: "400",
    lineHeight: 19,
  },
  caption: {
    fontSize: healthOSTypographyScale.caption,
    fontWeight: "500",
    lineHeight: 16,
  },
  micro: {
    fontSize: healthOSTypographyScale.micro,
    fontWeight: "700",
    letterSpacing: 0.5,
    lineHeight: 13,
    textTransform: "uppercase",
  },
  statNumber: {
    fontSize: healthOSTypographyScale.statNumber,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  statLabel: {
    fontSize: healthOSTypographyScale.statLabel,
    fontWeight: "700",
    letterSpacing: 0.5,
    lineHeight: 14,
    textTransform: "uppercase",
  },
  buttonLabel: {
    fontSize: healthOSTypographyScale.buttonLabel,
    fontWeight: "700",
    lineHeight: 18,
  },
  tabLabel: {
    fontSize: healthOSTypographyScale.tabLabel,
    fontWeight: "700",
    lineHeight: 14,
  },
  chartLabel: {
    fontSize: healthOSTypographyScale.chartLabel,
    fontWeight: "700",
    lineHeight: 13,
  },
} satisfies Record<string, TextStyle>;
