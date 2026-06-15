import { StyleSheet } from "react-native";

import {
  healthLightTheme,
  healthRadius,
  healthShadows,
  type HealthColorTheme
} from "./healthTheme";

export function createFoundationStyles(theme: HealthColorTheme) {
  return StyleSheet.create({
    appScreen: {
      backgroundColor: theme.background,
      flex: 1
    },
    appPage: {
      alignSelf: "center",
      paddingBottom: 112,
      paddingHorizontal: 16,
      paddingTop: 16,
      width: "100%",
      maxWidth: 430
    },
    pageHeader: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      marginBottom: 20
    },
    pageKicker: {
      color: theme.mutedForeground,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 2.16,
      textTransform: "uppercase"
    },
    pageTitle: {
      color: theme.foreground,
      fontSize: 24,
      fontWeight: "700",
      letterSpacing: -0.96
    },
    pageSubtitle: {
      color: theme.mutedForeground,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4
    },
    softCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: healthRadius.card,
      borderWidth: 1,
      ...healthShadows.card
    },
    softCardFlat: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: healthRadius.card,
      borderWidth: 1
    },
    softPanel: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: healthRadius.panel,
      borderWidth: 1,
      padding: 16,
      ...healthShadows.soft
    },
    glassPanel: {
      backgroundColor: theme.surfaceGlass,
      borderColor: theme.border,
      borderRadius: healthRadius.panel,
      borderWidth: 1,
      ...healthShadows.floating
    },
    metricCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: healthRadius.card,
      borderWidth: 1,
      padding: 16,
      ...healthShadows.card
    },
    metricLabel: {
      color: theme.mutedForeground,
      fontSize: 12,
      fontWeight: "500"
    },
    metricValue: {
      color: theme.foreground,
      fontSize: 24,
      fontWeight: "700",
      letterSpacing: -0.96,
      marginTop: 8
    },
    metricUnit: {
      color: theme.mutedForeground,
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4
    },
    sectionTitleRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      marginBottom: 12
    },
    sectionTitle: {
      color: theme.foreground,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: -0.32
    },
    sectionAction: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "600"
    },
    realmChip: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: theme.muted,
      borderColor: theme.border,
      borderRadius: healthRadius.pill,
      borderWidth: 1,
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingVertical: 4
    },
    realmChipLabel: {
      color: theme.mutedForeground,
      fontSize: 12,
      fontWeight: "600"
    },
    quickActionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12
    },
    quickActionCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: healthRadius.card,
      borderWidth: 1,
      minHeight: 88,
      padding: 16,
      width: "48%"
    },
    pressed: {
      transform: [{ scale: 0.98 }]
    },
    bottomSafeSpace: {
      paddingBottom: 112
    }
  });
}

export const foundationStyles = createFoundationStyles(healthLightTheme);
