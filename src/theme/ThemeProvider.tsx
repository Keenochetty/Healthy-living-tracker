import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { defaultThemeKey, getTheme, type AppTheme } from "@/theme/tokens";
import {
  getUserPreferences,
  subscribeToUserPreferences,
  updateUserPreferences,
} from "@/lib/userPreferences";
import type { UserThemeKey } from "@/types/profile";

type AppThemeContextValue = {
  setThemeKey: (themeKey: UserThemeKey) => Promise<void>;
  theme: AppTheme;
  themeKey: UserThemeKey;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeKeyState, setThemeKeyState] =
    useState<UserThemeKey>(defaultThemeKey);

  useEffect(() => {
    let isActive = true;

    getUserPreferences()
      .then((preferences) => {
        if (isActive) {
          setThemeKeyState(preferences.themeKey ?? defaultThemeKey);
        }
      })
      .catch(() => {
        if (isActive) {
          setThemeKeyState(defaultThemeKey);
        }
      });

    const unsubscribe = subscribeToUserPreferences((preferences) => {
      setThemeKeyState(preferences.themeKey ?? defaultThemeKey);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const setThemeKey = useCallback(async (nextThemeKey: UserThemeKey) => {
    setThemeKeyState(nextThemeKey);

    try {
      await updateUserPreferences({ themeKey: nextThemeKey });
    } catch {
      setThemeKeyState(defaultThemeKey);
    }
  }, []);

  const value = useMemo(
    () => ({
      setThemeKey,
      theme: getTheme(themeKeyState),
      themeKey: themeKeyState,
    }),
    [setThemeKey, themeKeyState],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    return {
      setThemeKey: async () => undefined,
      theme: getTheme(defaultThemeKey),
      themeKey: defaultThemeKey,
    };
  }

  return context;
}
