import type { ImagePickerAsset } from "expo-image-picker";

import type { AppIconName } from "@/constants/appIcons";

export type HealthOSScanMode =
  | "general"
  | "foodLabel"
  | "medication"
  | "script"
  | "doctorNote"
  | "supplement"
  | "gymMachine"
  | "mealPlan"
  | "record"
  | "pregnancy"
  | "babyChild"
  | "womenHealth";

export type HealthOSScanImportTarget =
  | "nutrition"
  | "medication"
  | "supplements"
  | "records"
  | "fitness"
  | "calendar"
  | "pregnancy"
  | "babyChild"
  | "womenHealth"
  | "family"
  | "ai";

export type HealthOSScanModeConfig = {
  hint: string;
  icon: AppIconName;
  importTargets: HealthOSScanImportTarget[];
  key: HealthOSScanMode;
  label: string;
  safetyNote?: string;
};

export type HealthOSScanAsset = {
  fileName?: string | null;
  height?: number;
  mimeType?: string | null;
  source: "camera" | "gallery";
  uri: string;
  width?: number;
};

export type HealthOSExtractionState =
  | "idle"
  | "loading"
  | "placeholder"
  | "extracted"
  | "error";

export function imagePickerAssetToScanAsset(
  asset: ImagePickerAsset,
): HealthOSScanAsset {
  return {
    fileName: asset.fileName,
    height: asset.height,
    mimeType: asset.mimeType,
    source: "gallery",
    uri: asset.uri,
    width: asset.width,
  };
}
