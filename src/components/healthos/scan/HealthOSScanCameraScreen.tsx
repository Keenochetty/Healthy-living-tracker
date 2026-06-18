import { CameraView } from "expo-camera";
import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSCameraGuidanceFrame } from "./HealthOSCameraGuidanceFrame";
import { HealthOSCameraPermissionState } from "./HealthOSCameraPermissionState";
import { HealthOSCapturedPreview } from "./HealthOSCapturedPreview";
import { HealthOSCaptureControls } from "./HealthOSCaptureControls";
import { HealthOSScanHistorySheet } from "./HealthOSScanHistorySheet";
import { HealthOSScanModePills } from "./HealthOSScanModePills";
import { HealthOSScanResultSheet } from "./HealthOSScanResultSheet";
import { HealthOSScanTopOverlay } from "./HealthOSScanTopOverlay";
import type {
  HealthOSExtractionState,
  HealthOSScanImportTarget,
} from "./HealthOSScanTypes";
import { useHealthOSScanCamera } from "./useHealthOSScanCamera";
import { useHealthOSScanModes } from "./useHealthOSScanModes";

export function HealthOSScanCameraScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const scanModes = useHealthOSScanModes();
  const camera = useHealthOSScanCamera();
  const [resultVisible, setResultVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [extractionState, setExtractionState] =
    useState<HealthOSExtractionState>("idle");

  useEffect(() => {
    if (camera.capturedAsset?.source === "gallery") {
      setResultVisible(true);
    }
  }, [camera.capturedAsset]);

  function closeCapture() {
    camera.retake();
    setResultVisible(false);
    setExtractionState("idle");
  }

  function handleExtract() {
    setExtractionState("placeholder");
  }

  function handleAskAI() {
    setResultVisible(true);
    setExtractionState("placeholder");
  }

  function handleImportTarget(target: HealthOSScanImportTarget) {
    setExtractionState("placeholder");
    if (target === "records") router.push("/records" as Href);
    if (target === "nutrition") router.push("/(tabs)/food" as Href);
    if (target === "medication") router.push("/medication" as Href);
    if (target === "supplements") router.push("/supplements" as Href);
    if (target === "fitness") router.push("/(tabs)/fitness" as Href);
    if (target === "calendar") router.push("/(tabs)/calendar" as Href);
    if (target === "pregnancy") router.push("/pregnancy" as Href);
    if (target === "babyChild") router.push("/baby-child" as Href);
    if (target === "womenHealth") router.push("/cycle" as Href);
    if (target === "family") router.push("/(tabs)/circle" as Href);
    if (target === "ai") router.push("/ai" as Href);
  }

  const hasCamera = camera.permissionStatus === "granted";

  return (
    <View style={[styles.screen, { backgroundColor: palette.deepNavy }]}>
      {hasCamera ? (
        <CameraView
          enableTorch={camera.flashEnabled}
          facing={camera.facing}
          mode="picture"
          ref={camera.cameraRef}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {!hasCamera ? (
        <HealthOSCameraPermissionState
          onPickFromGallery={camera.pickFromGallery}
          onRequestPermission={() => void camera.requestPermission()}
          status={camera.permissionStatus}
        />
      ) : null}

      {hasCamera && !camera.capturedAsset ? (
        <>
          <HealthOSScanTopOverlay
            flashEnabled={camera.flashEnabled}
            onManualEntry={() => router.push("/health/general/notes" as Href)}
            onOpenHistory={() => setHistoryVisible(true)}
            onPickFromGallery={camera.pickFromGallery}
            onShowTips={() => undefined}
            onToggleFacing={camera.toggleFacing}
            onToggleFlash={camera.toggleFlash}
          />
          <View style={styles.guidance}>
            <HealthOSCameraGuidanceFrame hint={scanModes.selectedModeHint} />
          </View>
          <View style={styles.bottomOverlay}>
            <HealthOSScanModePills
              modes={scanModes.modes}
              onSelectMode={scanModes.setSelectedMode}
              selectedMode={scanModes.selectedMode}
            />
            <HealthOSCaptureControls
              isCapturing={camera.isCapturing}
              onAskAI={handleAskAI}
              onCapture={camera.capturePhoto}
              onPickFromGallery={camera.pickFromGallery}
            />
          </View>
        </>
      ) : null}

      {camera.capturedAsset && !resultVisible ? (
        <HealthOSCapturedPreview
          asset={camera.capturedAsset}
          onClose={closeCapture}
          onRetake={camera.retake}
          onUsePhoto={() => setResultVisible(true)}
        />
      ) : null}

      {camera.error ? (
        <View style={styles.errorWrap}>
          <HealthOSCard variant="danger">
            <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
              {camera.error}
            </Text>
          </HealthOSCard>
        </View>
      ) : null}

      <HealthOSScanResultSheet
        asset={camera.capturedAsset}
        extractionState={extractionState}
        importTargets={scanModes.selectedModeConfig.importTargets}
        onAskAI={handleAskAI}
        onClose={() => setResultVisible(false)}
        onExtract={handleExtract}
        onImportTarget={handleImportTarget}
        onRetake={() => {
          setResultVisible(false);
          camera.retake();
        }}
        onSaveRecord={() => handleImportTarget("records")}
        selectedMode={scanModes.selectedModeConfig}
        visible={resultVisible}
      />
      <HealthOSScanHistorySheet
        onClose={() => setHistoryVisible(false)}
        visible={historyVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomOverlay: {
    bottom: healthOSSafeArea.bottomNavSpace + healthOSSpacing.sm,
    gap: healthOSSpacing.lg,
    left: 0,
    position: "absolute",
    right: 0,
  },
  errorWrap: {
    bottom: healthOSSafeArea.bottomNavSpace + 122,
    left: healthOSSpacing.lg,
    position: "absolute",
    right: healthOSSpacing.lg,
  },
  guidance: {
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  screen: {
    flex: 1,
  },
});
