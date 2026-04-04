import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
  Alert,
  SectionList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { BookingStore, type Booking, type BookingStatus } from "@/lib/booking-store";

// ── Trip Types ──
interface TripStop {
  id: string;
  name: string;
  siteId?: string;
  nights: number;
  notes: string;
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  stops: TripStop[];
  totalMiles: number;
  createdAt: number;
}

const TRIPS_KEY = "@rv_nomad_trips";

type TabMode = "trips" | "bookings";

export default function TripsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<TabMode>("trips");

  // ── Trips State ──
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripStart, setNewTripStart] = useState("");
  const [newTripEnd, setNewTripEnd] = useState("");
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [showAddStop, setShowAddStop] = useState(false);
  const [newStopName, setNewStopName] = useState("");
  const [newStopNights, setNewStopNights] = useState("1");
  const [newStopNotes, setNewStopNotes] = useState("");
  const [activeTrip, setActiveTrip] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // ── Bookings State ──
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadTrips = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(TRIPS_KEY);
      if (stored) setTrips(JSON.parse(stored));
    } catch {}
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const all = await BookingStore.getAll();
      setBookings(all);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
      loadBookings();
    }, [loadTrips, loadBookings])
  );

  const saveTrips = async (updated: Trip[]) => {
    setTrips(updated);
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
  };

  // ── Trip Actions ──
  const handleCreateTrip = async () => {
    if (!newTripName.trim()) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const trip: Trip = {
      id: Date.now().toString(),
      name: newTripName.trim(),
      startDate: newTripStart.trim() || "Not set",
      endDate: newTripEnd.trim() || "Not set",
      stops: [],
      totalMiles: 0,
      createdAt: Date.now(),
    };
    await saveTrips([trip, ...trips]);
    setNewTripName("");
    setNewTripStart("");
    setNewTripEnd("");
    setShowNewTrip(false);
  };

  const handleEditTrip = async () => {
    if (!editingTrip) return;
    const updated = trips.map((t) =>
      t.id === editingTrip.id ? editingTrip : t
    );
    await saveTrips(updated);
    setEditingTrip(null);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert("Delete Trip", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          await saveTrips(trips.filter((t) => t.id !== tripId));
        },
      },
    ]);
  };

  const handleAddStop = async () => {
    if (!newStopName.trim() || !activeTrip) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const stop: TripStop = {
      id: Date.now().toString(),
      name: newStopName.trim(),
      nights: parseInt(newStopNights) || 1,
      notes: newStopNotes.trim(),
    };
    const updated = trips.map((t) =>
      t.id === activeTrip ? { ...t, stops: [...t.stops, stop] } : t
    );
    await saveTrips(updated);
    setNewStopName("");
    setNewStopNights("1");
    setNewStopNotes("");
    setShowAddStop(false);
  };

  const handleRemoveStop = async (tripId: string, stopId: string) => {
    const updated = trips.map((t) =>
      t.id === tripId ? { ...t, stops: t.stops.filter((s) => s.id !== stopId) } : t
    );
    await saveTrips(updated);
  };

  const handleMoveStop = async (tripId: string, stopId: string, direction: "up" | "down") => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    const idx = trip.stops.findIndex((s) => s.id === stopId);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= trip.stops.length) return;
    const newStops = [...trip.stops];
    [newStops[idx], newStops[newIdx]] = [newStops[newIdx], newStops[idx]];
    const updated = trips.map((t) =>
      t.id === tripId ? { ...t, stops: newStops } : t
    );
    await saveTrips(updated);
  };

  // ── Booking Actions ──
  const handleCancelBooking = (bookingId: string) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this reservation?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel Booking",
        style: "destructive",
        onPress: async () => {
          await BookingStore.cancel(bookingId);
          loadBookings();
        },
      },
    ]);
  };

  const getTripSummary = (trip: Trip) => {
    const totalNights = trip.stops.reduce((sum, s) => sum + s.nights, 0);
    return { totalNights, stopCount: trip.stops.length };
  };

  const statusColor = (status: BookingStatus) => {
    switch (status) {
      case "upcoming": return colors.success;
      case "completed": return colors.primary;
      case "cancelled": return colors.error;
    }
  };

  // ── Render Trip Card ──
  const renderTrip = ({ item }: { item: Trip }) => {
    const isExpanded = expandedTrip === item.id;
    const summary = getTripSummary(item);
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setExpandedTrip(isExpanded ? null : item.id);
          }}
          style={({ pressed }) => [styles.cardHeader, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</Text>
            <Text style={[styles.cardSub, { color: colors.muted }]}>
              {item.startDate} — {item.endDate}
            </Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.chipText, { color: colors.primary }]}>
                  {summary.stopCount} stop{summary.stopCount !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={[styles.chip, { backgroundColor: colors.success + "15" }]}>
                <Text style={[styles.chipText, { color: colors.success }]}>
                  {summary.totalNights} night{summary.totalNights !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              onPress={() => setEditingTrip({ ...item })}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="edit" size={20} color={colors.muted} />
            </Pressable>
            <Pressable
              onPress={() => handleDeleteTrip(item.id)}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </Pressable>
            <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={24} color={colors.muted} />
          </View>
        </Pressable>

        {isExpanded && (
          <View style={[styles.stopsSection, { borderTopColor: colors.border }]}>
            {item.stops.length === 0 ? (
              <Text style={[styles.emptyStops, { color: colors.muted }]}>No stops added yet</Text>
            ) : (
              item.stops.map((stop, index) => (
                <View key={stop.id} style={[styles.stopItem, { borderBottomColor: colors.border }, index === item.stops.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.stopDot}>
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    {index < item.stops.length - 1 && (
                      <View style={[styles.dotLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <View style={styles.stopContent}>
                    <Text style={[styles.stopName, { color: colors.foreground }]}>{stop.name}</Text>
                    <Text style={[styles.stopMeta, { color: colors.muted }]}>
                      {stop.nights} night{stop.nights !== 1 ? "s" : ""}
                      {stop.notes ? ` · ${stop.notes}` : ""}
                    </Text>
                  </View>
                  <View style={styles.stopActions}>
                    {index > 0 && (
                      <Pressable onPress={() => handleMoveStop(item.id, stop.id, "up")} style={({ pressed }) => [pressed && { opacity: 0.5 }]}>
                        <MaterialIcons name="arrow-upward" size={16} color={colors.muted} />
                      </Pressable>
                    )}
                    {index < item.stops.length - 1 && (
                      <Pressable onPress={() => handleMoveStop(item.id, stop.id, "down")} style={({ pressed }) => [pressed && { opacity: 0.5 }]}>
                        <MaterialIcons name="arrow-downward" size={16} color={colors.muted} />
                      </Pressable>
                    )}
                    <Pressable onPress={() => handleRemoveStop(item.id, stop.id)} style={({ pressed }) => [pressed && { opacity: 0.5 }]}>
                      <MaterialIcons name="close" size={16} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
            <Pressable
              onPress={() => { setActiveTrip(item.id); setShowAddStop(true); }}
              style={({ pressed }) => [styles.addStopBtn, { borderColor: colors.primary }, pressed && { opacity: 0.8 }]}
            >
              <MaterialIcons name="add" size={18} color={colors.primary} />
              <Text style={[styles.addStopText, { color: colors.primary }]}>Add Stop</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  // ── Render Booking Card ──
  const renderBooking = ({ item }: { item: Booking }) => {
    const sColor = statusColor(item.status);
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.bookingHeader}>
          <View style={styles.cardInfo}>
            <View style={styles.bookingTopRow}>
              <View style={[styles.statusBadge, { backgroundColor: sColor + "20" }]}>
                <Text style={[styles.statusText, { color: sColor }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
              <Text style={[styles.confirmCode, { color: colors.muted }]}>{item.confirmationCode}</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.siteName}</Text>
            <Text style={[styles.cardSub, { color: colors.muted }]}>
              {item.siteCity}, {item.siteState}
            </Text>
          </View>
        </View>

        <View style={[styles.bookingDetails, { borderTopColor: colors.border }]}>
          <View style={styles.bookingRow}>
            <View style={styles.bookingCol}>
              <Text style={[styles.bookingLabel, { color: colors.muted }]}>Check-in</Text>
              <Text style={[styles.bookingValue, { color: colors.foreground }]}>{item.checkIn}</Text>
            </View>
            <View style={styles.bookingCol}>
              <Text style={[styles.bookingLabel, { color: colors.muted }]}>Check-out</Text>
              <Text style={[styles.bookingValue, { color: colors.foreground }]}>{item.checkOut}</Text>
            </View>
            <View style={styles.bookingCol}>
              <Text style={[styles.bookingLabel, { color: colors.muted }]}>Nights</Text>
              <Text style={[styles.bookingValue, { color: colors.foreground }]}>{item.nights}</Text>
            </View>
          </View>
          <View style={styles.bookingRow}>
            <View style={styles.bookingCol}>
              <Text style={[styles.bookingLabel, { color: colors.muted }]}>Guests</Text>
              <Text style={[styles.bookingValue, { color: colors.foreground }]}>{item.guests}</Text>
            </View>
            <View style={styles.bookingCol}>
              <Text style={[styles.bookingLabel, { color: colors.muted }]}>Sites</Text>
              <Text style={[styles.bookingValue, { color: colors.foreground }]}>{item.sites}</Text>
            </View>
            <View style={styles.bookingCol}>
              <Text style={[styles.bookingLabel, { color: colors.muted }]}>Total</Text>
              <Text style={[styles.bookingValue, { color: colors.primary, fontWeight: "700" }]}>${item.totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {item.status === "upcoming" && (
          <View style={[styles.bookingActions, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => handleCancelBooking(item.id)}
              style={({ pressed }) => [styles.cancelBtn, { borderColor: colors.error }, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.error }]}>Cancel Booking</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Trips</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Plan adventures & manage bookings</Text>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabBar, { borderColor: colors.border }]}>
        <Pressable
          onPress={() => setMode("trips")}
          style={[styles.tab, mode === "trips" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
        >
          <MaterialIcons name="route" size={18} color={mode === "trips" ? colors.primary : colors.muted} />
          <Text style={[styles.tabText, { color: mode === "trips" ? colors.primary : colors.muted }]}>My Trips</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("bookings")}
          style={[styles.tab, mode === "bookings" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
        >
          <MaterialIcons name="credit-card" size={18} color={mode === "bookings" ? colors.primary : colors.muted} />
          <Text style={[styles.tabText, { color: mode === "bookings" ? colors.primary : colors.muted }]}>
            Bookings{bookings.length > 0 ? ` (${bookings.length})` : ""}
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {mode === "trips" ? (
        <>
          <View style={styles.actionBar}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowNewTrip(true);
              }}
              style={({ pressed }) => [styles.newBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.newBtnText}>New Trip</Text>
            </Pressable>
          </View>
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={renderTrip}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="map" size={56} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No trips yet</Text>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  Tap "New Trip" to start planning your next RV adventure
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="credit-card" size={56} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No bookings yet</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Book a campsite from the map or explore tab to see your reservations here
              </Text>
            </View>
          }
        />
      )}

      {/* ── New Trip Modal ── */}
      <Modal visible={showNewTrip} transparent animationType="slide" onRequestClose={() => setShowNewTrip(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Trip</Text>
              <Pressable onPress={() => setShowNewTrip(false)} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Trip Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g., Summer West Coast Tour"
                placeholderTextColor={colors.muted}
                value={newTripName}
                onChangeText={setNewTripName}
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Start Date</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.muted}
                  value={newTripStart}
                  onChangeText={setNewTripStart}
                  returnKeyType="done"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>End Date</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.muted}
                  value={newTripEnd}
                  onChangeText={setNewTripEnd}
                  returnKeyType="done"
                />
              </View>
            </View>
            <Pressable
              onPress={handleCreateTrip}
              style={({ pressed }) => [styles.createBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <Text style={styles.createBtnText}>Create Trip</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Add Stop Modal ── */}
      <Modal visible={showAddStop} transparent animationType="slide" onRequestClose={() => setShowAddStop(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Stop</Text>
              <Pressable onPress={() => setShowAddStop(false)} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Stop Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g., Grand Canyon Campground"
                placeholderTextColor={colors.muted}
                value={newStopName}
                onChangeText={setNewStopName}
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Nights</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                placeholder="1"
                placeholderTextColor={colors.muted}
                value={newStopNights}
                onChangeText={setNewStopNights}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Any notes about this stop..."
                placeholderTextColor={colors.muted}
                value={newStopNotes}
                onChangeText={setNewStopNotes}
                multiline
                numberOfLines={3}
              />
            </View>
            <Pressable
              onPress={handleAddStop}
              style={({ pressed }) => [styles.createBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <Text style={styles.createBtnText}>Add Stop</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Edit Trip Modal ── */}
      <Modal visible={!!editingTrip} transparent animationType="slide" onRequestClose={() => setEditingTrip(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Trip</Text>
              <Pressable onPress={() => setEditingTrip(null)} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>
            {editingTrip && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>Trip Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                    value={editingTrip.name}
                    onChangeText={(t) => setEditingTrip({ ...editingTrip, name: t })}
                    returnKeyType="done"
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.foreground }]}>Start Date</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                      value={editingTrip.startDate}
                      onChangeText={(t) => setEditingTrip({ ...editingTrip, startDate: t })}
                      returnKeyType="done"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.foreground }]}>End Date</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                      value={editingTrip.endDate}
                      onChangeText={(t) => setEditingTrip({ ...editingTrip, endDate: t })}
                      returnKeyType="done"
                    />
                  </View>
                </View>
                <Pressable
                  onPress={handleEditTrip}
                  style={({ pressed }) => [styles.createBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                >
                  <Text style={styles.createBtnText}>Save Changes</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 32, fontWeight: "800" },
  subtitle: { fontSize: 15, marginTop: 2 },
  tabBar: {
    flexDirection: "row", marginHorizontal: 16, marginTop: 12, borderBottomWidth: 1,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  actionBar: { paddingHorizontal: 16, paddingTop: 12 },
  newBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 12, borderRadius: 12, gap: 4,
  },
  newBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100, gap: 12 },
  // Card
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  cardSub: { fontSize: 13, marginTop: 2 },
  chipRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  chipText: { fontSize: 12, fontWeight: "600" },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: { padding: 4 },
  // Stops
  stopsSection: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12 },
  emptyStops: { fontSize: 14, textAlign: "center", paddingVertical: 8 },
  stopItem: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  stopDot: { width: 20, alignItems: "center", paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotLine: { width: 2, flex: 1, marginTop: 4 },
  stopContent: { flex: 1, marginLeft: 10 },
  stopName: { fontSize: 15, fontWeight: "600" },
  stopMeta: { fontSize: 13, marginTop: 2 },
  stopActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  addStopBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderStyle: "dashed", marginTop: 8, gap: 4,
  },
  addStopText: { fontSize: 14, fontWeight: "600" },
  // Bookings
  bookingHeader: { padding: 16 },
  bookingTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: "700" },
  confirmCode: { fontSize: 12, fontWeight: "600" },
  bookingDetails: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  bookingRow: { flexDirection: "row" },
  bookingCol: { flex: 1 },
  bookingLabel: { fontSize: 11, marginBottom: 2 },
  bookingValue: { fontSize: 14, fontWeight: "500" },
  bookingActions: { borderTopWidth: StyleSheet.hairlineWidth, padding: 12 },
  cancelBtn: { paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "600" },
  // Empty
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyText: { fontSize: 15, textAlign: "center", paddingHorizontal: 40 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "700" },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 14, fontWeight: "600" },
  input: { height: 46, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  inputRow: { flexDirection: "row", gap: 12 },
  textArea: { height: 80, paddingTop: 12, textAlignVertical: "top" },
  createBtn: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 4 },
  createBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
