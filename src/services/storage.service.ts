import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// In-memory cache to prevent frequent slow native SecureStore bridge roundtrips
const memoryCache = new Map<string, string | null>();

// iOS Keychain only allows alphanumeric characters, '.', '-', and '_'
const sanitizeKey = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9._-]/g, "_");
};

export const storage = {
  get: async (key: string): Promise<string | null> => {
    const cleanKey = sanitizeKey(key);
    if (memoryCache.has(cleanKey)) {
      return memoryCache.get(cleanKey) ?? null;
    }

    try {
      let val: string | null = null;
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          val = window.localStorage.getItem(cleanKey);
        }
      } else {
        val = await SecureStore.getItemAsync(cleanKey);
      }
      memoryCache.set(cleanKey, val);
      return val;
    } catch {
      return null;
    }
  },

  getFast: (key: string): string | null => {
    const cleanKey = sanitizeKey(key);
    return memoryCache.get(cleanKey) ?? null;
  },

  set: async (key: string, value: string): Promise<void> => {
    const cleanKey = sanitizeKey(key);
    const safeValue = typeof value === "string" ? value : String(value ?? "");
    memoryCache.set(cleanKey, safeValue);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(cleanKey, safeValue);
        }
        return;
      }
      await SecureStore.setItemAsync(cleanKey, safeValue);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Storage set error:", error);
    }
  },

  remove: async (key: string): Promise<void> => {
    const cleanKey = sanitizeKey(key);
    memoryCache.delete(cleanKey);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(cleanKey);
        }
        return;
      }
      await SecureStore.deleteItemAsync(cleanKey);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Storage remove error:", error);
    }
  },

  clearCache: (): void => {
    memoryCache.clear();
  },
};
