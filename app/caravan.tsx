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
import { getCaravans, createCaravan, joinCaravan, addStop, deleteCaravan, updateCaravanStatus, type Caravan } from "@/lib/caravan-store";

type Mode = "list" | "create" | "join" | "detail";

export default function CaravanScreen() {
  const colors = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("list");
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [selected, setSelected] = useState<Caravan | null>(null);
  const [name, setName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderRig, setLeaderRig] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinRig, setJoinRig] = useState("");
  const [stopName, setStopName] = useState("");
  const [stopState, setStopState] = useState("");

  const load = useCallback(async () => { const c = await getCaravans(); setCaravans(c); }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!name.trim() || !leaderName.trim()) { Alert.alert("Required", "Enter caravan name and your name"); return; }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const c = await createCaravan(name.trim(), leaderName.trim(), leaderRig.trim());
    Alert.alert("Caravan Created!", `Share code: ${c.code}\nOthers can join with this code.`);
    setName(""); setLeaderName(""); setLeaderRig("");
    setMode("list"); load();
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !joinName.trim()) { Alert.alert("Required", "Enter join code and your name"); return; }
    const c = await joinCaravan(joinCode.trim().toUpperCase(), joinName.trim(), joinRig.trim());
    if (!c) { Alert.alert("Not Found", "No caravan found with that code"); return; }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Joined!", `You joined "${c.name}"`);
    setJoinCode(""); setJoinName(""); setJoinRig("");
    setMode("list"); load();
  };

  const handleAddStop = async () => {
    if (!selected || !stopName.trim()) return;
    await addStop(selected.id, { siteId: `custom_${Date.now()}`, siteName: stopName.trim(), state: stopState.trim() || "US", arrivalDate: "", departureDate: "", notes: "" });
    setStopName(""); setStopState("");
    load();
    const updated = (await getCaravans()).find((c) => c.id === selected.id);
    if (updated) setSelected(updated);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Caravan", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteCaravan(id); setMode("list"); load(); } },
    ]);
  };

  const statusColors: Record<string, string> = { planning: "#3B82F6", active: "#22C55E", completed: "#6B7280" };

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => mode === "list" ? router.back() : setMode("list")} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {mode === "list" ? "Caravan Mode" : mode === "create" ? "Create Caravan" : mode === "join" ? "Join Caravan" : selected?.name || "Caravan"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {mode === "list" && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={() => setMode("create")} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode("join")} style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <MaterialIcons name="group-add" size={20} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Join</Text>
            </TouchableOpacity>
          </View>
          {caravans.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="groups" size={48} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Caravans Yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.muted }]}>Create a caravan and invite friends to plan a group RV trip!</Text>
            </View>
          )}
          {caravans.map((c) => (
            <TouchableOpacity key={c.id} onPress={() => { setSelected(c); setMode("detail"); }}
              style={[styles.caravanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.caravanHeader}>
                <Text style={[styles.caravanName, { color: colors.foreground }]}>{c.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (statusColors[c.status] || "#6B7280") + "20" }]}>
                  <Text style={{ color: statusColors[c.status] || "#6B7280", fontSize: 11, fontWeight: "600" }}>{c.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[styles.caravanMeta, { color: colors.muted }]}>
                Code: {c.code} · {c.members.length} member{c.members.length !== 1 ? "s" : ""} · {c.stops.length} stop{c.stops.length !== 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {mode === "create" && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Caravan Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g., Summer 2026 Road Trip" placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Your Name</Text>
          <TextInput value={leaderName} onChangeText={setLeaderName} placeholder="Your name" placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Your Rig (optional)</Text>
          <TextInput value={leaderRig} onChangeText={setLeaderRig} placeholder="e.g., 2024 Thor Miramar 37.1" placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
          <TouchableOpacity onPress={handleCreate} style={[styles.submitBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.submitBtnText}>Create Caravan</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {mode === "join" && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Join Code</Text>
          <TextInput value={joinCode} onChangeText={setJoinCode} placeholder="Enter 6-character code" placeholderTextColor={colors.muted} autoCapitalize="characters" maxLength={6}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border, fontSize: 24, textAlign: "center", letterSpacing: 4 }]} />
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Your Name</Text>
          <TextInput value={joinName} onChangeText={setJoinName} placeholder="Your name" placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Your Rig (optional)</Text>
          <TextInput value={joinRig} onChangeText={setJoinRig} placeholder="e.g., 2023 Winnebago View" placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
          <TouchableOpacity onPress={handleJoin} style={[styles.submitBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.submitBtnText}>Join Caravan</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {mode === "detail" && selected && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>Share Code</Text>
            <Text style={[styles.codeText, { color: colors.primary }]}>{selected.code}</Text>
            <Text style={[styles.detailHint, { color: colors.muted }]}>Share this code so others can join</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Members ({selected.members.length})</Text>
          {selected.members.map((m) => (
            <View key={m.id} style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name={m.isLeader ? "star" : "person"} size={20} color={m.isLeader ? "#F59E0B" : colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.memberName, { color: colors.foreground }]}>{m.name} {m.isLeader ? "(Leader)" : ""}</Text>
                {m.rig ? <Text style={[styles.memberRig, { color: colors.muted }]}>{m.rig}</Text> : null}
              </View>
            </View>
          ))}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Stops ({selected.stops.length})</Text>
          {selected.stops.map((s, i) => (
            <View key={s.id} style={[styles.stopCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.stopNum, { backgroundColor: colors.primary }]}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stopName, { color: colors.foreground }]}>{s.siteName}</Text>
                <Text style={[styles.stopState, { color: colors.muted }]}>{s.state}</Text>
              </View>
            </View>
          ))}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput value={stopName} onChangeText={setStopName} placeholder="Add stop name" placeholderTextColor={colors.muted}
              style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={stopState} onChangeText={setStopState} placeholder="ST" placeholderTextColor={colors.muted} maxLength={2} autoCapitalize="characters"
              style={[styles.input, { width: 60, backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border, textAlign: "center" }]} />
          </View>
          <TouchableOpacity onPress={handleAddStop} style={[styles.submitBtn, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.submitBtnText}>Add Stop</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {selected.status === "planning" && (
              <TouchableOpacity onPress={async () => { await updateCaravanStatus(selected.id, "active"); load(); const u = (await getCaravans()).find((c) => c.id === selected.id); if (u) setSelected(u); }}
                style={[styles.statusBtn, { backgroundColor: "#22C55E" }]}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Start Trip</Text>
              </TouchableOpacity>
            )}
            {selected.status === "active" && (
              <TouchableOpacity onPress={async () => { await updateCaravanStatus(selected.id, "completed"); load(); const u = (await getCaravans()).find((c) => c.id === selected.id); if (u) setSelected(u); }}
                style={[styles.statusBtn, { backgroundColor: "#6B7280" }]}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Complete Trip</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDelete(selected.id)} style={[styles.statusBtn, { backgroundColor: "#EF4444" }]}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14, borderRadius: 12 },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  caravanCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  caravanHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  caravanName: { fontSize: 16, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  caravanMeta: { fontSize: 13 },
  formLabel: { fontSize: 14, fontWeight: "600" },
  input: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, fontSize: 15 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14, borderRadius: 12 },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  detailCard: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  detailLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  codeText: { fontSize: 32, fontWeight: "800", letterSpacing: 4 },
  detailHint: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  memberCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, borderWidth: 1, gap: 10 },
  memberName: { fontSize: 15, fontWeight: "600" },
  memberRig: { fontSize: 12, marginTop: 2 },
  stopCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, borderWidth: 1, gap: 10 },
  stopNum: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  stopName: { fontSize: 15, fontWeight: "600" },
  stopState: { fontSize: 12, marginTop: 2 },
  statusBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
});
