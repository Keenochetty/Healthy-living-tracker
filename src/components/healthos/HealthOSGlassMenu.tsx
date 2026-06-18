import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSpacing,
  healthOSTouchTargets,
  healthOSTypography,
  healthOSZIndex,
  type HealthOSColorMode,
} from "@/theme/healthos";

export type HealthOSGlassMenuItem = {
  closeOnPress?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  id?: string;
  key: string;
  label: string;
  onPress?: () => void;
  subtitle?: string;
};

type HealthOSGlassMenuProps = {
  anchor?: { x: number; y: number };
  infoBody?: string;
  infoTips?: string[];
  infoTitle?: string;
  items: HealthOSGlassMenuItem[];
  mode: "info" | "menu";
  onClose: () => void;
  testID?: string;
  visible: boolean;
};

export function HealthOSGlassMenu({
  anchor,
  infoBody,
  infoTips,
  infoTitle,
  items,
  mode,
  onClose,
  testID,
  visible,
}: HealthOSGlassMenuProps) {
  const colorMode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(colorMode);
  const surfaces = getHealthOSSurfaces(colorMode);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.menu,
            surfaces.glassMenu,
            anchor ? { left: anchor.x, top: anchor.y } : styles.centered,
          ]}
          testID={testID}
        >
          {mode === "info" ? (
            <View style={styles.info}>
              {infoTitle ? (
                <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                  {infoTitle}
                </Text>
              ) : null}
              {infoBody ? (
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  {infoBody}
                </Text>
              ) : null}
              {infoTips?.map((tip) => (
                <Text
                  key={tip}
                  style={[healthOSTypography.caption, { color: palette.softText }]}
                >
                  - {tip}
                </Text>
              ))}
            </View>
          ) : (
            items.map((item) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: item.disabled }}
                disabled={item.disabled}
                key={item.id ?? item.key}
                onPress={() => {
                  item.onPress?.();
                  if (item.closeOnPress !== false) {
                    onClose();
                  }
                }}
                style={({ pressed }) => [
                  styles.item,
                  pressed && { opacity: 0.72 },
                  item.disabled && { opacity: 0.4 },
                ]}
              >
                {item.icon ? <View style={styles.itemIcon}>{item.icon}</View> : null}
                <View style={styles.itemText}>
                  <Text
                    style={[
                      healthOSTypography.buttonLabel,
                      { color: item.destructive ? palette.danger : palette.inkText },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.subtitle ? (
                    <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.18)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: healthOSZIndex.menu,
  },
  centered: {
    alignSelf: "center",
    marginTop: 120,
  },
  info: {
    gap: healthOSSpacing.sm,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    minHeight: healthOSTouchTargets.comfortable,
    paddingHorizontal: healthOSSpacing.sm,
    paddingVertical: healthOSSpacing.sm,
  },
  itemIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
  },
  itemText: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  menu: {
    maxWidth: 320,
    minWidth: 236,
    position: "absolute",
  },
});
