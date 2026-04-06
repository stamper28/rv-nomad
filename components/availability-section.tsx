/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Modal,
  Platform, Alert, Pressable, KeyboardAvoidingView, ScrollView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import {
  getReports, addReport, getLatestStatus, formatTimeAgo, STATUS_INFO,
  type AvailabilityReport, type AvailabilityStatus,
} from "@/lib/availability-store";

interface Props { siteId: string; siteName: string; }

export function AvailabilitySection({ siteId, siteName }: Props) {
  const colors = useColors();
  const [reports, setReports] = useState<AvailabilityReport[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState<AvailabilityStatus>("open");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [sitesAvail, setSitesAvail] = useState("");

  const load = useCallback(async () => { const r = await getReports(siteId); setReports(r); }, [siteId]);
  useEffect(() => { load(); }, [load]);

  const latest = getLatestStatus(reports);

  const closeModal = () => {
    setShowModal(false);
    setNotes("");
    setSitesAvail("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) { Alert.alert("Required", "Enter your name"); return; }
    await addReport({ siteId, status, reporterName: name.trim(), notes: notes.trim(), sitesAvailable: parseInt(sitesAvail) || 0 });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeModal();
    load();
  };

  const statusOptions: AvailabilityStatus[] = ["open", "few_left", "full", "closed"];

  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="event-available" size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Live Availability</Text>
      </View>
      {latest ? (
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_INFO[latest.status].bg }]}>
            <MaterialIcons name={STATUS_INFO[latest.status].icon as any} size={16} color={STATUS_INFO[latest.status].color} />
            <Text style={[styles.statusText, { color: STATUS_INFO[latest.status].color }]}>{STATUS_INFO[latest.status].label}</Text>
          </View>
          <Text style={[styles.reportedBy, { color: colors.muted }]}>{latest.reporterName} · {formatTimeAgo(latest.reportedAt)}</Text>
        </View>
      ) : (
        <Text style={[styles.noData, { color: colors.muted }]}>No availability reports yet. Be the first!</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setShowModal(true)} style={[styles.reportBtn, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="add" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Report Status</Text>
        </TouchableOpacity>
        {reports.length > 1 && (
          <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
            <Text style={[styles.historyLink, { color: colors.primary }]}>{showHistory ? "Hide" : "View"} History ({reports.length})</Text>
          </TouchableOpacity>
        )}
      </View>
      {showHistory && reports.slice(0, 5).map((r) => (
        <View key={r.id} style={[styles.historyItem, { borderTopColor: colors.border }]}>
          <View style={[styles.historyDot, { backgroundColor: STATUS_INFO[r.status].color }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.historyStatus, { color: colors.foreground }]}>{STATUS_INFO[r.status].label}</Text>
            <Text style={[styles.historyMeta, { color: colors.muted }]}>{r.reporterName} · {formatTimeAgo(r.reportedAt)}</Text>
            {r.notes ? <Text style={[styles.historyNotes, { color: colors.muted }]}>{r.notes}</Text> : null}
          </View>
        </View>
      ))}

      {/* Report Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        {/* Tap outside overlay to dismiss */}
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Stop propagation so tapping inside the modal doesn't close it */}
            <Pressable
              style={[styles.modalContent, { backgroundColor: colors.background }]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Drag handle indicator */}
              <View style={styles.dragHandle}>
                <View style={[styles.dragBar, { backgroundColor: colors.muted + "40" }]} />
              </View>

              {/* Header with close button */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Report Availability</Text>
                <TouchableOpacity
                  onPress={closeModal}
                  style={[styles.closeBtn, { backgroundColor: colors.surface }]}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <MaterialIcons name="close" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <Text style={[styles.formLabel, { color: colors.foreground }]}>Current Status</Text>
                <View style={styles.statusGrid}>
                  {statusOptions.map((s) => (
                    <TouchableOpacity key={s} onPress={() => setStatus(s)}
                      style={[styles.statusOption, { backgroundColor: status === s ? STATUS_INFO[s].bg : colors.surface, borderColor: status === s ? STATUS_INFO[s].color : colors.border }]}>
                      <MaterialIcons name={STATUS_INFO[s].icon as any} size={18} color={status === s ? STATUS_INFO[s].color : colors.muted} />
                      <Text style={{ color: status === s ? STATUS_INFO[s].color : colors.muted, fontSize: 12, fontWeight: "600" }}>{STATUS_INFO[s].label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.formLabel, { color: colors.foreground }]}>Your Name</Text>
                <TextInput
                  value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted}
                  returnKeyType="next"
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                />

                <Text style={[styles.formLabel, { color: colors.foreground }]}>Notes (optional)</Text>
                <TextInput
                  value={notes} onChangeText={setNotes} placeholder="e.g., Lots of spots in loop B" placeholderTextColor={colors.muted} multiline
                  returnKeyType="done"
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border, height: 60 }]}
                />

                {/* Action buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={closeModal} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                    <Text style={{ color: colors.muted, fontWeight: "600", fontSize: 15 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Submit Report</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 16, borderRadius: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 13, fontWeight: "700" },
  reportedBy: { fontSize: 12 },
  noData: { fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reportBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  historyLink: { fontSize: 13, fontWeight: "600" },
  historyItem: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingTop: 10, marginTop: 10, borderTopWidth: 0.5 },
  historyDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  historyStatus: { fontSize: 13, fontWeight: "600" },
  historyMeta: { fontSize: 11, marginTop: 2 },
  historyNotes: { fontSize: 12, marginTop: 2, fontStyle: "italic" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  keyboardView: { justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, maxHeight: "85%" },
  dragHandle: { alignItems: "center", marginBottom: 8 },
  dragBar: { width: 36, height: 4, borderRadius: 2 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  formLabel: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusOption: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  input: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, fontSize: 15 },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
});
