import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Types ──
interface DayForecast {
  day: string;
  high: number;
  low: number;
  condition: "sunny" | "partly_cloudy" | "cloudy" | "rain" | "storm" | "snow" | "wind";
  precipitation: number;
  wind: number;
  humidity: number;
}

interface WeatherAlert {
  type: "warning" | "watch" | "advisory";
  title: string;
  description: string;
  expires: string;
}

const CONDITION_CONFIG: Record<DayForecast["condition"], { icon: string; label: string; color: string }> = {
  sunny: { icon: "wb-sunny", label: "Sunny", color: "#FB8C00" },
  partly_cloudy: { icon: "cloud", label: "Partly Cloudy", color: "#78909C" },
  cloudy: { icon: "cloud", label: "Cloudy", color: "#607D8B" },
  rain: { icon: "water-drop", label: "Rain", color: "#1565C0" },
  storm: { icon: "flash-on", label: "Thunderstorm", color: "#6A1B9A" },
  snow: { icon: "ac-unit", label: "Snow", color: "#42A5F5" },
  wind: { icon: "air", label: "Windy", color: "#26A69A" },
};

// ── Sample Forecast Data ──
const SAMPLE_FORECAST: DayForecast[] = [
  { day: "Today", high: 78, low: 55, condition: "sunny", precipitation: 0, wind: 8, humidity: 35 },
  { day: "Fri", high: 82, low: 58, condition: "sunny", precipitation: 5, wind: 10, humidity: 30 },
  { day: "Sat", high: 75, low: 52, condition: "partly_cloudy", precipitation: 15, wind: 12, humidity: 45 },
  { day: "Sun", high: 68, low: 48, condition: "rain", precipitation: 70, wind: 18, humidity: 75 },
  { day: "Mon", high: 65, low: 45, condition: "storm", precipitation: 85, wind: 25, humidity: 80 },
  { day: "Tue", high: 72, low: 50, condition: "partly_cloudy", precipitation: 20, wind: 15, humidity: 50 },
  { day: "Wed", high: 76, low: 54, condition: "sunny", precipitation: 5, wind: 8, humidity: 38 },
];

const SAMPLE_ALERTS: WeatherAlert[] = [
  {
    type: "warning",
    title: "Severe Thunderstorm Warning",
    description: "Severe thunderstorms expected Monday afternoon through evening. Damaging winds up to 60 mph, large hail, and heavy rain possible. Secure all outdoor items and awnings.",
    expires: "Mon 10:00 PM",
  },
  {
    type: "advisory",
    title: "Wind Advisory",
    description: "Sustained winds of 25-35 mph with gusts up to 50 mph expected Sunday through Monday. High-profile vehicles including RVs may be difficult to control on exposed roadways.",
    expires: "Mon 6:00 AM",
  },
];

const RV_WEATHER_TIPS = [
  { condition: "wind", tip: "Winds above 40 mph: Do NOT drive your RV. Pull over and wait it out.", icon: "warning" },
  { condition: "storm", tip: "Retract all awnings and slideouts before storms. Disconnect shore power if lightning is close.", icon: "flash-on" },
  { condition: "rain", tip: "Check your roof seals before heavy rain. A small leak can cause thousands in damage.", icon: "water-drop" },
  { condition: "snow", tip: "Keep your furnace running to prevent pipe freezing. Open cabinet doors under sinks.", icon: "ac-unit" },
];

export default function WeatherScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ location?: string }>();
  const [location, setLocation] = useState(params.location || "Sedona, Arizona");

  const currentWeather = SAMPLE_FORECAST[0];
  const currentCondition = CONDITION_CONFIG[currentWeather.condition];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Weather</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>7-day forecast for your campsite</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Location Search */}
        <View style={[styles.locationBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="place" size={20} color={colors.primary} />
          <TextInput
            style={[styles.locationInput, { color: colors.foreground }]}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter campground or city..."
            placeholderTextColor={colors.muted}
            returnKeyType="search"
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialIcons name="my-location" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Current Weather Card */}
        <View style={[styles.currentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.currentMain}>
            <View>
              <Text style={[styles.currentTemp, { color: colors.foreground }]}>{currentWeather.high}°F</Text>
              <Text style={[styles.currentCondition, { color: currentCondition.color }]}>{currentCondition.label}</Text>
              <Text style={[styles.currentHL, { color: colors.muted }]}>H: {currentWeather.high}° L: {currentWeather.low}°</Text>
            </View>
            <View style={[styles.currentIconBg, { backgroundColor: currentCondition.color + "15" }]}>
              <MaterialIcons name={currentCondition.icon as any} size={56} color={currentCondition.color} />
            </View>
          </View>
          <View style={[styles.currentStats, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <MaterialIcons name="water-drop" size={18} color="#1565C0" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{currentWeather.precipitation}%</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Rain</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="air" size={18} color="#26A69A" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{currentWeather.wind} mph</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Wind</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="opacity" size={18} color="#7E57C2" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{currentWeather.humidity}%</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Humidity</Text>
            </View>
          </View>
        </View>

        {/* Weather Alerts */}
        {SAMPLE_ALERTS.length > 0 && (
          <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Alerts</Text>
            {SAMPLE_ALERTS.map((alert, i) => (
              <View
                key={i}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: alert.type === "warning" ? colors.error + "10" : colors.warning + "10",
                    borderColor: alert.type === "warning" ? colors.error + "40" : colors.warning + "40",
                  },
                ]}
              >
                <View style={styles.alertHeader}>
                  <MaterialIcons
                    name={alert.type === "warning" ? "warning" : "info"}
                    size={18}
                    color={alert.type === "warning" ? colors.error : colors.warning}
                  />
                  <Text style={[styles.alertTitle, { color: alert.type === "warning" ? colors.error : colors.warning }]}>
                    {alert.title}
                  </Text>
                </View>
                <Text style={[styles.alertDesc, { color: colors.foreground }]}>{alert.description}</Text>
                <Text style={[styles.alertExpires, { color: colors.muted }]}>Expires: {alert.expires}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 7-Day Forecast */}
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>7-Day Forecast</Text>
          <View style={[styles.forecastCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {SAMPLE_FORECAST.map((day, i) => {
              const cond = CONDITION_CONFIG[day.condition];
              return (
                <View
                  key={i}
                  style={[
                    styles.forecastRow,
                    i < SAMPLE_FORECAST.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.forecastDay, { color: colors.foreground }]}>{day.day}</Text>
                  <View style={styles.forecastCondition}>
                    <MaterialIcons name={cond.icon as any} size={20} color={cond.color} />
                    <Text style={[styles.forecastPrecip, { color: "#1565C0" }]}>
                      {day.precipitation > 0 ? `${day.precipitation}%` : ""}
                    </Text>
                  </View>
                  <View style={styles.forecastTemps}>
                    <Text style={[styles.forecastHigh, { color: colors.foreground }]}>{day.high}°</Text>
                    <View style={[styles.tempBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.tempBarFill,
                          {
                            backgroundColor: cond.color,
                            width: `${((day.high - 40) / 60) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.forecastLow, { color: colors.muted }]}>{day.low}°</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* RV Weather Tips */}
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>RV Weather Tips</Text>
          {RV_WEATHER_TIPS.map((tip, i) => (
            <View key={i} style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name={tip.icon as any} size={22} color={colors.warning} />
              <Text style={[styles.tipText, { color: colors.foreground }]}>{tip.tip}</Text>
            </View>
          ))}
        </View>

        {/* API Integration Notice */}
        <View style={[styles.apiNotice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="cloud" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.apiNoticeTitle, { color: colors.foreground }]}>Live Weather Data</Text>
            <Text style={[styles.apiNoticeText, { color: colors.muted }]}>
              Connect a weather API (OpenWeatherMap, Weather.gov) for real-time forecasts and alerts at your exact campsite location.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 8, gap: 4,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  locationBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
  },
  locationInput: { flex: 1, fontSize: 15 },
  currentCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, overflow: "hidden",
  },
  currentMain: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 20,
  },
  currentTemp: { fontSize: 52, fontWeight: "800", lineHeight: 56 },
  currentCondition: { fontSize: 18, fontWeight: "600", marginTop: 4 },
  currentHL: { fontSize: 14, marginTop: 4 },
  currentIconBg: {
    width: 90, height: 90, borderRadius: 45, justifyContent: "center", alignItems: "center",
  },
  currentStats: {
    flexDirection: "row", justifyContent: "space-around", paddingVertical: 14, borderTopWidth: 0.5,
  },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 15, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  alertCard: {
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 6,
  },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  alertTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  alertDesc: { fontSize: 13, lineHeight: 19 },
  alertExpires: { fontSize: 11, fontStyle: "italic" },
  forecastCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  forecastRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14,
  },
  forecastDay: { width: 50, fontSize: 14, fontWeight: "600" },
  forecastCondition: { flexDirection: "row", alignItems: "center", width: 60, gap: 4 },
  forecastPrecip: { fontSize: 12, fontWeight: "600" },
  forecastTemps: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  forecastHigh: { fontSize: 14, fontWeight: "700", width: 32, textAlign: "right" },
  forecastLow: { fontSize: 14, width: 32 },
  tempBar: { flex: 1, height: 4, borderRadius: 2 },
  tempBarFill: { height: 4, borderRadius: 2 },
  tipCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 6,
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
  apiNotice: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 16, marginBottom: 20, padding: 14, borderRadius: 14, borderWidth: 1,
  },
  apiNoticeTitle: { fontSize: 14, fontWeight: "700" },
  apiNoticeText: { fontSize: 12, lineHeight: 17, marginTop: 2 },
});
