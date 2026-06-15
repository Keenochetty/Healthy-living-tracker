import * as ImagePicker from "expo-image-picker";
import { Href, router, useFocusEffect } from "expo-router";
import {
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import {
  AppAvatar,
  AppButton,
  AppCard,
  AppChip,
  AppFormInput,
  AppSection,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  getProfileContactDetails,
  removeProfileAvatar,
  saveProfileContactDetails,
  updateAccountEmail,
  uploadProfileAvatar,
} from "@/lib/profileContactStorage";
import type {
  EmergencyContact,
  ProfileContactDetails,
  PreferredContactMethod,
} from "@/types/profileContact";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function ProfileContactScreen() {
  const { refreshProfile, user } = useAuth();
  const { theme } = useAppTheme();
  const [details, setDetails] = useState<ProfileContactDetails | null>(null);
  const [email, setEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setDetails(await getProfileContactDetails());
    setEmail(user?.email ?? "");
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function choosePhoto(source: "camera" | "library") {
    setError("");
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        `${source === "camera" ? "Camera" : "Photo library"} permission was denied. You can allow it in system settings.`,
      );
      return;
    }
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.75,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.75,
          });
    const asset = result.canceled ? null : result.assets[0];
    if (asset && details)
      setDetails({ ...details, avatarPreviewUri: asset.uri });
  }

  async function save() {
    if (!details) return;
    if (!details.fullName.trim() || !details.displayName.trim()) {
      setError("Full name and display name are required.");
      return;
    }
    if (
      details.emergencyContacts.some(
        (contact) => !contact.name.trim() || !contact.phone.trim(),
      )
    ) {
      setError("Each emergency contact needs a name and phone number.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      let next = details;
      if (details.avatarPreviewUri) {
        if (user) {
          setUploading(true);
          const path = await uploadProfileAvatar(details.avatarPreviewUri);
          next = { ...details, avatarPath: path, avatarPreviewUri: null };
        } else {
          next = details;
        }
      }
      if (user && email.trim() && email.trim() !== user.email) {
        if (!emailCurrentPassword)
          throw new Error("Enter your current password to change email.");
        await updateAccountEmail(email, emailCurrentPassword);
        setEmailCurrentPassword("");
      }
      await saveProfileContactDetails(next);
      await refreshProfile();
      setDetails(next);
      setMessage(
        user && email.trim() !== user.email
          ? "Saved. Check the new email address to confirm the change."
          : "Profile and contact information saved.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your profile.",
      );
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  async function removePhoto() {
    if (!details) return;
    setUploading(true);
    setError("");
    try {
      await removeProfileAvatar(details.avatarPath);
      setDetails({ ...details, avatarPath: null, avatarPreviewUri: null });
    } catch {
      setError("Could not remove the profile photo.");
    } finally {
      setUploading(false);
    }
  }

  if (!details)
    return (
      <AppMainLayout subtitle="Settings" title="Profile and contact">
        <ActivityIndicator color={theme.primary} />
      </AppMainLayout>
    );
  const initials =
    details.displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2) || "HS";

  return (
    <AppMainLayout subtitle="Settings" title="Profile and contact">
      {error ? (
        <AppCard variant="danger">
          <Text style={{ color: theme.text }}>{error}</Text>
        </AppCard>
      ) : null}
      {message ? (
        <AppCard variant="success">
          <Text style={{ color: theme.text }}>{message}</Text>
        </AppCard>
      ) : null}

      <AppSection
        title="Profile photo"
        subtitle="Camera and photo permissions are requested only when you choose an action."
      >
        <AppCard>
          <View style={styles.avatarRow}>
            <AppAvatar
              imageUri={details.avatarPreviewUri ?? undefined}
              initials={initials}
              size={76}
            />
            <View style={styles.flex}>
              <Text style={[styles.title, { color: theme.text }]}>
                Preview before saving
              </Text>
              <Text style={[styles.body, { color: theme.mutedText }]}>
                Photos are stored in private profile avatar storage.
              </Text>
              {uploading ? (
                <View style={styles.progress}>
                  <ActivityIndicator color={theme.primary} />
                  <Text style={{ color: theme.mutedText }}>Uploading...</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.actions}>
            <AppButton
              iconLeft={<Camera color="#ffffff" size={17} />}
              onPress={() => choosePhoto("camera")}
              size="sm"
              title="Camera"
            />
            <AppButton
              iconLeft={<ImageIcon color={theme.primary} size={17} />}
              onPress={() => choosePhoto("library")}
              size="sm"
              title="Library"
              variant="secondary"
            />
            <AppButton
              iconLeft={<X color={theme.danger} size={17} />}
              onPress={removePhoto}
              size="sm"
              title="Remove"
              variant="outline"
            />
          </View>
        </AppCard>
      </AppSection>

      <AppSection title="Identity">
        <AppCard style={styles.form}>
          <AppFormInput
            label="Full name"
            onChangeText={(fullName) => setDetails({ ...details, fullName })}
            placeholder="Full legal or preferred name"
            value={details.fullName}
          />
          <AppFormInput
            label="Display name"
            onChangeText={(displayName) =>
              setDetails({ ...details, displayName })
            }
            placeholder="Name shown in the app"
            value={details.displayName}
          />
          <AppFormInput
            label="Date of birth"
            onChangeText={(dateOfBirth) =>
              setDetails({ ...details, dateOfBirth })
            }
            placeholder="YYYY-MM-DD"
            value={details.dateOfBirth}
          />
        </AppCard>
      </AppSection>

      <AppSection title="Contact">
        <AppCard style={styles.form}>
          <FieldStatus
            label="Email verification"
            status={
              user?.email_confirmed_at
                ? "Verified"
                : user
                  ? "Needs attention"
                  : "Local mode"
            }
          />
          <AppFormInput
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email address"
            onChangeText={setEmail}
            placeholder="name@example.com"
            value={email}
          />
          {user && email.trim() !== user.email ? (
            <AppFormInput
              helperText="Required to re-authenticate this high-risk change."
              label="Current password"
              onChangeText={setEmailCurrentPassword}
              placeholder="Current password"
              secureTextEntry
              value={emailCurrentPassword}
            />
          ) : null}
          <FieldStatus
            label="Phone verification"
            status={
              user?.phone_confirmed_at
                ? "Verified"
                : details.phone
                  ? "Not verified"
                  : "Not added"
            }
          />
          <AppFormInput
            keyboardType="phone-pad"
            label="Phone number"
            onChangeText={(phone) => setDetails({ ...details, phone })}
            placeholder="+27..."
            value={details.phone}
          />
          <Text style={[styles.label, { color: theme.text }]}>
            Preferred contact method
          </Text>
          <View style={styles.actions}>
            {(["email", "phone", "none"] as PreferredContactMethod[]).map(
              (method) => (
                <AppChip
                  key={method}
                  label={format(method)}
                  onPress={() =>
                    setDetails({ ...details, preferredContactMethod: method })
                  }
                  selected={details.preferredContactMethod === method}
                />
              ),
            )}
          </View>
        </AppCard>
      </AppSection>

      <AppSection
        actionLabel="Add"
        onActionPress={() =>
          setDetails({
            ...details,
            emergencyContacts: [...details.emergencyContacts, newContact()],
          })
        }
        title="Emergency contacts"
        subtitle="Contacts remain private unless you choose a broader visibility rule."
      >
        {details.emergencyContacts.length ? (
          details.emergencyContacts.map((contact, index) => (
            <EmergencyContactEditor
              contact={contact}
              key={contact.id}
              onChange={(next) =>
                setDetails({
                  ...details,
                  emergencyContacts: details.emergencyContacts.map(
                    (item, itemIndex) => (itemIndex === index ? next : item),
                  ),
                })
              }
              onRemove={() =>
                setDetails({
                  ...details,
                  emergencyContacts: details.emergencyContacts.filter(
                    (item) => item.id !== contact.id,
                  ),
                })
              }
            />
          ))
        ) : (
          <AppCard>
            <Text style={{ color: theme.mutedText }}>
              No emergency contacts added.
            </Text>
          </AppCard>
        )}
      </AppSection>

      <AppButton
        fullWidth
        iconLeft={<Upload color="#ffffff" size={18} />}
        loading={saving}
        onPress={save}
        title="Save profile and contacts"
      />
      <AppButton
        fullWidth
        onPress={() => router.push("/settings/privacy-center" as Href)}
        title="Review privacy and sharing"
        variant="secondary"
      />
    </AppMainLayout>
  );
}

function EmergencyContactEditor({
  contact,
  onChange,
  onRemove,
}: {
  contact: EmergencyContact;
  onChange: (contact: EmergencyContact) => void;
  onRemove: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={styles.form}>
      <View style={styles.between}>
        <Text style={[styles.title, { color: theme.text }]}>
          Emergency contact
        </Text>
        <Pressable
          accessibilityLabel="Remove emergency contact"
          onPress={onRemove}
        >
          <Trash2 color={theme.danger} size={20} />
        </Pressable>
      </View>
      <AppFormInput
        label="Name"
        onChangeText={(name) => onChange({ ...contact, name })}
        placeholder="Contact name"
        value={contact.name}
      />
      <AppFormInput
        label="Relationship"
        onChangeText={(relationship) => onChange({ ...contact, relationship })}
        placeholder="Partner, parent, friend..."
        value={contact.relationship}
      />
      <AppFormInput
        keyboardType="phone-pad"
        label="Phone number"
        onChangeText={(phone) => onChange({ ...contact, phone })}
        placeholder="+27..."
        value={contact.phone}
      />
      <AppFormInput
        label="Secondary phone or email"
        onChangeText={(secondaryContact) =>
          onChange({ ...contact, secondaryContact })
        }
        placeholder="Optional"
        value={contact.secondaryContact}
      />
      <Text style={[styles.label, { color: theme.text }]}>Visibility</Text>
      <View style={styles.actions}>
        {(["private", "circle_admins", "emergency_contacts"] as const).map(
          (visibility) => (
            <AppChip
              key={visibility}
              label={format(visibility)}
              onPress={() => onChange({ ...contact, visibility })}
              selected={contact.visibility === visibility}
            />
          ),
        )}
      </View>
      <View style={styles.between}>
        <Text style={[styles.body, { color: theme.text }]}>
          Include in Medical ID
        </Text>
        <Switch
          onValueChange={(includeInMedicalId) =>
            onChange({ ...contact, includeInMedicalId })
          }
          value={contact.includeInMedicalId}
        />
      </View>
    </AppCard>
  );
}

function FieldStatus({ label, status }: { label: string; status: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.between}>
      <Text style={[styles.body, { color: theme.mutedText }]}>{label}</Text>
      <AppChip
        label={status}
        variant={status === "Verified" ? "success" : "muted"}
      />
    </View>
  );
}
function newContact(): EmergencyContact {
  return {
    id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    includeInMedicalId: false,
    name: "",
    phone: "",
    relationship: "",
    secondaryContact: "",
    visibility: "private",
  };
}
function format(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  avatarRow: { alignItems: "center", flexDirection: "row", gap: 16 },
  between: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  body: { fontSize: 13, lineHeight: 19 },
  flex: { flex: 1 },
  form: { gap: 14 },
  label: { fontWeight: "900" },
  progress: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  title: { fontSize: 17, fontWeight: "900" },
});
