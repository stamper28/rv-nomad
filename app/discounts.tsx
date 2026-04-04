import React, { useState } from "react";
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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface DiscountProgram {
  id: string;
  name: string;
  cost: string;
  savings: string;
  description: string;
  benefits: string[];
  bestFor: string;
  website: string;
  color: string;
}

const DISCOUNT_PROGRAMS: DiscountProgram[] = [
  {
    id: "passport",
    name: "Passport America",
    cost: "$44/year",
    savings: "50% off at 1,900+ campgrounds",
    description: "The original 50% discount camping club. Half-price camping at participating RV parks and campgrounds across the US, Canada, and Mexico.",
    benefits: [
      "50% off nightly rates at 1,900+ campgrounds",
      "No limit on number of discounted stays",
      "Includes campgrounds in US, Canada, and Mexico",
      "Free listing in member directory",
      "Digital membership card",
    ],
    bestFor: "Budget-conscious RVers who stay at private campgrounds frequently",
    website: "https://www.passportamerica.com",
    color: "#1565C0",
  },
  {
    id: "goodsam",
    name: "Good Sam Club",
    cost: "$29/year",
    savings: "10% off at 2,000+ parks",
    description: "The largest RV club in North America. Discounts on camping, fuel, and roadside assistance. Good Sam rated parks are quality-inspected.",
    benefits: [
      "10% off at 2,000+ Good Sam Parks",
      "Up to 25¢/gallon off fuel at Pilot/Flying J",
      "Roadside assistance available ($79.95/year add-on)",
      "10% off at Camping World/Gander stores",
      "Good Sam Rewards Visa card (5% back on camping)",
      "Trip planner and campground reviews",
    ],
    bestFor: "Full-timers and frequent travelers who want comprehensive RV benefits",
    website: "https://www.goodsam.com",
    color: "#E65100",
  },
  {
    id: "koa",
    name: "KOA Value Kard Rewards",
    cost: "$33/year",
    savings: "10% off at 500+ KOA campgrounds",
    description: "Loyalty program for KOA Kampgrounds. Earn points toward free camping and get instant discounts at every KOA location.",
    benefits: [
      "10% off daily registration at all KOAs",
      "Earn reward points toward free nights",
      "Free night after 9 paid nights at same KOA",
      "Exclusive member-only deals and promotions",
      "Free KOA Directory and Road Atlas",
    ],
    bestFor: "Families who prefer KOA's consistent quality and amenities",
    website: "https://www.koa.com",
    color: "#F9A825",
  },
  {
    id: "harvest",
    name: "Harvest Hosts",
    cost: "$99/year",
    savings: "Free overnight stays at unique locations",
    description: "Stay for free at wineries, breweries, farms, museums, and other unique locations. No hookups, but unforgettable experiences.",
    benefits: [
      "Free overnight stays at 4,600+ unique locations",
      "Wineries, breweries, farms, golf courses, museums",
      "Includes Boondockers Welcome (free stays at member homes)",
      "No hookups but incredible experiences",
      "Support small businesses and local communities",
    ],
    bestFor: "Adventurous RVers who love unique experiences and are self-contained",
    website: "https://www.harvesthosts.com",
    color: "#2E7D32",
  },
  {
    id: "escapees",
    name: "Escapees RV Club",
    cost: "$39.95/year",
    savings: "Various discounts + mail forwarding",
    description: "Full-timer focused RV club with mail forwarding, domicile services, and a supportive community. Essential for full-time RVers.",
    benefits: [
      "Mail forwarding service (additional fee)",
      "Domicile/residency services (TX, FL, SD)",
      "Escapees RV parks at member rates",
      "Healthcare solutions for full-timers",
      "Boot camp education programs",
      "Supportive full-timer community",
    ],
    bestFor: "Full-time RVers who need domicile, mail forwarding, and community",
    website: "https://www.escapees.com",
    color: "#6A1B9A",
  },
  {
    id: "military",
    name: "Military FamCamp",
    cost: "Free (with military ID)",
    savings: "$15-40/night at base campgrounds",
    description: "Active duty, retired, and veteran military families can stay at campgrounds on military bases across the US at deeply discounted rates.",
    benefits: [
      "Campgrounds on military installations",
      "Rates typically $15-40/night (vs $50-80 civilian)",
      "Full hookups at most locations",
      "Access to base amenities (commissary, PX, gym)",
      "Some bases allow 100% disabled veterans",
      "Reservations through militarycampgrounds.us",
    ],
    bestFor: "Active duty, retired, and eligible veteran military families",
    website: "https://www.militarycampgrounds.us",
    color: "#37474F",
  },
  {
    id: "boondockers",
    name: "Boondockers Welcome",
    cost: "Included with Harvest Hosts ($99/yr)",
    savings: "Free overnight stays at member homes",
    description: "Stay for free in the driveways and properties of fellow RVers. A community-driven network of hosts who welcome travelers.",
    benefits: [
      "Free overnight stays at host properties",
      "2,800+ host locations across North America",
      "Meet fellow RVers and get local tips",
      "Some hosts offer hookups",
      "Now included with Harvest Hosts membership",
    ],
    bestFor: "Social RVers who enjoy meeting fellow travelers",
    website: "https://www.boondockerswelcome.com",
    color: "#00838F",
  },
];

export default function DiscountsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>("passport");

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Discount Programs</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Save money on camping across the US</Text>
        </View>
      </View>

      {/* Savings Tip */}
      <View style={[styles.tipBar, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
        <MaterialIcons name="savings" size={20} color={colors.success} />
        <Text style={[styles.tipText, { color: colors.foreground }]}>
          Pro tip: Passport America + Harvest Hosts = $143/year and saves most RVers $1,000+ annually.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {DISCOUNT_PROGRAMS.map((program) => {
          const isExpanded = expandedId === program.id;
          return (
            <View key={program.id} style={{ marginBottom: 6 }}>
              <TouchableOpacity
                onPress={() => setExpandedId(isExpanded ? null : program.id)}
                style={[styles.programCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <View style={[styles.programIcon, { backgroundColor: program.color + "15" }]}>
                  <MaterialIcons name="card-membership" size={22} color={program.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.programName, { color: colors.foreground }]}>{program.name}</Text>
                  <Text style={[styles.programSavings, { color: colors.success }]}>{program.savings}</Text>
                  <Text style={[styles.programCost, { color: colors.muted }]}>{program.cost}</Text>
                </View>
                <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={24} color={colors.muted} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={[styles.expandedContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.programDesc, { color: colors.muted }]}>{program.description}</Text>

                  <Text style={[styles.benefitsTitle, { color: colors.foreground }]}>Benefits</Text>
                  {program.benefits.map((benefit, i) => (
                    <View key={i} style={styles.benefitRow}>
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text style={[styles.benefitText, { color: colors.foreground }]}>{benefit}</Text>
                    </View>
                  ))}

                  <View style={[styles.bestForBox, { backgroundColor: program.color + "08", borderColor: program.color + "20" }]}>
                    <Text style={[styles.bestForLabel, { color: program.color }]}>Best For</Text>
                    <Text style={[styles.bestForText, { color: colors.foreground }]}>{program.bestFor}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.visitBtn, { backgroundColor: program.color }]}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(program.website).catch(() => {})}
                  >
                    <Text style={styles.visitBtnText}>Visit {program.name}</Text>
                    <MaterialIcons name="open-in-new" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
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
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 8, gap: 4,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  tipBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 12, padding: 10, borderRadius: 10, borderWidth: 1,
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  programCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 16, padding: 14, borderRadius: 14, borderWidth: 1,
  },
  programIcon: {
    width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center",
  },
  programName: { fontSize: 16, fontWeight: "700" },
  programSavings: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  programCost: { fontSize: 12, marginTop: 1 },
  expandedContent: {
    marginHorizontal: 16, marginTop: -1, padding: 14,
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0,
    gap: 8,
  },
  programDesc: { fontSize: 13, lineHeight: 19 },
  benefitsTitle: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  benefitText: { flex: 1, fontSize: 13, lineHeight: 19 },
  bestForBox: { padding: 10, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  bestForLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
  bestForText: { fontSize: 13, lineHeight: 18 },
  visitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 10, borderRadius: 10, marginTop: 4,
  },
  visitBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
