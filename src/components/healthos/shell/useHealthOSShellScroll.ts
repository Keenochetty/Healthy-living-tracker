import { useCallback, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export type HealthOSShellScrollDirection = "down" | "idle" | "up";

export function useHealthOSShellScroll() {
  const scrollY = useSharedValue(0);
  const previousY = useRef(0);
  const [direction, setDirection] = useState<HealthOSShellScrollDirection>("idle");
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [navCompressed, setNavCompressed] = useState(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextY = Math.max(0, event.nativeEvent.contentOffset.y);
      const delta = nextY - previousY.current;
      scrollY.value = nextY;

      if (Math.abs(delta) > 4) {
        const nextDirection = delta > 0 ? "down" : "up";
        setDirection(nextDirection);
        setHeaderCollapsed(nextY > 36 && nextDirection === "down");
        setNavCompressed(nextY > 80 && nextDirection === "down");
      } else if (nextY <= 0) {
        setDirection("idle");
        setHeaderCollapsed(false);
        setNavCompressed(false);
      }

      previousY.current = nextY;
    },
    [scrollY],
  );

  return {
    direction,
    headerCollapsed,
    navCompressed,
    onScroll,
    scrollY,
  };
}
