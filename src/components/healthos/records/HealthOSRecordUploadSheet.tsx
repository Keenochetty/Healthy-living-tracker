import { Modal, StyleSheet, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { ensureImagePickerPermission } from "@/lib/devicePermissions";
import { healthOSSpacing } from "@/theme/healthos";

import { RecordsAction, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  onClose: () => void;
  onScan: () => void;
  onSelected: (message: string) => void;
  uploadStatus: string;
  visible: boolean;
};

export function HealthOSRecordUploadSheet({ onClose, onScan, onSelected, uploadStatus, visible }: Props) {
  async function chooseDocument() {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      onSelected(`Selected file: ${result.assets[0].name}. ${uploadStatus}`);
    }
  }

  async function choosePhoto() {
    if (!(await ensureImagePickerPermission("photos"))) return;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      onSelected(`Selected photo: ${result.assets[0].fileName ?? "photo"}. ${uploadStatus}`);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <HealthOSCard title="Add record" subtitle="Scan, upload, or create a manual note.">
          <View style={recordsSharedStyles.row}>
            <RecordsText muted>{uploadStatus}</RecordsText>
            <RecordsText muted>Original metadata is preserved when available. Nothing is uploaded to backend storage in this phase.</RecordsText>
            <View style={recordsSharedStyles.actions}>
              <RecordsAction label="Scan document" onPress={onScan} variant="realm" />
              <RecordsAction label="Choose file" onPress={chooseDocument} />
              <RecordsAction label="Choose photo" onPress={choosePhoto} />
              <RecordsAction label="Manual note" onPress={() => onSelected("Manual note creation uses the existing records save flow in a later phase.")} />
              <RecordsAction label="Close" onPress={onClose} />
            </View>
          </View>
        </HealthOSCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: healthOSSpacing.lg,
  },
});
