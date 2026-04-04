import React, { forwardRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

let RNMapView: any = null;
let RNMarker: any = null;
let mapLoadError = false;

try {
  const maps = require("react-native-maps");
  RNMapView = maps.default;
  RNMarker = maps.Marker;
} catch (e) {
  mapLoadError = true;
}

function MapFallback() {
  return (
    <View style={fallbackStyles.container}>
      <MaterialIcons name="map" size={64} color="#2E7D32" />
      <Text style={fallbackStyles.title}>Map Unavailable</Text>
      <Text style={fallbackStyles.subtitle}>
        Google Maps could not be loaded.{"\n"}
        Please check your configuration.
      </Text>
    </View>
  );
}

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151718",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ECEDEE",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#9BA1A6",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.warn("MapView error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <MapFallback />;
    }
    return this.props.children;
  }
}

export const MapViewWrapper = forwardRef<any, any>(
  ({ children, ...props }, ref) => {
    if (mapLoadError || !RNMapView) {
      return <MapFallback />;
    }

    return (
      <MapErrorBoundary>
        <RNMapView ref={ref} {...props}>
          {children}
        </RNMapView>
      </MapErrorBoundary>
    );
  }
);

MapViewWrapper.displayName = "MapViewWrapper";

export const MarkerWrapper = RNMarker
  ? RNMarker
  : ((_props: any) => null) as any;
