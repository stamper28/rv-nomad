import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

/**
 * Native map wrapper - renders a placeholder.
 * Native map libraries (react-native-maps, expo-maps) have been removed
 * to prevent APK crashes. The home screen uses a list-based UI instead.
 */

function MapPlaceholder() {
  return (
    <View style={styles.container}>
      <MaterialIcons name="map" size={64} color="#2E7D32" />
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.subtitle}>
        Browse campgrounds using the list below
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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

export const MapViewWrapper = forwardRef<any, any>(
  ({ children, style, ...props }, ref) => {
    return <MapPlaceholder />;
  }
);

MapViewWrapper.displayName = "MapViewWrapper";

export const MarkerWrapper = ((_props: any) => null) as any;
