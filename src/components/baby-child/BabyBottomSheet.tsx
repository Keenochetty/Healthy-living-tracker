import { useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme/ThemeProvider";

export function BabyBottomSheet({
  children,
  onClose,
  onSave,
  saveTitle,
  subtitle,
  title,
  visible
}: {
  children: ReactNode;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  saveTitle: string;
  subtitle?: string;
  title: string;
  visible: boolean;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [isSaving, setIsSaving] = useState(false);

  function close() {
    if (isSaving) return;
    Keyboard.dismiss();
    onClose();
  }

  async function save() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={close} statusBarTranslucent transparent visible={visible}>
      <View style={styles.modal}>
        <Pressable accessibilityLabel="Close quick log" accessibilityRole="button" onPress={close} style={styles.scrim} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          pointerEvents="box-none"
          style={styles.keyboard}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                maxHeight: height * 0.9
              }
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                {subtitle ? <Text style={[styles.subtitle, { color: theme.mutedText }]}>{subtitle}</Text> : null}
              </View>
              <Pressable
                accessibilityLabel="Close quick input"
                accessibilityRole="button"
                disabled={isSaving}
                onPress={close}
                style={({ pressed }) => [styles.close, { backgroundColor: theme.primarySoft }, pressed ? styles.pressed : null]}
              >
                <Text style={[styles.closeText, { color: theme.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.body}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            <View
              style={[
                styles.footer,
                {
                  backgroundColor: theme.surface,
                  borderTopColor: theme.border,
                  paddingBottom: Math.max(insets.bottom, 12) + 8
                }
              ]}
            >
              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={close}
                style={({ pressed }) => [styles.cancel, { borderColor: theme.border }, pressed ? styles.pressed : null]}
              >
                <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={save}
                style={({ pressed }) => [
                  styles.save,
                  { backgroundColor: theme.primary },
                  pressed ? styles.pressed : null,
                  isSaving ? styles.saving : null
                ]}
              >
                <Text style={styles.saveText}>{isSaving ? "Saving..." : saveTitle}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 18 },
  cancel: { alignItems: "center", borderRadius: 18, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 50, paddingHorizontal: 14 },
  cancelText: { fontWeight: "900" },
  close: { alignItems: "center", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  closeText: { fontSize: 15, fontWeight: "900" },
  footer: { borderTopWidth: 1, flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  handle: { alignSelf: "center", borderRadius: 999, height: 4, marginTop: 10, width: 46 },
  header: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", gap: 12, paddingBottom: 14, paddingHorizontal: 20, paddingTop: 12 },
  headerCopy: { flex: 1 },
  keyboard: { flex: 1, justifyContent: "flex-end" },
  modal: { flex: 1, justifyContent: "flex-end" },
  pressed: { opacity: 0.76 },
  save: { alignItems: "center", borderRadius: 18, flex: 1.5, justifyContent: "center", minHeight: 50, paddingHorizontal: 14 },
  saveText: { color: "#ffffff", fontWeight: "900" },
  saving: { opacity: 0.65 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(15,23,42,0.58)" },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, overflow: "hidden" },
  subtitle: { lineHeight: 19, marginTop: 3 },
  title: { fontSize: 20, fontWeight: "900" }
});
