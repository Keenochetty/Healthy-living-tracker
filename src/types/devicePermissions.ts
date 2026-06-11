export type DevicePermissionStatus =
  | "allowed"
  | "limited"
  | "denied"
  | "not_requested"
  | "unavailable";

export type DevicePermissionKey =
  | "camera"
  | "photos"
  | "notifications"
  | "location"
  | "health_data"
  | "microphone";

export type DevicePermissionState = {
  canAskAgain: boolean;
  key: DevicePermissionKey;
  status: DevicePermissionStatus;
};
