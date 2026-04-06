/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { amazonUrl, AFFILIATE_CONFIG } from "@/lib/affiliate";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { openUrl } from "@/lib/open-url";

// ── Types ──
interface GearItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  rating: number;
  description: string;
  whyWeLoveIt: string;
  asin: string; // Amazon ASIN for direct product link
}

interface GearCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: GearItem[];
}

// ── Gear Data with real ASINs ──
const GEAR_CATEGORIES: GearCategory[] = [
  {
    id: "leveling",
    title: "Leveling & Stabilization",
    icon: "straighten",
    description: "Keep your RV level and stable at any campsite",
    items: [
      {
        id: "l1", name: "Lynx Levelers (10-Pack)", brand: "Tri-Lynx",
        price: "$39.99", rating: 4.8, asin: "B0019KPUNG",
        description: "Interlocking orange leveling blocks. Stack to desired height. Works for any RV.",
        whyWeLoveIt: "Lightweight, durable, and universally compatible. The RV community standard.",
      },
      {
        id: "l2", name: "Andersen Camper Leveler (2-Pack)", brand: "Andersen",
        price: "$84.99", rating: 4.7, asin: "B00F55B0OW",
        description: "Drive-on leveling system. No stacking blocks needed. Includes chock.",
        whyWeLoveIt: "One-person operation. Drive on, you're level. Saves 10 minutes every setup.",
      },
      {
        id: "l3", name: "X-Chock Tire Locking Chock (Pair)", brand: "BAL",
        price: "$34.99", rating: 4.6, asin: "B000BQXNQK",
        description: "Ratchet-style chock that fits between dual tires. Prevents rocking.",
        whyWeLoveIt: "Eliminates side-to-side rocking completely. A must for travel trailers.",
      },
      {
        id: "l4", name: "Camco EZ Level (2-Pack)", brand: "Camco",
        price: "$19.99", rating: 4.5, asin: "B0014IIKQO",
        description: "T-shaped bubble level. Stick to your RV for quick leveling reference.",
        whyWeLoveIt: "Cheap, simple, and you can see it from the driver's seat while parking.",
      },
    ],
  },
  {
    id: "solar",
    title: "Solar & Power",
    icon: "wb-sunny",
    description: "Stay powered off-grid with solar and battery systems",
    items: [
      {
        id: "s1", name: "200W Portable Solar Panel", brand: "Renogy",
        price: "$249.99", rating: 4.7, asin: "B0BFCJ7Y8T",
        description: "Foldable 200W monocrystalline panel. Built-in kickstand. MC4 connectors.",
        whyWeLoveIt: "Best watt-per-dollar for portable solar. Folds flat for storage.",
      },
      {
        id: "s2", name: "Jackery Explorer 1000 Plus", brand: "Jackery",
        price: "$1,099.00", rating: 4.6, asin: "B0CZ5RYBWW",
        description: "1264Wh portable power station. 2000W output. Expandable to 5kWh.",
        whyWeLoveIt: "Runs a mini fridge, CPAP, laptop, and phone chargers simultaneously.",
      },
      {
        id: "s3", name: "Victron SmartSolar MPPT 100/30", brand: "Victron Energy",
        price: "$169.00", rating: 4.8, asin: "B075KGXFY5",
        description: "30A MPPT charge controller with Bluetooth monitoring. 100V input.",
        whyWeLoveIt: "Industry gold standard. Bluetooth app shows real-time solar harvest data.",
      },
      {
        id: "s4", name: "Battle Born 100Ah LiFePO4 Battery", brand: "Battle Born",
        price: "$925.00", rating: 4.8, asin: "B077Y9HNTF",
        description: "12V 100Ah lithium battery. 3000-5000 cycle life. Built-in BMS.",
        whyWeLoveIt: "Half the weight of lead-acid, 10x the lifespan. The upgrade that changes everything.",
      },
    ],
  },
  {
    id: "water",
    title: "Water & Filtration",
    icon: "water-drop",
    description: "Clean water systems for safe drinking on the road",
    items: [
      {
        id: "w1", name: "Camco TastePURE Water Filter", brand: "Camco",
        price: "$24.99", rating: 4.5, asin: "B0006IX87S",
        description: "Inline water filter with flexible hose protector. KDF-55 & GAC filtration.",
        whyWeLoveIt: "Removes bad taste, odor, sediment, and bacteria. Essential for every hookup.",
      },
      {
        id: "w2", name: "25ft Drinking Water Hose", brand: "Camco",
        price: "$18.99", rating: 4.7, asin: "B004ME1JI8",
        description: "NSF/ANSI certified drinking water safe hose. Lead and BPA free.",
        whyWeLoveIt: "Don't use a garden hose for drinking water. This one is food-grade safe.",
      },
      {
        id: "w3", name: "Water Pressure Regulator", brand: "Valterra",
        price: "$12.99", rating: 4.5, asin: "B0006JLT5M",
        description: "Adjustable brass water pressure regulator. Protects RV plumbing from high pressure.",
        whyWeLoveIt: "Campground water pressure can spike to 100+ PSI. This protects your pipes.",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & Emergency",
    icon: "shield",
    description: "Stay safe on the road and at the campsite",
    items: [
      {
        id: "sf1", name: "Tire Pressure Monitoring System (6 sensors)", brand: "TireMinder",
        price: "$289.00", rating: 4.5, asin: "B07BFHG2MN",
        description: "Wireless TPMS with 6 sensors. Real-time pressure and temperature alerts.",
        whyWeLoveIt: "Tire blowouts are the #1 RV road hazard. This warns you before it happens.",
      },
      {
        id: "sf2", name: "First Alert RV Fire Extinguisher", brand: "First Alert",
        price: "$24.99", rating: 4.6, asin: "B000UVOMHQ",
        description: "Rechargeable 2-lb fire extinguisher. Rated for A, B, and C fires.",
        whyWeLoveIt: "Compact enough for the RV kitchen. Every RV should have two — one in front, one in back.",
      },
      {
        id: "sf3", name: "Kidde Carbon Monoxide Detector", brand: "Kidde",
        price: "$29.99", rating: 4.7, asin: "B07QXJYBZL",
        description: "Digital display CO detector with 10-year sealed battery. Peak level memory.",
        whyWeLoveIt: "Generator exhaust and propane leaks can be deadly. This is non-negotiable safety gear.",
      },
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen & Cooking",
    icon: "restaurant",
    description: "Cook great meals in your RV or at the campsite",
    items: [
      {
        id: "k1", name: "Blackstone 22\" Tabletop Griddle", brand: "Blackstone",
        price: "$149.99", rating: 4.7, asin: "B08BFHWDH4",
        description: "Portable propane griddle with 339 sq in cooking surface. Folds flat.",
        whyWeLoveIt: "Pancakes, burgers, stir fry — this replaces your campfire cooking setup.",
      },
      {
        id: "k2", name: "Instant Pot Duo 6-Quart", brand: "Instant Pot",
        price: "$79.99", rating: 4.7, asin: "B00FLYWNYQ",
        description: "7-in-1 pressure cooker, slow cooker, rice cooker, steamer, and more.",
        whyWeLoveIt: "One-pot meals save propane and cleanup time. Perfect for small RV kitchens.",
      },
      {
        id: "k3", name: "Stanley Adventure Camp Cook Set", brand: "Stanley",
        price: "$35.00", rating: 4.5, asin: "B005188T90",
        description: "Stainless steel nesting cook set for 4. Pot, lid/pan, cups, and sporks.",
        whyWeLoveIt: "Compact, durable, and nests together. Great for campfire cooking.",
      },
    ],
  },
  {
    id: "connectivity",
    title: "Connectivity & WiFi",
    icon: "wifi",
    description: "Stay connected even in remote locations",
    items: [
      {
        id: "c1", name: "GL.iNet Beryl AX (GL-MT3000)", brand: "GL.iNet",
        price: "$89.00", rating: 4.4, asin: "B0BY5913LF",
        description: "Portable travel router with WiFi 6. Extend campground WiFi to all your devices.",
        whyWeLoveIt: "Campground WiFi is always weak. This router grabs the signal and boosts it inside your RV.",
      },
      {
        id: "c2", name: "weBoost Drive Reach RV", brand: "weBoost",
        price: "$499.99", rating: 4.3, asin: "B08LXJNMGV",
        description: "Cell signal booster for RVs. Boosts 5G/4G LTE for all carriers simultaneously.",
        whyWeLoveIt: "Turns 1 bar into 3-4 bars. Essential for boondocking and remote campgrounds.",
      },
      {
        id: "c3", name: "Starlink Standard Kit", brand: "SpaceX",
        price: "$499.00 + $120/mo", rating: 4.6, asin: "B0BK23MZTH",
        description: "Satellite internet anywhere in North America. 25-220 Mbps download speeds.",
        whyWeLoveIt: "Game changer for remote workers. Internet in places that have zero cell service.",
      },
    ],
  },
  {
    id: "tools",
    title: "Tools & Maintenance",
    icon: "build",
    description: "Essential tools for RV repairs and maintenance",
    items: [
      {
        id: "t1", name: "Camco RV Sewer Hose Kit (20ft)", brand: "Camco",
        price: "$39.99", rating: 4.5, asin: "B000BGHXOO",
        description: "20ft heavy-duty sewer hose with fittings, elbow, and storage caps.",
        whyWeLoveIt: "Don't cheap out on sewer hoses. This one won't leak or collapse. Trust us.",
      },
      {
        id: "t2", name: "Eternabond RV Roof Repair Tape", brand: "EternaBond",
        price: "$29.99", rating: 4.7, asin: "B001AH8FO6",
        description: "4\" x 25' microsealant roof repair tape. Permanent waterproof seal.",
        whyWeLoveIt: "Emergency roof leak fix that becomes a permanent repair. Every RVer needs a roll.",
      },
      {
        id: "t3", name: "Valterra Bladex Valve Opener", brand: "Valterra",
        price: "$14.99", rating: 4.4, asin: "B000BGM3YI",
        description: "Universal T-handle for RV waste valve. Fits all standard 3\" and 1.5\" valves.",
        whyWeLoveIt: "When your dump valve handle breaks at 10pm, you'll be glad you have a spare.",
      },
    ],
  },
  {
    id: "towing",
    title: "Towing & Hitch",
    icon: "directions-car",
    description: "Towing accessories for safe travel",
    items: [
      {
        id: "tw1", name: "Equal-i-zer Weight Distribution Hitch", brand: "Equal-i-zer",
        price: "$699.00", rating: 4.8, asin: "B001GCJKH4",
        description: "4-point sway control with integrated weight distribution. 10,000 lb capacity.",
        whyWeLoveIt: "Eliminates trailer sway completely. The best WDH on the market, period.",
      },
      {
        id: "tw2", name: "CURT Trailer Hitch Lock", brand: "CURT",
        price: "$19.99", rating: 4.5, asin: "B001DNHXK4",
        description: "Chrome-plated steel hitch lock. Fits 1.25\" and 2\" receivers.",
        whyWeLoveIt: "Prevents trailer theft at campgrounds and rest stops. Cheap insurance.",
      },
      {
        id: "tw3", name: "Hopkins Tow Bar Wiring Kit", brand: "Hopkins",
        price: "$29.99", rating: 4.3, asin: "B0002F6QIC",
        description: "Universal 4-wire flat trailer wiring kit with converter.",
        whyWeLoveIt: "Proper trailer lights save lives. This kit makes installation straightforward.",
      },
    ],
  },
  {
    id: "outdoor",
    title: "Outdoor & Campsite",
    icon: "deck",
    description: "Make your campsite feel like home",
    items: [
      {
        id: "o1", name: "NEMO Stargaze Recliner Chair", brand: "NEMO",
        price: "$249.95", rating: 4.7, asin: "B0B4QLKJM3",
        description: "Suspended reclining camp chair. Swings gently. Supports 300 lbs.",
        whyWeLoveIt: "The most comfortable camp chair ever made. You'll fight over who gets to sit in it.",
      },
      {
        id: "o2", name: "Camco RV Patio Mat (9x12)", brand: "Camco",
        price: "$49.99", rating: 4.4, asin: "B001GAOQHQ",
        description: "Reversible outdoor mat. Keeps dirt out of your RV. Easy to clean.",
        whyWeLoveIt: "Defines your outdoor living space and keeps mud/grass out of the RV.",
      },
      {
        id: "o3", name: "BioLite AlpenGlow 500 Lantern", brand: "BioLite",
        price: "$69.95", rating: 4.6, asin: "B0B5FXQWQY",
        description: "Rechargeable LED lantern with color modes. 500 lumens. USB-C charging.",
        whyWeLoveIt: "Beautiful ambient lighting for your campsite. The color modes are actually useful.",
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
          We may earn a small commission from purchases made through our links. This helps support RV Nomad at no extra cost to you.
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
                <View style={[styles.itemCount, { backgroundColor: colors.primary + "15" }]}>
                  <Text style={[styles.itemCountText, { color: colors.primary }]}>{category.items.length}</Text>
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
                    style={[styles.shopBtn, { backgroundColor: "#FF9900" }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      openUrl(amazonUrl(item.asin, item.name, item.brand)).catch(() => {});
                    }}
                  >
                    <MaterialIcons name="shopping-cart" size={18} color="#fff" />
                    <Text style={styles.shopBtnText}>View on Amazon</Text>
                    <MaterialIcons name="open-in-new" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        {/* RV Insurance Section */}
        <View style={styles.insuranceSection}>
          <Text style={[styles.insuranceTitle, { color: colors.foreground }]}>RV Insurance</Text>
          <Text style={[styles.insuranceDesc, { color: colors.muted }]}>Compare quotes from top RV insurance providers</Text>
          <View style={styles.insuranceCards}>
            <TouchableOpacity
              style={[styles.insuranceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openUrl(AFFILIATE_CONFIG.insurance.progressive.url)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="verified-user" size={24} color="#0033A0" />
              <Text style={[styles.insuranceName, { color: colors.foreground }]}>Progressive</Text>
              <Text style={[styles.insuranceAction, { color: colors.primary }]}>Get Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.insuranceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openUrl(AFFILIATE_CONFIG.insurance.nationalGeneral.url)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="verified-user" size={24} color="#C41230" />
              <Text style={[styles.insuranceName, { color: colors.foreground }]}>National General</Text>
              <Text style={[styles.insuranceAction, { color: colors.primary }]}>Get Quote</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Membership Programs */}
        <View style={styles.membershipSection}>
          <Text style={[styles.insuranceTitle, { color: colors.foreground }]}>Membership Programs</Text>
          <Text style={[styles.insuranceDesc, { color: colors.muted }]}>Save money with these RV membership programs</Text>
          {[
            { key: "harvestHosts", icon: "wine-bar", color: "#7B1FA2" },
            { key: "goodSam", icon: "card-membership", color: "#1565C0" },
            { key: "passportAmerica", icon: "loyalty", color: "#E65100" },
            { key: "escapees", icon: "groups", color: "#2E7D32" },
            { key: "thousandTrails", icon: "park", color: "#00695C" },
          ].map(({ key, icon, color }) => {
            const info = (AFFILIATE_CONFIG as any)[key];
            return (
              <TouchableOpacity
                key={key}
                style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => openUrl(info.url)}
                activeOpacity={0.7}
              >
                <View style={[styles.memberIcon, { backgroundColor: color + "15" }]}>
                  <MaterialIcons name={icon as any} size={22} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.memberName, { color: colors.foreground }]}>{info.name}</Text>
                  <Text style={[styles.memberCost, { color: colors.success }]}>{info.cost}</Text>
                  <Text style={[styles.memberDesc, { color: colors.muted }]} numberOfLines={2}>{info.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
              </TouchableOpacity>
            );
          })}
        </View>
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
  itemCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  itemCountText: { fontSize: 12, fontWeight: "700" },
  gearCard: {
    marginHorizontal: 16, marginTop: 6, padding: 14, borderRadius: 12, borderWidth: 1, gap: 8,
  },
  gearHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  gearBrand: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  gearName: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  gearPrice: { fontSize: 16, fontWeight: "800" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, fontWeight: "600" },
  gearDesc: { fontSize: 13, lineHeight: 19 },
  whyBox: {
    borderRadius: 10, borderWidth: 1, padding: 10, gap: 4,
  },
  whyLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  whyText: { fontSize: 13, lineHeight: 18 },
  shopBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 10,
  },
  shopBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  // Insurance
  insuranceSection: { marginTop: 24, paddingHorizontal: 16 },
  insuranceTitle: { fontSize: 18, fontWeight: "700" },
  insuranceDesc: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  insuranceCards: { flexDirection: "row", gap: 12 },
  insuranceCard: {
    flex: 1, alignItems: "center", paddingVertical: 20, borderRadius: 14, borderWidth: 1, gap: 8,
  },
  insuranceName: { fontSize: 14, fontWeight: "700" },
  insuranceAction: { fontSize: 13, fontWeight: "600" },
  // Memberships
  membershipSection: { marginTop: 24, paddingHorizontal: 16, marginBottom: 20 },
  memberCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 8,
  },
  memberIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  memberName: { fontSize: 15, fontWeight: "700" },
  memberCost: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  memberDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
});
