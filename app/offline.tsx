import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { STATE_LIST } from "@/lib/all-sites-data";

interface DownloadState {
  stateCode: string;
  status: "none" | "downloading" | "downloaded";
  sizeMB: number;
}

export default function OfflineScreen() {
  const colors = useColors();
  const router = useRouter();
  const [downloads, setDownloads] = useState<Record<string, DownloadState>>({});

  const totalDownloaded = Object.values(downloads).filter((d) => d.status === "downloaded").length;
  const totalSizeMB = Object.values(downloads).filter((d) => d.status === "downloaded").reduce((sum, d) => sum + d.sizeMB, 0);

  function handleDownload(stateCode: string, stateName: string) {
    const sizeMB = Math.floor(Math.random() * 8) + 3;
    setDownloads((prev) => ({ ...prev, [stateCode]: { stateCode, status: "downloading", sizeMB } }));
    setTimeout(() => {
      setDownloads((prev) => ({ ...prev, [stateCode]: { stateCode, status: "downloaded", sizeMB } }));
    }, 1500);
  }

  function handleDelete(stateCode: string, stateName: string) {
    Alert.alert("Remove Download", `Remove offline data for ${stateName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        setDownloads((prev) => {
          const next = { ...prev };
          delete next[stateCode];
          return next;
        });
      }},
    ]);
  }

  function handleDownloadAll() {
    Alert.alert("Download All States", "This will download campsite data for all 50 states (~250 MB). Continue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Download All", onPress: () => {
        STATE_LIST.forEach((state, i) => {
          const sizeMB = Math.floor(Math.random() * 8) + 3;
          setTimeout(() => {
            setDownloads((prev) => ({ ...prev, [state.code]: { stateCode: state.code, status: "downloading", sizeMB } }));
          }, i * 100);
          setTimeout(() => {
            setDownloads((prev) => ({ ...prev, [state.code]: { stateCode: state.code, status: "downloaded", sizeMB } }));
          }, i * 100 + 1500);
        });
      }},
    ]);
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Offline Maps</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Download state data for offline access</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Stats Bar */}
        <View style={[styles.statsBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalDownloaded}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>States Saved</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalSizeMB} MB</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Storage Used</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>50</Text>
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
          <Text style={styles.downloadAllText}>Download All States</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="info" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Offline data includes campground names, locations, amenities, ratings, and state laws. Map tiles require an internet connection.
          </Text>
        </View>

        {/* State List */}
        {STATE_LIST.map((state) => {
          const dl = downloads[state.code];
          const isDownloaded = dl?.status === "downloaded";
          const isDownloading = dl?.status === "downloading";

          return (
            <View key={state.code} style={[styles.stateRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.stateCode, { backgroundColor: isDownloaded ? colors.success + "15" : colors.primary + "10" }]}>
                <Text style={[styles.stateCodeText, { color: isDownloaded ? colors.success : colors.primary }]}>{state.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stateName, { color: colors.foreground }]}>{state.name}</Text>
                <Text style={[styles.stateSites, { color: colors.muted }]}>
                  {state.siteCount} sites{isDownloaded ? ` · ${dl.sizeMB} MB` : ""}
                </Text>
              </View>
              {isDownloading ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.warning + "15" }]}>
                  <MaterialIcons name="hourglass-top" size={16} color={colors.warning} />
                  <Text style={[styles.statusText, { color: colors.warning }]}>Saving...</Text>
                </View>
              ) : isDownloaded ? (
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
                  onPress={() => handleDownload(state.code, state.name)}
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 8, gap: 4 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  statsBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 30 },
  downloadAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
  downloadAllText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  stateRow: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 4, padding: 12, borderRadius: 10, borderWidth: 1 },
  stateCode: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  stateCodeText: { fontSize: 14, fontWeight: "800" },
  stateName: { fontSize: 15, fontWeight: "600" },
  stateSites: { fontSize: 12, marginTop: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600" },
  dlBtn: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
});
