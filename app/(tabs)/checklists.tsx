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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Checklist {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
  isCustom: boolean;
}

const STORAGE_KEY = "@rv_nomad_checklists";

const DEFAULT_CHECKLISTS: Checklist[] = [
  {
    id: "pre-departure",
    name: "Pre-Departure",
    icon: "directions-car",
    isCustom: false,
    items: [
      { id: "pd1", text: "Retract awning", checked: false },
      { id: "pd2", text: "Disconnect shore power", checked: false },
      { id: "pd3", text: "Disconnect water hose", checked: false },
      { id: "pd4", text: "Disconnect sewer hose", checked: false },
      { id: "pd5", text: "Retract leveling jacks", checked: false },
      { id: "pd6", text: "Retract slides", checked: false },
      { id: "pd7", text: "Secure all cabinets and drawers", checked: false },
      { id: "pd8", text: "Check tire pressure", checked: false },
      { id: "pd9", text: "Check fluid levels", checked: false },
      { id: "pd10", text: "Secure loose items inside", checked: false },
      { id: "pd11", text: "Close all windows and vents", checked: false },
      { id: "pd12", text: "Lock entry door", checked: false },
      { id: "pd13", text: "Check mirrors and lights", checked: false },
      { id: "pd14", text: "Walk around inspection", checked: false },
    ],
  },
  {
    id: "arrival-setup",
    name: "Arrival Setup",
    icon: "home",
    isCustom: false,
    items: [
      { id: "as1", text: "Level the RV", checked: false },
      { id: "as2", text: "Deploy leveling jacks", checked: false },
      { id: "as3", text: "Extend slides", checked: false },
      { id: "as4", text: "Connect shore power", checked: false },
      { id: "as5", text: "Connect water hose", checked: false },
      { id: "as6", text: "Connect sewer hose", checked: false },
      { id: "as7", text: "Deploy awning", checked: false },
      { id: "as8", text: "Set up outdoor furniture", checked: false },
      { id: "as9", text: "Check propane levels", checked: false },
      { id: "as10", text: "Turn on water heater", checked: false },
      { id: "as11", text: "Test AC/heating", checked: false },
    ],
  },
  {
    id: "maintenance",
    name: "Monthly Maintenance",
    icon: "build",
    isCustom: false,
    items: [
      { id: "m1", text: "Check roof for leaks or damage", checked: false },
      { id: "m2", text: "Inspect seals and caulking", checked: false },
      { id: "m3", text: "Check battery water levels", checked: false },
      { id: "m4", text: "Lubricate slide mechanisms", checked: false },
      { id: "m5", text: "Clean AC filters", checked: false },
      { id: "m6", text: "Check fire extinguisher", checked: false },
      { id: "m7", text: "Test smoke/CO detectors", checked: false },
      { id: "m8", text: "Inspect tires for wear", checked: false },
      { id: "m9", text: "Check generator oil", checked: false },
      { id: "m10", text: "Clean water filter", checked: false },
    ],
  },
  {
    id: "winterize",
    name: "Winterization",
    icon: "ac-unit",
    isCustom: false,
    items: [
      { id: "w1", text: "Drain fresh water tank", checked: false },
      { id: "w2", text: "Drain hot water heater", checked: false },
      { id: "w3", text: "Bypass water heater", checked: false },
      { id: "w4", text: "Add RV antifreeze to lines", checked: false },
      { id: "w5", text: "Drain and clean black tank", checked: false },
      { id: "w6", text: "Drain and clean gray tank", checked: false },
      { id: "w7", text: "Disconnect batteries", checked: false },
      { id: "w8", text: "Cover exterior vents", checked: false },
      { id: "w9", text: "Cover tires", checked: false },
      { id: "w10", text: "Apply RV cover", checked: false },
    ],
  },
];

export default function ChecklistsScreen() {
  const colors = useColors();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [showNewChecklist, setShowNewChecklist] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);

  const loadChecklists = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setChecklists(JSON.parse(stored));
      } else {
        // First time: use defaults
        setChecklists(DEFAULT_CHECKLISTS);
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEFAULT_CHECKLISTS)
        );
      }
    } catch {
      setChecklists(DEFAULT_CHECKLISTS);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChecklists();
    }, [loadChecklists])
  );

  const saveChecklists = async (updated: Checklist[]) => {
    setChecklists(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleToggleItem = async (checklistId: string, itemId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const updated = checklists.map((cl) =>
      cl.id === checklistId
        ? {
            ...cl,
            items: cl.items.map((item) =>
              item.id === itemId
                ? { ...item, checked: !item.checked }
                : item
            ),
          }
        : cl
    );
    await saveChecklists(updated);
  };

  const handleResetChecklist = async (checklistId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const updated = checklists.map((cl) =>
      cl.id === checklistId
        ? {
            ...cl,
            items: cl.items.map((item) => ({ ...item, checked: false })),
          }
        : cl
    );
    await saveChecklists(updated);
  };

  const handleCreateChecklist = async () => {
    if (!newChecklistName.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const newList: Checklist = {
      id: Date.now().toString(),
      name: newChecklistName.trim(),
      icon: "checklist",
      items: [],
      isCustom: true,
    };
    await saveChecklists([...checklists, newList]);
    setNewChecklistName("");
    setShowNewChecklist(false);
  };

  const handleAddItem = async () => {
    if (!newItemText.trim() || !activeChecklist) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const updated = checklists.map((cl) =>
      cl.id === activeChecklist
        ? {
            ...cl,
            items: [
              ...cl.items,
              {
                id: Date.now().toString(),
                text: newItemText.trim(),
                checked: false,
              },
            ],
          }
        : cl
    );
    await saveChecklists(updated);
    setNewItemText("");
    setShowAddItem(false);
  };

  const getProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0;
    return items.filter((i) => i.checked).length / items.length;
  };

  const renderChecklist = ({ item }: { item: Checklist }) => {
    const isExpanded = expandedList === item.id;
    const progress = getProgress(item.items);
    const checkedCount = item.items.filter((i) => i.checked).length;
    const allDone = progress === 1 && item.items.length > 0;

    return (
      <View
        style={[
          styles.checklistCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setExpandedList(isExpanded ? null : item.id);
          }}
          style={({ pressed }) => [
            styles.checklistHeader,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.checklistIcon}>
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={allDone ? colors.success : colors.primary}
            />
          </View>
          <View style={styles.checklistInfo}>
            <Text
              style={[styles.checklistName, { color: colors.foreground }]}
            >
              {item.name}
            </Text>
            <View style={styles.progressRow}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: allDone
                        ? colors.success
                        : colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.muted }]}>
                {checkedCount}/{item.items.length}
              </Text>
            </View>
          </View>
          <MaterialIcons
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24}
            color={colors.muted}
          />
        </Pressable>

        {isExpanded && (
          <View
            style={[styles.itemsSection, { borderTopColor: colors.border }]}
          >
            {item.items.map((ci) => (
              <Pressable
                key={ci.id}
                onPress={() => handleToggleItem(item.id, ci.id)}
                style={({ pressed }) => [
                  styles.checkItem,
                  { borderBottomColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <MaterialIcons
                  name={
                    ci.checked ? "check-box" : "check-box-outline-blank"
                  }
                  size={22}
                  color={ci.checked ? colors.success : colors.muted}
                />
                <Text
                  style={[
                    styles.checkItemText,
                    { color: colors.foreground },
                    ci.checked && {
                      textDecorationLine: "line-through",
                      color: colors.muted,
                    },
                  ]}
                >
                  {ci.text}
                </Text>
              </Pressable>
            ))}

            <View style={styles.checklistActions}>
              <Pressable
                onPress={() => {
                  setActiveChecklist(item.id);
                  setShowAddItem(true);
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  { borderColor: colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <MaterialIcons name="add" size={16} color={colors.primary} />
                <Text
                  style={[styles.actionButtonText, { color: colors.primary }]}
                >
                  Add Item
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleResetChecklist(item.id)}
                style={({ pressed }) => [
                  styles.actionButton,
                  { borderColor: colors.warning },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <MaterialIcons
                  name="refresh"
                  size={16}
                  color={colors.warning}
                />
                <Text
                  style={[styles.actionButtonText, { color: colors.warning }]}
                >
                  Reset
                </Text>
              </Pressable>
            </View>
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
              Checklists
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Never forget a step
            </Text>
          </View>
          <Pressable
            onPress={() => setShowNewChecklist(true)}
            style={({ pressed }) => [
              styles.newButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.newButtonText}>New List</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={checklists}
        keyExtractor={(item) => item.id}
        renderItem={renderChecklist}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* New Checklist Modal */}
      <Modal
        visible={showNewChecklist}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewChecklist(false)}
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
                New Checklist
              </Text>
              <Pressable
                onPress={() => setShowNewChecklist(false)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                Checklist Name
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
                placeholder="e.g., Grocery List"
                placeholderTextColor={colors.muted}
                value={newChecklistName}
                onChangeText={setNewChecklistName}
              />
            </View>
            <Pressable
              onPress={handleCreateChecklist}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={showAddItem}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddItem(false)}
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
                Add Item
              </Text>
              <Pressable
                onPress={() => setShowAddItem(false)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter checklist item..."
                placeholderTextColor={colors.muted}
                value={newItemText}
                onChangeText={setNewItemText}
                returnKeyType="done"
                onSubmitEditing={handleAddItem}
              />
            </View>
            <Pressable
              onPress={handleAddItem}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.createButtonText}>Add</Text>
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
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  newButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  // Card
  checklistCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  checklistIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistInfo: {
    flex: 1,
    gap: 6,
  },
  checklistName: {
    fontSize: 17,
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "right",
  },
  // Items
  itemsSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  checkItemText: {
    fontSize: 15,
    flex: 1,
  },
  checklistActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
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
