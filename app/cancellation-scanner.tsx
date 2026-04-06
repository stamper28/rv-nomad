/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useCallback } from "react";
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet, Alert, Switch, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface WatchedCampground {
  id: string;
  name: string;
  state: string;
  dates: string;
  status: "watching" | "found" | "expired";
  lastChecked: string;
  checksToday: number;
  notifyPush: boolean;
  notifySms: boolean;
  notifyEmail: boolean;
}

interface RecentOpening {
  id: string;
  campgroundName: string;
  state: string;
  siteNumber: string;
  dates: string;
  foundAt: string;
  pricePerNight: number;
  hookup: string;
  status: "available" | "claimed";
}

const WATCHED: WatchedCampground[] = [
  { id: "w1", name: "Yosemite Upper Pines", state: "CA", dates: "Jul 4-8, 2026", status: "watching", lastChecked: "2 min ago", checksToday: 47, notifyPush: true, notifySms: true, notifyEmail: false },
  { id: "w2", name: "Zion Watchman Campground", state: "UT", dates: "Jun 15-20, 2026", status: "watching", lastChecked: "5 min ago", checksToday: 42, notifyPush: true, notifySms: false, notifyEmail: true },
  { id: "w3", name: "Glacier Apgar Campground", state: "MT", dates: "Aug 1-5, 2026", status: "found", lastChecked: "1 hr ago", checksToday: 38, notifyPush: true, notifySms: true, notifyEmail: true },
  { id: "w4", name: "Grand Canyon Mather", state: "AZ", dates: "May 20-25, 2026", status: "expired", lastChecked: "3 days ago", checksToday: 0, notifyPush: false, notifySms: false, notifyEmail: false },
];

const RECENT_OPENINGS: RecentOpening[] = [
  { id: "o1", campgroundName: "Glacier Apgar Campground", state: "MT", siteNumber: "Site A14", dates: "Aug 1-5, 2026", foundAt: "Today 2:34 PM", pricePerNight: 25, hookup: "None", status: "available" },
  { id: "o2", campgroundName: "Yellowstone Bridge Bay", state: "WY", siteNumber: "Site 112", dates: "Jul 10-14, 2026", foundAt: "Today 11:15 AM", pricePerNight: 30, hookup: "None", status: "claimed" },
  { id: "o3", campgroundName: "Acadia Blackwoods", state: "ME", siteNumber: "Site B7", dates: "Sep 5-9, 2026", foundAt: "Yesterday 8:22 PM", pricePerNight: 30, hookup: "Electric", status: "available" },
  { id: "o4", campgroundName: "Rocky Mountain Moraine Park", state: "CO", siteNumber: "Site 44", dates: "Aug 15-18, 2026", foundAt: "Yesterday 3:45 PM", pricePerNight: 30, hookup: "None", status: "claimed" },
  { id: "o5", campgroundName: "Great Smoky Elkmont", state: "TN", siteNumber: "Site 22", dates: "Jun 20-24, 2026", foundAt: "2 days ago", pricePerNight: 25, hookup: "None", status: "available" },
];

export default function CancellationScannerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<"watching" | "openings">("watching");
  const [refreshing, setRefreshing] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleAddWatch = () => {
    Alert.alert(
      "Add Campground Watch",
      "To watch for cancellations:\n\n1. Go to any campground detail page\n2. Tap the 'Watch for Cancellations' button\n3. Select your desired dates\n4. We'll notify you instantly when a spot opens up!",
      [{ text: "Got It" }]
    );
  };

  const handleBookOpening = (opening: RecentOpening) => {
    if (opening.status === "claimed") {
      Alert.alert("Already Claimed", "This opening was already booked by another user. We'll keep scanning for more!");
      return;
    }
    Alert.alert(
      "Book This Spot?",
      `${opening.campgroundName}\n${opening.siteNumber}\n${opening.dates}\nEst. $${opening.pricePerNight}/night`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Book Now", onPress: () => Alert.alert("Redirecting...", "Taking you to the booking page to secure this spot before someone else does!") },
      ]
    );
  };

  const statusColors: Record<string, string> = {
    watching: colors.primary,
    found: colors.success,
    expired: colors.muted,
  };

  const statusLabels: Record<string, string> = {
    watching: "Scanning",
    found: "Opening Found!",
    expired: "Expired",
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Cancellation Scanner</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Scanner Status */}
      <View style={[styles.statusBanner, { backgroundColor: scannerActive ? colors.success + "15" : colors.error + "15", borderColor: scannerActive ? colors.success + "40" : colors.error + "40" }]}>
        <View style={[styles.statusDot, { backgroundColor: scannerActive ? colors.success : colors.error }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusTitle, { color: scannerActive ? colors.success : colors.error }]}>
            {scannerActive ? "Scanner Active" : "Scanner Paused"}
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors.muted }]}>
            {scannerActive ? "Checking every 5 minutes for cancellations" : "Turn on to start scanning for openings"}
          </Text>
        </View>
        <Switch
          value={scannerActive}
          onValueChange={setScannerActive}
          trackColor={{ false: colors.border, true: colors.success + "50" }}
          thumbColor={scannerActive ? colors.success : colors.muted}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab("watching")}
          style={[styles.tab, { borderBottomColor: tab === "watching" ? colors.primary : "transparent" }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="visibility" size={18} color={tab === "watching" ? colors.primary : colors.muted} />
          <Text style={[styles.tabText, { color: tab === "watching" ? colors.primary : colors.muted }]}>
            Watching ({WATCHED.filter(w => w.status === "watching").length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("openings")}
          style={[styles.tab, { borderBottomColor: tab === "openings" ? colors.primary : "transparent" }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="notifications-active" size={18} color={tab === "openings" ? colors.primary : colors.muted} />
          <Text style={[styles.tabText, { color: tab === "openings" ? colors.primary : colors.muted }]}>
            Openings ({RECENT_OPENINGS.filter(o => o.status === "available").length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {tab === "watching" ? (
          <>
            {/* Add Watch Button */}
            <TouchableOpacity
              onPress={handleAddWatch}
              style={[styles.addWatchBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add-alert" size={20} color="#fff" />
              <Text style={styles.addWatchText}>Watch a Campground</Text>
            </TouchableOpacity>

            {/* How It Works */}
            <View style={[styles.howItWorks, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.howTitle, { color: colors.foreground }]}>How It Works</Text>
              <View style={styles.howStep}>
                <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.muted }]}>Pick a campground and your desired dates</Text>
              </View>
              <View style={styles.howStep}>
                <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.muted }]}>We scan every 5 minutes for cancellations</Text>
              </View>
              <View style={styles.howStep}>
                <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.muted }]}>Get instant push/SMS/email notification</Text>
              </View>
              <View style={styles.howStep}>
                <View style={[styles.stepNum, { backgroundColor: colors.success }]}>
                  <Text style={styles.stepNumText}>4</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.muted }]}>Book immediately before someone else does!</Text>
              </View>
            </View>

            {/* Watched List */}
            {WATCHED.map((watch) => (
              <View key={watch.id} style={[styles.watchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.watchHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.watchName, { color: colors.foreground }]}>{watch.name}</Text>
                    <Text style={[styles.watchState, { color: colors.muted }]}>{watch.state} • {watch.dates}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[watch.status] + "15" }]}>
                    {watch.status === "watching" && <View style={[styles.pulsingDot, { backgroundColor: statusColors[watch.status] }]} />}
                    <Text style={[styles.statusBadgeText, { color: statusColors[watch.status] }]}>{statusLabels[watch.status]}</Text>
                  </View>
                </View>

                {watch.status === "watching" && (
                  <>
                    <View style={styles.scanInfo}>
                      <View style={styles.scanItem}>
                        <MaterialIcons name="schedule" size={14} color={colors.muted} />
                        <Text style={[styles.scanText, { color: colors.muted }]}>Last checked: {watch.lastChecked}</Text>
                      </View>
                      <View style={styles.scanItem}>
                        <MaterialIcons name="refresh" size={14} color={colors.muted} />
                        <Text style={[styles.scanText, { color: colors.muted }]}>{watch.checksToday} checks today</Text>
                      </View>
                    </View>
                    <View style={styles.notifyRow}>
                      <Text style={[styles.notifyLabel, { color: colors.muted }]}>Notify via:</Text>
                      {watch.notifyPush && (
                        <View style={[styles.notifyChip, { backgroundColor: colors.primary + "15" }]}>
                          <MaterialIcons name="notifications" size={12} color={colors.primary} />
                          <Text style={[styles.notifyChipText, { color: colors.primary }]}>Push</Text>
                        </View>
                      )}
                      {watch.notifySms && (
                        <View style={[styles.notifyChip, { backgroundColor: colors.success + "15" }]}>
                          <MaterialIcons name="sms" size={12} color={colors.success} />
                          <Text style={[styles.notifyChipText, { color: colors.success }]}>SMS</Text>
                        </View>
                      )}
                      {watch.notifyEmail && (
                        <View style={[styles.notifyChip, { backgroundColor: "#E6510015" }]}>
                          <MaterialIcons name="email" size={12} color="#E65100" />
                          <Text style={[styles.notifyChipText, { color: "#E65100" }]}>Email</Text>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {watch.status === "found" && (
                  <TouchableOpacity
                    style={[styles.bookNowBtn, { backgroundColor: colors.success }]}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert("Opening Found!", "Redirecting to booking page...")}
                  >
                    <MaterialIcons name="flash-on" size={18} color="#fff" />
                    <Text style={styles.bookNowText}>Book Now — Before It's Gone!</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        ) : (
          <>
            {/* Recent Openings */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Cancellations Found</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Openings detected across all watched campgrounds</Text>

            {RECENT_OPENINGS.map((opening) => (
              <TouchableOpacity
                key={opening.id}
                style={[styles.openingCard, { backgroundColor: colors.surface, borderColor: opening.status === "available" ? colors.success + "40" : colors.border }]}
                onPress={() => handleBookOpening(opening)}
                activeOpacity={0.7}
              >
                <View style={styles.openingHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.openingName, { color: colors.foreground }]}>{opening.campgroundName}</Text>
                    <Text style={[styles.openingState, { color: colors.muted }]}>{opening.state} • {opening.siteNumber}</Text>
                  </View>
                  <View style={[styles.availBadge, { backgroundColor: opening.status === "available" ? colors.success + "15" : colors.error + "15" }]}>
                    <Text style={[styles.availText, { color: opening.status === "available" ? colors.success : colors.error }]}>
                      {opening.status === "available" ? "AVAILABLE" : "CLAIMED"}
                    </Text>
                  </View>
                </View>
                <View style={styles.openingDetails}>
                  <View style={styles.openingDetail}>
                    <MaterialIcons name="date-range" size={14} color={colors.muted} />
                    <Text style={[styles.openingDetailText, { color: colors.foreground }]}>{opening.dates}</Text>
                  </View>
                  <View style={styles.openingDetail}>
                    <MaterialIcons name="attach-money" size={14} color={colors.muted} />
                    <Text style={[styles.openingDetailText, { color: colors.foreground }]}>Est. ${opening.pricePerNight}/night</Text>
                  </View>
                  <View style={styles.openingDetail}>
                    <MaterialIcons name="power" size={14} color={colors.muted} />
                    <Text style={[styles.openingDetailText, { color: colors.foreground }]}>{opening.hookup}</Text>
                  </View>
                </View>
                <Text style={[styles.foundAt, { color: colors.muted }]}>Found: {opening.foundAt}</Text>
                {opening.status === "available" && (
                  <View style={[styles.urgentBanner, { backgroundColor: colors.warning + "10" }]}>
                    <MaterialIcons name="flash-on" size={14} color={colors.warning} />
                    <Text style={[styles.urgentText, { color: colors.warning }]}>Book quickly — cancellations get claimed fast!</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  statusBanner: { marginHorizontal: 16, padding: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12, borderWidth: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusTitle: { fontSize: 14, fontWeight: "700" },
  statusSubtitle: { fontSize: 11, marginTop: 1 },
  tabRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 12 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 10, borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: "600" },
  addWatchBtn: { marginHorizontal: 16, padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  addWatchText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  howItWorks: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 10 },
  howTitle: { fontSize: 14, fontWeight: "700" },
  howStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  stepText: { fontSize: 12, flex: 1 },
  watchCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 10 },
  watchHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  watchName: { fontSize: 15, fontWeight: "700" },
  watchState: { fontSize: 12, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  pulsingDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
  scanInfo: { flexDirection: "row", gap: 16 },
  scanItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  scanText: { fontSize: 11 },
  notifyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  notifyLabel: { fontSize: 11 },
  notifyChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  notifyChipText: { fontSize: 10, fontWeight: "600" },
  bookNowBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, borderRadius: 8 },
  bookNowText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  sectionTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: 16, marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, paddingHorizontal: 16, marginBottom: 12 },
  openingCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 8 },
  openingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  openingName: { fontSize: 15, fontWeight: "700" },
  openingState: { fontSize: 12, marginTop: 2 },
  availBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  availText: { fontSize: 10, fontWeight: "700" },
  openingDetails: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  openingDetail: { flexDirection: "row", alignItems: "center", gap: 4 },
  openingDetailText: { fontSize: 12 },
  foundAt: { fontSize: 10 },
  urgentBanner: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 8 },
  urgentText: { fontSize: 11, fontWeight: "600", flex: 1 },
});
