/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MapViewWrapper, MarkerWrapper } from "@/components/map-view-wrapper";
import { useColors } from "@/hooks/use-colors";
import { CATEGORY_COLORS, CATEGORY_LABELS, type CampSite } from "@/lib/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Region for continental US + Canada
const DEFAULT_REGION = {
  latitude: 39.5,
  longitude: -98.35,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

interface CampgroundMapProps {
  sites: CampSite[];
  onSelectSite: (site: CampSite) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

/**
 * Simple grid-based clustering for performance with 18K+ markers.
 * Groups nearby sites into clusters based on the current zoom level.
 */
interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  sites: CampSite[];
  category?: string;
}

function clusterSites(
  sites: CampSite[],
  latDelta: number,
  lonDelta: number,
  maxMarkers: number = 200
): Cluster[] {
  if (sites.length <= maxMarkers) {
    // Show individual markers
    return sites.map((s) => ({
      id: s.id,
      latitude: s.latitude,
      longitude: s.longitude,
      count: 1,
      sites: [s],
      category: s.category,
    }));
  }

  // Grid-based clustering
  const gridSize = Math.max(latDelta, lonDelta) / 15;
  const clusters = new Map<string, Cluster>();

  for (const site of sites) {
    const gridX = Math.floor(site.longitude / gridSize);
    const gridY = Math.floor(site.latitude / gridSize);
    const key = `${gridX}_${gridY}`;

    if (clusters.has(key)) {
      const c = clusters.get(key)!;
      c.count++;
      c.latitude = (c.latitude * (c.count - 1) + site.latitude) / c.count;
      c.longitude = (c.longitude * (c.count - 1) + site.longitude) / c.count;
      c.sites.push(site);
      c.category = undefined; // Mixed cluster
    } else {
      clusters.set(key, {
        id: key,
        latitude: site.latitude,
        longitude: site.longitude,
        count: 1,
        sites: [site],
        category: site.category,
      });
    }
  }

  return Array.from(clusters.values());
}

export function CampgroundMap({ sites, onSelectSite, userLocation }: CampgroundMapProps) {
  const colors = useColors();
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  // Filter sites visible in current region (with some padding)
  const visibleSites = useMemo(() => {
    const pad = 0.1;
    const minLat = region.latitude - region.latitudeDelta / 2 - pad;
    const maxLat = region.latitude + region.latitudeDelta / 2 + pad;
    const minLon = region.longitude - region.longitudeDelta / 2 - pad;
    const maxLon = region.longitude + region.longitudeDelta / 2 + pad;

    return sites.filter(
      (s) => s.latitude >= minLat && s.latitude <= maxLat && s.longitude >= minLon && s.longitude <= maxLon
    );
  }, [sites, region]);

  // Cluster visible sites
  const clusters = useMemo(() => {
    return clusterSites(visibleSites, region.latitudeDelta, region.longitudeDelta);
  }, [visibleSites, region.latitudeDelta, region.longitudeDelta]);

  const handleRegionChange = useCallback((newRegion: any) => {
    setRegion(newRegion);
    setSelectedCluster(null);
  }, []);

  const handleClusterPress = useCallback(
    (cluster: Cluster) => {
      if (cluster.count === 1) {
        onSelectSite(cluster.sites[0]);
      } else if (cluster.count <= 5) {
        // Show a selection popup
        setSelectedCluster(cluster);
      } else {
        // Zoom in
        mapRef.current?.animateToRegion(
          {
            latitude: cluster.latitude,
            longitude: cluster.longitude,
            latitudeDelta: region.latitudeDelta / 3,
            longitudeDelta: region.longitudeDelta / 3,
          },
          300
        );
      }
    },
    [onSelectSite, region]
  );

  const handleRecenter = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 2,
          longitudeDelta: 2,
        },
        400
      );
    } else {
      mapRef.current?.animateToRegion(DEFAULT_REGION, 400);
    }
  }, [userLocation]);

  // Get marker color based on category
  const getMarkerColor = (cluster: Cluster): string => {
    if (cluster.count > 1 && !cluster.category) return "#FF6F00"; // Orange for mixed clusters
    const cat = cluster.category || cluster.sites[0]?.category;
    return CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#2E7D32";
  };

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webPlaceholder, { backgroundColor: colors.surface }]}>
        <MaterialIcons name="map" size={48} color={colors.primary} />
        <Text style={[styles.webPlaceholderTitle, { color: colors.foreground }]}>
          Interactive Map
        </Text>
        <Text style={[styles.webPlaceholderText, { color: colors.muted }]}>
          Available on iOS and Android via Expo Go
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapViewWrapper
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        mapType="standard"
      >
        {clusters.map((cluster) => (
          <MarkerWrapper
            key={cluster.id}
            coordinate={{
              latitude: cluster.latitude,
              longitude: cluster.longitude,
            }}
            onPress={() => handleClusterPress(cluster)}
            tracksViewChanges={false}
          >
            {cluster.count > 1 ? (
              <View style={[styles.clusterMarker, { backgroundColor: getMarkerColor(cluster) }]}>
                <Text style={styles.clusterText}>
                  {cluster.count > 99 ? "99+" : cluster.count}
                </Text>
              </View>
            ) : (
              <View style={[styles.singleMarker, { backgroundColor: getMarkerColor(cluster) }]}>
                <MaterialIcons name="place" size={16} color="#FFF" />
              </View>
            )}
          </MarkerWrapper>
        ))}
      </MapViewWrapper>

      {/* Map controls */}
      <View style={[styles.controls, { top: 12 }]}>
        <Pressable
          onPress={handleRecenter}
          style={({ pressed }) => [
            styles.controlButton,
            { backgroundColor: colors.background },
            pressed && { opacity: 0.8 },
          ]}
        >
          <MaterialIcons name="my-location" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Site count badge */}
      <View style={[styles.countBadge, { backgroundColor: colors.background + "E0" }]}>
        <MaterialIcons name="place" size={14} color={colors.primary} />
        <Text style={[styles.countText, { color: colors.foreground }]}>
          {visibleSites.length.toLocaleString()} sites in view
        </Text>
      </View>

      {/* Cluster popup */}
      {selectedCluster && selectedCluster.count > 1 && selectedCluster.count <= 5 && (
        <View style={[styles.clusterPopup, { backgroundColor: colors.background }]}>
          <View style={styles.clusterPopupHeader}>
            <Text style={[styles.clusterPopupTitle, { color: colors.foreground }]}>
              {selectedCluster.count} Campgrounds
            </Text>
            <Pressable
              onPress={() => setSelectedCluster(null)}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>
          {selectedCluster.sites.map((site) => {
            const catColor = CATEGORY_COLORS[site.category] || "#666";
            return (
              <Pressable
                key={site.id}
                onPress={() => {
                  setSelectedCluster(null);
                  onSelectSite(site);
                }}
                style={({ pressed }) => [
                  styles.clusterItem,
                  { borderBottomColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.clusterItemDot, { backgroundColor: catColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.clusterItemName, { color: colors.foreground }]} numberOfLines={1}>
                    {site.name}
                  </Text>
                  <Text style={[styles.clusterItemSub, { color: colors.muted }]}>
                    {CATEGORY_LABELS[site.category] || site.category} • {site.city}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={colors.muted} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  map: { flex: 1 },
  // Markers
  clusterMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  clusterText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
  singleMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  // Controls
  controls: {
    position: "absolute",
    right: 12,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  // Count badge
  countBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  countText: { fontSize: 12, fontWeight: "600" },
  // Cluster popup
  clusterPopup: {
    position: "absolute",
    bottom: 50,
    left: 16,
    right: 16,
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  clusterPopupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clusterPopupTitle: { fontSize: 16, fontWeight: "700" },
  clusterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  clusterItemDot: { width: 8, height: 8, borderRadius: 4 },
  clusterItemName: { fontSize: 14, fontWeight: "600" },
  clusterItemSub: { fontSize: 12, marginTop: 1 },
  // Web placeholder
  webPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    margin: 16,
  },
  webPlaceholderTitle: { fontSize: 20, fontWeight: "700", marginTop: 12 },
  webPlaceholderText: { fontSize: 14, textAlign: "center", marginTop: 6 },
});
