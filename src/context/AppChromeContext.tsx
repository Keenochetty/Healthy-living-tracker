import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

type AppChromeContextValue = {
  aiSearchVisible: boolean;
  handleScrollForChrome: (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => void;
  setAiSearchVisible: (visible: boolean) => void;
};

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

const HIDE_AFTER_Y = 80;
const SHOW_NEAR_TOP_Y = 24;
const SCROLL_DELTA = 10;

export function AppChromeProvider({ children }: { children: ReactNode }) {
  const [aiSearchVisibleState, setAiSearchVisibleState] = useState(true);
  const visibleRef = useRef(true);
  const previousScrollYRef = useRef(0);
  const lastToggleYRef = useRef(0);

  const setAiSearchVisible = useCallback((visible: boolean) => {
    visibleRef.current = visible;
    setAiSearchVisibleState(visible);
  }, []);

  const handleScrollForChrome = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = Math.max(0, event.nativeEvent.contentOffset.y);
      const previousY = previousScrollYRef.current;
      const delta = scrollY - previousY;

      previousScrollYRef.current = scrollY;

      if (scrollY <= SHOW_NEAR_TOP_Y) {
        lastToggleYRef.current = scrollY;
        if (!visibleRef.current) setAiSearchVisible(true);
        return;
      }

      if (Math.abs(delta) < SCROLL_DELTA) return;
      if (Math.abs(scrollY - lastToggleYRef.current) < SCROLL_DELTA) return;

      if (scrollY > HIDE_AFTER_Y && delta > 0 && visibleRef.current) {
        lastToggleYRef.current = scrollY;
        setAiSearchVisible(false);
        return;
      }

      if (delta < 0 && !visibleRef.current) {
        lastToggleYRef.current = scrollY;
        setAiSearchVisible(true);
      }
    },
    [setAiSearchVisible],
  );

  const value = useMemo(
    () => ({
      aiSearchVisible: aiSearchVisibleState,
      handleScrollForChrome,
      setAiSearchVisible,
    }),
    [aiSearchVisibleState, handleScrollForChrome, setAiSearchVisible],
  );

  return (
    <AppChromeContext.Provider value={value}>
      {children}
    </AppChromeContext.Provider>
  );
}

export function useAppChrome() {
  const context = useContext(AppChromeContext);

  if (!context) {
    return {
      aiSearchVisible: true,
      handleScrollForChrome: () => undefined,
      setAiSearchVisible: () => undefined,
    };
  }

  return context;
}
