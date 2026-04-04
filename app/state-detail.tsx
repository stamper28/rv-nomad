import { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CATEGORY_LABELS, CATEGORY_COLORS, type CampSite, type SiteCategory, type StateLaws } from "@/lib/types";

type FilterKey = "all" | SiteCategory;

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "rv_park", label: "RV Parks" },
  { key: "state_park", label: "State Parks" },
  { key: "national_park", label: "Nat'l Parks" },
  { key: "boondocking", label: "Boondocking" },
  { key: "blm", label: "BLM" },
  { key: "national_forest", label: "Nat'l Forest" },
  { key: "military", label: "Military" },
  { key: "harvest_host", label: "Harvest Host" },
  { key: "walmart", label: "Walmart" },
  { key: "dump_station", label: "Dump Stations" },
  { key: "fuel_station", label: "Fuel" },
  { key: "propane", label: "Propane" },
  { key: "rv_repair", label: "RV Repair" },
  { key: "water_fill", label: "Water" },
  { key: "laundromat", label: "Laundry" },
  { key: "rv_wash", label: "RV Wash" },
  { key: "rv_tires", label: "Tires" },
  { key: "casino_parking", label: "Casino" },
  { key: "cabelas_bass_pro", label: "Cabela's" },
  { key: "truck_stop", label: "Truck Stop" },
  { key: "attraction", label: "Attractions" },
  { key: "scenic_view", label: "Scenic" },
  { key: "restaurant", label: "Restaurants" },
  { key: "historic_site", label: "Historic" },
];

export default function StateDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ stateCode: string; stateName: string }>();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showLaws, setShowLaws] = useState(false);
  const [allSites, setAllSites] = useState<CampSite[]>([]);
  const [stateLawsMap, setStateLawsMap] = useState<Record<string, StateLaws>>({});

  useEffect(() => {
    import("@/lib/all-sites-data").then((mod) => {
      setAllSites(mod.ALL_SITES);
      setStateLawsMap(mod.STATE_LAWS);
    });
  }, []);

  const stateSites = useMemo(() => {
    const code = params.stateCode || "";
    return allSites.filter((s) => s.state === code);
  }, [params.stateCode, allSites]);

  const filteredSites = useMemo(() => {
    if (filter === "all") return stateSites;
    return stateSites.filter((s) => s.category === filter);
  }, [stateSites, filter]);

  const laws = stateLawsMap[params.stateCode || ""] || null;

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.foreground }]}>{params.stateName}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {stateSites.length} camping sites
          </Text>
        </View>
      </View>

      {/* Laws Toggle */}
      {laws && (
        <TouchableOpacity
          style={[styles.lawsToggle, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}
          onPress={() => setShowLaws(!showLaws)}
          activeOpacity={0.7}
        >
          <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.warning} />
          <Text style={[styles.lawsToggleText, { color: colors.warning }]}>
            {showLaws ? "Hide" : "View"} RV Laws & Restrictions
          </Text>
          <IconSymbol
            name={showLaws ? "chevron.left" : "chevron.right"}
            size={14}
            color={colors.warning}
          />
        </TouchableOpacity>
      )}

      {/* Laws Panel */}
      {showLaws && laws && (
        <ScrollView
          style={[styles.lawsPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}
          nestedScrollEnabled
        >
          <View style={styles.lawsContent}>
            <LawRow label="Overnight Parking" value={laws.overnightParking} colors={colors} />
            <LawRow label="Boondocking" value={laws.boondockingLegality} colors={colors} />
            <LawRow label="Walmart Parking" value={laws.walmartParking} colors={colors} />
            <LawRow label="Max RV Length" value={laws.maxRVLength} colors={colors} />
            <LawRow label="Max RV Height" value={laws.maxRVHeight} colors={colors} />
            <LawRow label="Max RV Weight" value={laws.maxRVWeight} colors={colors} />
            <LawRow label="Propane/Tunnel Rules" value={laws.propaneTunnels} colors={colors} />
            <LawRow label="Speed Limits" value={laws.speedLimits} colors={colors} />
            {laws.specialNotes ? (
              <View style={styles.lawNotes}>
                <Text style={[styles.lawNotesText, { color: colors.muted }]}>{laws.specialNotes}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {FILTER_OPTIONS.map((opt) => {
          const count = opt.key === "all"
            ? stateSites.length
            : stateSites.filter((s) => s.category === opt.key).length;
          if (count === 0 && opt.key !== "all") return null;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.chip,
                {
                  backgroundColor: filter === opt.key ? colors.primary : colors.surface,
                  borderColor: filter === opt.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(opt.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: filter === opt.key ? "#fff" : colors.foreground },
                ]}
              >
                {opt.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Site List */}
      <FlatList
        data={filteredSites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <SiteRow site={item} colors={colors} router={router} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="magnifyingglass" size={40} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>No sites in this category</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function LawRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.lawRow}>
      <Text style={[styles.lawLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.lawValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function SiteRow({ site, colors, router }: { site: CampSite; colors: any; router: any }) {
  const catColor = CATEGORY_COLORS[site.category];
  return (
    <TouchableOpacity
      style={[styles.siteRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push({ pathname: "/site-detail", params: { siteId: site.id } })}
      activeOpacity={0.7}
    >
      <View style={[styles.siteStrip, { backgroundColor: catColor }]} />
      <View style={styles.siteContent}>
        <View style={styles.siteHeader}>
          <View style={styles.siteTitleArea}>
            <Text style={[styles.siteName, { color: colors.foreground }]} numberOfLines={1}>
              {site.name}
            </Text>
            <View style={[styles.catBadge, { backgroundColor: catColor + "20" }]}>
              <Text style={[styles.catBadgeText, { color: catColor }]}>
                {CATEGORY_LABELS[site.category]}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.sitePrice,
              { color: site.pricePerNight === null ? colors.success : colors.primary },
            ]}
          >
            {site.pricePerNight === null ? "Free" : `$${site.pricePerNight}/night`}
          </Text>
        </View>
        <Text style={[styles.siteCity, { color: colors.muted }]}>{site.city}, {site.state}</Text>
        <View style={styles.siteFooter}>
          <View style={styles.ratingRow}>
            <IconSymbol name="star.fill" size={12} color={colors.warning} />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>{site.rating}</Text>
            <Text style={[styles.reviewCount, { color: colors.muted }]}>({site.reviewCount})</Text>
          </View>
          {site.amenities.length > 0 && (
            <Text style={[styles.amenityCount, { color: colors.muted }]}>
              {site.amenities.length} amenities
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getStateAbbr(stateName: string): string {
  const map: Record<string, string> = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
    "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
    "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
    "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
  };
  return map[stateName] || "";
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { marginRight: 8, padding: 4 },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  lawsToggle: {
    marginHorizontal: 16, marginBottom: 8, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8,
  },
  lawsToggleText: { flex: 1, fontSize: 14, fontWeight: "600" },
  lawsPanel: { marginHorizontal: 16, marginBottom: 8, maxHeight: 250, borderRadius: 12, borderWidth: 1 },
  lawsContent: { padding: 14 },
  lawRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#33333320" },
  lawLabel: { fontSize: 13, fontWeight: "500", flex: 1 },
  lawValue: { fontSize: 13, fontWeight: "600", flex: 1.5, textAlign: "right" },
  lawNotes: { marginTop: 10, paddingTop: 8 },
  lawNotesText: { fontSize: 12, fontStyle: "italic", lineHeight: 18 },
  filterRow: { maxHeight: 44, marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "600" },
  siteRow: { marginBottom: 8, borderRadius: 12, borderWidth: 1, overflow: "hidden", flexDirection: "row" },
  siteStrip: { width: 4 },
  siteContent: { flex: 1, padding: 12, gap: 4 },
  siteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  siteTitleArea: { flex: 1, marginRight: 8 },
  siteName: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  catBadge: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  catBadgeText: { fontSize: 10, fontWeight: "700" },
  sitePrice: { fontSize: 14, fontWeight: "700" },
  siteCity: { fontSize: 12 },
  siteFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 12, fontWeight: "600" },
  reviewCount: { fontSize: 11 },
  amenityCount: { fontSize: 11 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "500" },
});
