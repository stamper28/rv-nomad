import React, { forwardRef } from "react";
import { Platform, View, Text, StyleSheet } from "react-native";

/**
 * Cross-platform MapView wrapper.
 * On web, renders a placeholder since react-native-maps doesn't support web.
 * On native, this file is replaced by map-view-wrapper.native.tsx
 */

export const MapViewWrapper = forwardRef<any, any>(
  ({ children, style, ...props }, ref) => {
    return (
      <View style={[style, webStyles.container]}>
        <View style={webStyles.content}>
          <Text style={webStyles.icon}>🗺️</Text>
          <Text style={webStyles.title}>Interactive Map</Text>
          <Text style={webStyles.subtitle}>
            The interactive map with campground markers{"\n"}
            is available on iOS and Android.{"\n\n"}
            Scan the QR code with Expo Go to preview.
          </Text>
        </View>
      </View>
    );
  }
);

MapViewWrapper.displayName = "MapViewWrapper";

export const MarkerWrapper = ({ children }: any) => null;

const webStyles = StyleSheet.create({
  container: {
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});
