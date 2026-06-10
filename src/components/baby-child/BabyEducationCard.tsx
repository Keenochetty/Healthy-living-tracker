import { StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

const ITEMS = ["Back to sleep", "Firm flat surface", "No loose blankets or toys", "Baby's own sleep space"];

export function BabyEducationCard() {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.card, { backgroundColor: isDark(theme.background) ? theme.surfaceSoft ?? theme.surface : "#fff0ed", borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={[styles.illustration, { backgroundColor: theme.primarySoft }]}>
          <View style={[styles.cribTop, { borderColor: theme.primary }]} />
          <View style={[styles.cribBase, { borderColor: theme.primary }]}>
            <AppIcon color={theme.primary} decorative name="sleep" size={28} />
          </View>
          <View style={[styles.star, { backgroundColor: theme.primary }]} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>Safe Sleep, Happy Baby</Text>
          <Text style={[styles.subtitle, { color: theme.mutedText }]}>A calm checklist for every sleep.</Text>
        </View>
      </View>
      <View style={styles.list}>
        {ITEMS.map((item) => (
          <View key={item} style={styles.item}>
            <AppIcon color={theme.success} decorative name="success" size={17} />
            <Text style={[styles.itemText, { color: theme.text }]}>{item}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.footer, { borderTopColor: theme.border, color: theme.mutedText }]}>
        For education only. Ask your pediatrician, clinic, nurse, or healthcare professional if unsure.
      </Text>
    </AppCard>
  );
}

function isDark(background: string) {
  return background.startsWith("#0") || background.startsWith("#1") || background.startsWith("rgb");
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  copy: { flex: 1 },
  cribBase: { alignItems: "center", borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, bottom: 14, height: 32, justifyContent: "center", position: "absolute", width: 50 },
  cribTop: { borderTopLeftRadius: 18, borderTopWidth: 2, height: 16, left: 12, position: "absolute", top: 15, width: 28 },
  footer: { borderTopWidth: 1, lineHeight: 19, marginTop: 16, paddingTop: 14 },
  header: { alignItems: "center", flexDirection: "row", gap: 14 },
  illustration: { alignItems: "center", borderRadius: 24, height: 72, justifyContent: "center", width: 72 },
  item: { alignItems: "center", flexDirection: "row", gap: 9 },
  itemText: { flex: 1, lineHeight: 20 },
  list: { gap: 10, marginTop: 18 },
  subtitle: { lineHeight: 20, marginTop: 4 },
  star: { borderRadius: 999, height: 6, position: "absolute", right: 13, top: 14, width: 6 },
  title: { fontSize: 20, fontWeight: "900" }
});
