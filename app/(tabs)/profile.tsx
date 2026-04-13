/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext, type ThemePreference } from "@/lib/theme-provider";
import {
  Store,
  RVProfile,
  DEFAULT_RV_PROFILE,
  AppSettings,
  DEFAULT_SETTINGS,
  UserStats,
  DEFAULT_STATS,
  DiscountMemberships,
  DEFAULT_MEMBERSHIPS,
} from "@/lib/store";
import { openUrl } from "@/lib/open-url";
// import { loadPremiumStatus } from "@/lib/iap-service"; // Disabled for v1.0 free release

const RV_TYPES = [
  "Class A Motorhome",
  "Class B Motorhome",
  "Class C Motorhome",
  "Travel Trailer",
  "Fifth Wheel",
  "Pop-Up Camper",
  "Truck Camper",
  "Camper Van",
];

const THEME_OPTIONS: { key: ThemePreference; label: string; icon: string }[] = [
  { key: "system", label: "System", icon: "gear" },
  { key: "light", label: "Light", icon: "sun.max.fill" },
  { key: "dark", label: "Dark", icon: "moon.fill" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { themePreference, setThemePreference } = useThemeContext();
  const [profile, setProfile] = useState<RVProfile>(DEFAULT_RV_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [memberships, setMemberships] = useState<DiscountMemberships>(DEFAULT_MEMBERSHIPS);
  const [editingRV, setEditingRV] = useState(false);
  const [editProfile, setEditProfile] = useState<RVProfile>(DEFAULT_RV_PROFILE);
  const [activeStatTab, setActiveStatTab] = useState<"visited" | "reviews" | "miles">("visited");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const [p, s, st, m] = await Promise.all([
      Store.getRVProfile(),
      Store.getSettings(),
      Store.getStats(),
      Store.getMemberships(),
    ]);
    setProfile(p);
    setSettings(s);
    setStats(st);
    setMemberships(m);
  }

  async function toggleMembership(key: keyof DiscountMemberships) {
    const next = { ...memberships, [key]: !memberships[key] };
    setMemberships(next);
    await Store.setMemberships(next);
  }

  async function saveProfile() {
    await Store.setRVProfile(editProfile);
    setProfile(editProfile);
    setEditingRV(false);
  }

  async function toggleDistance() {
    const next: AppSettings = {
      ...settings,
      distanceUnit: settings.distanceUnit === "miles" ? "km" : "miles",
    };
    await Store.setSettings(next);
    setSettings(next);
  }

  async function handleRate() {
    if (Platform.OS === "web") return;
    try {
      const StoreReview = await import("expo-store-review");
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        // Fallback: open App Store directly
        Linking.openURL("https://apps.apple.com/app/rv-nomad/id6744194498?action=write-review");
      }
    } catch {
      Linking.openURL("https://apps.apple.com/app/rv-nomad/id6744194498?action=write-review");
    }
  }

  function handleContact() {
    openUrl("mailto:support@rvnomad.app?subject=RV Nomad Support");
  }

  const statTabs = [
    { key: "visited" as const, label: "Spots Visited", value: stats.spotsVisited },
    { key: "reviews" as const, label: "Reviews", value: stats.reviewsWritten },
    { key: "miles" as const, label: "Miles", value: stats.milesTraveled.toLocaleString() },
  ];

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Tabs */}
        <View className="flex-row border-b border-border">
          {statTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className="flex-1 items-center py-3"
              onPress={() => setActiveStatTab(tab.key)}
              style={
                activeStatTab === tab.key
                  ? { borderBottomWidth: 2, borderBottomColor: colors.primary }
                  : {}
              }
            >
              <Text
                className="text-sm"
                style={{
                  color: activeStatTab === tab.key ? colors.primary : colors.muted,
                  fontWeight: activeStatTab === tab.key ? "600" : "400",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="p-4 gap-5">
          {/* My RV Section */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">My RV</Text>
            <TouchableOpacity
              onPress={() => {
                setEditProfile({ ...profile });
                setEditingRV(!editingRV);
              }}
            >
              <IconSymbol name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {editingRV ? (
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
              <TextInput
                className="bg-background rounded-lg px-3 py-2.5 text-foreground border border-border"
                placeholder="RV Nickname"
                placeholderTextColor={colors.muted}
                value={editProfile.nickname}
                onChangeText={(t) => setEditProfile({ ...editProfile, nickname: t })}
              />
              {/* RV Type Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {RV_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      className="px-3 py-2 rounded-full border"
                      style={{
                        borderColor:
                          editProfile.type === type ? colors.primary : colors.border,
                        backgroundColor:
                          editProfile.type === type ? colors.primary + "20" : "transparent",
                      }}
                      onPress={() => setEditProfile({ ...editProfile, type })}
                    >
                      <Text
                        className="text-xs"
                        style={{
                          color: editProfile.type === type ? colors.primary : colors.muted,
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-background rounded-lg px-3 py-2.5 text-foreground border border-border"
                  placeholder="Year"
                  placeholderTextColor={colors.muted}
                  value={editProfile.year}
                  onChangeText={(t) => setEditProfile({ ...editProfile, year: t })}
                  keyboardType="numeric"
                />
                <TextInput
                  className="flex-1 bg-background rounded-lg px-3 py-2.5 text-foreground border border-border"
                  placeholder="Make"
                  placeholderTextColor={colors.muted}
                  value={editProfile.make}
                  onChangeText={(t) => setEditProfile({ ...editProfile, make: t })}
                />
              </View>
              <TextInput
                className="bg-background rounded-lg px-3 py-2.5 text-foreground border border-border"
                placeholder="Model"
                placeholderTextColor={colors.muted}
                value={editProfile.model}
                onChangeText={(t) => setEditProfile({ ...editProfile, model: t })}
              />
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-background rounded-lg px-3 py-2.5 text-foreground border border-border"
                  placeholder="Length (ft)"
                  placeholderTextColor={colors.muted}
                  value={editProfile.length}
                  onChangeText={(t) => setEditProfile({ ...editProfile, length: t })}
                  keyboardType="numeric"
                />
                <TextInput
                  className="flex-1 bg-background rounded-lg px-3 py-2.5 text-foreground border border-border"
                  placeholder="Height (ft)"
                  placeholderTextColor={colors.muted}
                  value={editProfile.height}
                  onChangeText={(t) => setEditProfile({ ...editProfile, height: t })}
                  keyboardType="numeric"
                />
                <TextInput
                  className="flex-1 bg-background rounded-lg px-3 py-2.5 text-foreground border border-border"
                  placeholder="Weight (lbs)"
                  placeholderTextColor={colors.muted}
                  value={editProfile.weight}
                  onChangeText={(t) => setEditProfile({ ...editProfile, weight: t })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={saveProfile}
                >
                  <Text className="text-background font-semibold">Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center border border-border"
                  onPress={() => setEditingRV(false)}
                >
                  <Text className="text-muted font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <IconSymbol name="point.topleft.down.to.point.bottomright.curvepath.fill" size={28} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">{profile.nickname}</Text>
                  <Text className="text-sm text-muted">{profile.type}</Text>
                  {profile.year && profile.make && (
                    <Text className="text-sm text-muted">
                      {profile.year} {profile.make} {profile.model}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  {profile.length ? (
                    <Text className="text-sm font-semibold text-foreground">{profile.length}' long</Text>
                  ) : null}
                  {profile.height ? (
                    <Text className="text-sm font-semibold text-foreground">{profile.height}' tall</Text>
                  ) : null}
                  {profile.weight ? (
                    <Text className="text-sm font-semibold text-primary">
                      {Number(profile.weight).toLocaleString()} lbs
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          {/* My Memberships */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">My Memberships</Text>
            <Text className="text-xs text-muted">Auto-applied at booking</Text>
          </View>
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            {([
              { key: "military" as const, label: "Military / Veteran", icon: "shield" },
              { key: "senior" as const, label: "Senior (62+)", icon: "person.fill" },
              { key: "goodSam" as const, label: "Good Sam Club", icon: "star.fill" },
              { key: "passportAmerica" as const, label: "Passport America", icon: "globe" },
              { key: "escapees" as const, label: "Escapees RV Club", icon: "point.topleft.down.to.point.bottomright.curvepath.fill" },
              { key: "koaValueKard" as const, label: "KOA Value Kard", icon: "tent.fill" },
              { key: "aaa" as const, label: "AAA / CAA", icon: "car.fill" },
              { key: "aarp" as const, label: "AARP", icon: "person.2.fill" },
            ]).map((m) => (
              <TouchableOpacity
                key={m.key}
                className="flex-row items-center"
                onPress={() => toggleMembership(m.key)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: memberships[m.key] ? colors.primary : colors.border,
                    backgroundColor: memberships[m.key] ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  {memberships[m.key] && (
                    <IconSymbol name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <Text className="flex-1 text-foreground text-sm">{m.label}</Text>
                {memberships[m.key] && (
                  <Text className="text-xs font-medium" style={{ color: colors.success }}>Active</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Offline Maps */}
          <TouchableOpacity
            className="bg-surface rounded-2xl p-4 border border-border flex-row items-center gap-3"
            onPress={() => router.push("/offline")}
            activeOpacity={0.7}
          >
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.success + '15', justifyContent: 'center', alignItems: 'center' }}>
              <IconSymbol name="arrow.down.circle.fill" size={22} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-base font-bold text-foreground">Offline Maps</Text>
              <Text className="text-xs text-muted">Download state data for offline access</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {/* Settings Section */}
          <Text className="text-xl font-bold text-foreground">Settings</Text>
          <View className="bg-surface rounded-2xl border border-border overflow-hidden">
            {/* Appearance / Dark Mode */}
            <View className="px-4 py-3.5 border-b border-border">
              <View className="flex-row items-center mb-2">
                <IconSymbol name="moon.fill" size={20} color={colors.muted} />
                <Text className="flex-1 ml-3 text-foreground">Appearance</Text>
              </View>
              <View className="flex-row gap-2">
                {THEME_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    className="flex-1 flex-row items-center justify-center py-2 rounded-lg border"
                    style={{
                      borderColor: themePreference === opt.key ? colors.primary : colors.border,
                      backgroundColor: themePreference === opt.key ? colors.primary + '15' : 'transparent',
                    }}
                    onPress={() => setThemePreference(opt.key)}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: themePreference === opt.key ? colors.primary : colors.muted }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3.5 border-b border-border"
              onPress={toggleDistance}
            >
              <IconSymbol name="speedometer" size={20} color={colors.muted} />
              <Text className="flex-1 ml-3 text-foreground">Distance: {settings.distanceUnit === "miles" ? "Miles" : "Kilometers"}</Text>
            </TouchableOpacity>

            {/* Rate */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3.5 border-b border-border"
              onPress={handleRate}
            >
              <IconSymbol name="star.fill" size={20} color={colors.warning} />
              <Text className="flex-1 ml-3 text-foreground">Rate RV Nomad</Text>
            </TouchableOpacity>

            {/* Contact Support */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3.5 border-b border-border"
              onPress={handleContact}
            >
              <IconSymbol name="envelope.fill" size={20} color={colors.muted} />
              <Text className="flex-1 ml-3 text-foreground">Contact Support</Text>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity className="flex-row items-center px-4 py-3.5 border-b border-border" onPress={() => router.push("/about" as any)}>
              <IconSymbol name="info.circle" size={20} color={colors.muted} />
              <Text className="flex-1 ml-3 text-foreground">About RV Nomad</Text>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity className="flex-row items-center px-4 py-3.5 border-b border-border" onPress={() => openUrl("https://rvnomadapp.com/privacy")}>
              <IconSymbol name="info.circle" size={20} color={colors.muted} />
              <Text className="flex-1 ml-3 text-foreground">Privacy Policy</Text>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </TouchableOpacity>

            {/* Terms of Service */}
            <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={() => openUrl("https://rvnomadapp.com/terms")}>
              <IconSymbol name="doc.text" size={20} color={colors.muted} />
              <Text className="flex-1 ml-3 text-foreground">Terms of Service</Text>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View
            className="bg-surface rounded-2xl p-4 border border-border items-center gap-1"
          >
            <Text className="text-lg font-bold text-foreground">RV Nomad</Text>
            <Text className="text-sm text-primary font-semibold">
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
