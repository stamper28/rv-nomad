import React, { forwardRef, useImperativeHandle, useRef, useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

let ExpoMaps: any = null;
let mapLoadError = false;

try {
  ExpoMaps = require("expo-maps");
} catch (e) {
  mapLoadError = true;
}

function MapFallback() {
  return (
    <View style={fallbackStyles.container}>
      <MaterialIcons name="map" size={64} color="#2E7D32" />
      <Text style={fallbackStyles.title}>Map Unavailable</Text>
      <Text style={fallbackStyles.subtitle}>
        The map component could not be loaded.{"\n"}
        Please restart the app.
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

/**
 * Marker data interface for expo-maps GoogleMaps.View
 */
export interface ExpoMapMarker {
  id: string;
  coordinates: { latitude: number; longitude: number };
  title?: string;
  snippet?: string;
  color?: string;
}

/**
 * MapViewWrapper using expo-maps (GoogleMaps.View on Android)
 * 
 * Props interface matches what index.tsx expects:
 * - style: ViewStyle
 * - initialRegion: { latitude, longitude, latitudeDelta, longitudeDelta }
 * - showsUserLocation: boolean
 * - onPress: () => void
 * - onMapReady: () => void
 * - onRegionChangeComplete: (region) => void
 * - children: marker elements (ignored - we use markers prop instead)
 * 
 * Also accepts:
 * - markers: ExpoMapMarker[] (for expo-maps native markers)
 * - onMarkerClick: (marker) => void
 */
export const MapViewWrapper = forwardRef<any, any>(
  ({ children, style, initialRegion, onPress, onMapReady, onRegionChangeComplete, markers, onMarkerClick, ...props }, ref) => {
    const mapViewRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: any, duration?: number) => {
        if (mapViewRef.current?.setCameraPosition) {
          mapViewRef.current.setCameraPosition({
            coordinates: {
              latitude: region.latitude,
              longitude: region.longitude,
            },
            zoom: latDeltaToZoom(region.latitudeDelta),
            duration: duration || 800,
          });
        }
      },
    }));

    if (mapLoadError || !ExpoMaps?.GoogleMaps?.View) {
      return <MapFallback />;
    }

    const GoogleMapsView = ExpoMaps.GoogleMaps.View;

    // Convert initialRegion to cameraPosition
    const cameraPosition = initialRegion
      ? {
          coordinates: {
            latitude: initialRegion.latitude,
            longitude: initialRegion.longitude,
          },
          zoom: latDeltaToZoom(initialRegion.latitudeDelta),
        }
      : {
          coordinates: { latitude: 39.8283, longitude: -98.5795 },
          zoom: 4,
        };

    // Convert markers to expo-maps format
    const expoMarkers = markers || [];

    return (
      <MapErrorBoundary>
        <GoogleMapsView
          ref={mapViewRef}
          style={style}
          cameraPosition={cameraPosition}
          markers={expoMarkers}
          uiSettings={{
            myLocationButtonEnabled: false,
            compassEnabled: false,
          }}
          properties={{
            isMyLocationEnabled: props.showsUserLocation ?? true,
          }}
          onMapLoaded={() => {
            if (onMapReady) onMapReady();
          }}
          onMapClick={() => {
            if (onPress) onPress();
          }}
          onMarkerClick={(marker: any) => {
            if (onMarkerClick) onMarkerClick(marker);
          }}
          onCameraMove={(event: any) => {
            if (onRegionChangeComplete) {
              const zoom = event?.zoom ?? 4;
              const delta = zoomToLatDelta(zoom);
              onRegionChangeComplete({
                latitude: event?.coordinates?.latitude ?? 39.8283,
                longitude: event?.coordinates?.longitude ?? -98.5795,
                latitudeDelta: delta,
                longitudeDelta: delta * 1.5,
              });
            }
          }}
        />
      </MapErrorBoundary>
    );
  }
);

MapViewWrapper.displayName = "MapViewWrapper";

/**
 * MarkerWrapper is a no-op on expo-maps since markers are passed as data props.
 * We keep this export for backward compatibility but it renders nothing.
 */
export const MarkerWrapper = ((_props: any) => null) as any;

// Helper: convert latitude delta to Google Maps zoom level
function latDeltaToZoom(latDelta: number): number {
  if (latDelta <= 0) return 15;
  // Approximate: zoom = log2(360 / latDelta)
  const zoom = Math.log2(360 / latDelta);
  return Math.max(2, Math.min(20, zoom));
}

// Helper: convert Google Maps zoom level to latitude delta
function zoomToLatDelta(zoom: number): number {
  return 360 / Math.pow(2, zoom);
}
