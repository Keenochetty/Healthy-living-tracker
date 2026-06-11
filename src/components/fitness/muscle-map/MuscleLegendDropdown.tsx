import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const LEGEND_ITEMS = [
  { color: "#e5e7eb", label: "Grey", text: "Not targeted or no recent activity." },
  { color: "#fed7aa", label: "Peach", text: "Lightly involved." },
  { color: "#f97316", label: "Orange", text: "Secondary or moderate usage." },
  { color: "#dc2626", label: "Red", text: "Primary muscle or high usage." },
  { color: "#7f1d1d", label: "Dark red", text: "High recent load. Recovery may need attention." },
  { color: "#2563eb", label: "Blue outline", text: "Suggested muscle group to train next." },
  { color: "#7c3aed", label: "Purple outline", text: "Safety caution or restricted movement." }
];

export function MuscleLegendDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((current) => !current)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>What do the colors mean?</Text>
        <Text style={styles.chevron}>{open ? "\u2212" : "+"}</Text>
      </Pressable>

      {open ? (
        <View style={styles.panel}>
          {LEGEND_ITEMS.map((item) => (
            <View key={item.label} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <View style={styles.copy}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.text}>{item.text}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.note}>
            This map is general fitness guidance. It does not diagnose pain or injury.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  buttonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "800"
  },
  chevron: {
    color: "#475569",
    fontSize: 18,
    fontWeight: "900"
  },
  copy: {
    flex: 1,
    gap: 2
  },
  dot: {
    borderColor: "#cbd5e1",
    borderRadius: 7,
    borderWidth: 1,
    height: 14,
    marginTop: 3,
    width: 14
  },
  label: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800"
  },
  note: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 4
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  text: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17
  },
  wrap: {
    gap: 8
  }
});
