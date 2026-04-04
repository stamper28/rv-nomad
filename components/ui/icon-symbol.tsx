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
  // Tab icons
  "map.fill": "map",
  "safari.fill": "explore",
  "point.topleft.down.to.point.bottomright.curvepath.fill": "route",
  "checklist": "checklist",
  "gearshape.fill": "settings",
  // General icons
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "magnifyingglass": "search",
  "location.fill": "my-location",
  "line.3.horizontal.decrease.circle": "filter-list",
  "plus": "add",
  "xmark": "close",
  "star.fill": "star",
  "star": "star-border",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "trash": "delete",
  "pencil": "edit",
  "arrow.clockwise": "refresh",
  "info.circle": "info",
  "person.fill": "person",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
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
