import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Button, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { ChildCard } from "@/components/children/child-card";
import {
  activityTypes,
  createActivityLog,
  listActivityLogsForChild,
  type ActivityLog,
  type ActivityType
} from "@/lib/activity-logs";
import {
  canCreateOrEditChildProfiles,
  getChildProfile,
  grantCaregiverAccessToChild,
  updateChildProfile,
  type ChildProfile
} from "@/lib/children";
import { useProfileContext } from "@/lib/profile-context";

export default function ChildDetailScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { profile, selectedFamily } = useProfileContext();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [caregiverEmail, setCaregiverEmail] = useState("");
  const [canViewCareInstructions, setCanViewCareInstructions] = useState(true);
  const [canViewSchedule, setCanViewSchedule] = useState(true);
  const [canLogActivity, setCanLogActivity] = useState(true);
  const [canUploadPhotos, setCanUploadPhotos] = useState(false);
  const [canUseEmergencyButton, setCanUseEmergencyButton] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityType, setActivityType] = useState<ActivityType>("activity");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityNote, setActivityNote] = useState("");
  const [shareWithCaregiver, setShareWithCaregiver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const canEdit = canCreateOrEditChildProfiles(profile, selectedFamily);

  const loadChild = useCallback(async () => {
    if (!childId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextChild, nextLogs] = await Promise.all([
        getChildProfile(childId),
        listActivityLogsForChild(childId)
      ]);
      setChild(nextChild);
      setActivityLogs(nextLogs);
      setFirstName(nextChild.first_name);
      setLastName(nextChild.last_name ?? "");
      setDateOfBirth(nextChild.date_of_birth ?? "");
      setGender(nextChild.gender ?? "");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load child profile.");
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

  async function handleSave() {
    if (!childId) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const nextChild = await updateChildProfile(childId, {
        dateOfBirth,
        firstName,
        gender,
        lastName
      });
      setChild(nextChild);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update child profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGrantCaregiverAccess() {
    if (!childId) {
      return;
    }

    setIsGrantingAccess(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      await grantCaregiverAccessToChild({
        caregiverEmail,
        canLogActivity,
        canUploadPhotos,
        canUseEmergencyButton,
        canViewCareInstructions,
        canViewSchedule,
        childId
      });
      setCaregiverEmail("");
      setNotice("Caregiver access granted.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to grant caregiver access.");
    } finally {
      setIsGrantingAccess(false);
    }
  }

  async function handleCreateActivityLog() {
    if (!child || !canEdit) {
      return;
    }

    setIsCreatingActivity(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const log = await createActivityLog({
        activityType,
        childId: child.id,
        familyId: child.family_id,
        isSharedWithCaregiver: shareWithCaregiver,
        isSharedWithParents: true,
        note: activityNote,
        notificationType: activityType === "emergency" ? "red_emergency" : "green_normal_update",
        title: activityTitle
      });
      setActivityLogs((currentLogs) => [log, ...currentLogs]);
      setActivityTitle("");
      setActivityNote("");
      setShareWithCaregiver(false);
      setNotice("Activity log created.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create activity log.");
    } finally {
      setIsCreatingActivity(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Child profile</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {child ? <ChildCard child={child} /> : <Text>Child profile not found.</Text>}

      {child && canEdit ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit child profile</Text>
          <TextInput onChangeText={setFirstName} placeholder="First name" style={styles.input} value={firstName} />
          <TextInput onChangeText={setLastName} placeholder="Last name" style={styles.input} value={lastName} />
          <TextInput
            onChangeText={setDateOfBirth}
            placeholder="Date of birth, YYYY-MM-DD"
            style={styles.input}
            value={dateOfBirth}
          />
          <TextInput onChangeText={setGender} placeholder="Gender" style={styles.input} value={gender} />
          {isSaving ? <ActivityIndicator /> : <Button onPress={handleSave} title="Save child profile" />}
        </View>
      ) : (
        <Text style={styles.muted}>Only parents/guardians with family permission can edit child profiles.</Text>
      )}

      {child && canEdit ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add activity log</Text>
          <View style={styles.optionGroup}>
            {activityTypes.map((type) => (
              <Button
                key={type}
                onPress={() => setActivityType(type)}
                title={`${activityType === type ? "Selected: " : ""}${type.replaceAll("_", " ")}`}
              />
            ))}
          </View>
          <TextInput
            onChangeText={setActivityTitle}
            placeholder="Activity title"
            style={styles.input}
            value={activityTitle}
          />
          <TextInput
            multiline
            onChangeText={setActivityNote}
            placeholder="Note"
            style={styles.input}
            value={activityNote}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Share with caregiver</Text>
            <Switch onValueChange={setShareWithCaregiver} value={shareWithCaregiver} />
          </View>
          {isCreatingActivity ? (
            <ActivityIndicator />
          ) : (
            <Button onPress={handleCreateActivityLog} title="Create activity log" />
          )}
        </View>
      ) : null}

      {child && canEdit ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grant caregiver access</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setCaregiverEmail}
            placeholder="Caregiver email"
            style={styles.input}
            value={caregiverEmail}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Can view care instructions</Text>
            <Switch onValueChange={setCanViewCareInstructions} value={canViewCareInstructions} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Can view schedule</Text>
            <Switch onValueChange={setCanViewSchedule} value={canViewSchedule} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Can log activity</Text>
            <Switch onValueChange={setCanLogActivity} value={canLogActivity} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Can upload photos</Text>
            <Switch onValueChange={setCanUploadPhotos} value={canUploadPhotos} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Can use emergency button</Text>
            <Switch onValueChange={setCanUseEmergencyButton} value={canUseEmergencyButton} />
          </View>
          {isGrantingAccess ? (
            <ActivityIndicator />
          ) : (
            <Button onPress={handleGrantCaregiverAccess} title="Grant caregiver access" />
          )}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity logs</Text>
        {activityLogs.length === 0 ? <Text style={styles.muted}>No activity logs yet.</Text> : null}
        {activityLogs.map((log) => (
          <View key={log.id} style={styles.logCard}>
            <Text style={styles.logTitle}>{log.title}</Text>
            <Text>{log.activity_type.replaceAll("_", " ")}</Text>
            {log.note ? <Text>{log.note}</Text> : null}
            <Text style={styles.muted}>{new Date(log.created_at).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  container: {
    gap: 16,
    padding: 24
  },
  error: {
    color: "#b91c1c"
  },
  input: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  muted: {
    color: "#64748b"
  },
  notice: {
    color: "#166534"
  },
  section: {
    gap: 12
  },
  logCard: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12
  },
  logTitle: {
    fontWeight: "600"
  },
  optionGroup: {
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600"
  },
  switchLabel: {
    flex: 1
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "600"
  }
});
