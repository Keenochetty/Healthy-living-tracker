export type HealthOSDevicePlatform = "android" | "ios";
export type HealthOSTestingMode = "developmentBuild" | "expoGo" | "previewReleaseLater";

export type HealthOSDeviceQACheck =
  | "accessibilityFontSize"
  | "appResumeBackground"
  | "auth"
  | "cameraScan"
  | "darkLightMode"
  | "filePhotoUpload"
  | "keyboardForms"
  | "launch"
  | "memoryImageHeavyScreens"
  | "navigation"
  | "notifications"
  | "offlinePoorNetwork"
  | "permissionsDenied"
  | "slowDeviceScroll";

export type HealthOSDeviceQAMatrixItem = {
  checks: HealthOSDeviceQACheck[];
  deviceClass: string;
  mode: HealthOSTestingMode;
  notes: string;
  platform: HealthOSDevicePlatform;
  requiredBeforeRelease: boolean;
};

const coreChecks: HealthOSDeviceQACheck[] = [
  "launch",
  "auth",
  "navigation",
  "darkLightMode",
  "cameraScan",
  "notifications",
  "filePhotoUpload",
  "keyboardForms",
  "offlinePoorNetwork",
  "slowDeviceScroll",
  "memoryImageHeavyScreens",
  "appResumeBackground",
  "permissionsDenied",
  "accessibilityFontSize",
];

export const healthOSDeviceQAMatrix: HealthOSDeviceQAMatrixItem[] = [
  qa("android", "Low-end Android phone", "developmentBuild", "Primary slow-device target for scroll, camera, image, and memory checks.", true),
  qa("android", "Mid-range Android phone", "expoGo", "Useful for broad navigation and layout checks.", true),
  qa("android", "Current Android phone", "developmentBuild", "Production-like native permission and notification behavior.", true),
  qa("android", "Android tablet optional", "previewReleaseLater", "Responsive layout check after phone MVP.", false),
  qa("ios", "Older supported iPhone", "developmentBuild", "Small-memory and small-screen performance check.", true),
  qa("ios", "Current iPhone", "developmentBuild", "Primary iOS native behavior check.", true),
  qa("ios", "Small-screen iPhone", "expoGo", "Navigation, keyboard, and readability check.", true),
  qa("ios", "Large-screen iPhone", "expoGo", "Max-width and centered layout check.", true),
  qa("ios", "iPad optional later", "previewReleaseLater", "Tablet polish after MVP.", false),
];

function qa(
  platform: HealthOSDevicePlatform,
  deviceClass: string,
  mode: HealthOSTestingMode,
  notes: string,
  requiredBeforeRelease: boolean,
): HealthOSDeviceQAMatrixItem {
  return { checks: coreChecks, deviceClass, mode, notes, platform, requiredBeforeRelease };
}
