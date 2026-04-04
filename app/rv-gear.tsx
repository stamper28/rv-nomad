import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Types ──
interface GearItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  rating: number;
  description: string;
  whyWeLoveIt: string;
  affiliateTag: string;
}

interface GearCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: GearItem[];
}

// ── Gear Data ──
const GEAR_CATEGORIES: GearCategory[] = [
  {
    id: "leveling",
    title: "Leveling & Stabilization",
    icon: "straighten",
    description: "Keep your RV level and stable at any campsite",
    items: [
      {
        id: "l1", name: "Lynx Levelers (10-Pack)", brand: "Tri-Lynx",
        price: "$39.99", rating: 4.8,
        description: "Interlocking orange leveling blocks. Stack to desired height. Works for any RV.",
        whyWeLoveIt: "Lightweight, durable, and universally compatible. The RV community standard.",
        affiliateTag: "rv-nomad-levelers",
      },
      {
        id: "l2", name: "Andersen Camper Leveler", brand: "Andersen",
        price: "$84.99", rating: 4.7,
        description: "Drive-on leveling system. No stacking blocks needed. Includes chock.",
        whyWeLoveIt: "One-person operation. Drive on, you're level. Saves 10 minutes every setup.",
        affiliateTag: "rv-nomad-andersen",
      },
      {
        id: "l3", name: "X-Chock Tire Locking Chock", brand: "BAL",
        price: "$34.99", rating: 4.6,
        description: "Ratchet-style chock that fits between tandem tires. Eliminates rocking.",
        whyWeLoveIt: "Game changer for travel trailers. No more wobble when walking inside.",
        affiliateTag: "rv-nomad-xchock",
      },
    ],
  },
  {
    id: "solar",
    title: "Solar & Power",
    icon: "solar-power",
    description: "Stay powered off-grid with solar and battery solutions",
    items: [
      {
        id: "s1", name: "200W Portable Solar Panel", brand: "Renogy",
        price: "$249.99", rating: 4.7,
        description: "Foldable 200W monocrystalline panel with built-in kickstand and MC4 connectors.",
        whyWeLoveIt: "Best watts-per-dollar for portable solar. Folds flat for storage.",
        affiliateTag: "rv-nomad-renogy200",
      },
      {
        id: "s2", name: "Jackery Explorer 1000 Plus", brand: "Jackery",
        price: "$1,299.00", rating: 4.8,
        description: "1264Wh LiFePO4 portable power station. 2000W output. Expandable to 5kWh.",
        whyWeLoveIt: "Reliable, quiet alternative to generators. Powers AC, fridge, CPAP, and more.",
        affiliateTag: "rv-nomad-jackery1000",
      },
      {
        id: "s3", name: "Victron SmartSolar MPPT 100/30", brand: "Victron",
        price: "$189.00", rating: 4.9,
        description: "30A MPPT solar charge controller with Bluetooth monitoring.",
        whyWeLoveIt: "Industry-leading efficiency. The Bluetooth app shows real-time solar production.",
        affiliateTag: "rv-nomad-victron",
      },
    ],
  },
  {
    id: "water",
    title: "Water & Filtration",
    icon: "water-drop",
    description: "Clean water solutions for safe drinking on the road",
    items: [
      {
        id: "w1", name: "Camco TastePURE Water Filter", brand: "Camco",
        price: "$24.99", rating: 4.5,
        description: "Inline water filter with flexible hose protector. Reduces bad taste and odor.",
        whyWeLoveIt: "Cheap insurance for clean water. Replace every 3 months.",
        affiliateTag: "rv-nomad-camcofilter",
      },
      {
        id: "w2", name: "Aqua-Hot Tankless Water Heater", brand: "Aqua-Hot",
        price: "$1,899.00", rating: 4.6,
        description: "Continuous hot water on demand. Diesel or electric powered.",
        whyWeLoveIt: "Never run out of hot water. Worth the investment for full-timers.",
        affiliateTag: "rv-nomad-aquahot",
      },
      {
        id: "w3", name: "Zero Water Pitcher (10-Cup)", brand: "ZeroWater",
        price: "$34.99", rating: 4.4,
        description: "5-stage filtration pitcher. Removes 99.6% of dissolved solids.",
        whyWeLoveIt: "Perfect backup filtration. The TDS meter tells you exactly when to replace.",
        affiliateTag: "rv-nomad-zerowater",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & Security",
    icon: "security",
    description: "Protect your RV and your family on the road",
    items: [
      {
        id: "sf1", name: "Tire Pressure Monitoring System (6-Sensor)", brand: "TireMinder",
        price: "$289.99", rating: 4.7,
        description: "Real-time tire pressure and temperature monitoring for all tires including towed vehicle.",
        whyWeLoveIt: "Tire blowouts are the #1 RV road hazard. This gives you early warning.",
        affiliateTag: "rv-nomad-tpms",
      },
      {
        id: "sf2", name: "Ring Stick Up Cam (Battery)", brand: "Ring",
        price: "$99.99", rating: 4.3,
        description: "Wireless security camera with motion detection. Works on WiFi or hotspot.",
        whyWeLoveIt: "Check on your RV from anywhere. Great for monitoring when you're hiking.",
        affiliateTag: "rv-nomad-ringcam",
      },
      {
        id: "sf3", name: "First Alert Dual-Sensor Smoke/CO Alarm", brand: "First Alert",
        price: "$39.99", rating: 4.6,
        description: "Combination smoke and carbon monoxide detector designed for RVs.",
        whyWeLoveIt: "Non-negotiable safety item. The dual sensor catches both fast and slow fires.",
        affiliateTag: "rv-nomad-firstalert",
      },
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen & Cooking",
    icon: "restaurant",
    description: "Cook like a pro in your RV kitchen",
    items: [
      {
        id: "k1", name: "Blackstone 17\" Tabletop Griddle", brand: "Blackstone",
        price: "$99.99", rating: 4.8,
        description: "Portable propane griddle with 268 sq in cooking surface. Perfect for outdoor cooking.",
        whyWeLoveIt: "Breakfast, lunch, dinner — this thing does it all. Easy to clean.",
        affiliateTag: "rv-nomad-blackstone",
      },
      {
        id: "k2", name: "Instant Pot Duo 6-Quart", brand: "Instant Pot",
        price: "$89.99", rating: 4.7,
        description: "7-in-1 pressure cooker. Pressure cook, slow cook, rice, steam, sauté, yogurt, warm.",
        whyWeLoveIt: "One appliance replaces five. Saves propane by using electric power.",
        affiliateTag: "rv-nomad-instantpot",
      },
      {
        id: "k3", name: "Collapsible Dish Drying Rack", brand: "Surpahs",
        price: "$14.99", rating: 4.5,
        description: "Over-the-sink collapsible drying rack. Folds flat for storage.",
        whyWeLoveIt: "Space is everything in an RV. This folds to 1 inch thick.",
        affiliateTag: "rv-nomad-dishrack",
      },
    ],
  },
  {
    id: "connectivity",
    title: "WiFi & Connectivity",
    icon: "wifi",
    description: "Stay connected while traveling and working remotely",
    items: [
      {
        id: "c1", name: "Pepwave MAX Transit Duo", brand: "Peplink",
        price: "$999.00", rating: 4.8,
        description: "Dual-modem cellular router with load balancing. Supports 2 SIM cards.",
        whyWeLoveIt: "The gold standard for RV internet. Combines two carriers for reliable coverage.",
        affiliateTag: "rv-nomad-pepwave",
      },
      {
        id: "c2", name: "weBoost Drive Reach RV", brand: "weBoost",
        price: "$499.99", rating: 4.4,
        description: "Cell signal booster for RVs. Boosts all carriers simultaneously.",
        whyWeLoveIt: "Turns 1 bar into 3-4 bars. Essential for boondocking in remote areas.",
        affiliateTag: "rv-nomad-weboost",
      },
      {
        id: "c3", name: "Starlink RV (Standard Kit)", brand: "SpaceX",
        price: "$599.00 + $150/mo", rating: 4.6,
        description: "Satellite internet anywhere in the US. 50-200 Mbps download speeds.",
        whyWeLoveIt: "Game changer for remote workers. Internet in places that have zero cell service.",
        affiliateTag: "rv-nomad-starlink",
      },
    ],
  },
];

export default function RVGearScreen() {
  const colors = useColors();
  const router = useRouter();
  const [expandedCategory, setExpandedCategory] = useState<string | null>("leveling");

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-border"}
          size={14}
          color="#FB8C00"
        />
      );
    }
    return stars;
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>RV Gear Guide</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Curated picks from the RV community</Text>
        </View>
      </View>

      {/* Affiliate Disclaimer */}
      <View style={[styles.disclaimer, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
        <MaterialIcons name="info-outline" size={16} color={colors.primary} />
        <Text style={[styles.disclaimerText, { color: colors.muted }]}>
          We may earn a small commission from purchases made through our links. This helps support RV Nomad.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {GEAR_CATEGORIES.map((category) => {
          const isExpanded = expandedCategory === category.id;
          return (
            <View key={category.id} style={{ marginBottom: 4 }}>
              {/* Category Header */}
              <TouchableOpacity
                onPress={() => setExpandedCategory(isExpanded ? null : category.id)}
                style={[styles.categoryHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: colors.primary + "15" }]}>
                  <MaterialIcons name={category.icon as any} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.categoryTitle, { color: colors.foreground }]}>{category.title}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.muted }]}>{category.description}</Text>
                </View>
                <MaterialIcons
                  name={isExpanded ? "expand-less" : "expand-more"}
                  size={24}
                  color={colors.muted}
                />
              </TouchableOpacity>

              {/* Category Items */}
              {isExpanded && category.items.map((item) => (
                <View key={item.id} style={[styles.gearCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.gearHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.gearBrand, { color: colors.primary }]}>{item.brand}</Text>
                      <Text style={[styles.gearName, { color: colors.foreground }]}>{item.name}</Text>
                    </View>
                    <Text style={[styles.gearPrice, { color: colors.success }]}>{item.price}</Text>
                  </View>

                  <View style={styles.ratingRow}>
                    {renderStars(item.rating)}
                    <Text style={[styles.ratingText, { color: colors.muted }]}>{item.rating.toFixed(1)}</Text>
                  </View>

                  <Text style={[styles.gearDesc, { color: colors.muted }]}>{item.description}</Text>

                  <View style={[styles.whyBox, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" }]}>
                    <Text style={[styles.whyLabel, { color: colors.primary }]}>Why we love it</Text>
                    <Text style={[styles.whyText, { color: colors.foreground }]}>{item.whyWeLoveIt}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.shopBtn, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      // Placeholder for affiliate link
                      Linking.openURL(`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}&tag=${item.affiliateTag}`).catch(() => {});
                    }}
                  >
                    <MaterialIcons name="shopping-cart" size={18} color="#fff" />
                    <Text style={styles.shopBtnText}>View on Amazon</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 8, gap: 4,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  disclaimer: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 12, padding: 10, borderRadius: 10, borderWidth: 1,
  },
  disclaimerText: { fontSize: 11, flex: 1, lineHeight: 16 },
  categoryHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 14, borderWidth: 1,
  },
  categoryIcon: {
    width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center",
  },
  categoryTitle: { fontSize: 16, fontWeight: "700" },
  categoryDesc: { fontSize: 12, marginTop: 2 },
  gearCard: {
    marginHorizontal: 16, marginTop: 6, padding: 14, borderRadius: 12, borderWidth: 1, gap: 8,
  },
  gearHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  gearBrand: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  gearName: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  gearPrice: { fontSize: 16, fontWeight: "800" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, marginLeft: 2 },
  gearDesc: { fontSize: 13, lineHeight: 19 },
  whyBox: { padding: 10, borderRadius: 8, borderWidth: 1 },
  whyLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
  whyText: { fontSize: 13, lineHeight: 18 },
  shopBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 10, borderRadius: 10,
  },
  shopBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
