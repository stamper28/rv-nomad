/**
 * Date formatting utilities for MM-DD-YYYY format.
 *
 * Users type only digits; dashes are auto-inserted.
 * Internal storage uses YYYY-MM-DD for Date parsing.
 * Display uses MM-DD-YYYY everywhere.
 */

/**
 * Auto-format raw digit input into MM-DD-YYYY as the user types.
 * Only allows digits; auto-inserts dashes after MM and DD.
 *
 * "04"      → "04-"
 * "0405"    → "04-05-"
 * "04052026" → "04-05-2026"
 */
export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

/**
 * Convert MM-DD-YYYY display string to YYYY-MM-DD for Date parsing / backend.
 * Returns empty string if input is incomplete or invalid.
 */
export function displayToISO(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length !== 8) return "";
  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  const m = parseInt(mm, 10);
  const d = parseInt(dd, 10);
  const y = parseInt(yyyy, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2099) return "";
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convert YYYY-MM-DD (ISO) to MM-DD-YYYY for display.
 * Also handles legacy formats like MM/DD/YYYY.
 * Returns "Not set" or the original string if not parseable.
 */
export function isoToDisplay(iso: string): string {
  if (!iso || iso === "Not set") return iso || "";
  // Already MM-DD-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(iso)) return iso;
  // YYYY-MM-DD
  const isoMatch = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[2]}-${isoMatch[3]}-${isoMatch[1]}`;
  // MM/DD/YYYY (legacy)
  const slashMatch = iso.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (slashMatch) return `${slashMatch[1]}-${slashMatch[2]}-${slashMatch[3]}`;
  return iso;
}

/**
 * Check if a MM-DD-YYYY string represents a complete, valid date.
 */
export function isValidDisplayDate(display: string): boolean {
  return displayToISO(display) !== "";
}

/**
 * Format a Date object or ISO string to MM-DD-YYYY.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/**
 * Format a timestamp (ms) to MM-DD-YYYY.
 */
export function formatTimestamp(ts: number): string {
  return formatDate(new Date(ts));
}
