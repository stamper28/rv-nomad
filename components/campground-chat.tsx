/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Platform, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { getMessages, postMessage, formatTimeAgo, type ChatMessage } from "@/lib/campground-chat-store";
import { ReportContentModal } from "@/components/report-content-modal";

interface Props { siteId: string; siteName: string; }

export function CampgroundChat({ siteId, siteName }: Props) {
  const colors = useColors();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [reportTarget, setReportTarget] = useState<string | null>(null);

  const load = useCallback(async () => { const m = await getMessages(siteId); setMessages(m); }, [siteId]);
  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!name.trim()) { Alert.alert("Name Required", "Enter your name to post"); return; }
    await postMessage({ siteId, authorName: name.trim(), authorRig: "", message: text.trim(), isQuestion: text.trim().includes("?") });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setText("");
    load();
  };



  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.msgCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.msgHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{item.authorName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.authorName, { color: colors.foreground }]}>{item.authorName}</Text>
          <Text style={[styles.msgTime, { color: colors.muted }]}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={() => setReportTarget(item.id)} style={{ padding: 4 }}>
          <MaterialIcons name="flag" size={16} color={colors.muted} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.msgText, { color: colors.foreground }]}>{item.message}</Text>
    </View>
  );

  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.sectionHeader}>
        <MaterialIcons name="forum" size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Campground Chat</Text>
        <View style={{ flex: 1 }} />
        <Text style={[styles.msgCount, { color: colors.muted }]}>{messages.length} message{messages.length !== 1 ? "s" : ""}</Text>
        <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={22} color={colors.muted} />
      </TouchableOpacity>

      {!expanded && messages.length > 0 && (
        <View style={[styles.previewMsg, { borderTopColor: colors.border }]}>
          <Text style={[styles.previewAuthor, { color: colors.foreground }]}>{messages[0].authorName}:</Text>
          <Text style={[styles.previewText, { color: colors.muted }]} numberOfLines={1}>{messages[0].message}</Text>
        </View>
      )}

      {expanded && (
        <>
          <FlatList
            data={messages.slice(0, 20)}
            renderItem={renderMessage}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 8, paddingTop: 8 }}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <MaterialIcons name="chat-bubble-outline" size={32} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>No messages yet. Start the conversation!</Text>
              </View>
            }
          />
          <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
            <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.muted}
              style={[styles.nameInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]} />
          </View>
          <View style={styles.inputRow}>
            <TextInput value={text} onChangeText={setText} placeholder="Ask a question or share info..." placeholderTextColor={colors.muted}
              multiline returnKeyType="done" onSubmitEditing={handleSend}
              style={[styles.msgInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]} />
            <TouchableOpacity onPress={handleSend} style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.border }]} disabled={!text.trim()}>
              <MaterialIcons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <ReportContentModal
        visible={!!reportTarget}
        onClose={() => setReportTarget(null)}
        contentId={reportTarget || ""}
        contentType="message"
        onReported={() => { setReportTarget(null); load(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 16, borderRadius: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  msgCount: { fontSize: 12, marginRight: 4 },
  previewMsg: { flexDirection: "row", gap: 6, paddingTop: 10, marginTop: 10, borderTopWidth: 0.5 },
  previewAuthor: { fontSize: 13, fontWeight: "600" },
  previewText: { fontSize: 13, flex: 1 },
  msgCard: { padding: 12, borderRadius: 10, borderWidth: 0.5 },
  msgHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 13, fontWeight: "700" },
  authorName: { fontSize: 13, fontWeight: "700" },
  msgTime: { fontSize: 11 },
  msgText: { fontSize: 14, lineHeight: 20 },
  emptyChat: { alignItems: "center", paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 13, textAlign: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  nameInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, fontSize: 14 },
  msgInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, fontSize: 14, maxHeight: 80 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
});
