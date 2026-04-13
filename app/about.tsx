/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { openUrl } from "@/lib/open-url";

export default function AboutScreen() {
  const colors = useColors();
  const router = useRouter();

  const features = [
    { icon: "search", label: "Search campgrounds across all 50 states" },
    { icon: "map", label: "Interactive maps with campground locations" },
    { icon: "notifications-active", label: "Cancellation scanner for sold-out sites" },
    { icon: "auto-awesome", label: "AI-powered trip planning" },
    { icon: "cloud-download", label: "Offline maps for no-signal areas" },
    { icon: "people", label: "Community forums & campground reviews" },
    { icon: "build", label: "RV tools: fuel, maintenance, weight & tires" },
    { icon: "wb-sunny", label: "Weather forecasts for any campground" },
    { icon: "cell-wifi", label: "Cell signal reports from real users" },
    { icon: "local-offer", label: "Discount membership tracking" },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, flex: 1 }}>About RV Nomad</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* App Icon & Version */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <MaterialIcons name="directions-car" size={40} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.foreground }}>RV Nomad</Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>Version 1.0.0</Text>
        </View>

        {/* Mission */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>Our Mission</Text>
          <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 22 }}>
            RV Nomad is built by RVers, for RVers. We believe finding the perfect campsite shouldn't be stressful. Whether you're a weekend warrior or a full-time nomad, RV Nomad helps you discover, plan, and enjoy every trip.
          </Text>
        </View>

        {/* Features */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>What You Can Do</Text>
          {features.map((f, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderTopWidth: i > 0 ? 0.5 : 0, borderTopColor: colors.border }}>
              <MaterialIcons name={f.icon as any} size={20} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground, flex: 1 }}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Data Sources */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>Data Sources</Text>
          <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 22 }}>
            Campground data is sourced from the Recreation Information Database (RIDB) provided by Recreation.gov and the U.S. Department of Agriculture. Weather data is provided by the National Weather Service. Cell signal reports come from our community of users.
          </Text>
        </View>

        {/* Links */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
            onPress={() => openUrl("https://rvnomadapp.com")}
          >
            <MaterialIcons name="language" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.primary, marginLeft: 12, flex: 1 }}>Visit rvnomadapp.com</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: colors.border }}
            onPress={() => openUrl("mailto:support@rvnomad.app")}
          >
            <MaterialIcons name="email" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.primary, marginLeft: 12, flex: 1 }}>support@rvnomad.app</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: colors.border }}
            onPress={() => openUrl("https://rvnomadapp.com/privacy")}
          >
            <MaterialIcons name="privacy-tip" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.primary, marginLeft: 12, flex: 1 }}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: colors.border }}
            onPress={() => openUrl("https://rvnomadapp.com/terms")}
          >
            <MaterialIcons name="description" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.primary, marginLeft: 12, flex: 1 }}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>
            © 2026 Kieran Woll Creative Works LLC
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 2 }}>
            All Rights Reserved
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
