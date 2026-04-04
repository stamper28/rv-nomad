import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  StyleSheet,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";

interface RVProfile {
  rvType: string;
  length: string;
  height: string;
  weight: string;
}

interface Preferences {
  useMiles: boolean;
  defaultMapType: "standard" | "satellite" | "terrain";
}

const STORAGE_KEY_PROFILE = "@rv_nomad_profile";
const STORAGE_KEY_PREFS = "@rv_nomad_preferences";

const RV_TYPES = [
  "Class A Motorhome",
  "Class B Van",
  "Class C Motorhome",
  "Fifth Wheel",
  "Travel Trailer",
  "Pop-Up Camper",
  "Truck Camper",
  "Toy Hauler",
];

export default function SettingsScreen() {
  const colors = useColors();
  const [profile, setProfile] = useState<RVProfile>({
    rvType: "",
    length: "",
    height: "",
    weight: "",
  });
  const [preferences, setPreferences] = useState<Preferences>({
    useMiles: true,
    defaultMapType: "standard",
  });
  const [showRVTypePicker, setShowRVTypePicker] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const [storedProfile, storedPrefs] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_PROFILE),
        AsyncStorage.getItem(STORAGE_KEY_PREFS),
      ]);
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedPrefs) setPreferences(JSON.parse(storedPrefs));
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const saveProfile = async (updated: RVProfile) => {
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
  };

  const savePreferences = async (updated: Preferences) => {
    setPreferences(updated);
    await AsyncStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(updated));
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <MaterialIcons
        name={icon as any}
        size={20}
        color={colors.primary}
      />
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        {title}
      </Text>
    </View>
  );

  const renderSettingRow = (
    label: string,
    value: string | React.ReactNode,
    onPress?: () => void
  ) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { borderBottomColor: colors.border },
        pressed && onPress && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      {typeof value === "string" ? (
        <View style={styles.settingValueRow}>
          <Text style={[styles.settingValue, { color: colors.muted }]}>
            {value || "Not set"}
          </Text>
          {onPress && (
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={colors.muted}
            />
          )}
        </View>
      ) : (
        value
      )}
    </Pressable>
  );

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Settings
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Customize your RV Nomad experience
          </Text>
        </View>

        {/* RV Profile Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {renderSectionHeader("RV Profile", "directions-car")}

          {editingProfile ? (
            <View style={styles.editSection}>
              <Pressable
                onPress={() => setShowRVTypePicker(!showRVTypePicker)}
                style={({ pressed }) => [
                  styles.inputField,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.inputFieldText,
                    {
                      color: profile.rvType
                        ? colors.foreground
                        : colors.muted,
                    },
                  ]}
                >
                  {profile.rvType || "Select RV Type"}
                </Text>
                <MaterialIcons
                  name="expand-more"
                  size={20}
                  color={colors.muted}
                />
              </Pressable>

              {showRVTypePicker && (
                <View
                  style={[
                    styles.picker,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {RV_TYPES.map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        saveProfile({ ...profile, rvType: type });
                        setShowRVTypePicker(false);
                      }}
                      style={({ pressed }) => [
                        styles.pickerItem,
                        { borderBottomColor: colors.border },
                        pressed && { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: colors.foreground },
                          profile.rvType === type && {
                            color: colors.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {type}
                      </Text>
                      {profile.rvType === type && (
                        <MaterialIcons
                          name="check"
                          size={18}
                          color={colors.primary}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text
                    style={[styles.inputLabel, { color: colors.foreground }]}
                  >
                    Length (ft)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.foreground,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="e.g., 32"
                    placeholderTextColor={colors.muted}
                    value={profile.length}
                    onChangeText={(v) =>
                      saveProfile({ ...profile, length: v })
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text
                    style={[styles.inputLabel, { color: colors.foreground }]}
                  >
                    Height (ft)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.foreground,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="e.g., 12"
                    placeholderTextColor={colors.muted}
                    value={profile.height}
                    onChangeText={(v) =>
                      saveProfile({ ...profile, height: v })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: colors.foreground }]}
                >
                  Weight (lbs)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.foreground,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g., 18000"
                  placeholderTextColor={colors.muted}
                  value={profile.weight}
                  onChangeText={(v) =>
                    saveProfile({ ...profile, weight: v })
                  }
                  keyboardType="numeric"
                />
              </View>

              <Pressable
                onPress={() => setEditingProfile(false)}
                style={({ pressed }) => [
                  styles.doneButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              {renderSettingRow("RV Type", profile.rvType, () => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setEditingProfile(true);
              })}
              {renderSettingRow(
                "Length",
                profile.length ? `${profile.length} ft` : ""
              )}
              {renderSettingRow(
                "Height",
                profile.height ? `${profile.height} ft` : ""
              )}
              {renderSettingRow(
                "Weight",
                profile.weight ? `${profile.weight} lbs` : ""
              )}
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setEditingProfile(true);
                }}
                style={({ pressed }) => [
                  styles.editButton,
                  { borderColor: colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <MaterialIcons name="edit" size={16} color={colors.primary} />
                <Text
                  style={[styles.editButtonText, { color: colors.primary }]}
                >
                  Edit Profile
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {renderSectionHeader("Preferences", "tune")}

          {renderSettingRow(
            "Use Miles",
            <Switch
              value={preferences.useMiles}
              onValueChange={(v) => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                savePreferences({ ...preferences, useMiles: v });
              }}
              trackColor={{
                false: colors.border,
                true: colors.primary + "80",
              }}
              thumbColor={preferences.useMiles ? colors.primary : colors.muted}
            />
          )}

          {renderSettingRow(
            "Default Map Type",
            preferences.defaultMapType.charAt(0).toUpperCase() +
              preferences.defaultMapType.slice(1),
            () => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              const types: Preferences["defaultMapType"][] = [
                "standard",
                "satellite",
                "terrain",
              ];
              const current = types.indexOf(preferences.defaultMapType);
              const next = types[(current + 1) % types.length];
              savePreferences({ ...preferences, defaultMapType: next });
            }
          )}
        </View>

        {/* About Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {renderSectionHeader("About", "info")}
          {renderSettingRow("Version", "1.0.0")}
          {renderSettingRow("App", "RV Nomad")}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            RV Nomad — Your RV Lifestyle Companion
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Setting Row
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingValue: {
    fontSize: 15,
  },
  // Edit Profile
  editSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  inputField: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputFieldText: {
    fontSize: 15,
  },
  picker: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerItemText: {
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  doneButton: {
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
  },
});
