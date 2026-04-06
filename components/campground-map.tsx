/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 *
 * Interactive campground map using Leaflet + OpenStreetMap via WebView.
 * This approach works reliably in Expo Go, published APKs, and web
 * without requiring any API keys.
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { CATEGORY_COLORS, CATEGORY_LABELS, type CampSite } from "@/lib/types";

interface CampgroundMapProps {
  sites: CampSite[];
  onSelectSite: (site: CampSite) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

// Limit markers sent to the WebView for performance
const MAX_MARKERS = 500;

/**
 * Simple grid-based clustering to reduce marker count.
 */
function clusterForMap(
  sites: CampSite[],
  maxMarkers: number = MAX_MARKERS
): Array<{
  id: string;
  lat: number;
  lng: number;
  count: number;
  name: string;
  category: string;
  color: string;
  siteId: string;
}> {
  if (sites.length <= maxMarkers) {
    return sites.map((s) => ({
      id: s.id,
      lat: s.latitude,
      lng: s.longitude,
      count: 1,
      name: s.name,
      category: s.category,
      color: CATEGORY_COLORS[s.category] || "#2E7D32",
      siteId: s.id,
    }));
  }

  // Grid clustering
  const gridSize = 0.5; // ~30 miles per cell
  const clusters = new Map<
    string,
    { lat: number; lng: number; count: number; sites: CampSite[] }
  >();

  for (const site of sites) {
    const gx = Math.floor(site.longitude / gridSize);
    const gy = Math.floor(site.latitude / gridSize);
    const key = `${gx}_${gy}`;
    if (clusters.has(key)) {
      const c = clusters.get(key)!;
      c.count++;
      c.lat = (c.lat * (c.count - 1) + site.latitude) / c.count;
      c.lng = (c.lng * (c.count - 1) + site.longitude) / c.count;
      c.sites.push(site);
    } else {
      clusters.set(key, {
        lat: site.latitude,
        lng: site.longitude,
        count: 1,
        sites: [site],
      });
    }
  }

  return Array.from(clusters.entries()).map(([key, c]) => ({
    id: key,
    lat: c.lat,
    lng: c.lng,
    count: c.count,
    name:
      c.count === 1
        ? c.sites[0].name
        : `${c.count} campgrounds`,
    category: c.count === 1 ? c.sites[0].category : "cluster",
    color:
      c.count === 1
        ? CATEGORY_COLORS[c.sites[0].category] || "#2E7D32"
        : "#FF6F00",
    siteId: c.count === 1 ? c.sites[0].id : "",
  }));
}

function buildMapHTML(
  markers: ReturnType<typeof clusterForMap>,
  userLat?: number,
  userLng?: number,
  isDark?: boolean
): string {
  const markersJSON = JSON.stringify(markers);
  const bgColor = isDark ? "#151718" : "#ffffff";
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttrib = isDark
    ? '&copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>';

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; background: ${bgColor}; }
  .cluster-icon {
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%; color: #fff; font-weight: 800;
    font-size: 11px; border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  .single-icon {
    width: 12px; height: 12px; border-radius: 50%;
    border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .leaflet-popup-content-wrapper {
    border-radius: 10px; padding: 0;
    ${isDark ? "background: #1e2022; color: #ECEDEE;" : ""}
  }
  .leaflet-popup-content { margin: 10px 14px; font-family: -apple-system, sans-serif; }
  .popup-name { font-weight: 700; font-size: 14px; margin-bottom: 2px; }
  .popup-cat { font-size: 12px; opacity: 0.7; }
  .popup-tap { font-size: 11px; color: #0a7ea4; margin-top: 6px; font-weight: 600; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    center: [39.5, -98.35],
    zoom: 4,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('${tileUrl}', { attribution: '${tileAttrib}', maxZoom: 18 }).addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);

  var markers = ${markersJSON};
  var markerLayer = L.layerGroup().addTo(map);

  function addMarkers() {
    markerLayer.clearLayers();
    markers.forEach(function(m) {
      var icon;
      if (m.count > 1) {
        var size = m.count > 50 ? 40 : m.count > 10 ? 34 : 28;
        icon = L.divIcon({
          className: '',
          html: '<div class="cluster-icon" style="width:' + size + 'px;height:' + size + 'px;background:' + m.color + '">' + (m.count > 99 ? '99+' : m.count) + '</div>',
          iconSize: [size, size],
          iconAnchor: [size/2, size/2]
        });
      } else {
        icon = L.divIcon({
          className: '',
          html: '<div class="single-icon" style="background:' + m.color + '"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
      }

      var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(markerLayer);

      if (m.count === 1) {
        marker.bindPopup(
          '<div class="popup-name">' + m.name.replace(/</g, '&lt;') + '</div>' +
          '<div class="popup-cat">' + (m.category || '') + '</div>' +
          '<div class="popup-tap">Tap to view details</div>',
          { closeButton: false, maxWidth: 220 }
        );
        marker.on('click', function() {
          marker.openPopup();
          // Send site ID to React Native after a short delay for popup display
          setTimeout(function() {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'select', siteId: m.siteId
            }));
          }, 1500);
        });
      } else {
        marker.on('click', function() {
          map.setView([m.lat, m.lng], map.getZoom() + 3, { animate: true });
        });
      }
    });
  }

  addMarkers();

  ${userLat && userLng ? `
  L.circleMarker([${userLat}, ${userLng}], {
    radius: 8, fillColor: '#4285F4', fillOpacity: 1,
    color: '#fff', weight: 3
  }).addTo(map);
  ` : ""}

  // Listen for messages from React Native
  document.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'recenter' && msg.lat && msg.lng) {
        map.setView([msg.lat, msg.lng], 8, { animate: true });
      }
      if (msg.type === 'updateMarkers' && msg.markers) {
        markers = msg.markers;
        addMarkers();
      }
    } catch(err) {}
  });
  window.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'recenter' && msg.lat && msg.lng) {
        map.setView([msg.lat, msg.lng], 8, { animate: true });
      }
    } catch(err) {}
  });
</script>
</body>
</html>`;
}

export function CampgroundMap({ sites, onSelectSite, userLocation }: CampgroundMapProps) {
  const colors = useColors();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const isDark = colors.background === "#151718";

  // Build clustered markers
  const markers = useMemo(() => clusterForMap(sites, MAX_MARKERS), [sites]);

  // Build the HTML once
  const html = useMemo(
    () =>
      buildMapHTML(
        markers,
        userLocation?.latitude,
        userLocation?.longitude,
        isDark
      ),
    [markers, userLocation, isDark]
  );

  // Create a lookup map for site IDs
  const siteMap = useMemo(() => {
    const m = new Map<string, CampSite>();
    for (const s of sites) m.set(s.id, s);
    return m;
  }, [sites]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "select" && data.siteId) {
          const site = siteMap.get(data.siteId);
          if (site) onSelectSite(site);
        }
      } catch {}
    },
    [siteMap, onSelectSite]
  );

  const handleRecenter = useCallback(() => {
    if (userLocation) {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "recenter",
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        })
      );
    }
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.map}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        cacheEnabled
        originWhitelist={["*"]}
      />

      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Loading map...
          </Text>
        </View>
      )}

      {/* My Location button */}
      {userLocation && (
        <View style={styles.controls}>
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
      )}

      {/* Site count badge */}
      <View style={[styles.countBadge, { backgroundColor: colors.background + "E0" }]}>
        <MaterialIcons name="place" size={14} color={colors.primary} />
        <Text style={[styles.countText, { color: colors.foreground }]}>
          {sites.length.toLocaleString()} campgrounds
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  map: { flex: 1, backgroundColor: "transparent" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: { marginTop: 12, fontSize: 14 },
  controls: {
    position: "absolute",
    top: 12,
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
});
