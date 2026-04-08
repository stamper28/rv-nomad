/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { openUrl } from "@/lib/open-url";
import {
  BORDER_CROSSINGS,
  BORDER_LAWS,
  BORDER_AGENCY_CONTACTS,
  BORDER_REGIONS,
  type BorderCrossing,
  type BorderLaw,
} from "@/lib/border-crossings-data";

type Tab = "crossings" | "laws" | "contacts";
type RegionFilter = BorderCrossing["region"] | "all" | "rv-friendly";

const REGION_LABELS: Record<RegionFilter, string> = {
  all: "All",
  "rv-friendly": "\u2b50 RV Friendly",
  Atlantic: "Atlantic",
  Quebec: "Quebec",
  Ontario: "Ontario",
  Prairies: "Prairies",
  "British Columbia": "BC",
  Alaska: "Alaska",
};

const SEVERITY_COLORS: Record<BorderLaw["severity"], string> = {
  critical: "#DC2626",
  high: "#EA580C",
  medium: "#CA8A04",
};

const RV_RATING_LABELS = ["", "Not Ideal", "OK", "Great for RVs"];
const RV_RATING_COLORS = ["", "#DC2626", "#CA8A04", "#16A34A"];

export default function BorderCrossingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("crossings");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);
  const [expandedCrossing, setExpandedCrossing] = useState<string | null>(null);

  const filteredCrossings = useMemo(() => {
    if (regionFilter === "all") {
      return [...BORDER_CROSSINGS].sort((a, b) => a.popularityRank - b.popularityRank);
    }
    if (regionFilter === "rv-friendly") {
      return BORDER_CROSSINGS.filter((c) => c.rvFriendly === 3).sort(
        (a, b) => a.popularityRank - b.popularityRank
      );
    }
    return BORDER_CROSSINGS.filter((c) => c.region === regionFilter).sort(
      (a, b) => a.popularityRank - b.popularityRank
    );
  }, [regionFilter]);

  const handleCall = useCallback((phone: string) => {
    if (!phone) return;
    const cleaned = phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleaned}`);
  }, []);

  const renderCrossingItem = useCallback(
    ({ item }: { item: BorderCrossing }) => {
      const isExpanded = expandedCrossing === item.id;
      return (
        <TouchableOpacity
          style={[styles.crossingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setExpandedCrossing(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.crossingHeader}>
            <View style={styles.crossingHeaderLeft}>
              <View style={styles.crossingNameRow}>
                <Text style={[styles.crossingName, { color: colors.foreground }]} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.hasRVLane && (
                  <View style={[styles.rvLaneBadge, { backgroundColor: "#16A34A20" }]}>
                    <Text style={[styles.rvLaneBadgeText, { color: "#16A34A" }]}>RV LANE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.crossingRoute, { color: colors.muted }]}>
                {item.canadianCity}, {item.canadianProvince} \u2194 {item.usCity}, {item.usState}
              </Text>
            </View>
            <View style={styles.crossingHeaderRight}>
              <View
                style={[
                  styles.rvRatingBadge,
                  { backgroundColor: RV_RATING_COLORS[item.rvFriendly] + "15" },
                ]}
              >
                <MaterialIcons
                  name="rv-hookup"
                  size={16}
                  color={RV_RATING_COLORS[item.rvFriendly]}
                />
                <Text
                  style={[styles.rvRatingText, { color: RV_RATING_COLORS[item.rvFriendly] }]}
                >
                  {RV_RATING_LABELS[item.rvFriendly]}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.crossingQuickInfo}>
            <View style={styles.quickInfoItem}>
              <MaterialIcons name="schedule" size={14} color={colors.muted} />
              <Text style={[styles.quickInfoText, { color: colors.muted }]}>
                {item.typicalWait}
              </Text>
            </View>
            <View style={styles.quickInfoItem}>
              <MaterialIcons
                name={item.open24h ? "check-circle" : "info"}
                size={14}
                color={item.open24h ? "#16A34A" : "#CA8A04"}
              />
              <Text
                style={[
                  styles.quickInfoText,
                  { color: item.open24h ? "#16A34A" : "#CA8A04" },
                ]}
              >
                {item.open24h ? "24/7" : "Limited Hours"}
              </Text>
            </View>
            <View style={styles.quickInfoItem}>
              <MaterialIcons name="star" size={14} color={colors.muted} />
              <Text style={[styles.quickInfoText, { color: colors.muted }]}>
                #{item.popularityRank} busiest
              </Text>
            </View>
          </View>

          {/* Expanded Details */}
          {isExpanded && (
            <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
              {/* RV Notes */}
              <View style={styles.rvNotesBox}>
                <MaterialIcons name="info-outline" size={16} color={colors.primary} />
                <Text style={[styles.rvNotesText, { color: colors.foreground }]}>
                  {item.rvNotes}
                </Text>
              </View>

              {/* Phone Numbers */}
              <Text style={[styles.phoneHeader, { color: colors.foreground }]}>
                Border Agent Phone Numbers
              </Text>

              {/* CBSA Phone */}
              <TouchableOpacity
                style={[styles.phoneRow, { backgroundColor: colors.background }]}
                onPress={() => handleCall(item.cbsaPhone)}
                activeOpacity={0.7}
              >
                <View style={[styles.phoneIconBox, { backgroundColor: "#DC262615" }]}>
                  <Text style={styles.flagEmoji}>{"\ud83c\udde8\ud83c\udde6"}</Text>
                </View>
                <View style={styles.phoneInfo}>
                  <Text style={[styles.phoneLabel, { color: colors.muted }]}>
                    CBSA (Canadian Side)
                  </Text>
                  <Text style={[styles.phoneNumber, { color: colors.primary }]}>
                    {item.cbsaPhone}
                  </Text>
                </View>
                <MaterialIcons name="phone" size={20} color={colors.primary} />
              </TouchableOpacity>

              {/* CBP Phone */}
              {item.cbpPhone ? (
                <TouchableOpacity
                  style={[styles.phoneRow, { backgroundColor: colors.background }]}
                  onPress={() => handleCall(item.cbpPhone)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.phoneIconBox, { backgroundColor: "#1D4ED815" }]}>
                    <Text style={styles.flagEmoji}>{"\ud83c\uddfa\ud83c\uddf8"}</Text>
                  </View>
                  <View style={styles.phoneInfo}>
                    <Text style={[styles.phoneLabel, { color: colors.muted }]}>
                      CBP (US Side)
                    </Text>
                    <Text style={[styles.phoneNumber, { color: colors.primary }]}>
                      {item.cbpPhone}
                    </Text>
                  </View>
                  <MaterialIcons name="phone" size={20} color={colors.primary} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.phoneRow, { backgroundColor: colors.background }]}>
                  <View style={[styles.phoneIconBox, { backgroundColor: "#1D4ED815" }]}>
                    <Text style={styles.flagEmoji}>{"\ud83c\uddfa\ud83c\uddf8"}</Text>
                  </View>
                  <View style={styles.phoneInfo}>
                    <Text style={[styles.phoneLabel, { color: colors.muted }]}>
                      CBP (US Side)
                    </Text>
                    <Text style={[styles.phoneNumber, { color: colors.muted }]}>
                      No staffed port
                    </Text>
                  </View>
                </View>
              )}

              {/* Get Directions */}
              <TouchableOpacity
                style={[styles.directionsBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps:?q=${item.name}&ll=${item.lat},${item.lng}`,
                    default: `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`,
                  });
                  openUrl(url!);
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="directions" size={18} color="#fff" />
                <Text style={styles.directionsBtnText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Expand indicator */}
          <View style={styles.expandIndicator}>
            <MaterialIcons
              name={isExpanded ? "expand-less" : "expand-more"}
              size={20}
              color={colors.muted}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [expandedCrossing, colors, handleCall]
  );

  const renderLawItem = useCallback(
    ({ item }: { item: BorderLaw }) => {
      const isExpanded = expandedLaw === item.id;
      const severityColor = SEVERITY_COLORS[item.severity];
      return (
        <TouchableOpacity
          style={[styles.lawCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setExpandedLaw(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.lawHeader}>
            <View style={[styles.lawRankBadge, { backgroundColor: severityColor + "15" }]}>
              <Text style={[styles.lawRankText, { color: severityColor }]}>#{item.rank}</Text>
            </View>
            <View style={styles.lawHeaderContent}>
              <View style={styles.lawTitleRow}>
                <MaterialIcons
                  name={item.icon as any}
                  size={20}
                  color={severityColor}
                />
                <Text style={[styles.lawTitle, { color: colors.foreground }]}>{item.title}</Text>
              </View>
              <View style={styles.lawMeta}>
                <View style={[styles.severityBadge, { backgroundColor: severityColor + "20" }]}>
                  <Text style={[styles.severityText, { color: severityColor }]}>
                    {item.severity.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.directionText, { color: colors.muted }]}>
                  {item.direction === "both"
                    ? "\ud83c\udde8\ud83c\udde6 \u2194 \ud83c\uddfa\ud83c\uddf8 Both Directions"
                    : item.direction === "entering_canada"
                    ? "\u2192 \ud83c\udde8\ud83c\udde6 Entering Canada"
                    : "\u2192 \ud83c\uddfa\ud83c\uddf8 Entering US"}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text
            style={[styles.lawDescription, { color: colors.foreground }]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {item.description}
          </Text>

          {/* Penalty */}
          <View style={[styles.penaltyBox, { backgroundColor: severityColor + "10" }]}>
            <MaterialIcons name="warning" size={14} color={severityColor} />
            <Text style={[styles.penaltyText, { color: severityColor }]}>
              Penalty: {item.penalty}
            </Text>
          </View>

          {/* Expanded Tips */}
          {isExpanded && (
            <View style={[styles.tipsSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.tipsHeader, { color: colors.foreground }]}>
                Tips for RVers
              </Text>
              {item.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <MaterialIcons name="check-circle" size={14} color={colors.primary} />
                  <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.expandIndicator}>
            <MaterialIcons
              name={isExpanded ? "expand-less" : "expand-more"}
              size={20}
              color={colors.muted}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [expandedLaw, colors]
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {"\ud83c\udde8\ud83c\udde6"} Border Crossings {"\ud83c\uddfa\ud83c\uddf8"}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            US/Canada \u2022 {BORDER_CROSSINGS.length} crossings
          </Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {(
          [
            { key: "crossings", label: "Crossings", icon: "swap-horiz" },
            { key: "laws", label: "Laws & Rules", icon: "gavel" },
            { key: "contacts", label: "Contacts", icon: "phone" },
          ] as { key: Tab; label: string; icon: string }[]
        ).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? colors.primary : colors.muted },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Crossings Tab ── */}
      {activeTab === "crossings" && (
        <View style={styles.tabContent}>
          {/* Region Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {(["all", "rv-friendly", ...BORDER_REGIONS] as RegionFilter[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: regionFilter === r ? colors.primary : colors.surface,
                    borderColor: regionFilter === r ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setRegionFilter(r)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: regionFilter === r ? "#fff" : colors.foreground },
                  ]}
                >
                  {REGION_LABELS[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.resultCount, { color: colors.muted }]}>
            {filteredCrossings.length} crossing{filteredCrossings.length !== 1 ? "s" : ""}
          </Text>

          <FlatList
            data={filteredCrossings}
            keyExtractor={(item) => item.id}
            renderItem={renderCrossingItem}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* ── Laws Tab ── */}
      {activeTab === "laws" && (
        <View style={styles.tabContent}>
          <View style={[styles.lawsIntro, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name="warning-amber" size={24} color="#EA580C" />
            <Text style={[styles.lawsIntroText, { color: colors.foreground }]}>
              Top 10 laws RVers most commonly break at the US/Canada border. Tap any law for detailed tips.
            </Text>
          </View>

          <FlatList
            data={BORDER_LAWS}
            keyExtractor={(item) => item.id}
            renderItem={renderLawItem}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* ── Contacts Tab ── */}
      {activeTab === "contacts" && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* CBSA Section */}
          <View style={styles.contactSection}>
            <View style={styles.contactSectionHeader}>
              <Text style={styles.contactFlag}>{"\ud83c\udde8\ud83c\udde6"}</Text>
              <View>
                <Text style={[styles.contactSectionTitle, { color: colors.foreground }]}>
                  Canada Border Services Agency
                </Text>
                <Text style={[styles.contactSectionSub, { color: colors.muted }]}>CBSA</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleCall(BORDER_AGENCY_CONTACTS.cbsa.mainPhone)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="phone" size={22} color="#DC2626" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>
                  Main Line (within Canada)
                </Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>
                  {BORDER_AGENCY_CONTACTS.cbsa.mainPhone}
                </Text>
              </View>
              <MaterialIcons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleCall(BORDER_AGENCY_CONTACTS.cbsa.outsideCanada)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="phone" size={22} color="#DC2626" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>
                  Outside Canada
                </Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>
                  {BORDER_AGENCY_CONTACTS.cbsa.outsideCanada}
                </Text>
              </View>
              <MaterialIcons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleCall(BORDER_AGENCY_CONTACTS.cbsa.borderInfoService)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="info" size={22} color="#DC2626" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>
                  Border Information Service
                </Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>
                  {BORDER_AGENCY_CONTACTS.cbsa.borderInfoService}
                </Text>
              </View>
              <MaterialIcons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openUrl(BORDER_AGENCY_CONTACTS.cbsa.waitTimesUrl)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="schedule" size={22} color="#DC2626" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>
                  Live Border Wait Times
                </Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>
                  Check CBSA Wait Times
                </Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openUrl(BORDER_AGENCY_CONTACTS.cbsa.website)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="language" size={22} color="#DC2626" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>Website</Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>
                  cbsa-asfc.gc.ca
                </Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* CBP Section */}
          <View style={styles.contactSection}>
            <View style={styles.contactSectionHeader}>
              <Text style={styles.contactFlag}>{"\ud83c\uddfa\ud83c\uddf8"}</Text>
              <View>
                <Text style={[styles.contactSectionTitle, { color: colors.foreground }]}>
                  U.S. Customs and Border Protection
                </Text>
                <Text style={[styles.contactSectionSub, { color: colors.muted }]}>CBP</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleCall(BORDER_AGENCY_CONTACTS.cbp.mainPhone)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="phone" size={22} color="#1D4ED8" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>
                  Main Line (within US)
                </Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>
                  {BORDER_AGENCY_CONTACTS.cbp.mainPhone}
                </Text>
              </View>
              <MaterialIcons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleCall(BORDER_AGENCY_CONTACTS.cbp.outsideUS)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="phone" size={22} color="#1D4ED8" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>Outside US</Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>
                  {BORDER_AGENCY_CONTACTS.cbp.outsideUS}
                </Text>
              </View>
              <MaterialIcons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openUrl(BORDER_AGENCY_CONTACTS.cbp.waitTimesUrl)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="schedule" size={22} color="#1D4ED8" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>
                  Live Border Wait Times
                </Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>
                  Check CBP Wait Times
                </Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openUrl(BORDER_AGENCY_CONTACTS.cbp.website)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="language" size={22} color="#1D4ED8" />
              <View style={styles.contactCardInfo}>
                <Text style={[styles.contactCardLabel, { color: colors.muted }]}>Website</Text>
                <Text style={[styles.contactCardValue, { color: colors.primary }]}>cbp.gov</Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Emergency Note */}
          <View
            style={[
              styles.emergencyNote,
              { backgroundColor: "#DC262610", borderColor: "#DC262630" },
            ]}
          >
            <MaterialIcons name="emergency" size={20} color="#DC2626" />
            <Text style={[styles.emergencyText, { color: colors.foreground }]}>
              In an emergency at the border, call 911 (US) or 911 (Canada). For non-emergency
              border questions, use the numbers above.
            </Text>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },

  // Filter
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  resultCount: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  // Crossing Card
  crossingCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  crossingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  crossingHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  crossingNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  crossingName: {
    fontSize: 15,
    fontWeight: "700",
  },
  rvLaneBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rvLaneBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  crossingRoute: {
    fontSize: 12,
    marginTop: 3,
  },
  crossingHeaderRight: {
    alignItems: "flex-end",
  },
  rvRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  rvRatingText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Quick Info
  crossingQuickInfo: {
    flexDirection: "row",
    marginTop: 10,
    gap: 12,
    flexWrap: "wrap",
  },
  quickInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  quickInfoText: {
    fontSize: 12,
  },

  // Expanded
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  rvNotesBox: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  rvNotesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  phoneHeader: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 10,
  },
  phoneIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  flagEmoji: {
    fontSize: 18,
  },
  phoneInfo: {
    flex: 1,
  },
  phoneLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  phoneNumber: {
    fontSize: 15,
    fontWeight: "700",
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  directionsBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  expandIndicator: {
    alignItems: "center",
    marginTop: 4,
  },

  // Law Card
  lawCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  lawHeader: {
    flexDirection: "row",
    gap: 10,
  },
  lawRankBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lawRankText: {
    fontSize: 14,
    fontWeight: "800",
  },
  lawHeaderContent: {
    flex: 1,
  },
  lawTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lawTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  lawMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 9,
    fontWeight: "800",
  },
  directionText: {
    fontSize: 11,
  },
  lawDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  penaltyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  penaltyText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  tipsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  tipsHeader: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  // Laws Intro
  lawsIntro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  lawsIntroText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  // Contact Section
  contactSection: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  contactSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  contactFlag: {
    fontSize: 28,
  },
  contactSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  contactSectionSub: {
    fontSize: 12,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  contactCardInfo: {
    flex: 1,
  },
  contactCardLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  contactCardValue: {
    fontSize: 15,
    fontWeight: "700",
  },

  // Emergency
  emergencyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  emergencyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
