export const layout = {
  breakpoints: {
    compactPhone: 370,
    phone: 480,
    tablet: 768,
    desktop: 1024,
  },
  contentMaxWidth: 980,
  minTapTarget: 44,
  tabBarHeight: 72,
  floatingActionBottomOffset: 92,
  screen: {
    paddingHorizontal: 18,
    compactPaddingHorizontal: 16,
    paddingTop: 18,
    bottomClearance: 148,
  },
  card: {
    padding: 14,
    compactPadding: 12,
    minMetricHeight: 108,
  },
  header: {
    actionSize: 40,
    avatarSize: 42,
    compactAvatarSize: 30,
  },
  navigation: {
    barHeight: 64,
    itemHeight: 48,
    horizontalInset: 18,
    bottomInset: 22,
  },
  aiBar: {
    height: 50,
    horizontalInset: 18,
    bottomOffset: 86,
  },
  chart: {
    progressRing: 96,
    progressRingSmall: 60,
    donut: 84,
    sparklineHeight: 54,
  },
} as const;

export const componentMetrics = {
  aiBar: layout.aiBar,
  card: layout.card,
  charts: layout.chart,
  header: layout.header,
  navigation: layout.navigation,
  screen: layout.screen,
} as const;
