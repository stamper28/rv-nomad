/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
/**
 * Reliable URL opener that works in Expo Go and production builds.
 * Uses expo-web-browser for http/https URLs (in-app browser on native),
 * falls back to Linking for tel:, mailto:, and other schemes.
 */
import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

/**
 * Open a URL reliably across all platforms.
 * - http/https URLs: Opens in-app browser on iOS/Android, new tab on web
 * - tel:/mailto:/maps: Uses Linking.openURL
 * - Google Maps URLs: Uses Linking.openURL to open in Maps app
 */
export async function openUrl(url: string): Promise<void> {
  if (!url) return;

  try {
    // For tel:, mailto:, sms: schemes — use Linking
    if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("sms:")) {
      await Linking.openURL(url);
      return;
    }

    // For Google Maps directions URLs — try to open in Maps app first
    if (url.includes("google.com/maps") || url.includes("maps.google.com")) {
      if (Platform.OS !== "web") {
        // Try opening in Google Maps app first
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return;
        }
      }
      // Fallback to in-app browser
      await WebBrowser.openBrowserAsync(url);
      return;
    }

    // For all http/https URLs — use WebBrowser (in-app browser)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      if (Platform.OS === "web") {
        // On web, open in new tab
        window.open(url, "_blank");
      } else {
        // On native, use in-app browser (Safari View Controller / Chrome Custom Tabs)
        await WebBrowser.openBrowserAsync(url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          controlsColor: "#0a7ea4",
          toolbarColor: "#ffffff",
        });
      }
      return;
    }

    // For any other scheme, try Linking
    await Linking.openURL(url);
  } catch (error) {
    console.warn("Failed to open URL:", url, error);
    // Last resort fallback — try Linking
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.error("All URL open methods failed:", url, e);
    }
  }
}
