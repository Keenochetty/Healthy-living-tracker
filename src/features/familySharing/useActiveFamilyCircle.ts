import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { HealthOSFamilyCircle } from "./familySharingTypes";
import { useFamilyCircles } from "./useFamilyCircles";

const ACTIVE_FAMILY_CIRCLE_KEY = "healthos_active_family_circle_id";

export function useActiveFamilyCircle() {
  const circlesResult = useFamilyCircles();
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ACTIVE_FAMILY_CIRCLE_KEY)
      .then(setActiveCircleId)
      .catch(() => setActiveCircleId(null));
  }, []);

  const activeCircle = useMemo<HealthOSFamilyCircle | null>(() => {
    const circles = circlesResult.data ?? [];
    return (
      circles.find((circle) => circle.id === activeCircleId) ??
      circles[0] ??
      null
    );
  }, [activeCircleId, circlesResult.data]);

  const setActiveCircle = useCallback(async (circleId: string | null) => {
    setActiveCircleId(circleId);
    if (circleId) {
      await AsyncStorage.setItem(ACTIVE_FAMILY_CIRCLE_KEY, circleId);
    } else {
      await AsyncStorage.removeItem(ACTIVE_FAMILY_CIRCLE_KEY);
    }
  }, []);

  return { ...circlesResult, activeCircle, activeCircleId, setActiveCircle };
}
