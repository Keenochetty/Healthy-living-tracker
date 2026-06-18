export const healthOSSpacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const healthOSRadius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  "2xl": 26,
  "3xl": 30,
  family: 26,
  fitness: 18,
  nutrition: 18,
  calendarCell: 12,
  pill: 999,
} as const;

export const healthOSBorderWidth = {
  hairline: 0.5,
  thin: 1,
  medium: 1.5,
  strong: 2,
} as const;

export const healthOSOpacity = {
  disabled: 0.42,
  pressed: 0.76,
  overlay: 0.58,
  glassLight: 0.82,
  glassDark: 0.78,
  subtle: 0.68,
} as const;

export const healthOSZIndex = {
  base: 0,
  raised: 10,
  sticky: 20,
  bottomNav: 40,
  sheet: 60,
  menu: 80,
  toast: 100,
} as const;

export const healthOSTypographyScale = {
  display: 30,
  screenTitle: 24,
  sectionTitle: 18,
  cardTitle: 16,
  body: 15,
  bodySmall: 13,
  caption: 12,
  micro: 10,
  statNumber: 28,
  statLabel: 11,
  buttonLabel: 14,
  tabLabel: 11,
  chartLabel: 10,
} as const;

export const healthOSCardSizes = {
  minCompactHeight: 72,
  minWidgetHeight: 108,
  minHeroHeight: 156,
  horizontalPadding: 16,
  verticalPadding: 14,
} as const;

export const healthOSNavSizes = {
  bottomNavHeight: 72,
  bottomNavWidthMax: 390,
  itemSize: 52,
  centerActionSize: 58,
  searchBarHeight: 52,
} as const;

export const healthOSHeaderSizes = {
  compactHeight: 48,
  standardHeight: 64,
  largeHeight: 88,
  iconButton: 44,
} as const;

export const healthOSWidgetSizes = {
  compact: 96,
  standard: 132,
  tall: 180,
  gridMinWidth: 148,
} as const;

export const healthOSBottomSheetSizes = {
  handleHeight: 24,
  cornerRadius: 28,
  compactSnap: "34%",
  mediumSnap: "58%",
  expandedSnap: "88%",
} as const;

export const healthOSTouchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

export const healthOSChartSizes = {
  miniSparklineHeight: 44,
  progressRingSmall: 52,
  progressRingMedium: 84,
  progressRingLarge: 132,
  barHeight: 8,
  tooltipMinWidth: 112,
} as const;

export const healthOSAvatarSizes = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
} as const;

export const healthOSIconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 30,
} as const;

export const healthOSSafeArea = {
  screenHorizontal: 16,
  screenTop: 8,
  screenBottom: 16,
  bottomNavSpace: 104,
  headerSpace: 10,
  keyboardOffset: 12,
} as const;

export const healthOSSafeAreaLayout = healthOSSafeArea;

export const healthOSTokens = {
  avatar: healthOSAvatarSizes,
  borderWidth: healthOSBorderWidth,
  bottomSheet: healthOSBottomSheetSizes,
  card: healthOSCardSizes,
  chart: healthOSChartSizes,
  header: healthOSHeaderSizes,
  icon: healthOSIconSizes,
  nav: healthOSNavSizes,
  opacity: healthOSOpacity,
  radius: healthOSRadius,
  safeArea: healthOSSafeArea,
  safeAreaLayout: healthOSSafeAreaLayout,
  spacing: healthOSSpacing,
  touchTarget: healthOSTouchTargets,
  typography: healthOSTypographyScale,
  widget: healthOSWidgetSizes,
  zIndex: healthOSZIndex,
} as const;
