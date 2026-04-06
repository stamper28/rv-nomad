/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import {
  reportContent,
  REPORT_REASON_LABELS,
  type ContentType,
  type ReportReason,
} from "@/lib/content-moderation";

interface ReportContentModalProps {
  visible: boolean;
  onClose: () => void;
  contentId: string;
  contentType: ContentType;
  onReported?: () => void;
}

const REASONS: ReportReason[] = [
  "nudity",
  "inappropriate",
  "offensive",
  "spam",
  "misleading",
  "other",
];

export function ReportContentModal({
  visible,
  onClose,
  contentId,
  contentType,
  onReported,
}: ReportContentModalProps) {
  const colors = useColors();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Select a Reason", "Please select why you're reporting this content.");
      return;
    }
    setSubmitting(true);
    try {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await reportContent(contentId, contentType, selectedReason, details);
      Alert.alert(
        "Content Reported",
        "Thank you for helping keep RV Nomad safe. This content has been hidden from your view.",
        [{ text: "OK", onPress: () => { onClose(); onReported?.(); } }]
      );
    } catch {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
      setSelectedReason(null);
      setDetails("");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="flag" size={22} color={colors.error} />
              <Text style={[styles.title, { color: colors.foreground }]}>Report Content</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Why are you reporting this content? It will be hidden from your view immediately.
            </Text>

            {/* Reason Selection */}
            <View style={styles.reasonList}>
              {REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor: selectedReason === reason ? colors.error + "12" : colors.surface,
                      borderColor: selectedReason === reason ? colors.error : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radio,
                    {
                      borderColor: selectedReason === reason ? colors.error : colors.muted,
                      backgroundColor: selectedReason === reason ? colors.error : "transparent",
                    },
                  ]}>
                    {selectedReason === reason && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reasonLabel, { color: colors.foreground }]}>
                      {REPORT_REASON_LABELS[reason]}
                    </Text>
                  </View>
                  {reason === "nudity" && (
                    <MaterialIcons name="visibility-off" size={18} color={colors.error} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Additional Details */}
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>
              Additional details (optional)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Describe the issue..."
              placeholderTextColor={colors.muted}
              value={details}
              onChangeText={setDetails}
              multiline
              maxLength={500}
              returnKeyType="done"
            />

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: selectedReason ? colors.error : colors.muted,
                  opacity: submitting ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={submitting || !selectedReason}
              activeOpacity={0.8}
            >
              <MaterialIcons name="flag" size={18} color="#fff" />
              <Text style={styles.submitText}>
                {submitting ? "Reporting..." : "Report & Hide Content"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.disclaimer, { color: colors.muted }]}>
              Reported content is immediately hidden from your view. Repeated violations may result in content being removed for all users.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  reasonList: { gap: 8, marginBottom: 16 },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  reasonLabel: { fontSize: 15, fontWeight: "500" },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  disclaimer: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 30,
  },
});
