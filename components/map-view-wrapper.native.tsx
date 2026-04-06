/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import React, { forwardRef } from "react";
import MapView, { Marker, type MapViewProps, type MapMarkerProps } from "react-native-maps";

/**
 * Native map wrapper using react-native-maps.
 * Uses Apple Maps on iOS and Google Maps on Android (built-in, no API key needed for Expo Go).
 */
export const MapViewWrapper = forwardRef<MapView, MapViewProps>(
  (props, ref) => {
    return <MapView ref={ref} {...props} />;
  }
);

MapViewWrapper.displayName = "MapViewWrapper";

export const MarkerWrapper = Marker as React.ComponentType<MapMarkerProps>;
