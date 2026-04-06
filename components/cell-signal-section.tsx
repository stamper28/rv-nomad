/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  Switch,
  TextInput,
} from "react-native";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import {
  getSignalReportsForSite,
  getSignalSummaryForSite,
  addSignalReport,
  CARRIERS,
  SIGNAL_LABELS,
  SIGNAL_COLORS,
  DATA_SPEED_LABELS,
  type CellSignalReport,
  type SiteSignalSummary,
  type Carrier,
  type SignalStrength,
} from "@/lib/cell-signal-store";

interface CellSignalSectionProps {
  siteId: string;
  siteName: string;
}

export function CellSignalSection({ siteId, siteName }: CellSignalSectionProps) {
  const colors = useColors();
  const [reports, setReports] = useState<CellSignalReport[]>([]);
  const [summary, setSummary] = useState<SiteSignalSummary | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [carrier, setCarrier] = useState<Carrier>("Verizon");
  const [signal, setSignal] = useState<SignalStrength>(3);
  const [dataSpeed, setDataSpeed] = useState<"none" | "slow" | "moderate" | "fast" | "very_fast">("moderate");
  const [canStream, setCanStream] = useState(false);
  const [canVideoCall, setCanVideoCall] = useState(false);
  const [boosterUsed, setBoosterUsed] = useState(false);
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    const [r, s] = await Promise.all([
      getSignalReportsForSite(siteId),
      getSignalSummaryForSite(siteId),
    ]);
    setReports(r);
    setSummary(s);
  }, [siteId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addSignalReport({
      siteId,
      carrier,
      signalStrength: signal,
      dataSpeed,
      canStream,
      canVideoCall,
      boosterUsed,
      notes: notes.trim() || undefined,
      authorName: "You",
    });
    setShowForm(false);
    setNotes("");
    loadData();
  };

  const renderSignalBars = (strength: number, size: "sm" | "lg" = "sm") => {
    const barH = size === "lg" ? [8, 14, 20, 26, 32] : [4, 7, 10, 13, 16];
    const barW = size === "lg" ? 6 : 3;
    const gap = size === "lg" ? 3 : 2;
    return (
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap }}>
        {barH.map((h, i) => (
          <View
            key={i}
            style={{
              width: barW,
              height: h,
              borderRadius: 1,
              backgroundColor: i < Math.round(strength) ? SIGNAL_COLORS[Math.round(strength) as SignalStrength] : colors.border,
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="signal-cellular-alt" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>Cell Signal</Text>
          {summary && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>{summary.totalReports}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowForm(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {summary ? (
        <View style={{ gap: 8 }}>
          {/* Best carrier callout */}
          <View style={[styles.bestCarrier, { backgroundColor: "#2E7D3210", borderColor: "#2E7D3230" }]}>
            <MaterialIcons name="star" size={16} color="#2E7D32" />
            <Text style={{ color: "#2E7D32", fontSize: 13, fontWeight: "700", flex: 1 }}>
              Best: {summary.bestCarrier} ({summary.byCarrier[summary.bestCarrier]?.avgSignal.toFixed(1)}/5)
            </Text>
            {renderSignalBars(summary.byCarrier[summary.bestCarrier]?.avgSignal || 0)}
          </View>

          {/* Carrier breakdown */}
          {Object.entries(summary.byCarrier).map(([carrierName, data]) => (
            <View key={carrierName} style={[styles.carrierRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.carrierName, { color: colors.foreground }]}>{carrierName}</Text>
                  {renderSignalBars(data.avgSignal)}
                </View>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                  {data.reportCount} report{data.reportCount !== 1 ? "s" : ""} · Avg {data.avgSignal.toFixed(1)}/5
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 2 }}>
                {data.canStream > 0 && (
                  <Text style={{ color: "#2E7D32", fontSize: 10, fontWeight: "600" }}>Can Stream</Text>
                )}
                {data.canVideoCall > 0 && (
                  <Text style={{ color: "#1565C0", fontSize: 10, fontWeight: "600" }}>Video Calls OK</Text>
                )}
              </View>
            </View>
          ))}

          {/* Recent reports */}
          {reports.slice(0, 3).map((r) => (
            <View key={r.id} style={[styles.reportCard, { borderColor: colors.border }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>{r.carrier}</Text>
                <Text style={{ color: colors.muted, fontSize: 10 }}>
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                {renderSignalBars(r.signalStrength)}
                <Text style={{ color: SIGNAL_COLORS[r.signalStrength], fontSize: 11, fontWeight: "600" }}>
                  {SIGNAL_LABELS[r.signalStrength]}
                </Text>
                {r.dataSpeed && (
                  <Text style={{ color: colors.muted, fontSize: 10 }}>· {DATA_SPEED_LABELS[r.dataSpeed]}</Text>
                )}
              </View>
              {r.boosterUsed && (
                <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>📡 Signal booster used</Text>
              )}
              {r.notes && (
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4, fontStyle: "italic" }}>{r.notes}</Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="signal-cellular-off" size={28} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No signal reports yet</Text>
          <Text style={[styles.emptySub, { color: colors.muted }]}>
            Help fellow RVers — report your cell signal at {siteName}!
          </Text>
        </View>
      )}

      {/* Report Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.foreground }]}>Report Cell Signal</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Carrier Selection */}
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Carrier</Text>
              <View style={styles.chipRow}>
                {CARRIERS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.chip,
                      { borderColor: carrier === c ? colors.primary : colors.border, backgroundColor: carrier === c ? colors.primary + "15" : colors.surface },
                    ]}
                    onPress={() => setCarrier(c)}
                  >
                    <Text style={{ color: carrier === c ? colors.primary : colors.foreground, fontSize: 13, fontWeight: carrier === c ? "700" : "500" }}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Signal Strength */}
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Signal Strength</Text>
              <View style={styles.signalPicker}>
                {([0, 1, 2, 3, 4, 5] as SignalStrength[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.signalOption,
                      {
                        borderColor: signal === s ? SIGNAL_COLORS[s] : colors.border,
                        backgroundColor: signal === s ? SIGNAL_COLORS[s] + "15" : colors.surface,
                      },
                    ]}
                    onPress={() => setSignal(s)}
                  >
                    {renderSignalBars(s, "lg")}
                    <Text style={{ color: signal === s ? SIGNAL_COLORS[s] : colors.muted, fontSize: 10, fontWeight: "600", marginTop: 4 }}>
                      {SIGNAL_LABELS[s]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Data Speed */}
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Data Speed</Text>
              <View style={styles.chipRow}>
                {Object.entries(DATA_SPEED_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.chip,
                      { borderColor: dataSpeed === key ? colors.primary : colors.border, backgroundColor: dataSpeed === key ? colors.primary + "15" : colors.surface },
                    ]}
                    onPress={() => setDataSpeed(key as "none" | "slow" | "moderate" | "fast" | "very_fast")}
                  >
                    <Text style={{ color: dataSpeed === key ? colors.primary : colors.foreground, fontSize: 12, fontWeight: dataSpeed === key ? "700" : "500" }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Toggles */}
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Can stream video?</Text>
                <Switch value={canStream} onValueChange={setCanStream} />
              </View>
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Can make video calls?</Text>
                <Switch value={canVideoCall} onValueChange={setCanVideoCall} />
              </View>
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Used a signal booster?</Text>
                <Switch value={boosterUsed} onValueChange={setBoosterUsed} />
              </View>

              {/* Notes */}
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Notes (optional)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g., Signal drops after 6pm, works best near the office"
                placeholderTextColor={colors.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                maxLength={300}
                returnKeyType="done"
              />

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <MaterialIcons name="signal-cellular-alt" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 17, fontWeight: "700" },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 12, fontWeight: "700" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  bestCarrier: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  carrierRow: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, borderWidth: 1 },
  carrierName: { fontSize: 14, fontWeight: "700" },
  reportCard: { borderTopWidth: 1, paddingTop: 8, paddingBottom: 4 },
  emptyState: { alignItems: "center", padding: 20, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: "600" },
  emptySub: { fontSize: 13, textAlign: "center" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  formContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "90%" },
  formHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  formTitle: { fontSize: 18, fontWeight: "700" },
  fieldLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  signalPicker: { flexDirection: "row", gap: 6, justifyContent: "space-between" },
  signalOption: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  toggleLabel: { fontSize: 14, fontWeight: "500" },
  textInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, minHeight: 60 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 20, marginBottom: 30 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
