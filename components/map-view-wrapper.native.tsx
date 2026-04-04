import React, { forwardRef } from "react";
import MapView, { Marker } from "react-native-maps";

/**
 * Native MapView wrapper using react-native-maps.
 * This file is automatically used on iOS/Android by Metro's platform resolution.
 */

export const MapViewWrapper = forwardRef<MapView, any>(
  ({ children, ...props }, ref) => {
    return (
      <MapView ref={ref} {...props}>
        {children}
      </MapView>
    );
  }
);

MapViewWrapper.displayName = "MapViewWrapper";

export const MarkerWrapper = Marker;
