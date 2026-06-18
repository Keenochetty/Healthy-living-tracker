import type { ViewStyle } from "react-native";

import { healthOSNavSizes, healthOSSafeArea, healthOSSpacing } from "./tokens";

export const healthOSLayout = {
  centeredScreen: {
    alignSelf: "center",
    maxWidth: 430,
    width: "100%",
  },
  scrollScreen: {
    flexGrow: 1,
    paddingBottom: healthOSSafeArea.bottomNavSpace,
  },
  tabScreenPadding: {
    paddingBottom: healthOSSafeArea.bottomNavSpace,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSafeArea.screenTop,
  },
  screenMaxWidth: 430,
  contentMaxWidth: 390,
  cardGap: healthOSSpacing.md,
  sectionGap: healthOSSpacing["2xl"],
  bottomNavOffset: healthOSNavSizes.bottomNavHeight + healthOSSpacing.xl,
  floatingHeaderOffset: healthOSSpacing.lg,
  safeBottomPadding: healthOSSafeArea.bottomNavSpace,
  widgetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.md,
  },
  twoColumnCompactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  heroSection: {
    gap: healthOSSpacing.md,
    marginBottom: healthOSSpacing["2xl"],
  },
  pageHeader: {
    gap: healthOSSpacing.xs,
    marginBottom: healthOSSpacing.lg,
  },
  realmHeader: {
    gap: healthOSSpacing.sm,
    marginBottom: healthOSSpacing.xl,
  },
  stickyWeekHeader: {
    paddingBottom: healthOSSpacing.sm,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSpacing.xs,
  },
} satisfies Record<string, ViewStyle | number>;
