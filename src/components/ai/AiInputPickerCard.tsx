import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { ensureImagePickerPermission } from "@/lib/devicePermissions";
import type { AiInputType } from "@/types/ai";

export type AiInputSelection = {
  fileName?: string;
  inputType: AiInputType;
  localUri?: string;
  mimeType?: string;
  textInput?: string;
};

type AiInputPickerCardProps = {
  onChange: (selection: AiInputSelection) => void;
  selection: AiInputSelection;
};

export function AiInputPickerCard({
  onChange,
  selection,
}: AiInputPickerCardProps) {
  async function takePhoto() {
    if (!(await ensureImagePickerPermission("camera"))) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onChange({
        fileName: asset.fileName ?? "camera-photo.jpg",
        inputType: "image",
        localUri: asset.uri,
        mimeType: asset.mimeType,
      });
    }
  }

  async function choosePhoto() {
    if (!(await ensureImagePickerPermission("photos"))) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onChange({
        fileName: asset.fileName ?? "photo.jpg",
        inputType: "image",
        localUri: asset.uri,
        mimeType: asset.mimeType,
      });
    }
  }

  async function chooseDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onChange({
        fileName: asset.name,
        inputType: "document",
        localUri: asset.uri,
        mimeType: asset.mimeType,
      });
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <PickerButton label="Take photo" onPress={takePhoto} />
        <PickerButton label="Choose photo" onPress={choosePhoto} />
        <PickerButton label="Choose document" onPress={chooseDocument} />
      </View>

      <TextInput
        multiline
        onChangeText={(textInput) => onChange({ inputType: "text", textInput })}
        placeholder="Or type a note manually"
        placeholderTextColor="#94a3b8"
        style={{
          backgroundColor: "#f8fafc",
          borderColor: "#e2e8f0",
          borderRadius: 18,
          borderWidth: 1,
          color: "#0f172a",
          minHeight: 82,
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlignVertical: "top",
        }}
        value={selection.textInput ?? ""}
      />

      {selection.localUri || selection.fileName ? (
        <Text style={{ color: "#64748b" }}>
          Selected: {selection.fileName ?? selection.localUri}
        </Text>
      ) : null}
    </View>
  );
}

function PickerButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: "#ede9fe",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: "#7c3aed", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}
