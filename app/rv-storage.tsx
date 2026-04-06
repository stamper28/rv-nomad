/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useMemo } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { openUrl } from "@/lib/open-url";
import {
  RV_STORAGE_FACILITIES,
  searchStorage,
  getStorageTypeInfo,
  type RVStorageFacility,
} from "@/lib/rv-storage-data";

export default function RVStorageScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFacilities = useMemo(() => {
    if (!searchQuery.trim()) return RV_STORAGE_FACILITIES;
    return searchStorage(searchQuery.trim());
  }, [searchQuery]);

  const renderFacility = ({ item }: { item: RVStorageFacility }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => openUrl(item.directionsUrl)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.facilityName, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.facilityLocation, { color: colors.muted }]}>{item.city}, {item.state}</Text>
        </View>
        <View style={[styles.priceBadge, { backgroundColor: "#2E7D3215" }]}>
          <Text style={styles.priceText}>${item.monthlyPriceMin}–${item.monthlyPriceMax}/mo</Text>
        </View>
      </View>

      {/* Storage Types */}
      <View style={styles.typesRow}>
        {item.storageTypes.map((type) => {
          const info = getStorageTypeInfo(type);
          return (
            <View key={type} style={[styles.typeChip, { backgroundColor: info.color + "15" }]}>
              <MaterialIcons name={info.icon as any} size={12} color={info.color} />
              <Text style={{ color: info.color, fontSize: 11, fontWeight: "600" }}>{info.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Features */}
      <View style={styles.featuresRow}>
        {item.has24HourAccess && (
          <View style={styles.featureTag}>
            <MaterialIcons name="access-time" size={11} color={colors.muted} />
            <Text style={[styles.featureText, { color: colors.muted }]}>24hr Access</Text>
          </View>
        )}
        {item.hasSecurity && (
          <View style={styles.featureTag}>
            <MaterialIcons name="security" size={11} color={colors.muted} />
            <Text style={[styles.featureText, { color: colors.muted }]}>Security</Text>
          </View>
        )}
        {item.hasElectrical && (
          <View style={styles.featureTag}>
            <MaterialIcons name="bolt" size={11} color={colors.muted} />
            <Text style={[styles.featureText, { color: colors.muted }]}>Electric</Text>
          </View>
        )}
        {item.hasDumpStation && (
          <View style={styles.featureTag}>
            <MaterialIcons name="water-drop" size={11} color={colors.muted} />
            <Text style={[styles.featureText, { color: colors.muted }]}>Dump</Text>
          </View>
        )}
        {item.hasWashBay && (
          <View style={styles.featureTag}>
            <MaterialIcons name="local-car-wash" size={11} color={colors.muted} />
            <Text style={[styles.featureText, { color: colors.muted }]}>Wash Bay</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={{ color: colors.muted, fontSize: 11 }}>Max Length: {item.maxLength} ft</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => openUrl(`tel:${item.phone}`)}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <MaterialIcons name="phone" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>Call</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <MaterialIcons name="directions" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>Directions</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>RV Storage Finder</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{RV_STORAGE_FACILITIES.length} facilities nationwide</Text>
        </View>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search by city, state, or facility name..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="close" size={18} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredFacilities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 12 }}>
            {filteredFacilities.length} facilit{filteredFacilities.length !== 1 ? "ies" : "y"} found
          </Text>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60, gap: 8 }}>
            <MaterialIcons name="search-off" size={48} color={colors.muted} />
            <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "700" }}>No facilities found</Text>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Try a different search</Text>
          </View>
        }
        renderItem={renderFacility}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "800" },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  facilityName: { fontSize: 15, fontWeight: "700" },
  facilityLocation: { fontSize: 12, marginTop: 2 },
  priceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priceText: { color: "#2E7D32", fontSize: 12, fontWeight: "700" },
  typesRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
  typeChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  featuresRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  featureTag: { flexDirection: "row", alignItems: "center", gap: 3 },
  featureText: { fontSize: 11 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#E5E7EB30" },
});
