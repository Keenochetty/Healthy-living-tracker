import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ChildCard } from "@/components/children/child-card";
import {
  getCaregiverChildProfile,
  type CaregiverChildAccess,
  type ChildProfile,
} from "@/lib/children";

export default function CaregiverChildDetailScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [access, setAccess] = useState<CaregiverChildAccess | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadChild = useCallback(async () => {
    if (!childId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getCaregiverChildProfile(childId);
      setChild(result.child);
      setAccess(result.access);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load caregiver child view.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      loadChild();
    }, 0);

    return () => {
      clearTimeout(loadTimer);
    };
  }, [loadChild]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Caregiver child view</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {child ? <ChildCard child={child} isCaregiverView /> : null}

      {access ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approved caregiver fields</Text>
          <Text>
            Care instructions:{" "}
            {access.can_view_care_instructions ? "Approved" : "Hidden"}
          </Text>
          <Text>
            Today schedule: {access.can_view_schedule ? "Approved" : "Hidden"}
          </Text>
          <Text>
            Emergency contact:{" "}
            {access.can_use_emergency_button ? "Approved" : "Hidden"}
          </Text>
          <Text>
            Caregiver access status: {access.is_active ? "Active" : "Inactive"}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  container: {
    gap: 16,
    padding: 24,
  },
  error: {
    color: "#b91c1c",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
});
