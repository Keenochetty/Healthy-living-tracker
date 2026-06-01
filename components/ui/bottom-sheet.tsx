import type { PropsWithChildren, ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { componentRadius } from "@/constants/radius";
import { layoutSpacing, spacing } from "@/constants/spacing";
import { colors, shadows } from "@/constants/theme";

type BottomSheetProps = PropsWithChildren<{
  footer?: ReactNode;
  onClose: () => void;
  title?: string;
  visible: boolean;
}>;

export function BottomSheet({ children, footer, onClose, title, visible }: BottomSheetProps) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <View style={styles.content}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  content: {
    gap: spacing.lg
  },
  footer: {
    borderTopColor: colors.border.soft,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.lg
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border.strong,
    borderRadius: 999,
    height: 5,
    marginBottom: spacing.lg,
    width: layoutSpacing.bottomSheetHandleWidth
  },
  overlay: {
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    flex: 1,
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: colors.background.warm,
    borderTopLeftRadius: componentRadius.bottomSheet,
    borderTopRightRadius: componentRadius.bottomSheet,
    gap: spacing.lg,
    maxHeight: "86%",
    padding: layoutSpacing.screenPadding,
    ...shadows.card
  },
  title: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "800"
  }
});
