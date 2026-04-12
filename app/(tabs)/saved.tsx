/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useCallback } from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Store } from "@/lib/store";
import { CATEGORY_LABELS, CATEGORY_COLORS, type CampSite } from "@/lib/types";
import { getCardPriceText } from "@/lib/price-labels";

type FilterMode = "all" | "campgrounds" | "boondocking" | "free";

export default function SavedScreen() {
  const colors = useColors();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [allSites, setAllSites] = useState<CampSite[]>([]);

  useFocusEffect(
    useCallback(() => {
      Store.getSavedSites().then(setSavedIds);
      import("@/lib/all-sites-data").then((mod) => setAllSites(mod.ALL_SITES));
    }, [])
  );

  const savedSites = allSites.filter((s) => savedIds.includes(s.id));

  const filteredSites = savedSites.filter((s) => {
    if (filter === "all") return true;
    if (filter === "campgrounds")
      return ["rv_park", "state_park", "national_park"].includes(s.category);
    if (filter === "boondocking")
      return ["boondocking", "blm", "national_forest"].includes(s.category);
    if (filter === "free") return s.pricePerNight === null;
    return true;
  });

  async function handleRemove(id: string) {
    const next = await Store.toggleSavedSite(id);
    setSavedIds(next);
  }

  const filters: { key: FilterMode; label: string }[] = [
    { key: "all", label: "All" },
    { key: "campgrounds", label: "Campgrounds" },
    { key: "boondocking", label: "Boondocking" },
    { key: "free", label: "Free" },
  ];

  function renderSite({ item }: { item: CampSite }) {
    const catColor = CATEGORY_COLORS[item.category];
    return (
      <View className="mx-4 mb-3 bg-surface rounded-2xl border border-border overflow-hidden">
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-2 mb-1">
                <View
                  className="px-2 py-0.5 rounded"
                  style={{ backgroundColor: catColor + "20" }}
                >
                  <Text className="text-xs font-semibold" style={{ color: catColor }}>
                    {CATEGORY_LABELS[item.category]}
                  </Text>
                </View>
              </View>
              <Text className="text-base font-semibold text-foreground">{item.name}</Text>
              <Text className="text-sm text-muted">
                {item.city}, {item.state}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.id)} className="p-1">
              <IconSymbol name="heart.fill" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center mt-2 gap-3">
            <View className="flex-row items-center gap-1">
              <IconSymbol name="star.fill" size={14} color={colors.warning} />
              <Text className="text-sm font-semibold text-foreground">{item.rating}</Text>
              <Text className="text-xs text-muted">({item.reviewCount})</Text>
            </View>
            <Text
              className="text-sm font-semibold"
              style={{ color: item.pricePerNight === null ? colors.success : colors.primary }}
            >
              {getCardPriceText(item.category, item.pricePerNight)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer className="pt-2">
      <View className="px-4 pb-3">
        <Text className="text-2xl font-bold text-foreground mb-3">Saved</Text>
        <ScrollRow filters={filters} active={filter} onSelect={setFilter} colors={colors} />
      </View>

      {filteredSites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <IconSymbol name="heart" size={48} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4 text-center">
            {savedIds.length === 0 ? "No Saved Spots Yet" : "No Matches"}
          </Text>
          <Text className="text-sm text-muted mt-1 text-center">
            {savedIds.length === 0
              ? "Tap the heart icon on any campground to save it here."
              : "Try a different filter to see your saved spots."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSites}
          keyExtractor={(item) => item.id}
          renderItem={renderSite}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </ScreenContainer>
  );
}

function ScrollRow({
  filters,
  active,
  onSelect,
  colors,
}: {
  filters: { key: FilterMode; label: string }[];
  active: FilterMode;
  onSelect: (f: FilterMode) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View className="flex-row gap-2">
      {filters.map((f) => (
        <TouchableOpacity
          key={f.key}
          className="px-4 py-2 rounded-full"
          style={{
            backgroundColor: active === f.key ? colors.primary : colors.surface,
            borderWidth: 1,
            borderColor: active === f.key ? colors.primary : colors.border,
          }}
          onPress={() => onSelect(f.key)}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: active === f.key ? "#fff" : colors.foreground }}
          >
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
