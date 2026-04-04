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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";

interface TripStop {
  id: string;
  name: string;
  notes: string;
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  stops: TripStop[];
  createdAt: number;
}

const STORAGE_KEY = "@rv_nomad_trips";

export default function TripsScreen() {
  const colors = useColors();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripStart, setNewTripStart] = useState("");
  const [newTripEnd, setNewTripEnd] = useState("");
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [showAddStop, setShowAddStop] = useState(false);
  const [newStopName, setNewStopName] = useState("");
  const [newStopNotes, setNewStopNotes] = useState("");
  const [activeTrip, setActiveTrip] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTrips(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips])
  );

  const saveTrips = async (updated: Trip[]) => {
    setTrips(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCreateTrip = async () => {
    if (!newTripName.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const trip: Trip = {
      id: Date.now().toString(),
      name: newTripName.trim(),
      startDate: newTripStart.trim() || "Not set",
      endDate: newTripEnd.trim() || "Not set",
      stops: [],
      createdAt: Date.now(),
    };
    await saveTrips([trip, ...trips]);
    setNewTripName("");
    setNewTripStart("");
    setNewTripEnd("");
    setShowNewTrip(false);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          await saveTrips(trips.filter((t) => t.id !== tripId));
        },
      },
    ]);
  };

  const handleAddStop = async () => {
    if (!newStopName.trim() || !activeTrip) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const stop: TripStop = {
      id: Date.now().toString(),
      name: newStopName.trim(),
      notes: newStopNotes.trim(),
    };
    const updated = trips.map((t) =>
      t.id === activeTrip ? { ...t, stops: [...t.stops, stop] } : t
    );
    await saveTrips(updated);
    setNewStopName("");
    setNewStopNotes("");
    setShowAddStop(false);
  };

  const handleRemoveStop = async (tripId: string, stopId: string) => {
    const updated = trips.map((t) =>
      t.id === tripId
        ? { ...t, stops: t.stops.filter((s) => s.id !== stopId) }
        : t
    );
    await saveTrips(updated);
  };

  const renderTrip = ({ item }: { item: Trip }) => {
    const isExpanded = expandedTrip === item.id;
    return (
      <View
        style={[
          styles.tripCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setExpandedTrip(isExpanded ? null : item.id);
          }}
          style={({ pressed }) => [
            styles.tripHeader,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.tripInfo}>
            <Text style={[styles.tripName, { color: colors.foreground }]}>
              {item.name}
            </Text>
            <Text style={[styles.tripDates, { color: colors.muted }]}>
              {item.startDate} — {item.endDate}
            </Text>
            <Text style={[styles.tripStopCount, { color: colors.primary }]}>
              {item.stops.length} stop{item.stops.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.tripActions}>
            <Pressable
              onPress={() => handleDeleteTrip(item.id)}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <MaterialIcons name="delete-outline" size={22} color={colors.error} />
            </Pressable>
            <MaterialIcons
              name={isExpanded ? "expand-less" : "expand-more"}
              size={24}
              color={colors.muted}
            />
          </View>
        </Pressable>

        {isExpanded && (
          <View style={[styles.stopsSection, { borderTopColor: colors.border }]}>
            {item.stops.length === 0 ? (
              <Text style={[styles.noStops, { color: colors.muted }]}>
                No stops added yet
              </Text>
            ) : (
              item.stops.map((stop, index) => (
                <View
                  key={stop.id}
                  style={[
                    styles.stopItem,
                    { borderBottomColor: colors.border },
                    index === item.stops.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.stopDot}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                    {index < item.stops.length - 1 && (
                      <View
                        style={[
                          styles.dotLine,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.stopContent}>
                    <Text
                      style={[styles.stopName, { color: colors.foreground }]}
                    >
                      {stop.name}
                    </Text>
                    {stop.notes ? (
                      <Text style={[styles.stopNotes, { color: colors.muted }]}>
                        {stop.notes}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => handleRemoveStop(item.id, stop.id)}
                    style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                  >
                    <MaterialIcons
                      name="close"
                      size={18}
                      color={colors.muted}
                    />
                  </Pressable>
                </View>
              ))
            )}
            <Pressable
              onPress={() => {
                setActiveTrip(item.id);
                setShowAddStop(true);
              }}
              style={({ pressed }) => [
                styles.addStopButton,
                { borderColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <MaterialIcons name="add" size={18} color={colors.primary} />
              <Text style={[styles.addStopText, { color: colors.primary }]}>
                Add Stop
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Trips
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Plan your RV adventures
            </Text>
          </View>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              setShowNewTrip(true);
            }}
            style={({ pressed }) => [
              styles.newTripButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.newTripButtonText}>New Trip</Text>
          </Pressable>
        </View>
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
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No trips yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Tap "New Trip" to start planning your next RV adventure
            </Text>
          </View>
        }
      />

      {/* New Trip Modal */}
      <Modal
        visible={showNewTrip}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewTrip(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                New Trip
              </Text>
              <Pressable
                onPress={() => setShowNewTrip(false)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                Trip Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g., Summer West Coast Tour"
                placeholderTextColor={colors.muted}
                value={newTripName}
                onChangeText={setNewTripName}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                  Start Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.foreground,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.muted}
                  value={newTripStart}
                  onChangeText={setNewTripStart}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                  End Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.foreground,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.muted}
                  value={newTripEnd}
                  onChangeText={setNewTripEnd}
                />
              </View>
            </View>

            <Pressable
              onPress={handleCreateTrip}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.createButtonText}>Create Trip</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Stop Modal */}
      <Modal
        visible={showAddStop}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddStop(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Add Stop
              </Text>
              <Pressable
                onPress={() => setShowAddStop(false)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                Stop Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g., Grand Canyon Campground"
                placeholderTextColor={colors.muted}
                value={newStopName}
                onChangeText={setNewStopName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                Notes (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
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
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.createButtonText}>Add Stop</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  newTripButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  newTripButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  // Trip Card
  tripCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  tripInfo: {
    flex: 1,
    gap: 2,
  },
  tripName: {
    fontSize: 17,
    fontWeight: "700",
  },
  tripDates: {
    fontSize: 13,
    marginTop: 2,
  },
  tripStopCount: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  tripActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  // Stops
  stopsSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noStops: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stopDot: {
    width: 20,
    alignItems: "center",
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  stopContent: {
    flex: 1,
    marginLeft: 10,
  },
  stopName: {
    fontSize: 15,
    fontWeight: "600",
  },
  stopNotes: {
    fontSize: 13,
    marginTop: 2,
  },
  addStopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 8,
    gap: 4,
  },
  addStopText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  createButton: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
