/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 *
 * Content Moderation — report, block, and hide inappropriate user-generated content
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ContentType = "photo" | "signal_report" | "review" | "experience" | "message";

export type ReportReason =
  | "inappropriate"
  | "nudity"
  | "spam"
  | "offensive"
  | "misleading"
  | "other";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  inappropriate: "Inappropriate Content",
  nudity: "Nudity or Sexual Content",
  spam: "Spam or Advertising",
  offensive: "Offensive or Hateful",
  misleading: "Misleading Information",
  other: "Other",
};

export interface ContentReport {
  id: string;
  contentId: string;
  contentType: ContentType;
  reason: ReportReason;
  details?: string;
  createdAt: string;
}

export interface BlockedContent {
  contentId: string;
  contentType: ContentType;
  blockedAt: string;
}

const REPORTS_KEY = "rv_nomad_content_reports";
const BLOCKED_KEY = "rv_nomad_blocked_content";
const BLOCKED_USERS_KEY = "rv_nomad_blocked_users";

// ─── Reports ────────────────────────────────────────────────────────────────

export async function reportContent(
  contentId: string,
  contentType: ContentType,
  reason: ReportReason,
  details?: string
): Promise<ContentReport> {
  const report: ContentReport = {
    id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    contentId,
    contentType,
    reason,
    details: details?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  try {
    const raw = await AsyncStorage.getItem(REPORTS_KEY);
    const all: ContentReport[] = raw ? JSON.parse(raw) : [];
    all.push(report);
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(all));
  } catch {
    // silently fail
  }
  // Auto-block the content after reporting
  await blockContent(contentId, contentType);
  return report;
}

export async function getReports(): Promise<ContentReport[]> {
  try {
    const raw = await AsyncStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Blocked Content ────────────────────────────────────────────────────────

export async function blockContent(
  contentId: string,
  contentType: ContentType
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_KEY);
    const all: BlockedContent[] = raw ? JSON.parse(raw) : [];
    // Don't duplicate
    if (all.some((b) => b.contentId === contentId && b.contentType === contentType)) return;
    all.push({ contentId, contentType, blockedAt: new Date().toISOString() });
    await AsyncStorage.setItem(BLOCKED_KEY, JSON.stringify(all));
  } catch {
    // silently fail
  }
}

export async function unblockContent(
  contentId: string,
  contentType: ContentType
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_KEY);
    if (!raw) return;
    const all: BlockedContent[] = JSON.parse(raw);
    const filtered = all.filter(
      (b) => !(b.contentId === contentId && b.contentType === contentType)
    );
    await AsyncStorage.setItem(BLOCKED_KEY, JSON.stringify(filtered));
  } catch {
    // silently fail
  }
}

export async function isContentBlocked(
  contentId: string,
  contentType: ContentType
): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_KEY);
    if (!raw) return false;
    const all: BlockedContent[] = JSON.parse(raw);
    return all.some((b) => b.contentId === contentId && b.contentType === contentType);
  } catch {
    return false;
  }
}

export async function getBlockedContentIds(
  contentType: ContentType
): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_KEY);
    if (!raw) return new Set();
    const all: BlockedContent[] = JSON.parse(raw);
    return new Set(all.filter((b) => b.contentType === contentType).map((b) => b.contentId));
  } catch {
    return new Set();
  }
}

export async function getAllBlockedContent(): Promise<BlockedContent[]> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearAllBlockedContent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BLOCKED_KEY);
    await AsyncStorage.removeItem(REPORTS_KEY);
  } catch {
    // silently fail
  }
}

// ─── Blocked Users ──────────────────────────────────────────────────────────

export async function blockUser(authorName: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
    const all: string[] = raw ? JSON.parse(raw) : [];
    if (!all.includes(authorName)) {
      all.push(authorName);
      await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(all));
    }
  } catch {
    // silently fail
  }
}

export async function unblockUser(authorName: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
    if (!raw) return;
    const all: string[] = JSON.parse(raw);
    const filtered = all.filter((u) => u !== authorName);
    await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(filtered));
  } catch {
    // silently fail
  }
}

export async function getBlockedUsers(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isUserBlocked(authorName: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
    if (!raw) return false;
    const all: string[] = JSON.parse(raw);
    return all.includes(authorName);
  } catch {
    return false;
  }
}
