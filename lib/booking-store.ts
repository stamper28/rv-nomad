/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface Booking {
  id: string;
  siteId: string;
  siteName: string;
  siteCity: string;
  siteState: string;
  category: string;
  checkIn: string;   // MM-DD-YYYY
  checkOut: string;   // MM-DD-YYYY
  nights: number;
  guests: number;
  sites: number;      // number of RV sites booked
  pricePerNight: number;
  totalPrice: number;
  status: BookingStatus;
  paymentMethod: string; // "visa_4242" etc
  confirmationCode: string;
  createdAt: string;
  notes: string;
  spotNumber?: string;  // selected individual spot (e.g. "A1", "12")
  spotType?: string;    // e.g. "rv_full", "tent"
  appliedDiscounts?: string[];  // e.g. ["Military/Veteran", "Senior Discount"]
  discountSavings?: number;     // total discount amount in dollars
}

const KEY = "rv_nomad_bookings";

async function getAll(): Promise<Booking[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveAll(bookings: Booking[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(bookings));
}

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "RVN-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export const BookingStore = {
  getAll,

  getByStatus: async (status: BookingStatus): Promise<Booking[]> => {
    const all = await getAll();
    return all.filter((b) => b.status === status);
  },

  create: async (params: {
    siteId: string;
    siteName: string;
    siteCity: string;
    siteState: string;
    category: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    sites: number;
    pricePerNight: number;
    paymentMethod: string;
    notes: string;
    spotNumber?: string;
    spotType?: string;
    appliedDiscounts?: string[];
    discountSavings?: number;
  }): Promise<Booking> => {
    const nights = daysBetween(params.checkIn, params.checkOut);
    const booking: Booking = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      siteId: params.siteId,
      siteName: params.siteName,
      siteCity: params.siteCity,
      siteState: params.siteState,
      category: params.category,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights,
      guests: params.guests,
      sites: params.sites,
      pricePerNight: params.pricePerNight,
      totalPrice: nights * params.pricePerNight * params.sites,
      status: "upcoming",
      paymentMethod: params.paymentMethod,
      confirmationCode: generateConfirmationCode(),
      createdAt: new Date().toISOString(),
      notes: params.notes,
      spotNumber: params.spotNumber,
      spotType: params.spotType,
      appliedDiscounts: params.appliedDiscounts,
      discountSavings: params.discountSavings,
    };
    const all = await getAll();
    all.unshift(booking);
    await saveAll(all);
    return booking;
  },

  cancel: async (bookingId: string): Promise<void> => {
    const all = await getAll();
    const updated = all.map((b) =>
      b.id === bookingId ? { ...b, status: "cancelled" as BookingStatus } : b
    );
    await saveAll(updated);
  },

  delete: async (bookingId: string): Promise<void> => {
    const all = await getAll();
    await saveAll(all.filter((b) => b.id !== bookingId));
  },
};
