import "react-native-url-polyfill/auto";

import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function toSecureStoreKey(key: string) {
  return `fh${Array.from(key)
    .map((character) => character.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")}`;
}

function getSupabaseConfig() {
  const missingVariables = [
    ["EXPO_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
    ["EXPO_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", supabaseAnonKey]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing Supabase environment variable(s): ${missingVariables.join(", ")}`
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  } as {
    supabaseUrl: string;
    supabaseAnonKey: string;
  };
}

const webStorage: SupportedStorage = {
  getItem: async (key) => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  }
};

const nativeSecureStorage: SupportedStorage = {
  getItem: (key) => SecureStore.getItemAsync(toSecureStoreKey(key)),
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(toSecureStoreKey(key), value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(toSecureStoreKey(key));
  }
};

const config = getSupabaseConfig();
const authStorage = Platform.OS === "web" ? webStorage : nativeSecureStorage;

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    storage: authStorage
  }
});
