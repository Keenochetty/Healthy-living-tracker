import { StyleSheet, Text, View } from "react-native";

export default function AssistantScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Assistant</Text>
      <Text style={styles.description}>
        Use the floating AI button in the bottom-right corner to open the in-app assistant panel.
      </Text>
      <Text style={styles.description}>
        This foundation only creates safe summaries and internal draft actions. OpenAI tools are not connected yet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24
  },
  description: {
    color: "#475569",
    fontSize: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "600"
  }
});
