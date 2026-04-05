import { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CATEGORY_LABELS, CATEGORY_COLORS, type CampSite, type SiteCategory } from "@/lib/types";

type SimpleStateInfo = { code: string; name: string; siteCount: number };

type ViewMode = "categories" | "states";

const EXPLORE_SECTIONS: { category: SiteCategory; title: string; subtitle: string; includeExtra?: SiteCategory[] }[] = [
  { category: "state_park", title: "State Parks", subtitle: "Scenic camping in state-managed parks" },
  { category: "national_park", title: "National Parks", subtitle: "America's crown jewels" },
  { category: "rv_park", title: "RV Parks & Resorts", subtitle: "Full hookups and resort amenities" },
  { category: "boondocking", title: "Free Camping", subtitle: "Boondocking, BLM, Walmart & more", includeExtra: ["blm", "national_forest", "walmart", "cracker_barrel", "rest_area"] },
  { category: "military", title: "Military FamCamps", subtitle: "Base campgrounds for military families" },
  { category: "harvest_host", title: "Harvest Hosts", subtitle: "Wineries, farms & unique stays" },
  { category: "dump_station", title: "Dump Stations", subtitle: "Find dump stations near you" },
];

const CATEGORY_ICON_MAP: Record<SiteCategory, string> = {
  // Camping & Overnight
  rv_park: "house.fill",
  national_park: "mountain.2.fill",
  state_park: "tree.fill",
  boondocking: "tent.fill",
  blm: "leaf.fill",
  national_forest: "tree.fill",
  military: "shield.fill",
  harvest_host: "wineglass.fill",
  walmart: "cart.fill",
  cracker_barrel: "building.2.fill",
  rest_area: "mappin",
  casino_parking: "building.2.fill",
  cabelas_bass_pro: "leaf.fill",
  truck_stop: "fuelpump.fill",
  elks_moose: "building.2.fill",
  // RV Services
  dump_station: "arrow.clockwise",
  weight_scale: "scalemass.fill",
  fuel_station: "fuelpump.fill",
  propane: "flame.fill",
  rv_repair: "wrench.fill",
  water_fill: "drop.fill",
  laundromat: "washer.fill",
  rv_wash: "drop.fill",
  rv_tires: "circle.circle.fill",
  rv_dealer: "building.2.fill",
  // Road Safety
  low_clearance: "exclamationmark.triangle.fill",
  weigh_station: "scalemass.fill",
  road_condition: "exclamationmark.triangle.fill",
  // Supplies
  rv_grocery: "cart.fill",
  rv_supply_store: "wrench.fill",
  outdoor_store: "leaf.fill",
  // Connectivity
  cell_coverage: "antenna.radiowaves.left.and.right",
  free_wifi: "antenna.radiowaves.left.and.right",
  // Roadtrippers POI
  attraction: "star.fill",
  scenic_view: "mountain.2.fill",
  restaurant: "fork.knife",
  roadside_oddity: "star.fill",
  historic_site: "building.columns.fill",
  visitor_center: "building.2.fill",
};

export default function ExploreScreen() {
  const colors = useColors();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [allSites, setAllSites] = useState<CampSite[]>([]);
  const [stateList, setStateList] = useState<SimpleStateInfo[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Lazy load the large data file
    import("@/lib/all-sites-data").then((mod) => {
      setAllSites(mod.ALL_SITES);
      setStateList(mod.STATE_LIST);
      setDataLoaded(true);
    });
  }, []);

  const CANADIAN_CODES = new Set(["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]);

  const { filteredUS, filteredCA } = useMemo(() => {
    let list = stateList;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = stateList.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
    }
    return {
      filteredUS: list.filter((s) => !CANADIAN_CODES.has(s.code)),
      filteredCA: list.filter((s) => CANADIAN_CODES.has(s.code)),
    };
  }, [searchQuery, stateList]);

  function getSitesForSection(section: typeof EXPLORE_SECTIONS[number]): CampSite[] {
    if (section.includeExtra) {
      const cats = [section.category, ...section.includeExtra];
      return allSites.filter((s) => cats.includes(s.category)).slice(0, 20);
    }
    return allSites.filter((s) => s.category === section.category).slice(0, 20);
  }

  function renderSiteCard(site: CampSite) {
    const catColor = CATEGORY_COLORS[site.category];
    return (
      <TouchableOpacity
        key={site.id}
        style={[styles.siteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() =>
          router.push({ pathname: "/site-detail", params: { siteId: site.id } })
        }
        activeOpacity={0.7}
      >
        <View style={[styles.siteCardTop, { backgroundColor: catColor + "15" }]}>
          <IconSymbol
            name={CATEGORY_ICON_MAP[site.category] as any}
            size={36}
            color={catColor}
          />
        </View>
        <View style={styles.siteCardBody}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor + "20" }]}>
            <Text style={[styles.categoryBadgeText, { color: catColor }]}>
              {CATEGORY_LABELS[site.category].toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.siteName, { color: colors.foreground }]} numberOfLines={1}>
            {site.name}
          </Text>
          <Text style={[styles.siteLocation, { color: colors.muted }]} numberOfLines={1}>
            {site.city}, {site.state}
          </Text>
          <View style={styles.siteCardFooter}>
            <View style={styles.ratingRow}>
              <IconSymbol name="star.fill" size={12} color={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.foreground }]}>{site.rating}</Text>
            </View>
            <Text
              style={[
                styles.priceText,
                { color: site.pricePerNight === null ? colors.success : colors.primary },
              ]}
            >
              {site.pricePerNight === null ? "Free" : `$${site.pricePerNight}/night`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenContainer className="pt-2">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder={viewMode === "states" ? "Search states..." : "Search campgrounds..."}
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <IconSymbol name="xmark" size={16} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* View Mode Toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === "categories" && { backgroundColor: colors.primary }]}
          onPress={() => { setViewMode("categories"); setSearchQuery(""); }}
        >
          <Text style={[styles.toggleText, { color: viewMode === "categories" ? "#fff" : colors.muted }]}>
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === "states" && { backgroundColor: colors.primary }]}
          onPress={() => { setViewMode("states"); setSearchQuery(""); }}
        >
          <Text style={[styles.toggleText, { color: viewMode === "states" ? "#fff" : colors.muted }]}>
            By State
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "categories" ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {EXPLORE_SECTIONS.map((section) => {
            const sites = getSitesForSection(section);
            if (sites.length === 0) return null;
            return (
              <View key={section.category} style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{section.subtitle}</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                  {sites.map(renderSiteCard)}
                </ScrollView>
              </View>
            );
          })}

          {/* RV Tools Card */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/tools")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: colors.success + "20" }]}>
              <IconSymbol name="wrench.fill" size={24} color={colors.success} />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>RV Tools</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Fuel log, maintenance, packing & checklists</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* RV Buying Guide Promo */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/rv-guide")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: colors.primary + "20" }]}>
              <IconSymbol name="crown.fill" size={24} color={colors.primary} />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>RV Buying Guide</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Best & worst RVs to buy — expert ratings</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Weather */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/weather")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#1565C020" }]}>
              <IconSymbol name="cloud.sun.fill" size={24} color="#1565C0" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Weather</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>7-day forecast & RV weather alerts</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Discount Programs */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/discounts")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#E6510020" }]}>
              <IconSymbol name="tag.fill" size={24} color="#E65100" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Discount Programs</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Passport America, Good Sam, Harvest Hosts & more</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Community */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/community")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#6A1B9A20" }]}>
              <IconSymbol name="person.3.fill" size={24} color="#6A1B9A" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Community</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Tips, questions, meetups & reviews from RVers</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* RV Gear Guide */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/rv-gear")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#00838F20" }]}>
              <IconSymbol name="bag.fill" size={24} color="#00838F" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>RV Gear Guide</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Curated gear picks with affiliate links</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* United States */}
          {filteredUS.length > 0 && (
            <View style={[styles.countrySectionHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <Text style={styles.countrySectionFlag}>{"\ud83c\uddfa\ud83c\uddf8"}</Text>
              <Text style={[styles.countrySectionText, { color: colors.foreground }]}>United States</Text>
              <Text style={[styles.countrySectionCount, { color: colors.muted }]}>{filteredUS.length} states</Text>
            </View>
          )}
          {filteredUS.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[styles.stateRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() =>
                router.push({ pathname: "/state-detail", params: { stateCode: item.code, stateName: item.name } })
              }
              activeOpacity={0.7}
            >
              <View style={[styles.stateCodeBox, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.stateCode, { color: colors.primary }]}>{item.code}</Text>
              </View>
              <View style={styles.stateInfo}>
                <Text style={[styles.stateName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.stateSiteCount, { color: colors.muted }]}>{item.siteCount} sites</Text>
              </View>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}

          {/* Canada */}
          {filteredCA.length > 0 && (
            <View style={[styles.countrySectionHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <Text style={styles.countrySectionFlag}>{"\ud83c\udde8\ud83c\udde6"}</Text>
              <Text style={[styles.countrySectionText, { color: colors.foreground }]}>Canada</Text>
              <Text style={[styles.countrySectionCount, { color: colors.muted }]}>{filteredCA.length} provinces</Text>
            </View>
          )}
          {filteredCA.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[styles.stateRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() =>
                router.push({ pathname: "/state-detail", params: { stateCode: item.code, stateName: item.name } })
              }
              activeOpacity={0.7}
            >
              <View style={[styles.stateCodeBox, { backgroundColor: "#D32F2F15" }]}>
                <Text style={[styles.stateCode, { color: "#D32F2F" }]}>{item.code}</Text>
              </View>
              <View style={styles.stateInfo}>
                <Text style={[styles.stateName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.stateSiteCount, { color: colors.muted }]}>{item.siteCount} sites</Text>
              </View>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800" },
  searchBar: {
    marginHorizontal: 16, marginBottom: 10, height: 44, borderRadius: 12,
    borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, height: 44 },
  toggleRow: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 12, borderRadius: 12,
    borderWidth: 1, overflow: "hidden",
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  toggleText: { fontSize: 14, fontWeight: "600" },
  sectionContainer: { marginBottom: 20 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionSubtitle: { fontSize: 13, marginTop: 2 },
  siteCard: { width: 170, marginRight: 12, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  siteCardTop: { height: 90, alignItems: "center", justifyContent: "center" },
  siteCardBody: { padding: 10 },
  categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  categoryBadgeText: { fontSize: 9, fontWeight: "700" },
  siteName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  siteLocation: { fontSize: 11, marginBottom: 6 },
  siteCardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 12, fontWeight: "600" },
  priceText: { fontSize: 12, fontWeight: "700" },
  promoCard: {
    marginHorizontal: 16, marginBottom: 20, borderRadius: 16, borderWidth: 1,
    padding: 16, flexDirection: "row", alignItems: "center",
  },
  promoIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  promoText: { flex: 1 },
  promoTitle: { fontSize: 16, fontWeight: "700" },
  promoSubtitle: { fontSize: 13, marginTop: 2 },
  stateRow: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1,
    padding: 14, flexDirection: "row", alignItems: "center",
  },
  stateCodeBox: { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 12 },
  stateCode: { fontSize: 14, fontWeight: "700" },
  stateInfo: { flex: 1 },
  stateName: { fontSize: 16, fontWeight: "600" },
  stateSiteCount: { fontSize: 13, marginTop: 2 },
  countrySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countrySectionFlag: { fontSize: 22 },
  countrySectionText: { fontSize: 16, fontWeight: "700", flex: 1 },
  countrySectionCount: { fontSize: 13 },
});
