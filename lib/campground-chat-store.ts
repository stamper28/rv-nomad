/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ChatMessage {
  id: string; siteId: string; authorName: string; authorRig: string;
  message: string; createdAt: string; isQuestion: boolean;
  replies: ChatReply[];
}

export interface ChatReply {
  id: string; authorName: string; message: string; createdAt: string;
}

const KEY = "rv_nomad_campground_chat";
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export async function getMessages(siteId: string): Promise<ChatMessage[]> {
  try {
    const r = await AsyncStorage.getItem(KEY);
    const all: ChatMessage[] = r ? JSON.parse(r) : [];
    return all.filter((m) => m.siteId === siteId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch { return []; }
}

export async function postMessage(msg: Omit<ChatMessage, "id" | "createdAt" | "replies">): Promise<ChatMessage> {
  const r = await AsyncStorage.getItem(KEY);
  const all: ChatMessage[] = r ? JSON.parse(r) : [];
  const nm: ChatMessage = { ...msg, id: genId(), createdAt: new Date().toISOString(), replies: [] };
  all.push(nm);
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
  return nm;
}

export async function replyToMessage(messageId: string, reply: Omit<ChatReply, "id" | "createdAt">): Promise<void> {
  const r = await AsyncStorage.getItem(KEY);
  const all: ChatMessage[] = r ? JSON.parse(r) : [];
  const msg = all.find((m) => m.id === messageId);
  if (!msg) return;
  msg.replies.push({ ...reply, id: genId(), createdAt: new Date().toISOString() });
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export async function deleteMessage(messageId: string): Promise<void> {
  const r = await AsyncStorage.getItem(KEY);
  const all: ChatMessage[] = r ? JSON.parse(r) : [];
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter((m) => m.id !== messageId)));
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date(); const d = new Date(dateStr);
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
