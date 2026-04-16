/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CATEGORY_LABELS, CATEGORY_COLORS, type CampSite, type SiteCategory } from "@/lib/types";
import { getCardPriceText } from "@/lib/price-labels";
import { openUrl } from "@/lib/open-url";
import { AFFILIATE_CONFIG } from "@/lib/affiliate";
import { CRUISE_PORTS, type CruisePort } from "@/lib/cruise-ports";

const CRUISE_PORT_REGIONS: { name: CruisePort["region"]; color: string }[] = [
  { name: "Florida", color: "#FF6B35" },
  { name: "Gulf Coast", color: "#0077B6" },
  { name: "East Coast", color: "#2E7D32" },
  { name: "California", color: "#E91E63" },
];

type SimpleStateInfo = { code: string; name: string; siteCount: number };

type ViewMode = "categories" | "states";

const EXPLORE_SECTIONS: { category: SiteCategory; title: string; subtitle: string; includeExtra?: SiteCategory[] }[] = [
  { category: "state_park", title: "State Parks", subtitle: "Scenic camping in state-managed parks" },
  { category: "national_park", title: "National Parks", subtitle: "America's crown jewels" },
  { category: "rv_park", title: "RV Parks & Resorts", subtitle: "Full hookups and resort amenities" },
  { category: "boondocking", title: "Free Camping", subtitle: "Boondocking, BLM, Walmart & more", includeExtra: ["blm", "national_forest", "walmart", "cracker_barrel", "rest_area"] },
  { category: "military", title: "Military FamCamps", subtitle: "Base campgrounds for military families" },
  { category: "harvest_host", title: "Harvest Hosts", subtitle: "Wineries, farms & unique stays" },
  { category: "passport_america", title: "Passport America", subtitle: "50% off campground fees" },
  { category: "thousand_trails", title: "Thousand Trails", subtitle: "Membership campground network" },
  { category: "dump_station", title: "Dump Stations", subtitle: "Find dump stations near you" },
  { category: "fuel_station", title: "Fuel Stations", subtitle: "Truck stops & diesel with RV lanes" },
  { category: "attraction", title: "Attractions", subtitle: "Must-see stops along your route" },
  { category: "scenic_view", title: "Scenic Views", subtitle: "Stunning overlooks & photo spots" },
  { category: "restaurant", title: "Restaurants", subtitle: "RV-friendly dining near campgrounds" },
  { category: "laundromat", title: "Laundromats", subtitle: "Coin laundry near RV parks" },
  { category: "rv_wash", title: "RV Wash Stations", subtitle: "Keep your rig clean on the road" },
  { category: "rv_repair", title: "RV Repair & Service", subtitle: "Mechanics, dealers & mobile repair" },
  { category: "propane", title: "Propane Refill", subtitle: "Propane stations near you" },
  { category: "water_fill", title: "Water Fill Stations", subtitle: "Potable water for your tanks" },
  { category: "rv_tires", title: "RV Tire Shops", subtitle: "Tire sales & service for RVs" },
  { category: "historic_site", title: "Historic Sites", subtitle: "History & heritage along the way" },
  { category: "roadside_oddity", title: "Roadside Oddities", subtitle: "Quirky stops & fun photo ops" },
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
  passport_america: "tag.fill",
  thousand_trails: "tent.fill",
  walmart: "cart.fill",
  cracker_barrel: "building.2.fill",
  rest_area: "mappin",
  casino_parking: "building.2.fill",
  cabelas_bass_pro: "leaf.fill",
  truck_stop: "fuelpump.fill",
  elks_moose: "building.2.fill",
  army_corps: "drop.fill",
  county_park: "tree.fill",
  provincial_park: "leaf.fill",
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
  const cruisePorts = CRUISE_PORTS;

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
              {getCardPriceText(site.category, site.pricePerNight)}
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

      {/* Go Premium Banner */}
      <TouchableOpacity
        onPress={() => router.push("/premium" as any)}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginHorizontal: 16,
          marginBottom: 8,
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: colors.primary + "12",
          borderWidth: 1,
          borderColor: colors.primary + "30",
        }}
      >
        <MaterialIcons name="workspace-premium" size={20} color={colors.primary} />
        <Text style={{ flex: 1, color: colors.primary, fontSize: 13, fontWeight: "700" }}>
          Go Premium — All 50 states, trip planner & more
        </Text>
        <MaterialIcons name="chevron-right" size={18} color={colors.primary} />
      </TouchableOpacity>

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
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Fuel log, maintenance, packing, weight & more</Text>
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
              <MaterialIcons name="auto-stories" size={24} color={colors.primary} />
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

          {/* AI Trip Planner */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/ai-trip-planner")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#7C3AED20" }]}>
              <IconSymbol name="speedometer" size={24} color="#7C3AED" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>AI Trip Planner</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>AI builds your perfect RV itinerary</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Trip Cost Calculator */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/trip-cost-calculator")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#2E7D3220" }]}>
              <IconSymbol name="dollarsign.circle.fill" size={24} color="#2E7D32" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Trip Cost Calculator</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Estimate fuel, camping, food & total trip cost</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* RV Route Warnings */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/rv-route-warnings")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#E6510020" }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#E65100" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>RV Route Warnings</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Low bridges, tunnels, steep grades & restrictions</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Hiking Trails */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/hiking-trails" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#1B5E2020" }]}>
              <MaterialIcons name="terrain" size={24} color="#1B5E20" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Hiking Trails</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Best trails near campgrounds with difficulty ratings</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Track Chair Finder */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/track-chairs")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#3B82F620" }]}>
              <MaterialIcons name="accessible" size={24} color="#3B82F6" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Track Chair Finder</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>All-terrain wheelchairs for disabled hikers by state</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Fuel Prices */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/fuel-prices" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#E6510020" }]}>
              <MaterialIcons name="local-gas-station" size={24} color="#E65100" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Fuel Prices</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Real-time diesel & gas prices at truck stops</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Compare Campgrounds */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/compare")}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#6A1B9A20" }]}>
              <MaterialIcons name="compare-arrows" size={24} color="#6A1B9A" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Compare Campgrounds</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Side-by-side comparison of up to 3 campgrounds</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Insider Boondocking Spots */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/insider-spots" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#2E7D3220" }]}>
              <MaterialIcons name="explore" size={24} color="#2E7D32" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Insider Spots</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Secret boondocking spots from the community</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Personalized Recommendations */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/recommendations" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#6A1B9A20" }]}>
              <MaterialIcons name="auto-awesome" size={24} color="#6A1B9A" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>For You</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>AI-powered campground recommendations</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Cancellation Scanner */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/cancellation-scanner" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#C6282820" }]}>
              <MaterialIcons name="notifications-active" size={24} color="#C62828" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Cancellation Scanner</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Get notified when booked-up sites have openings</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* RV Problems & Recalls */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/rv-recalls" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#D3260020" }]}>
              <MaterialIcons name="warning" size={24} color="#D32600" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>RV Problems & Recalls</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>NHTSA recalls, common issues & VIN lookup</Text>
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

          {/* RV Experiences */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/rv-experiences" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#8B5CF620" }]}>
              <MaterialIcons name="forum" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>RV Experiences</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Share stories, tips & mods for your RV</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* Themed Routes */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/themed-routes" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#1B5E2020" }]}>
              <MaterialIcons name="map" size={24} color="#1B5E20" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Themed Routes</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>PCH, Route 66, Utah Mighty Five & more</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* Interstate Exit Guide */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/exit-guide" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#0D47A120" }]}>
              <MaterialIcons name="exit-to-app" size={24} color="#0D47A1" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Interstate Exit Guide</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Gas, food & services at upcoming exits</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* RV Storage Finder */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/rv-storage" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#4E342E20" }]}>
              <MaterialIcons name="warehouse" size={24} color="#4E342E" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>RV Storage Finder</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Find secure storage facilities near you</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* Weather Alerts */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/weather-alerts" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#EF444420" }]}>
              <MaterialIcons name="warning" size={24} color="#EF4444" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Weather Alerts</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Wind, storm & fire alerts for your campgrounds</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* Caravan Mode */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/caravan" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#8B5CF620" }]}>
              <MaterialIcons name="groups" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Caravan Mode</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Group trip planning & coordination</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* Badges & Passport */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/badges" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#F59E0B20" }]}>
              <MaterialIcons name="military-tech" size={24} color="#F59E0B" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Badges & Passport</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Track your camping achievements</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* Maintenance Tracker */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/maintenance" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#06B6D420" }]}>
              <MaterialIcons name="build" size={24} color="#06B6D4" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Maintenance Tracker</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Oil, tires, generator & slide-out reminders</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* Fuel Calculator */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/fuel-calculator" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#22C55E20" }]}>
              <MaterialIcons name="local-gas-station" size={24} color="#22C55E" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Fuel Calculator</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Estimate trip fuel costs by RV type</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Border Crossings */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/border-crossings" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#1D4ED820" }]}>
              <MaterialIcons name="swap-horiz" size={24} color="#1D4ED8" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>🇨🇦 Border Crossings 🇺🇸</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>US/Canada crossings, agent phone numbers & laws</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Weight Calculator */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/weight-calculator" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#8B5CF620" }]}>
              <MaterialIcons name="scale" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Weight Calculator</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Track GVWR, cargo, water & passenger weight</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {/* Tire Pressure */}
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/tire-pressure" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.promoIcon, { backgroundColor: "#EF444420" }]}>
              <MaterialIcons name="tire-repair" size={24} color="#EF4444" />
            </View>
            <View style={styles.promoText}>
              <Text style={[styles.promoTitle, { color: colors.foreground }]}>Tire Pressure</Text>
              <Text style={[styles.promoSubtitle, { color: colors.muted }]}>Monitor PSI, tread depth & tire safety</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* ─── RV Rentals ─── */}
          <View style={styles.partnerSectionHeader}>
            <Text style={[styles.partnerSectionTitle, { color: colors.foreground }]}>RV Rentals</Text>
            <Text style={[styles.partnerSectionSubtitle, { color: colors.muted }]}>Don't own an RV? Rent one for your next adventure</Text>
          </View>

          {/* Outdoorsy */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.rvRentals.outdoorsy.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#2E7D3215" }]}>
              <MaterialIcons name="rv-hookup" size={32} color="#2E7D32" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Outdoorsy</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#2E7D3220" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#2E7D32" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Rent RVs, camper vans & trailers from trusted owners — insurance included
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#2E7D32" }]}>
                <Text style={styles.partnerCtaText}>Browse Outdoorsy</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* RVshare */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.rvRentals.rvshare.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#1565C015" }]}>
              <MaterialIcons name="directions-car" size={32} color="#1565C0" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>RVshare</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#1565C020" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#1565C0" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Rent RVs from private owners — roadside assistance, 24/7 support & flexible cancellation
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#1565C0" }]}>
                <Text style={styles.partnerCtaText}>Browse RVshare</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Cruise America */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.rvRentals.cruiseAmerica.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#E6511515" }]}>
              <MaterialIcons name="airport-shuttle" size={32} color="#E65115" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Cruise America</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#E6511520" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#E65115" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Affordable RV rentals from 130+ locations — no RV experience needed
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#E65115" }]}>
                <Text style={styles.partnerCtaText}>Browse Cruise America</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* El Monte RV */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.rvRentals.elMonteRV.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#7B1FA215" }]}>
              <MaterialIcons name="local-shipping" size={32} color="#7B1FA2" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>El Monte RV</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#7B1FA220" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#7B1FA2" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Luxury RV rentals — Class A, Class C & travel trailers with full amenities
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#7B1FA2" }]}>
                <Text style={styles.partnerCtaText}>Browse El Monte RV</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* ─── Travel Medical Insurance ─── */}
          <View style={styles.partnerSectionHeader}>
            <Text style={[styles.partnerSectionTitle, { color: colors.foreground }]}>Travel Medical Insurance</Text>
            <Text style={[styles.partnerSectionSubtitle, { color: colors.muted }]}>Stay protected on the road — coverage for RVers</Text>
          </View>

          {/* Good Sam Travel Assist */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.travelInsurance.goodSamTravelAssist.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#D3222215" }]}>
              <MaterialIcons name="health-and-safety" size={32} color="#D32222" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Good Sam Travel Assist</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#D3222220" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#D32222" }]}>RV FOCUSED</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Emergency medical evacuation & RV/vehicle return — made for RVers. From $79.99/yr
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#D32222" }]}>
                <Text style={styles.partnerCtaText}>Learn More</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* SafetyWing */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.travelInsurance.safetyWing.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#6C5CE715" }]}>
              <MaterialIcons name="shield" size={32} color="#6C5CE7" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>SafetyWing</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#6C5CE720" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#6C5CE7" }]}>FULL-TIMERS</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Subscription travel medical insurance — no fixed end date. From $45/month
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#6C5CE7" }]}>
                <Text style={styles.partnerCtaText}>Learn More</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Medjet */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.travelInsurance.medjet.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#0077B615" }]}>
              <MaterialIcons name="flight" size={32} color="#0077B6" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Medjet</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#0077B620" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#0077B6" }]}>EVACUATION</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Air medical transport to your hospital of choice if hospitalized 150+ mi from home. From $99/yr
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#0077B6" }]}>
                <Text style={styles.partnerCtaText}>Learn More</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* World Nomads */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.travelInsurance.worldNomads.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#2D9CDB15" }]}>
              <MaterialIcons name="public" size={32} color="#2D9CDB" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>World Nomads</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#2D9CDB20" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#2D9CDB" }]}>TRAVEL</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Flexible travel insurance with emergency medical, trip cancellation & 24/7 assistance
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#2D9CDB" }]}>
                <Text style={styles.partnerCtaText}>Get a Quote</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Allianz */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.travelInsurance.allianz.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#003A8C15" }]}>
              <MaterialIcons name="verified-user" size={32} color="#003A8C" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Allianz Travel</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#003A8C20" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#003A8C" }]}>COMPREHENSIVE</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Full travel protection — medical, trip cancellation, baggage & 24-hour hotline
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#003A8C" }]}>
                <Text style={styles.partnerCtaText}>Get a Quote</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* ─── Partner Booking Platforms ─── */}
          <View style={styles.partnerSectionHeader}>
            <Text style={[styles.partnerSectionTitle, { color: colors.foreground }]}>Book Unique Stays</Text>
            <Text style={[styles.partnerSectionSubtitle, { color: colors.muted }]}>Explore camping on partner platforms</Text>
          </View>

          {/* Hipcamp */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.hipcamp.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#00A86B15" }]}>
              <MaterialIcons name="nature-people" size={32} color="#00A86B" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Hipcamp</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#00A86B20" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#00A86B" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Unique outdoor stays — farms, vineyards, ranches, treehouses & glamping
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#00A86B" }]}>
                <Text style={styles.partnerCtaText}>Browse Hipcamp</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Campspot */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.campspot.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#FF6B3515" }]}>
              <MaterialIcons name="terrain" size={32} color="#FF6B35" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Campspot</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#FF6B3520" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#FF6B35" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Book top-rated private RV parks — real-time availability & instant confirmation
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#FF6B35" }]}>
                <Text style={styles.partnerCtaText}>Browse Campspot</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* KOA Kampgrounds */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.koa.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#FFD70015" }]}>
              <MaterialIcons name="cabin" size={32} color="#DAA520" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>KOA Kampgrounds</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#FFD70020" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#DAA520" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                1,500+ campgrounds across North America — cabins, RV sites & tent camping
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#DAA520" }]}>
                <Text style={styles.partnerCtaText}>Browse KOA</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Harvest Hosts */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.harvestHosts.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#722F3715" }]}>
              <MaterialIcons name="wine-bar" size={32} color="#722F37" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Harvest Hosts</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#722F3720" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#722F37" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Free overnight stays at 5,600+ wineries, farms, breweries & unique locations
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#722F37" }]}>
                <Text style={styles.partnerCtaText}>Join Harvest Hosts</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* ─── Preserve Your Memories ─── */}
          <View style={styles.partnerSectionHeader}>
            <Text style={[styles.partnerSectionTitle, { color: colors.foreground }]}>Preserve Your Memories</Text>
            <Text style={[styles.partnerSectionSubtitle, { color: colors.muted }]}>Turn your RV trip photos into keepsakes</Text>
          </View>

          {/* Photobook America */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.photobookAmerica.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#E8364815" }]}>
              <MaterialIcons name="photo-album" size={32} color="#E83648" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Photobook America</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#E8364820" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#E83648" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Create photobooks, canvas prints, metal prints, calendars, mugs & more from your trip photos
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#E83648" }]}>
                <Text style={styles.partnerCtaText}>Create Photobook</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* ─── E-Bikes & Adventure Gear ─── */}
          <View style={styles.partnerSectionHeader}>
            <Text style={[styles.partnerSectionTitle, { color: colors.foreground }]}>E-Bikes & Adventure Gear</Text>
            <Text style={[styles.partnerSectionSubtitle, { color: colors.muted }]}>Explore campgrounds & trails on two wheels</Text>
          </View>
          {/* Young Electric Bikes */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.youngElectricBikes.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#2E7D3215" }]}>
              <MaterialIcons name="electric-bike" size={32} color="#2E7D32" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Young Electric Bikes</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#2E7D3220" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#2E7D32" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Powerful e-bikes built for adventure — explore campgrounds, trails & nearby towns from your RV
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#2E7D32" }]}>
                <Text style={styles.partnerCtaText}>Shop E-Bikes</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          {/* Kingbull Bike */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.kingbullBike.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#C6282815" }]}>
              <MaterialIcons name="electric-bike" size={32} color="#C62828" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Kingbull Bike</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#C6282820" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#C62828" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Quality e-bikes from city commutes to rugged trails — compact storage, perfect for RV travel
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#C62828" }]}>
                <Text style={styles.partnerCtaText}>Shop Kingbull</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          {/* OUTFITR Adventure Gear */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.outfitr.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#E6511015" }]}>
              <MaterialIcons name="hiking" size={32} color="#E65110" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>OUTFITR</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#E6511020" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#E65110" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Adventure-grade backpacks, outdoor accessories & travel essentials built to last
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#E65110" }]}>
                <Text style={styles.partnerCtaText}>Shop Gear</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          {/* Traverseon Outdoor Gear */}
          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openUrl(AFFILIATE_CONFIG.traverseon.url)}
            activeOpacity={0.7}
          >
            <View style={[styles.partnerLogoBox, { backgroundColor: "#0D7C6615" }]}>
              <MaterialIcons name="landscape" size={32} color="#0D7C66" />
            </View>
            <View style={styles.partnerContent}>
              <View style={styles.partnerNameRow}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>Traverseon</Text>
                <View style={[styles.partnerBadge, { backgroundColor: "#0D7C6620" }]}>
                  <Text style={[styles.partnerBadgeText, { color: "#0D7C66" }]}>PARTNER</Text>
                </View>
              </View>
              <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                Premium outdoor gear — compact & ultra-portable systems for adventurers
              </Text>
              <View style={[styles.partnerCta, { backgroundColor: "#0D7C66" }]}>
                <Text style={styles.partnerCtaText}>Shop Traverseon</Text>
                <MaterialIcons name="open-in-new" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* ─── Cruise Ship Ports for RVers ─── */}
          <View style={styles.partnerSectionHeader}>
            <Text style={[styles.partnerSectionTitle, { color: colors.foreground }]}>Cruise Ship Ports</Text>
            <Text style={[styles.partnerSectionSubtitle, { color: colors.muted }]}>Park your RV & board a cruise — Florida to California</Text>
          </View>

          {CRUISE_PORT_REGIONS.map((region) => (
            <View key={region.name}>
              <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
                <Text style={{ color: region.color, fontSize: 13, fontWeight: "700" }}>{region.name}</Text>
              </View>
              {cruisePorts.filter((p) => p.region === region.name).map((port) => (
                <TouchableOpacity
                  key={port.id}
                  style={[styles.partnerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: "/cruise-port-detail" as any, params: { portId: port.id } })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.partnerLogoBox, { backgroundColor: region.color + "15" }]}>
                    <MaterialIcons name="directions-boat" size={32} color={region.color} />
                  </View>
                  <View style={styles.partnerContent}>
                    <View style={styles.partnerNameRow}>
                      <Text style={[styles.partnerName, { color: colors.foreground }]}>{port.name}</Text>
                      <View style={[styles.partnerBadge, { backgroundColor: region.color + "20" }]}>
                        <Text style={[styles.partnerBadgeText, { color: region.color }]}>{port.cruiseLines.length} LINES</Text>
                      </View>
                    </View>
                    <Text style={[styles.partnerDesc, { color: colors.muted }]} numberOfLines={2}>
                      {port.city}, {port.state} — {port.rvParking.length} RV parking option{port.rvParking.length !== 1 ? "s" : ""}
                    </Text>
                    <View style={[styles.partnerCta, { backgroundColor: region.color }]}>
                      <Text style={styles.partnerCtaText}>View Port & Book</Text>
                      <MaterialIcons name="chevron-right" size={14} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
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
  partnerSectionHeader: {
    paddingHorizontal: 16, marginTop: 8, marginBottom: 12,
  },
  partnerSectionTitle: {
    fontSize: 20, fontWeight: "800",
  },
  partnerSectionSubtitle: {
    fontSize: 13, marginTop: 2,
  },
  partnerCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1,
    padding: 16, flexDirection: "row", alignItems: "flex-start",
  },
  partnerLogoBox: {
    width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 14,
  },
  partnerContent: {
    flex: 1,
  },
  partnerNameRow: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4,
  },
  partnerName: {
    fontSize: 17, fontWeight: "700",
  },
  partnerBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  partnerBadgeText: {
    fontSize: 9, fontWeight: "800", letterSpacing: 0.5,
  },
  partnerDesc: {
    fontSize: 13, lineHeight: 18, marginBottom: 10,
  },
  partnerCta: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  partnerCtaText: {
    color: "#fff", fontSize: 13, fontWeight: "700",
  },
});
