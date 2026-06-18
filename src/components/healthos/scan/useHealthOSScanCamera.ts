import { useRef, useState, type ElementRef } from "react";
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import type { HealthOSScanAsset } from "./HealthOSScanTypes";
import { imagePickerAssetToScanAsset } from "./HealthOSScanTypes";

export type HealthOSCameraPermissionStatus =
  | "loading"
  | "granted"
  | "undetermined"
  | "denied";

export function useHealthOSScanCamera() {
  const cameraRef = useRef<ElementRef<typeof CameraView>>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedAsset, setCapturedAsset] = useState<HealthOSScanAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const permissionStatus: HealthOSCameraPermissionStatus = !permission
    ? "loading"
    : permission.granted
      ? "granted"
      : permission.status === "undetermined"
        ? "undetermined"
        : "denied";

  function toggleFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function toggleFlash() {
    setFlashEnabled((current) => !current);
  }

  async function capturePhoto() {
    if (permissionStatus !== "granted") {
      setError("Camera permission is required before taking a photo.");
      return;
    }

    try {
      setError(null);
      setIsCapturing(true);
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.78,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        throw new Error("No photo was captured.");
      }
      setCapturedAsset({
        height: photo.height,
        source: "camera",
        uri: photo.uri,
        width: photo.width,
      });
    } catch {
      setError("Could not capture the photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }

  async function pickFromGallery() {
    try {
      setError(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ["images"],
        quality: 0.78,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedAsset(imagePickerAssetToScanAsset(result.assets[0]));
      }
    } catch {
      setError("Could not open your photo library.");
    }
  }

  function retake() {
    setCapturedAsset(null);
    setError(null);
  }

  return {
    cameraRef,
    capturePhoto,
    capturedAsset,
    error,
    facing,
    flashEnabled,
    isCapturing,
    permissionStatus,
    pickFromGallery,
    requestPermission,
    retake,
    toggleFacing,
    toggleFlash,
  };
}
