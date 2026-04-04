// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for tab bar and app icons.
 */
const MAPPING = {
  // Tab icons - Home(Map), Explore, Trips, Saved, Profile
  "map.fill": "map",
  "book.fill": "menu-book",
  "point.topleft.down.to.point.bottomright.curvepath.fill": "route",
  "heart.fill": "favorite",
  "person.fill": "person",
  // General navigation
  "house.fill": "home",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "xmark": "close",
  "plus": "add",
  "minus": "remove",
  // Search & filter
  "magnifyingglass": "search",
  "line.3.horizontal.decrease.circle": "filter-list",
  "slider.horizontal.3": "tune",
  // Location & map
  "location.fill": "my-location",
  "mappin": "place",
  "mappin.and.ellipse": "pin-drop",
  // Campsite categories
  "tent.fill": "holiday-village",
  "tree.fill": "park",
  "leaf.fill": "eco",
  "mountain.2.fill": "terrain",
  "building.2.fill": "apartment",
  "cart.fill": "shopping-cart",
  "shield.fill": "shield",
  "wineglass.fill": "wine-bar",
  // Actions
  "star.fill": "star",
  "star": "star-border",
  "heart": "favorite-border",
  "trash": "delete",
  "pencil": "edit",
  "arrow.clockwise": "refresh",
  "square.and.arrow.up": "share",
  "bookmark.fill": "bookmark",
  "bookmark": "bookmark-border",
  // Utility
  "fuelpump.fill": "local-gas-station",
  "wrench.fill": "build",
  "checklist": "checklist",
  "cube.box.fill": "inventory-2",
  "list.bullet": "list",
  "doc.text": "description",
  // Info & settings
  "info.circle": "info",
  "gearshape.fill": "settings",
  "questionmark.circle": "help",
  "envelope.fill": "email",
  "phone.fill": "phone",
  "globe": "language",
  // Weather
  "cloud.sun.fill": "wb-cloudy",
  "thermometer.medium": "thermostat",
  "wind": "air",
  // Community
  "bubble.left.fill": "chat",
  "person.2.fill": "group",
  "camera.fill": "photo-camera",
  "photo.fill": "photo",
  // Premium
  "crown.fill": "workspace-premium",
  "lock.fill": "lock",
  "arrow.down.circle.fill": "download",
  // Misc
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
  "bell.fill": "notifications",
  "exclamationmark.triangle.fill": "warning",
  "checkmark.circle.fill": "check-circle",
  "dollarsign.circle.fill": "attach-money",
  "creditcard.fill": "credit-card",
  "speedometer": "speed",
  "ruler.fill": "straighten",
  "scalemass.fill": "monitor-weight",
  "tag.fill": "local-offer",
  "person.3.fill": "groups",
  "bag.fill": "shopping-bag",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
