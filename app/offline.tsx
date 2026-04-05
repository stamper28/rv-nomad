import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  cacheStateData,
  removeCachedState,
  getCacheMeta,
  clearAllCache,
} from "@/lib/offline-cache";
import type { CampSite, StateLaws } from "@/lib/types";

type SimpleState = { code: string; name: string; siteCount: number };

interface CacheInfo {
  count: number;
  sizeKB: number;
  cachedAt: number;
}

export default function OfflineScreen() {
  const colors = useColors();
  const router = useRouter();
  const [stateList, setStateList] = useState<SimpleState[]>([]);
  const [allSites, setAllSites] = useState<CampSite[]>([]);
  const [stateLaws, setStateLaws] = useState<Record<string, StateLaws>>({});
  const [cachedStates, setCachedStates] = useState<Record<string, CacheInfo>>({});
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load data and cache meta
  useEffect(() => {
    Promise.all([
      import("@/lib/all-sites-data").then((mod) => {
        setStateList(mod.STATE_LIST);
        setAllSites(mod.ALL_SITES);
        setStateLaws(mod.STATE_LAWS);
      }),
      getCacheMeta().then((meta) => setCachedStates(meta.states)),
    ]).then(() => setDataLoaded(true));
  }, []);

  const totalCached = Object.keys(cachedStates).length;
  const totalSizeKB = Object.values(cachedStates).reduce((sum, s) => sum + s.sizeKB, 0);
  const totalSizeMB = (totalSizeKB / 1024).toFixed(1);

  const handleDownload = useCallback(
    async (stateCode: string) => {
      setDownloading((prev) => new Set(prev).add(stateCode));
      try {
        const sites = allSites.filter((s) => s.state === stateCode);
        const laws = stateLaws[stateCode];
        const { sizeKB } = await cacheStateData(stateCode, sites, laws);
        setCachedStates((prev) => ({
          ...prev,
          [stateCode]: { count: sites.length, sizeKB, cachedAt: Date.now() },
        }));
      } catch (e) {
        Alert.alert("Error", "Failed to save offline data. Please try again.");
      } finally {
        setDownloading((prev) => {
          const next = new Set(prev);
          next.delete(stateCode);
          return next;
        });
      }
    },
    [allSites, stateLaws]
  );

  const handleDelete = useCallback((stateCode: string, stateName: string) => {
    Alert.alert("Remove Download", `Remove offline data for ${stateName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await removeCachedState(stateCode);
          setCachedStates((prev) => {
            const next = { ...prev };
            delete next[stateCode];
            return next;
          });
        },
      },
    ]);
  }, []);

  const handleDownloadAll = useCallback(() => {
    const uncached = stateList.filter((s) => !cachedStates[s.code]);
    if (uncached.length === 0) {
      Alert.alert("All Saved", "All states/provinces are already saved for offline access.");
      return;
    }
    Alert.alert(
      "Download All",
      `Download campsite data for ${uncached.length} states/provinces? This may take a moment.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download All",
          onPress: async () => {
            for (const state of uncached) {
              await handleDownload(state.code);
            }
          },
        },
      ]
    );
  }, [stateList, cachedStates, handleDownload]);

  const handleClearAll = useCallback(() => {
    if (totalCached === 0) return;
    Alert.alert("Clear All", "Remove all offline data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          await clearAllCache();
          setCachedStates({});
        },
      },
    ]);
  }, [totalCached]);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Offline Data</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Save campsite data for use without internet
          </Text>
        </View>
        {totalCached > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={{ padding: 4 }}>
            <MaterialIcons name="delete-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Stats Bar */}
        <View style={[styles.statsBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalCached}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>States Saved</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalSizeMB} MB</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Storage Used</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stateList.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Available</Text>
          </View>
        </View>

        {/* Download All Button */}
        <TouchableOpacity
          style={[styles.downloadAllBtn, { backgroundColor: colors.primary }]}
          onPress={handleDownloadAll}
          activeOpacity={0.8}
        >
          <MaterialIcons name="cloud-download" size={20} color="#fff" />
          <Text style={styles.downloadAllText}>Download All States & Provinces</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="info" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Offline data includes campground names, locations, amenities, ratings, pricing, and state
            laws. Data persists between app sessions. Map tiles still require internet.
          </Text>
        </View>

        {/* State List */}
        {stateList.map((state: SimpleState) => {
          const cached = cachedStates[state.code];
          const isDownloading = downloading.has(state.code);
          const isCached = !!cached;

          return (
            <View
              key={state.code}
              style={[styles.stateRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View
                style={[
                  styles.stateCode,
                  { backgroundColor: isCached ? colors.success + "15" : colors.primary + "10" },
                ]}
              >
                <Text
                  style={[styles.stateCodeText, { color: isCached ? colors.success : colors.primary }]}
                >
                  {state.code}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stateName, { color: colors.foreground }]}>{state.name}</Text>
                <Text style={[styles.stateSites, { color: colors.muted }]}>
                  {state.siteCount} sites
                  {isCached ? ` \u00b7 ${(cached.sizeKB / 1024).toFixed(1)} MB` : ""}
                </Text>
              </View>
              {isDownloading ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.warning + "15" }]}>
                  <MaterialIcons name="hourglass-top" size={16} color={colors.warning} />
                  <Text style={[styles.statusText, { color: colors.warning }]}>Saving...</Text>
                </View>
              ) : isCached ? (
                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: colors.success + "15" }]}
                  onPress={() => handleDelete(state.code, state.name)}
                >
                  <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>Saved</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.dlBtn, { backgroundColor: colors.primary + "15" }]}
                  onPress={() => handleDownload(state.code)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="download" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 4,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 30 },
  downloadAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  downloadAllText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  stateCode: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  stateCodeText: { fontSize: 14, fontWeight: "800" },
  stateName: { fontSize: 15, fontWeight: "600" },
  stateSites: { fontSize: 12, marginTop: 1 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  dlBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
