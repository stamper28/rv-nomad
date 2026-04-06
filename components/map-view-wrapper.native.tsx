/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import React, { forwardRef, Component, type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Error boundary to catch native map crashes
class MapErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.warn("[MapErrorBoundary] Map crashed:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View style={fallbackStyles.container}>
            <MaterialIcons name="map" size={48} color="#2E7D32" />
            <Text style={fallbackStyles.title}>Map Unavailable</Text>
            <Text style={fallbackStyles.subtitle}>
              The map could not be loaded.{"\n"}
              Try restarting the app.
            </Text>
          </View>
        )
      );
    }
    return this.props.children;
  }
}

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#f0f0f0",
  },
  title: { fontSize: 20, fontWeight: "700", marginTop: 12, color: "#333" },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});

// Lazy-load react-native-maps to catch import errors
let RNMapView: any = null;
let RNMarker: any = null;
let loadError: Error | null = null;

try {
  const maps = require("react-native-maps");
  RNMapView = maps.default;
  RNMarker = maps.Marker;
} catch (e: any) {
  loadError = e;
  console.warn("[MapViewWrapper] Failed to load react-native-maps:", e.message);
}

/**
 * Native map wrapper using react-native-maps.
 * Uses Apple Maps on iOS and Google Maps on Android.
 * Wrapped in error boundary to prevent app crashes.
 */
export const MapViewWrapper = forwardRef<any, any>((props, ref) => {
  if (!RNMapView || loadError) {
    return (
      <View style={[props.style, fallbackStyles.container]}>
        <MaterialIcons name="map" size={48} color="#2E7D32" />
        <Text style={fallbackStyles.title}>Map Unavailable</Text>
        <Text style={fallbackStyles.subtitle}>
          Could not load map library.{"\n"}
          {loadError?.message || "Unknown error"}
        </Text>
      </View>
    );
  }

  return (
    <MapErrorBoundary>
      <RNMapView ref={ref} {...props} />
    </MapErrorBoundary>
  );
});

MapViewWrapper.displayName = "MapViewWrapper";

export const MarkerWrapper = RNMarker || (({ children }: any) => null);
