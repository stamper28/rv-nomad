import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Types ──
interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
}

interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipProbability: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipProbability: number;
}

// WMO Weather Codes → display config
function getWeatherInfo(code: number, isDay = true): { icon: string; label: string; color: string } {
  if (code === 0) return { icon: isDay ? "wb-sunny" : "dark-mode", label: "Clear Sky", color: "#FB8C00" };
  if (code <= 3) return { icon: "cloud", label: code === 1 ? "Mainly Clear" : code === 2 ? "Partly Cloudy" : "Overcast", color: "#78909C" };
  if (code <= 49) return { icon: "water-drop", label: "Fog", color: "#90A4AE" };
  if (code <= 59) return { icon: "water-drop", label: "Drizzle", color: "#42A5F5" };
  if (code <= 69) return { icon: "water-drop", label: "Rain", color: "#1565C0" };
  if (code <= 79) return { icon: "ac-unit", label: "Snow", color: "#42A5F5" };
  if (code <= 82) return { icon: "water-drop", label: "Rain Showers", color: "#1976D2" };
  if (code <= 86) return { icon: "ac-unit", label: "Snow Showers", color: "#64B5F6" };
  if (code <= 99) return { icon: "flash-on", label: "Thunderstorm", color: "#6A1B9A" };
  return { icon: "cloud", label: "Unknown", color: "#607D8B" };
}

function windDirectionLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

export default function WeatherScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lon?: string; name?: string }>();

  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState(params.name || "My Location");
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [useFahrenheit, setUseFahrenheit] = useState(true);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max&hourly=temperature_2m,weather_code,precipitation_probability&timezone=auto&forecast_days=7`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data.current) {
        setCurrent({
          temperature: data.current.temperature_2m,
          apparentTemperature: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          windDirection: data.current.wind_direction_10m,
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
        });
      }

      if (data.daily) {
        const days: DailyForecast[] = data.daily.time.map((date: string, i: number) => {
          const d = new Date(date + "T12:00:00");
          const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
          return {
            date,
            dayName,
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            weatherCode: data.daily.weather_code[i],
            precipProbability: data.daily.precipitation_probability_max[i],
            windSpeedMax: data.daily.wind_speed_10m_max[i],
            sunrise: data.daily.sunrise[i],
            sunset: data.daily.sunset[i],
            uvIndexMax: data.daily.uv_index_max[i],
          };
        });
        setDaily(days);
      }

      if (data.hourly) {
        const now = new Date();
        const hours: HourlyForecast[] = data.hourly.time
          .map((time: string, i: number) => ({
            time,
            temperature: data.hourly.temperature_2m[i],
            weatherCode: data.hourly.weather_code[i],
            precipProbability: data.hourly.precipitation_probability[i],
          }))
          .filter((h: HourlyForecast) => new Date(h.time) >= now)
          .slice(0, 24);
        setHourly(hours);
      }
    } catch (err) {
      setError("Failed to fetch weather data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocationAndFetch = useCallback(async () => {
    // If coordinates were passed as params, use those
    if (params.lat && params.lon) {
      fetchWeather(parseFloat(params.lat), parseFloat(params.lon));
      return;
    }

    // Otherwise get GPS location
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied. Please enable location access in Settings.");
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      // Reverse geocode to get city name
      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (geo) {
          setLocationName(geo.city || geo.subregion || geo.region || "My Location");
        }
      } catch {
        // Geocoding failed, use default name
      }
      fetchWeather(loc.coords.latitude, loc.coords.longitude);
    } catch (err) {
      setError("Could not determine your location.");
      setLoading(false);
    }
  }, [params.lat, params.lon, fetchWeather]);

  useEffect(() => {
    getLocationAndFetch();
  }, []);

  const temp = (c: number) => useFahrenheit ? `${celsiusToFahrenheit(c)}°F` : `${Math.round(c)}°C`;
  const wind = (kmh: number) => useFahrenheit ? `${kmhToMph(kmh)} mph` : `${Math.round(kmh)} km/h`;

  if (loading) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Weather</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>Getting your location...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Weather</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingCenter}>
          <MaterialIcons name="cloud-off" size={48} color={colors.muted} />
          <Text style={[styles.errorText, { color: colors.muted }]}>{error}</Text>
          <TouchableOpacity onPress={getLocationAndFetch} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const weatherInfo = current ? getWeatherInfo(current.weatherCode, current.isDay) : null;

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Weather</Text>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setUseFahrenheit(!useFahrenheit);
          }}
          style={[styles.unitToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.unitText, { color: colors.primary }]}>{useFahrenheit ? "°F" : "°C"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Current Conditions */}
        {current && weatherInfo && (
          <View style={[styles.currentCard, { backgroundColor: weatherInfo.color + "15" }]}>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                getLocationAndFetch();
              }}
              style={styles.locationRow}
            >
              <MaterialIcons name="my-location" size={16} color={colors.primary} />
              <Text style={[styles.locationName, { color: colors.foreground }]}>{locationName}</Text>
              <MaterialIcons name="refresh" size={16} color={colors.muted} />
            </TouchableOpacity>

            <View style={styles.currentMain}>
              <MaterialIcons name={weatherInfo.icon as any} size={64} color={weatherInfo.color} />
              <Text style={[styles.currentTemp, { color: colors.foreground }]}>{temp(current.temperature)}</Text>
            </View>
            <Text style={[styles.currentLabel, { color: weatherInfo.color }]}>{weatherInfo.label}</Text>
            <Text style={[styles.feelsLike, { color: colors.muted }]}>Feels like {temp(current.apparentTemperature)}</Text>

            {/* Current Details */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <MaterialIcons name="water-drop" size={18} color="#1565C0" />
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{current.humidity}%</Text>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Humidity</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="air" size={18} color="#26A69A" />
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{wind(current.windSpeed)}</Text>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>{windDirectionLabel(current.windDirection)}</Text>
              </View>
              {daily[0] && (
                <>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="wb-sunny" size={18} color="#FB8C00" />
                    <Text style={[styles.detailValue, { color: colors.foreground }]}>UV {daily[0].uvIndexMax}</Text>
                    <Text style={[styles.detailLabel, { color: colors.muted }]}>
                      {daily[0].uvIndexMax <= 2 ? "Low" : daily[0].uvIndexMax <= 5 ? "Moderate" : daily[0].uvIndexMax <= 7 ? "High" : "Very High"}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="umbrella" size={18} color="#1976D2" />
                    <Text style={[styles.detailValue, { color: colors.foreground }]}>{daily[0].precipProbability}%</Text>
                    <Text style={[styles.detailLabel, { color: colors.muted }]}>Rain</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Hourly Forecast */}
        {hourly.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Next 24 Hours</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {hourly.map((h, i) => {
                const hInfo = getWeatherInfo(h.weatherCode);
                const time = new Date(h.time);
                const label = i === 0 ? "Now" : time.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
                return (
                  <View key={i} style={[styles.hourCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.hourTime, { color: colors.muted }]}>{label}</Text>
                    <MaterialIcons name={hInfo.icon as any} size={22} color={hInfo.color} />
                    <Text style={[styles.hourTemp, { color: colors.foreground }]}>{temp(h.temperature)}</Text>
                    {h.precipProbability > 0 && (
                      <Text style={[styles.hourRain, { color: "#1565C0" }]}>{h.precipProbability}%</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 7-Day Forecast */}
        {daily.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>7-Day Forecast</Text>
            <View style={[styles.forecastCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {daily.map((day, i) => {
                const dInfo = getWeatherInfo(day.weatherCode);
                return (
                  <View key={i} style={[styles.dayRow, i < daily.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
                    <Text style={[styles.dayName, { color: colors.foreground }]}>{day.dayName}</Text>
                    <View style={styles.dayMiddle}>
                      <MaterialIcons name={dInfo.icon as any} size={20} color={dInfo.color} />
                      {day.precipProbability > 0 && (
                        <Text style={[styles.dayRain, { color: "#1565C0" }]}>{day.precipProbability}%</Text>
                      )}
                    </View>
                    <View style={styles.dayTemps}>
                      <Text style={[styles.dayHigh, { color: colors.foreground }]}>{temp(day.tempMax)}</Text>
                      <Text style={[styles.dayLow, { color: colors.muted }]}>{temp(day.tempMin)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Sunrise / Sunset */}
        {daily[0] && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sun</Text>
            <View style={styles.sunRow}>
              <View style={[styles.sunCard, { backgroundColor: "#FFF3E0", borderColor: colors.border }]}>
                <MaterialIcons name="wb-sunny" size={28} color="#FB8C00" />
                <Text style={[styles.sunLabel, { color: colors.muted }]}>Sunrise</Text>
                <Text style={[styles.sunTime, { color: colors.foreground }]}>
                  {new Date(daily[0].sunrise).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                </Text>
              </View>
              <View style={[styles.sunCard, { backgroundColor: "#E8EAF6", borderColor: colors.border }]}>
                <MaterialIcons name="dark-mode" size={28} color="#5C6BC0" />
                <Text style={[styles.sunLabel, { color: colors.muted }]}>Sunset</Text>
                <Text style={[styles.sunTime, { color: colors.foreground }]}>
                  {new Date(daily[0].sunset).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* RV Weather Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>RV Weather Tips</Text>
          <View style={[styles.tipsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {current && current.windSpeed > 40 && (
              <View style={styles.tipRow}>
                <MaterialIcons name="warning" size={16} color={colors.warning} />
                <Text style={[styles.tipText, { color: colors.foreground }]}>
                  High winds detected. Secure awnings and avoid driving tall rigs on exposed roads.
                </Text>
              </View>
            )}
            {daily[0] && daily[0].precipProbability > 60 && (
              <View style={styles.tipRow}>
                <MaterialIcons name="water-drop" size={16} color="#1565C0" />
                <Text style={[styles.tipText, { color: colors.foreground }]}>
                  High chance of rain. Check campsite drainage and avoid low-lying boondocking spots.
                </Text>
              </View>
            )}
            {daily[0] && daily[0].uvIndexMax > 7 && (
              <View style={styles.tipRow}>
                <MaterialIcons name="wb-sunny" size={16} color="#FB8C00" />
                <Text style={[styles.tipText, { color: colors.foreground }]}>
                  Very high UV index. Use sunscreen, seek shade, and keep your RV AC running.
                </Text>
              </View>
            )}
            {current && current.temperature < 0 && (
              <View style={styles.tipRow}>
                <MaterialIcons name="ac-unit" size={16} color="#42A5F5" />
                <Text style={[styles.tipText, { color: colors.foreground }]}>
                  Freezing temperatures. Protect water lines, use heat tape, and keep tanks insulated.
                </Text>
              </View>
            )}
            <View style={styles.tipRow}>
              <MaterialIcons name="info" size={16} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.muted }]}>
                Weather data from Open-Meteo. Tap the location icon to refresh with your current GPS position.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 8 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  unitToggle: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  unitText: { fontSize: 14, fontWeight: "700" },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14 },
  errorText: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  retryBtnText: { color: "#fff", fontWeight: "700" },
  // Current
  currentCard: { marginHorizontal: 16, borderRadius: 20, padding: 24, alignItems: "center", gap: 8 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationName: { fontSize: 16, fontWeight: "600" },
  currentMain: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 },
  currentTemp: { fontSize: 56, fontWeight: "800" },
  currentLabel: { fontSize: 18, fontWeight: "600" },
  feelsLike: { fontSize: 14 },
  detailsRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" as any, marginTop: 16, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: "rgba(0,0,0,0.1)" },
  detailItem: { alignItems: "center", gap: 4 },
  detailValue: { fontSize: 16, fontWeight: "700" },
  detailLabel: { fontSize: 11 },
  // Sections
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  // Hourly
  hourCard: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, gap: 6, minWidth: 64 },
  hourTime: { fontSize: 12, fontWeight: "600" },
  hourTemp: { fontSize: 14, fontWeight: "700" },
  hourRain: { fontSize: 10, fontWeight: "600" },
  // Daily
  forecastCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  dayRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  dayName: { width: 80, fontSize: 14, fontWeight: "600" },
  dayMiddle: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  dayRain: { fontSize: 12, fontWeight: "600" },
  dayTemps: { flexDirection: "row", gap: 10 },
  dayHigh: { fontSize: 15, fontWeight: "700", width: 44, textAlign: "right" },
  dayLow: { fontSize: 15, width: 44, textAlign: "right" },
  // Sun
  sunRow: { flexDirection: "row", gap: 12 },
  sunCard: { flex: 1, alignItems: "center", paddingVertical: 16, borderRadius: 14, borderWidth: 1, gap: 6 },
  sunLabel: { fontSize: 12 },
  sunTime: { fontSize: 16, fontWeight: "700" },
  // Tips
  tipsCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
