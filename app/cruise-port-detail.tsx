/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getCruisePortById, type CruisePort, type CruiseLine, type RVParkingOption } from "@/lib/cruise-ports";
import { openUrl } from "@/lib/open-url";

export default function CruisePortDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ portId: string }>();
  const [activeTab, setActiveTab] = useState<"overview" | "parking" | "cruises">("overview");

  const port = useMemo(() => getCruisePortById(params.portId || ""), [params.portId]);

  if (!port) {
    return (
      <ScreenContainer className="p-6" edges={["top", "bottom", "left", "right"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 16 }}>Port not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const regionColor = port.region === "Florida" ? "#FF6B35" : port.region === "Gulf Coast" ? "#0077B6" : port.region === "California" ? "#E91E63" : "#2E7D32";

  const handleDirections = () => {
    const url = Platform.select({
      ios: `maps://maps.apple.com/?daddr=${port.latitude},${port.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${port.latitude},${port.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${port.phone.replace(/[^0-9+]/g, "")}`);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>{port.name}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>{port.city}, {port.state}</Text>
        </View>
        <View style={[styles.regionBadge, { backgroundColor: regionColor + "20" }]}>
          <Text style={[styles.regionBadgeText, { color: regionColor }]}>{port.region}</Text>
        </View>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {(["overview", "parking", "cruises"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => {
              setActiveTab(tab);
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <MaterialIcons
              name={tab === "overview" ? "info-outline" : tab === "parking" ? "local-parking" : "directions-boat"}
              size={18}
              color={activeTab === tab ? colors.primary : colors.muted}
            />
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.muted }]}>
              {tab === "overview" ? "Overview" : tab === "parking" ? "RV Parking" : "Book Cruise"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === "overview" && (
          <View style={styles.content}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.description, { color: colors.foreground }]}>{port.description}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleDirections}>
                <MaterialIcons name="directions" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#2E7D32" }]} onPress={handleCall}>
                <MaterialIcons name="phone" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Call Port</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#0077B6" }]} onPress={() => openUrl(port.website)}>
                <MaterialIcons name="language" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Website</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Port Information</Text>
              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={18} color={colors.muted} />
                <Text style={[styles.infoText, { color: colors.foreground }]}>{port.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={18} color={colors.muted} />
                <Text style={[styles.infoText, { color: colors.primary }]}>{port.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="directions-boat" size={18} color={colors.muted} />
                <Text style={[styles.infoText, { color: colors.foreground }]}>{port.cruiseLines.length} cruise lines operate here</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="local-parking" size={18} color={colors.muted} />
                <Text style={[styles.infoText, { color: colors.foreground }]}>{port.rvParking.length} RV parking option{port.rvParking.length !== 1 ? "s" : ""} nearby</Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Cruise Lines</Text>
              {port.cruiseLines.map((line, idx) => (
                <View key={idx} style={[styles.cruiseLineRow, idx < port.cruiseLines.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={[styles.cruiseLineDot, { backgroundColor: line.logoColor }]} />
                  <Text style={[styles.cruiseLineName, { color: colors.foreground }]}>{line.name}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: "#FFF8E1", borderColor: "#FFD54F" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <MaterialIcons name="tips-and-updates" size={20} color="#F57F17" />
                <Text style={[styles.cardTitle, { color: "#F57F17", marginBottom: 0 }]}>RVer Tips</Text>
              </View>
              {port.tips.map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <Text style={{ color: "#F57F17", fontSize: 14 }}>{"\u2022"}</Text>
                  <Text style={{ color: "#5D4037", fontSize: 14, lineHeight: 20, flex: 1 }}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === "parking" && (
          <View style={styles.content}>
            <View style={[styles.card, { backgroundColor: "#E8F5E9", borderColor: "#66BB6A" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialIcons name="rv-hookup" size={20} color="#2E7D32" />
                <Text style={{ color: "#2E7D32", fontSize: 14, fontWeight: "600", flex: 1 }}>RV Parking Near {port.name}</Text>
              </View>
              <Text style={{ color: "#2E7D32", fontSize: 12, marginTop: 4, opacity: 0.8 }}>Park your RV securely while you cruise. Book early for peak season!</Text>
            </View>

            {port.rvParking.map((parking, idx) => (
              <ParkingCard key={idx} parking={parking} colors={colors} />
            ))}
          </View>
        )}

        {activeTab === "cruises" && (
          <View style={styles.content}>
            <View style={[styles.card, { backgroundColor: "#E3F2FD", borderColor: "#42A5F5" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialIcons name="directions-boat" size={20} color="#1565C0" />
                <Text style={{ color: "#1565C0", fontSize: 14, fontWeight: "600", flex: 1 }}>Book a Cruise from {port.name}</Text>
              </View>
              <Text style={{ color: "#1565C0", fontSize: 12, marginTop: 4, opacity: 0.8 }}>Tap any cruise line below to browse and book cruises departing from {port.city}.</Text>
            </View>

            {port.cruiseLines.map((line, idx) => (
              <CruiseLineCard key={idx} line={line} portCity={port.city} colors={colors} />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function ParkingCard({ parking, colors }: { parking: RVParkingOption; colors: any }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.parkingName, { color: colors.foreground }]}>{parking.name}</Text>
      <View style={styles.parkingBadges}>
        {parking.rvFriendly && (
          <View style={[styles.badge, { backgroundColor: "#2E7D3220" }]}>
            <MaterialIcons name="rv-hookup" size={12} color="#2E7D32" />
            <Text style={[styles.badgeText, { color: "#2E7D32" }]}>RV Friendly</Text>
          </View>
        )}
        {parking.hookups && (
          <View style={[styles.badge, { backgroundColor: "#1565C020" }]}>
            <MaterialIcons name="electrical-services" size={12} color="#1565C0" />
            <Text style={[styles.badgeText, { color: "#1565C0" }]}>Hookups</Text>
          </View>
        )}
        {parking.shuttle && (
          <View style={[styles.badge, { backgroundColor: "#FF6B3520" }]}>
            <MaterialIcons name="airport-shuttle" size={12} color="#FF6B35" />
            <Text style={[styles.badgeText, { color: "#FF6B35" }]}>Shuttle</Text>
          </View>
        )}
        <View style={[styles.badge, { backgroundColor: "#9C27B020" }]}>
          <MaterialIcons name="security" size={12} color="#9C27B0" />
          <Text style={[styles.badgeText, { color: "#9C27B0" }]}>{parking.security === "24hr" ? "24hr Security" : parking.security === "gated" ? "Gated" : parking.security === "monitored" ? "Monitored" : "Basic"}</Text>
        </View>
      </View>
      <View style={styles.parkingInfoRow}>
        <MaterialIcons name="attach-money" size={16} color={colors.muted} />
        <Text style={[styles.parkingInfoText, { color: colors.foreground }]}>{parking.dailyRate}</Text>
      </View>
      <View style={styles.parkingInfoRow}>
        <MaterialIcons name="location-on" size={16} color={colors.muted} />
        <Text style={[styles.parkingInfoText, { color: colors.foreground }]}>{parking.address}</Text>
      </View>
      {parking.phone && (
        <View style={styles.parkingInfoRow}>
          <MaterialIcons name="phone" size={16} color={colors.muted} />
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${parking.phone!.replace(/[^0-9+]/g, "")}`)}>
            <Text style={[styles.parkingInfoText, { color: colors.primary }]}>{parking.phone}</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={[styles.parkingNotes, { color: colors.muted }]}>{parking.notes}</Text>
      <TouchableOpacity style={[styles.directionsBtn, { backgroundColor: colors.primary }]} onPress={() => openUrl(parking.mapsUrl)}>
        <MaterialIcons name="directions" size={18} color="#fff" />
        <Text style={styles.directionsBtnText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

function CruiseLineCard({ line, portCity, colors }: { line: CruiseLine; portCity: string; colors: any }) {
  return (
    <TouchableOpacity
      style={[styles.cruiseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        openUrl(line.bookingUrl);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.cruiseLogoBox, { backgroundColor: line.logoColor + "15" }]}>
        <MaterialIcons name="directions-boat" size={28} color={line.logoColor} />
      </View>
      <View style={styles.cruiseContent}>
        <Text style={[styles.cruiseLineName2, { color: colors.foreground }]}>{line.name}</Text>
        <Text style={[styles.cruiseLineDesc, { color: colors.muted }]}>Browse and book cruises from {portCity}</Text>
        <View style={[styles.bookBtn, { backgroundColor: line.logoColor }]}>
          <Text style={styles.bookBtnText}>Book Now</Text>
          <MaterialIcons name="open-in-new" size={14} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, marginTop: 1 },
  regionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  regionBadgeText: { fontSize: 11, fontWeight: "700" },
  tabBar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 8 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  tabText: { fontSize: 13, fontWeight: "600" },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 22 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  infoText: { fontSize: 14, flex: 1, lineHeight: 20 },
  cruiseLineRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  cruiseLineDot: { width: 10, height: 10, borderRadius: 5 },
  cruiseLineName: { fontSize: 15, fontWeight: "600" },
  tipRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  parkingName: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  parkingBadges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  parkingInfoRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  parkingInfoText: { fontSize: 14, flex: 1, lineHeight: 20 },
  parkingNotes: { fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 12 },
  directionsBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12 },
  directionsBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  cruiseCard: { borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row", alignItems: "flex-start" },
  cruiseLogoBox: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 14 },
  cruiseContent: { flex: 1 },
  cruiseLineName2: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  cruiseLineDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  bookBtn: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  bookBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
