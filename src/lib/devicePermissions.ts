import * as ImagePicker from "expo-image-picker";
import { Linking, Platform } from "react-native";

import { getNotificationPermissionStatus } from "@/services/reminders/notificationService";
import type {
  DevicePermissionState,
  DevicePermissionStatus,
} from "@/types/devicePermissions";

type PermissionResponse = {
  canAskAgain: boolean;
  granted: boolean;
  status: string;
};

export async function getDevicePermissionStates(): Promise<
  DevicePermissionState[]
> {
  const [camera, photos, notifications] = await Promise.all([
    safePermission(() => ImagePicker.getCameraPermissionsAsync()),
    safePermission(() => ImagePicker.getMediaLibraryPermissionsAsync()),
    getNotificationPermissionStatus().catch(() => "unavailable" as const),
  ]);

  return [
    {
      canAskAgain: camera.canAskAgain,
      key: "camera",
      status: mapExpoPermission(camera),
    },
    {
      canAskAgain: photos.canAskAgain,
      key: "photos",
      status:
        photos.accessPrivileges === "limited"
          ? "limited"
          : mapExpoPermission(photos),
    },
    {
      canAskAgain: notifications === "not_requested",
      key: "notifications",
      status: mapNotificationPermission(notifications),
    },
    { canAskAgain: false, key: "location", status: "unavailable" },
    { canAskAgain: false, key: "health_data", status: "unavailable" },
    { canAskAgain: false, key: "microphone", status: "unavailable" },
  ];
}

export async function ensureImagePickerPermission(source: "camera" | "photos") {
  const current =
    source === "camera"
      ? await ImagePicker.getCameraPermissionsAsync()
      : await ImagePicker.getMediaLibraryPermissionsAsync();

  if (
    current.granted ||
    ("accessPrivileges" in current && current.accessPrivileges === "limited")
  )
    return true;
  if (!current.canAskAgain) return false;

  const requested =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  return (
    requested.granted ||
    ("accessPrivileges" in requested &&
      requested.accessPrivileges === "limited")
  );
}

export async function openDeviceSettings() {
  if (Platform.OS === "web")
    throw new Error("System app settings are not available in the web build.");
  await Linking.openSettings();
}

async function safePermission<T extends PermissionResponse>(
  read: () => Promise<T>,
) {
  try {
    return await read();
  } catch {
    return { canAskAgain: false, granted: false, status: "unavailable" } as T;
  }
}

function mapExpoPermission(
  permission: PermissionResponse,
): DevicePermissionStatus {
  if (permission.granted) return "allowed";
  if (permission.status === "unavailable") return "unavailable";
  if (permission.status === "denied" || permission.canAskAgain === false)
    return "denied";
  return "not_requested";
}

function mapNotificationPermission(
  status: Awaited<ReturnType<typeof getNotificationPermissionStatus>>,
): DevicePermissionStatus {
  if (status === "granted") return "allowed";
  if (status === "provisional") return "limited";
  return status;
}
