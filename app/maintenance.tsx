/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, FlatList, Platform } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getMaintenanceItems, initDefaultItems, updateMaintenanceItem, deleteMaintenanceItem, addMaintenanceItem,
  getRVProfile, saveRVProfile, isDue, isOverdue, CATEGORY_INFO,
  type MaintenanceItem, type MaintenanceCategory, type RVProfile,
} from "@/lib/maintenance-store";

type Tab = "due" | "all" | "profile";

export default function MaintenanceScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("due");
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [profile, setProfile] = useState<RVProfile | null>(null);
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", year: "", make: "", model: "", mileage: "", length: "" });

  const load = useCallback(async () => {
    await initDefaultItems();
    const [i, p] = await Promise.all([getMaintenanceItems(), getRVProfile()]);
    setItems(i); setProfile(p);
    if (p) setProfileForm({ name: p.name, year: p.year, make: p.make, model: p.model, mileage: String(p.currentMileage), length: String(p.length) });
  }, []);
  useEffect(() => { load(); }, [load]);

  const mileage = profile?.currentMileage || 0;
  const dueItems = items.filter((i) => isDue(i, mileage));
  const overdueItems = items.filter((i) => isOverdue(i, mileage));

  const handleMarkDone = async (item: MaintenanceItem) => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateMaintenanceItem(item.id, { lastDoneDate: new Date().toISOString(), lastDoneMileage: mileage });
    load();
  };

  const handleSaveProfile = async () => {
    const p: RVProfile = {
      name: profileForm.name, year: profileForm.year, make: profileForm.make, model: profileForm.model,
      currentMileage: parseInt(profileForm.mileage) || 0, fuelType: "diesel", length: parseInt(profileForm.length) || 0,
    };
    await saveRVProfile(p);
    setProfile(p);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "RV profile updated");
  };

  const renderItem = ({ item }: { item: MaintenanceItem }) => {
    const cat = CATEGORY_INFO[item.category];
    const due = isDue(item, mileage);
    const overdue = isOverdue(item, mileage);
    return (
      <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: overdue ? "#EF4444" : due ? "#F59E0B" : colors.border }]}>
        <View style={styles.itemHeader}>
          <View style={[styles.catBadge, { backgroundColor: cat.color + "20" }]}>
            <MaterialIcons name={cat.icon as any} size={16} color={cat.color} />
            <Text style={{ color: cat.color, fontSize: 11, fontWeight: "600" }}>{cat.label}</Text>
          </View>
          {overdue && <View style={[styles.dueBadge, { backgroundColor: "#FEE2E2" }]}><Text style={{ color: "#EF4444", fontSize: 11, fontWeight: "700" }}>OVERDUE</Text></View>}
          {!overdue && due && <View style={[styles.dueBadge, { backgroundColor: "#FEF3C7" }]}><Text style={{ color: "#D97706", fontSize: 11, fontWeight: "700" }}>DUE</Text></View>}
        </View>
        <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[styles.itemDesc, { color: colors.muted }]}>{item.description}</Text>
        <View style={styles.itemMeta}>
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {item.lastDoneDate ? `Last: ${new Date(item.lastDoneDate).toLocaleDateString()}` : "Never done"}
          </Text>
          <Text style={[styles.metaText, { color: colors.muted }]}>
            Every {item.intervalMonths}mo{item.intervalMiles > 0 ? ` / ${item.intervalMiles.toLocaleString()}mi` : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleMarkDone(item)} style={[styles.doneBtn, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="check" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Mark Done</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Maintenance</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: "#EF4444" }]}>{overdueItems.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Overdue</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: "#F59E0B" }]}>{dueItems.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Due Soon</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: "#22C55E" }]}>{items.length - dueItems.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Up to Date</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["due", "all", "profile"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.muted }]}>
              {t === "due" ? `Due (${dueItems.length})` : t === "all" ? `All (${items.length})` : "My RV"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(tab === "due" || tab === "all") && (
        <FlatList data={tab === "due" ? dueItems : items} renderItem={renderItem} keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="check-circle" size={48} color="#22C55E" />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All Caught Up!</Text>
              <Text style={[styles.emptyDesc, { color: colors.muted }]}>No maintenance items are due right now.</Text>
            </View>
          }
        />
      )}

      {tab === "profile" && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          <Text style={[styles.formLabel, { color: colors.foreground }]}>RV Name</Text>
          <TextInput value={profileForm.name} onChangeText={(v) => setProfileForm((p) => ({ ...p, name: v }))} placeholder="e.g., Big Bertha"
            placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Year</Text>
              <TextInput value={profileForm.year} onChangeText={(v) => setProfileForm((p) => ({ ...p, year: v }))} placeholder="2024" keyboardType="numeric"
                placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Make</Text>
              <TextInput value={profileForm.make} onChangeText={(v) => setProfileForm((p) => ({ ...p, make: v }))} placeholder="Thor"
                placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
            </View>
          </View>
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Model</Text>
          <TextInput value={profileForm.model} onChangeText={(v) => setProfileForm((p) => ({ ...p, model: v }))} placeholder="Miramar 37.1"
            placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Current Mileage</Text>
              <TextInput value={profileForm.mileage} onChangeText={(v) => setProfileForm((p) => ({ ...p, mileage: v }))} placeholder="45000" keyboardType="numeric"
                placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Length (ft)</Text>
              <TextInput value={profileForm.length} onChangeText={(v) => setProfileForm((p) => ({ ...p, length: v }))} placeholder="37" keyboardType="numeric"
                placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
            </View>
          </View>
          <TouchableOpacity onPress={handleSaveProfile} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Save RV Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  summary: { flexDirection: "row", margin: 16, padding: 16, borderRadius: 12 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNum: { fontSize: 24, fontWeight: "800" },
  summaryLabel: { fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, marginVertical: 4 },
  tabs: { flexDirection: "row", borderBottomWidth: 0.5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
  itemCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  catBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  dueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  itemTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  itemDesc: { fontSize: 13, marginBottom: 8 },
  itemMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  metaText: { fontSize: 12 },
  doneBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center" },
  formLabel: { fontSize: 14, fontWeight: "600" },
  input: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, fontSize: 15 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
});
