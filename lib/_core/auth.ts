/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SESSION_TOKEN_KEY, USER_INFO_KEY } from "@/constants/oauth";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

/**
 * iOS 26 / iPadOS 26 requires an explicit keychainService parameter
 * for SecureStore operations. Without it, the app crashes on launch
 * with a SIGABRT in TurboModule performVoidMethodInvocation.
 * 
 * See: https://github.com/facebook/react-native/issues/54859
 */
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: "space.manus.rv.nomad.t20260404012848",
};

export async function getSessionToken(): Promise<string | null> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token retrieval");
      return null;
    }

    // Use SecureStore for native with iOS 26-compatible options
    console.log("[Auth] Getting session token...");
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY, SECURE_STORE_OPTIONS);
    console.log(
      "[Auth] Session token retrieved from SecureStore:",
      token ? `present (${token.substring(0, 20)}...)` : "missing",
    );
    return token;
  } catch (error) {
    console.error("[Auth] Failed to get session token:", error);
    // Return null instead of crashing — app can still function without stored token
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token storage");
      return;
    }

    // Use SecureStore for native with iOS 26-compatible options
    console.log("[Auth] Setting session token...", token.substring(0, 20) + "...");
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token, SECURE_STORE_OPTIONS);
    console.log("[Auth] Session token stored in SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to set session token:", error);
    // Don't throw — let the app continue even if token storage fails
  }
}

export async function removeSessionToken(): Promise<void> {
  try {
    // Web platform uses cookie-based auth, logout is handled by server clearing cookie
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token removal");
      return;
    }

    // Use SecureStore for native with iOS 26-compatible options
    console.log("[Auth] Removing session token...");
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY, SECURE_STORE_OPTIONS);
    console.log("[Auth] Session token removed from SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to remove session token:", error);
  }
}

export async function getUserInfo(): Promise<User | null> {
  try {
    console.log("[Auth] Getting user info...");

    let info: string | null = null;
    if (Platform.OS === "web") {
      // Use localStorage for web
      info = window.localStorage.getItem(USER_INFO_KEY);
    } else {
      // Use SecureStore for native with iOS 26-compatible options
      info = await SecureStore.getItemAsync(USER_INFO_KEY, SECURE_STORE_OPTIONS);
    }

    if (!info) {
      console.log("[Auth] No user info found");
      return null;
    }
    const user = JSON.parse(info);
    console.log("[Auth] User info retrieved:", user);
    return user;
  } catch (error) {
    console.error("[Auth] Failed to get user info:", error);
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  try {
    console.log("[Auth] Setting user info...", user);

    if (Platform.OS === "web") {
      // Use localStorage for web
      window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
      console.log("[Auth] User info stored in localStorage successfully");
      return;
    }

    // Use SecureStore for native with iOS 26-compatible options
    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user), SECURE_STORE_OPTIONS);
    console.log("[Auth] User info stored in SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to set user info:", error);
  }
}

export async function clearUserInfo(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Use localStorage for web
      window.localStorage.removeItem(USER_INFO_KEY);
      return;
    }

    // Use SecureStore for native with iOS 26-compatible options
    await SecureStore.deleteItemAsync(USER_INFO_KEY, SECURE_STORE_OPTIONS);
  } catch (error) {
    console.error("[Auth] Failed to clear user info:", error);
  }
}
