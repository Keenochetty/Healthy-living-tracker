import { StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getHealthOSSurfaces,
  healthOSNavSizes,
  healthOSSpacing,
  healthOSZIndex,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSNavItem } from "./HealthOSNavItem";
import { healthOSNavItems, type HealthOSNavKey, type HealthOSNavItemConfig } from "./healthOSNavConfig";

type HealthOSFloatingNavProps = {
  activeKey?: HealthOSNavKey;
  compressed?: boolean;
  hidden?: boolean;
  onNavigate: (item: HealthOSNavItemConfig) => void;
  testID?: string;
};

export function HealthOSFloatingNav({
  activeKey = "home",
  compressed = false,
  hidden = false,
  onNavigate,
  testID,
}: HealthOSFloatingNavProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const surfaces = getHealthOSSurfaces(mode);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  if (hidden) return null;

  const navWidth = Math.min(width - healthOSSpacing.lg * 2, healthOSNavSizes.bottomNavWidthMax);

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View
        style={[
          styles.nav,
          surfaces.glassMenu,
          {
            bottom: insets.bottom + 10,
            height: compressed ? 60 : 68,
            width: navWidth,
          },
        ]}
        testID={testID}
      >
        {healthOSNavItems.map((item) => (
          <HealthOSNavItem
            active={activeKey === item.key}
            item={item}
            key={item.key}
            onPress={() => onNavigate(item)}
            testID={`healthos-nav-${item.key}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 8,
    position: "absolute",
  },
  overlay: {
    alignItems: "center",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: healthOSZIndex.bottomNav,
  },
});
