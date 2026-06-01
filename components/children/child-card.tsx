import { Button, StyleSheet, Text, View } from "react-native";

import { getChildAge, getChildFullName, type ChildProfile } from "@/lib/children";

type ChildCardProps = {
  child: ChildProfile;
  isCaregiverView?: boolean;
  onOpen?: () => void;
};

export function ChildCard({ child, isCaregiverView = false, onOpen }: ChildCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{getChildFullName(child)}</Text>
      <Text>{getChildAge(child.date_of_birth)}</Text>

      <View style={styles.details}>
        <Text>Allergies: {isCaregiverView ? "Approved allergies only" : "None added yet"}</Text>
        {!isCaregiverView ? <Text>Conditions: None added yet</Text> : null}
        <Text>
          Emergency contact: {isCaregiverView ? "Shown if approved" : "Not added yet"}
        </Text>
        <Text>Today schedule: No schedule added yet</Text>
        <Text>Caregiver access status: {isCaregiverView ? "Active approved access" : "Not configured"}</Text>
      </View>

      {onOpen ? <Button onPress={onOpen} title="Open child profile" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12
  },
  details: {
    gap: 4
  },
  name: {
    fontSize: 18,
    fontWeight: "600"
  }
});
