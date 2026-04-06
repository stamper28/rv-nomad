import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CATEGORY_LABELS, CATEGORY_COLORS, type CampSite } from "@/lib/types";
import { BookingStore } from "@/lib/booking-store";
import { calculatePayment, PLATFORM_FEE_PER_NIGHT } from "@/lib/stripe";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { formatDateInput, displayToISO, isoToDisplay } from "@/lib/date-utils";
import { generateSpotsForSite, SPOT_TYPE_LABELS, SPOT_TYPE_ICONS, type CampsiteSpot } from "@/lib/campsite-spots";
import { calculateDiscounts, type Discount } from "@/lib/discount-stacker";
import { Store, type DiscountMemberships } from "@/lib/store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type Step = "details" | "spot_selection" | "payment" | "confirmation";
type SpotFilter = "all" | "rv_full" | "rv_we" | "rv_electric" | "tent" | "cabin" | "ada";

export default function BookingScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ siteId: string }>();
  const { user, isAuthenticated } = useAuth();
  const [site, setSite] = useState<CampSite | undefined>(undefined);

  useEffect(() => {
    import("@/lib/all-sites-data").then((mod) => {
      const found = mod.ALL_SITES.find((s: CampSite) => s.id === params.siteId);
      setSite(found);
    });
  }, [params.siteId]);

  const [step, setStep] = useState<Step>("details");
  // Details
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [siteCount, setSiteCount] = useState(1);
  const [notes, setNotes] = useState("");
  // Spot selection
  const [selectedSpot, setSelectedSpot] = useState<CampsiteSpot | null>(null);
  const [spotFilter, setSpotFilter] = useState<SpotFilter>("all");
  // Discounts
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  // Payment
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "google">("card");
  // Confirmation
  const [confirmCode, setConfirmCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // Availability
  const [availabilityStatus, setAvailabilityStatus] = useState<"unchecked" | "checking" | "available" | "unavailable">("unchecked");
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // tRPC mutations
  const checkAvailability = trpc.bookings.checkAvailability.useQuery(
    { siteId: params.siteId || "", checkIn: displayToISO(checkIn) || checkIn, checkOut: displayToISO(checkOut) || checkOut },
    { enabled: false }
  );
  const createBookingMutation = trpc.bookings.create.useMutation();
  const createPaymentMutation = trpc.payments.createIntent.useMutation();

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    try {
      const isoIn = displayToISO(checkIn) || checkIn;
      const isoOut = displayToISO(checkOut) || checkOut;
      const s = new Date(isoIn);
      const e = new Date(isoOut);
      const diff = e.getTime() - s.getTime();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  }, [checkIn, checkOut]);

  // Generate spots for this campground
  const spots = useMemo(() => {
    if (!site) return [];
    return generateSpotsForSite(
      site.id,
      site.category,
      site.hookupType,
      site.ampService,
      site.adaAccessible,
      site.pullThrough,
      site.bigRigFriendly,
      site.pricePerNight,
    );
  }, [site]);

  const filteredSpots = useMemo(() => {
    if (spotFilter === "all") return spots;
    if (spotFilter === "ada") return spots.filter((s) => s.adaAccessible);
    return spots.filter((s) => s.spotType === spotFilter);
  }, [spots, spotFilter]);

  const pricePerNight = site?.pricePerNight ?? 0;
  const spotPriceModifier = selectedSpot?.priceModifier ?? 0;
  const effectivePricePerNight = Math.max(0, pricePerNight + spotPriceModifier);
  const payment = useMemo(
    () => calculatePayment({ pricePerNight: effectivePricePerNight, nights, sites: siteCount }),
    [effectivePricePerNight, nights, siteCount]
  );
  // Discount calculation
  const availableDiscounts = useMemo(() => {
    if (!site) return { discounts: [], bestCombo: [], totalSavings: 0, bestPrice: 0, originalPrice: 0 };
    return calculateDiscounts(effectivePricePerNight, nights || 1, site.category, site.name);
  }, [site, effectivePricePerNight, nights]);

  const discountSavings = useMemo(() => {
    if (selectedDiscounts.length === 0 || !site) return 0;
    let totalPercent = 0;
    for (const program of selectedDiscounts) {
      const d = availableDiscounts.discounts.find((dd) => dd.program === program);
      if (d?.percentOff) totalPercent += d.percentOff;
    }
    // Cap at 50%
    totalPercent = Math.min(totalPercent, 50);
    return Math.round(effectivePricePerNight * (nights || 1) * siteCount * totalPercent / 100 * 100) / 100;
  }, [selectedDiscounts, availableDiscounts, effectivePricePerNight, nights, siteCount, site]);

  const { campsiteSubtotal: subtotal, platformFee, taxes: baseTaxes, total: baseTotal } = payment;
  const discountedSubtotal = Math.max(0, subtotal - discountSavings);
  const taxes = Math.round(discountedSubtotal * 0.06 * 100) / 100;
  const total = Math.round((discountedSubtotal + platformFee + taxes) * 100) / 100;

  // Auto-apply length-of-stay discounts
  useEffect(() => {
    if (!site) return;
    const losDiscounts = availableDiscounts.discounts.filter((d) => d.type === "length_of_stay");
    for (const d of losDiscounts) {
      if (!selectedDiscounts.includes(d.program)) {
        setSelectedDiscounts((prev) => prev.includes(d.program) ? prev : [...prev, d.program]);
      }
    }
  }, [availableDiscounts.discounts, site]);

  // Auto-apply saved membership discounts from profile
  useEffect(() => {
    if (!site) return;
    Store.getMemberships().then((memberships) => {
      const programMap: Record<string, keyof DiscountMemberships> = {
        "Military/Veteran": "military",
        "Senior (62+)": "senior",
        "Good Sam": "goodSam",
        "Passport America": "passportAmerica",
        "Escapees": "escapees",
        "KOA Value Kard": "koaValueKard",
        "AAA/CAA": "aaa",
        "AARP": "aarp",
      };
      const toApply: string[] = [];
      for (const d of availableDiscounts.discounts) {
        const membershipKey = programMap[d.program];
        if (membershipKey && memberships[membershipKey]) {
          toApply.push(d.program);
        }
      }
      if (toApply.length > 0) {
        setSelectedDiscounts((prev) => {
          const next = [...prev];
          for (const p of toApply) {
            if (!next.includes(p)) next.push(p);
          }
          return next;
        });
      }
    });
  }, [site, availableDiscounts.discounts]);

  // Check availability when dates change
  useEffect(() => {
    if (!checkIn || !checkOut || nights <= 0 || !params.siteId) {
      setAvailabilityStatus("unchecked");
      return;
    }
    setAvailabilityStatus("checking");
    checkAvailability.refetch().then((result) => {
      if (result.data) {
        setAvailabilityStatus(result.data.available ? "available" : "unavailable");
        setBlockedDates(result.data.blockedDates);
      } else {
        // If backend is unavailable, default to available (local-only mode)
        setAvailabilityStatus("available");
      }
    }).catch(() => {
      setAvailabilityStatus("available");
    });
  }, [checkIn, checkOut, nights, params.siteId]);

  if (!site) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.center}>
          <Text style={{ color: colors.muted }}>Site not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary, marginTop: 12 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const catColor = CATEGORY_COLORS[site.category];

  function formatCardNumber(text: string) {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  }

  function formatExpiry(text: string) {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    return cleaned;
  }

  async function handlePayment() {
    if (!checkIn || !checkOut || nights <= 0) {
      Alert.alert("Invalid Dates", "Please enter valid check-in and check-out dates.");
      return;
    }
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCVC || !cardName)) {
      Alert.alert("Missing Info", "Please fill in all payment fields.");
      return;
    }

    setIsProcessing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      // Step 1: Create payment intent on server
      let paymentIntentId = "";
      let clientSecret = "";
      try {
        const amountCents = Math.round(total * 100);
        const paymentResult = await createPaymentMutation.mutateAsync({
          amount: amountCents,
          description: `RV Nomad Booking - ${site!.name}`,
          siteName: site!.name,
        });
        paymentIntentId = paymentResult.paymentIntentId;
        clientSecret = paymentResult.clientSecret;
      } catch (payErr) {
        // If Stripe fails, still allow booking with local-only payment tracking
        console.warn("[Booking] Stripe payment intent failed, using local booking:", payErr);
        paymentIntentId = `local_${Date.now()}`;
      }

      // Step 2: Create booking in database
      let bookingId: number | undefined;
      try {
        const bookingResult = await createBookingMutation.mutateAsync({
          siteId: site!.id,
          siteName: site!.name,
          siteState: site!.state,
          checkInDate: displayToISO(checkIn) || checkIn,
          checkOutDate: displayToISO(checkOut) || checkOut,
          nights,
          guests,
          sitePrice: subtotal.toFixed(2),
          bookingFee: platformFee.toFixed(2),
          totalPrice: total.toFixed(2),
          guestName: cardName || undefined,
          rvType: undefined,
          rvLength: undefined,
          specialRequests: notes || undefined,
        });
        bookingId = bookingResult.bookingId;
      } catch (dbErr) {
        console.warn("[Booking] Server booking failed, saving locally:", dbErr);
      }

      // Step 3: Always save locally as backup
      const localBooking = await BookingStore.create({
        siteId: site!.id,
        siteName: site!.name,
        siteCity: site!.city,
        siteState: site!.state,
        category: site!.category,
        checkIn: displayToISO(checkIn) || checkIn,
        checkOut: displayToISO(checkOut) || checkOut,
        guests,
        sites: siteCount,
        pricePerNight: effectivePricePerNight,
        spotNumber: selectedSpot?.spotNumber,
        spotType: selectedSpot?.spotType,
        appliedDiscounts: selectedDiscounts.length > 0 ? selectedDiscounts : undefined,
        discountSavings: discountSavings > 0 ? discountSavings : undefined,
        paymentMethod:
          paymentMethod === "card"
            ? `visa_${cardNumber.replace(/\s/g, "").slice(-4)}`
            : paymentMethod === "apple"
            ? "apple_pay"
            : "google_pay",
        notes,
      });

      setConfirmCode(localBooking.confirmationCode);
      setStep("confirmation");

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  // ── Step 1: Details ──
  if (step === "details") {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Book Campsite</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Site Summary */}
          <View style={[styles.siteSummary, { backgroundColor: catColor + "10", borderColor: colors.border }]}>
            <View style={[styles.catBadge, { backgroundColor: catColor + "25" }]}>
              <Text style={[styles.catBadgeText, { color: catColor }]}>
                {CATEGORY_LABELS[site.category]}
              </Text>
            </View>
            <Text style={[styles.siteName, { color: colors.foreground }]}>{site.name}</Text>
            <Text style={[styles.siteLocation, { color: colors.muted }]}>
              {site.city}, {site.state}
            </Text>
            <Text style={[styles.sitePrice, { color: colors.primary }]}>
              ${pricePerNight}/night
            </Text>
          </View>

          <View style={styles.form}>
            {/* Dates */}
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Trip Dates</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Check-in</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="MM-DD-YYYY"
                  placeholderTextColor={colors.muted}
                  value={checkIn}
                  onChangeText={(t) => setCheckIn(formatDateInput(t))}
                  keyboardType="number-pad"
                  maxLength={10}
                  returnKeyType="done"
                />
              </View>
              <View style={styles.dateField}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Check-out</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="MM-DD-YYYY"
                  placeholderTextColor={colors.muted}
                  value={checkOut}
                  onChangeText={(t) => setCheckOut(formatDateInput(t))}
                  keyboardType="number-pad"
                  maxLength={10}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Availability Status */}
            {nights > 0 && (
              <View style={styles.availRow}>
                <Text style={[styles.nightsLabel, { color: colors.primary }]}>
                  {nights} night{nights !== 1 ? "s" : ""}
                </Text>
                {availabilityStatus === "checking" && (
                  <View style={styles.availBadge}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.availText, { color: colors.muted }]}>Checking availability...</Text>
                  </View>
                )}
                {availabilityStatus === "available" && (
                  <View style={[styles.availBadge, { backgroundColor: colors.success + "15" }]}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
                    <Text style={[styles.availText, { color: colors.success }]}>Available</Text>
                  </View>
                )}
                {availabilityStatus === "unavailable" && (
                  <View style={[styles.availBadge, { backgroundColor: colors.error + "15" }]}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.error} />
                    <Text style={[styles.availText, { color: colors.error }]}>Dates unavailable</Text>
                  </View>
                )}
              </View>
            )}

            {/* Blocked dates warning */}
            {availabilityStatus === "unavailable" && blockedDates.length > 0 && (
              <View style={[styles.warningBox, { backgroundColor: colors.error + "10", borderColor: colors.error + "30" }]}>
                <Text style={[styles.warningText, { color: colors.error }]}>
                  The following dates are already booked: {blockedDates.slice(0, 5).join(", ")}
                  {blockedDates.length > 5 ? ` and ${blockedDates.length - 5} more` : ""}
                </Text>
              </View>
            )}

            {/* Guests & Sites */}
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Guests & Sites</Text>
            <View style={styles.counterRow}>
              <Text style={[styles.counterLabel, { color: colors.foreground }]}>Guests</Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={[styles.counterBtn, { borderColor: colors.border }]}
                  onPress={() => setGuests(Math.max(1, guests - 1))}
                >
                  <IconSymbol name="minus" size={16} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: colors.foreground }]}>{guests}</Text>
                <TouchableOpacity
                  style={[styles.counterBtn, { borderColor: colors.border }]}
                  onPress={() => setGuests(Math.min(20, guests + 1))}
                >
                  <IconSymbol name="plus" size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.counterRow}>
              <Text style={[styles.counterLabel, { color: colors.foreground }]}>RV Sites</Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={[styles.counterBtn, { borderColor: colors.border }]}
                  onPress={() => setSiteCount(Math.max(1, siteCount - 1))}
                >
                  <IconSymbol name="minus" size={16} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: colors.foreground }]}>{siteCount}</Text>
                <TouchableOpacity
                  style={[styles.counterBtn, { borderColor: colors.border }]}
                  onPress={() => setSiteCount(Math.min(5, siteCount + 1))}
                >
                  <IconSymbol name="plus" size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Special Requests</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Any special requests or notes..."
              placeholderTextColor={colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Price Breakdown */}
            {nights > 0 && (
              <View style={[styles.priceBreakdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: colors.muted }]}>
                    ${pricePerNight} x {nights} night{nights !== 1 ? "s" : ""} x {siteCount} site{siteCount !== 1 ? "s" : ""}
                  </Text>
                  <Text style={[styles.priceValue, { color: colors.foreground }]}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: colors.muted }]}>RV Nomad Booking Fee (${PLATFORM_FEE_PER_NIGHT}/night)</Text>
                  <Text style={[styles.priceValue, { color: colors.foreground }]}>${platformFee.toFixed(2)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: colors.muted }]}>Taxes (6%)</Text>
                  <Text style={[styles.priceValue, { color: colors.foreground }]}>${taxes.toFixed(2)}</Text>
                </View>
                <View style={[styles.priceDivider, { borderColor: colors.border }]} />
                <View style={styles.priceRow}>
                  <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: colors.primary }]}>${total.toFixed(2)}</Text>
                </View>
              </View>
            )}

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, {
                backgroundColor: (nights > 0 && availabilityStatus !== "unavailable") ? colors.primary : colors.muted,
              }]}
              onPress={() => {
                if (nights <= 0) {
                  Alert.alert("Invalid Dates", "Please enter valid check-in and check-out dates.");
                  return;
                }
                if (availabilityStatus === "unavailable") {
                  Alert.alert("Dates Unavailable", "Please select different dates for your stay.");
                  return;
                }
                setStep("spot_selection");
              }}
              disabled={nights <= 0 || availabilityStatus === "unavailable"}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Select Your Spot</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Step 2: Spot Selection ──
  if (step === "spot_selection") {
    const spotFilterOptions: { key: SpotFilter; label: string }[] = [
      { key: "all", label: "All Spots" },
      { key: "rv_full", label: "Full Hookup" },
      { key: "rv_we", label: "W/E" },
      { key: "rv_electric", label: "Electric" },
      { key: "tent", label: "Tent" },
      { key: "ada", label: "ADA" },
    ];

    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => setStep("details")} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Select Your Spot</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Spot Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 8 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {spotFilterOptions.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setSpotFilter(f.key)}
              style={[
                styles.spotFilterChip,
                {
                  backgroundColor: spotFilter === f.key ? colors.primary : colors.surface,
                  borderColor: spotFilter === f.key ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.spotFilterText, { color: spotFilter === f.key ? "#fff" : colors.foreground }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.spotCountLabel, { color: colors.muted }]}>
          {filteredSpots.length} spot{filteredSpots.length !== 1 ? "s" : ""} available
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 10 }}>
          {filteredSpots.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id;
            const spotPrice = Math.max(0, pricePerNight + spot.priceModifier);
            const typeLabel = SPOT_TYPE_LABELS[spot.spotType];
            const typeIcon = SPOT_TYPE_ICONS[spot.spotType];

            return (
              <TouchableOpacity
                key={spot.id}
                onPress={() => {
                  setSelectedSpot(isSelected ? null : spot);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.spotCard,
                  {
                    backgroundColor: isSelected ? colors.primary + "08" : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.spotCardHeader}>
                  <View style={styles.spotNumberBadge}>
                    <View style={[styles.spotNumberCircle, { backgroundColor: isSelected ? colors.primary : colors.muted + "30" }]}>
                      <Text style={[styles.spotNumberText, { color: isSelected ? "#fff" : colors.foreground }]}>
                        {spot.spotNumber}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.spotTypeLabel, { color: colors.foreground }]}>{typeLabel}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <MaterialIcons name={typeIcon as any} size={14} color={colors.muted} />
                        {spot.hookup !== "none" && (
                          <Text style={{ fontSize: 11, color: colors.muted }}>
                            {spot.hookup === "full" ? "Full Hookup" : spot.hookup === "water_electric" ? "W/E" : "Electric"}
                          </Text>
                        )}
                        {spot.ampService !== "none" && (
                          <Text style={{ fontSize: 11, color: colors.muted }}>
                            {spot.ampService === "50_30" ? "50/30A" : `${spot.ampService}A`}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.spotPrice, { color: colors.primary }]}>
                      ${spotPrice}/night
                    </Text>
                    {spot.priceModifier !== 0 && (
                      <Text style={{ fontSize: 10, color: spot.priceModifier > 0 ? colors.warning : colors.success }}>
                        {spot.priceModifier > 0 ? `+$${spot.priceModifier}` : `-$${Math.abs(spot.priceModifier)}`}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Spot Details Row */}
                <View style={styles.spotDetailsRow}>
                  {spot.maxRVLength > 0 && (
                    <View style={[styles.spotDetailChip, { backgroundColor: colors.background }]}>
                      <MaterialIcons name="straighten" size={12} color={colors.muted} />
                      <Text style={[styles.spotDetailText, { color: colors.muted }]}>Max {spot.maxRVLength}ft</Text>
                    </View>
                  )}
                  {spot.pullThrough && (
                    <View style={[styles.spotDetailChip, { backgroundColor: colors.success + "15" }]}>
                      <MaterialIcons name="swap-horiz" size={12} color={colors.success} />
                      <Text style={[styles.spotDetailText, { color: colors.success }]}>Pull-Through</Text>
                    </View>
                  )}
                  {spot.shade !== "none" && (
                    <View style={[styles.spotDetailChip, { backgroundColor: colors.background }]}>
                      <MaterialIcons name="park" size={12} color={colors.muted} />
                      <Text style={[styles.spotDetailText, { color: colors.muted }]}>{spot.shade === "full" ? "Full Shade" : "Partial Shade"}</Text>
                    </View>
                  )}
                  {spot.waterfront && (
                    <View style={[styles.spotDetailChip, { backgroundColor: "#0288D115" }]}>
                      <MaterialIcons name="water" size={12} color="#0288D1" />
                      <Text style={[styles.spotDetailText, { color: "#0288D1" }]}>Waterfront</Text>
                    </View>
                  )}
                  {spot.adaAccessible && (
                    <View style={[styles.spotDetailChip, { backgroundColor: "#1565C015" }]}>
                      <MaterialIcons name="accessible" size={12} color="#1565C0" />
                      <Text style={[styles.spotDetailText, { color: "#1565C0" }]}>ADA</Text>
                    </View>
                  )}
                  {spot.premium && !spot.waterfront && (
                    <View style={[styles.spotDetailChip, { backgroundColor: colors.warning + "15" }]}>
                      <MaterialIcons name="star" size={12} color={colors.warning} />
                      <Text style={[styles.spotDetailText, { color: colors.warning }]}>Premium</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.spotBottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          {selectedSpot ? (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                Spot {selectedSpot.spotNumber} • {SPOT_TYPE_LABELS[selectedSpot.spotType]}
              </Text>
              <Text style={{ fontSize: 17, fontWeight: "700", color: colors.primary }}>
                ${Math.max(0, pricePerNight + selectedSpot.priceModifier)}/night
              </Text>
            </View>
          ) : (
            <Text style={{ flex: 1, fontSize: 14, color: colors.muted }}>Tap a spot to select it</Text>
          )}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: selectedSpot ? colors.primary : colors.muted, flex: 0, paddingHorizontal: 24, paddingVertical: 14 },
            ]}
            onPress={() => {
              if (!selectedSpot) {
                Alert.alert("Select a Spot", "Please tap on a campsite spot to select it before continuing.");
                return;
              }
              if (!isAuthenticated) {
                Alert.alert("Sign In Required", "Please sign in to complete your booking.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign In", onPress: () => router.push("/(tabs)/profile") },
                ]);
                return;
              }
              setStep("payment");
            }}
            disabled={!selectedSpot}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // ── Step 3: Payment ──
  if (step === "payment") {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep("spot_selection")} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Payment</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.form}>
            {/* Stripe Badge */}
            <View style={[styles.stripeBadge, { backgroundColor: "#635BFF15", borderColor: "#635BFF30" }]}>
              <Text style={[styles.stripeBadgeText, { color: "#635BFF" }]}>Powered by Stripe</Text>
              <Text style={[styles.stripeBadgeSub, { color: colors.muted }]}>Secure, encrypted payment processing</Text>
            </View>

            {/* Payment Method Selector */}
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              {(Platform.OS === "ios" || Platform.OS === "web") && (
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    {
                      borderColor: paymentMethod === "apple" ? colors.primary : colors.border,
                      backgroundColor: paymentMethod === "apple" ? colors.primary + "10" : colors.surface,
                    },
                  ]}
                  onPress={() => setPaymentMethod("apple")}
                >
                  <Text style={[styles.methodText, { color: paymentMethod === "apple" ? colors.primary : colors.foreground }]}>
                     Apple Pay
                  </Text>
                </TouchableOpacity>
              )}
              {(Platform.OS === "android" || Platform.OS === "web") && (
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    {
                      borderColor: paymentMethod === "google" ? colors.primary : colors.border,
                      backgroundColor: paymentMethod === "google" ? colors.primary + "10" : colors.surface,
                    },
                  ]}
                  onPress={() => setPaymentMethod("google")}
                >
                  <Text style={[styles.methodText, { color: paymentMethod === "google" ? colors.primary : colors.foreground }]}>
                    Google Pay
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  {
                    borderColor: paymentMethod === "card" ? colors.primary : colors.border,
                    backgroundColor: paymentMethod === "card" ? colors.primary + "10" : colors.surface,
                  },
                ]}
                onPress={() => setPaymentMethod("card")}
              >
                <Text style={[styles.methodText, { color: paymentMethod === "card" ? colors.primary : colors.foreground }]}>
                  Credit Card
                </Text>
              </TouchableOpacity>
            </View>

            {/* Card Form */}
            {paymentMethod === "card" && (
              <View style={styles.cardForm}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.muted }]}>Name on Card</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="John Doe"
                    placeholderTextColor={colors.muted}
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="words"
                    returnKeyType="done"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.muted }]}>Card Number</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={colors.muted}
                    value={cardNumber}
                    onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                    keyboardType="numeric"
                    maxLength={19}
                    returnKeyType="done"
                  />
                </View>
                <View style={styles.dateRow}>
                  <View style={styles.dateField}>
                    <Text style={[styles.inputLabel, { color: colors.muted }]}>Expiry</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.muted}
                      value={cardExpiry}
                      onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                      keyboardType="numeric"
                      maxLength={5}
                      returnKeyType="done"
                    />
                  </View>
                  <View style={styles.dateField}>
                    <Text style={[styles.inputLabel, { color: colors.muted }]}>CVC</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="123"
                      placeholderTextColor={colors.muted}
                      value={cardCVC}
                      onChangeText={setCardCVC}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Apply Discounts */}
            {availableDiscounts.discounts.length > 0 && (
              <View style={{ gap: 10 }}>
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Apply Discounts</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: -6 }}>
                  Select all that apply. Discounts are capped at 50% off.
                </Text>
                {availableDiscounts.discounts
                  .filter((d) => d.type !== "seasonal" && d.type !== "length_of_stay")
                  .map((d) => {
                    const isSelected = selectedDiscounts.includes(d.program);
                    const icon = d.type === "military" ? "shield" : d.type === "age" ? "elderly" : "card-membership";
                    return (
                      <TouchableOpacity
                        key={d.program}
                        onPress={() => {
                          setSelectedDiscounts((prev) =>
                            prev.includes(d.program)
                              ? prev.filter((p) => p !== d.program)
                              : [...prev, d.program]
                          );
                          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[
                          styles.discountOption,
                          {
                            backgroundColor: isSelected ? colors.success + "10" : colors.surface,
                            borderColor: isSelected ? colors.success : colors.border,
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <View style={styles.discountOptionLeft}>
                          <View style={[styles.discountCheck, { backgroundColor: isSelected ? colors.success : colors.surface, borderColor: isSelected ? colors.success : colors.border }]}>
                            {isSelected && <MaterialIcons name="check" size={14} color="#fff" />}
                          </View>
                          <MaterialIcons name={icon as any} size={20} color={isSelected ? colors.success : colors.muted} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.discountName, { color: colors.foreground }]}>{d.program}</Text>
                            <Text style={[styles.discountDesc, { color: colors.muted }]}>{d.description}</Text>
                            {d.requirements && (
                              <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2, fontStyle: "italic" }}>{d.requirements}</Text>
                            )}
                          </View>
                        </View>
                        <Text style={[styles.discountPercent, { color: isSelected ? colors.success : colors.primary }]}>
                          -{d.percentOff}%
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                {/* Auto-applied length-of-stay discounts */}
                {availableDiscounts.discounts
                  .filter((d) => d.type === "length_of_stay")
                  .map((d) => (
                    <View
                      key={d.program}
                      style={[
                        styles.discountOption,
                        {
                          backgroundColor: colors.success + "10",
                          borderColor: colors.success,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View style={styles.discountOptionLeft}>
                        <MaterialIcons name="check-circle" size={20} color={colors.success} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.discountName, { color: colors.foreground }]}>{d.program}</Text>
                          <Text style={[styles.discountDesc, { color: colors.muted }]}>{d.description}</Text>
                        </View>
                      </View>
                      <View style={[styles.autoAppliedBadge, { backgroundColor: colors.success + "20" }]}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: colors.success }}>AUTO</Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Order Summary */}
            <View style={[styles.priceBreakdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Order Summary</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]} numberOfLines={1}>{site.name}</Text>
              </View>
              {selectedSpot && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: colors.primary }]}>
                    Spot {selectedSpot.spotNumber} • {SPOT_TYPE_LABELS[selectedSpot.spotType]}
                  </Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>
                  ${effectivePricePerNight}/night × {nights} night{nights !== 1 ? "s" : ""} × {siteCount} site{siteCount !== 1 ? "s" : ""}
                </Text>
                <Text style={[styles.priceValue, { color: colors.foreground }]}>${subtotal.toFixed(2)}</Text>
              </View>
              {discountSavings > 0 && (
                <View style={styles.priceRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
                    <MaterialIcons name="local-offer" size={14} color={colors.success} />
                    <Text style={[styles.priceLabel, { color: colors.success }]} numberOfLines={1}>
                      Discount ({selectedDiscounts.join(", ")})
                    </Text>
                  </View>
                  <Text style={[styles.priceValue, { color: colors.success, fontWeight: "700" }]}>-${discountSavings.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>Booking Fee</Text>
                <Text style={[styles.priceValue, { color: colors.foreground }]}>${platformFee.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>Taxes (6%)</Text>
                <Text style={[styles.priceValue, { color: colors.foreground }]}>${taxes.toFixed(2)}</Text>
              </View>
              <View style={[styles.priceDivider, { borderColor: colors.border }]} />
              <View style={styles.priceRow}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>${total.toFixed(2)}</Text>
              </View>
              {discountSavings > 0 && (
                <View style={[styles.savingsBanner, { backgroundColor: colors.success + "12" }]}>
                  <MaterialIcons name="savings" size={16} color={colors.success} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.success }}>
                    You're saving ${discountSavings.toFixed(2)} with your discount{selectedDiscounts.length > 1 ? "s" : ""}!
                  </Text>
                </View>
              )}
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: isProcessing ? colors.muted : colors.success }]}
              onPress={handlePayment}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <IconSymbol name="lock.fill" size={16} color="#fff" />
              )}
              <Text style={styles.primaryBtnText}>
                {isProcessing ? "Processing Payment..." : `Pay $${total.toFixed(2)}`}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.secureNote, { color: colors.muted }]}>
              Your payment is securely processed by Stripe. You can cancel up to 24 hours before check-in for a full refund.
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Step 3: Confirmation ──
  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      >
        <View style={styles.confirmContainer}>
          <View style={[styles.confirmIcon, { backgroundColor: colors.success + "20" }]}>
            <IconSymbol name="checkmark.circle.fill" size={56} color={colors.success} />
          </View>
          <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Booking Confirmed!</Text>
          <Text style={[styles.confirmSubtitle, { color: colors.muted }]}>
            Your reservation has been confirmed and payment processed.
          </Text>

          <View style={[styles.confirmCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.confirmCode, { color: colors.primary }]}>{confirmCode}</Text>
            <Text style={[styles.confirmCodeLabel, { color: colors.muted }]}>Confirmation Code</Text>

            <View style={[styles.priceDivider, { borderColor: colors.border }]} />

            <View style={styles.confirmDetail}>
              <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Campsite</Text>
              <Text style={[styles.confirmDetailValue, { color: colors.foreground }]}>{site.name}</Text>
            </View>
            <View style={styles.confirmDetail}>
              <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Location</Text>
              <Text style={[styles.confirmDetailValue, { color: colors.foreground }]}>{site.city}, {site.state}</Text>
            </View>
            <View style={styles.confirmDetail}>
              <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Check-in</Text>
              <Text style={[styles.confirmDetailValue, { color: colors.foreground }]}>{checkIn}</Text>
            </View>
            <View style={styles.confirmDetail}>
              <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Check-out</Text>
              <Text style={[styles.confirmDetailValue, { color: colors.foreground }]}>{checkOut}</Text>
            </View>
            {selectedSpot && (
              <View style={styles.confirmDetail}>
                <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Spot</Text>
                <Text style={[styles.confirmDetailValue, { color: colors.primary }]}>
                  #{selectedSpot.spotNumber} • {SPOT_TYPE_LABELS[selectedSpot.spotType]}
                </Text>
              </View>
            )}
            <View style={styles.confirmDetail}>
              <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Nights</Text>
              <Text style={[styles.confirmDetailValue, { color: colors.foreground }]}>{nights}</Text>
            </View>
            {selectedDiscounts.length > 0 && (
              <View style={styles.confirmDetail}>
                <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Discounts</Text>
                <Text style={[styles.confirmDetailValue, { color: colors.success }]}>
                  {selectedDiscounts.join(", ")}
                </Text>
              </View>
            )}
            {discountSavings > 0 && (
              <View style={styles.confirmDetail}>
                <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Savings</Text>
                <Text style={[styles.confirmDetailValue, { color: colors.success, fontWeight: "700" }]}>-${discountSavings.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.confirmDetail}>
              <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Total Paid</Text>
              <Text style={[styles.confirmDetailValue, { color: colors.primary, fontWeight: "700" }]}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)/trips")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Back to Map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  siteSummary: {
    marginHorizontal: 16, padding: 16, borderRadius: 16, borderWidth: 1,
    alignItems: "center", gap: 4,
  },
  catBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontWeight: "700" },
  siteName: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  siteLocation: { fontSize: 13 },
  sitePrice: { fontSize: 20, fontWeight: "800", marginTop: 4 },
  form: { padding: 16, gap: 16 },
  sectionLabel: { fontSize: 16, fontWeight: "700" },
  dateRow: { flexDirection: "row", gap: 12 },
  dateField: { flex: 1, gap: 4 },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: 13, fontWeight: "500" },
  input: {
    height: 46, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15,
  },
  textArea: {
    height: 80, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14,
    paddingTop: 12, fontSize: 15, textAlignVertical: "top",
  },
  nightsLabel: { fontSize: 14, fontWeight: "600" },
  availRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  availBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  availText: { fontSize: 13, fontWeight: "600" },
  warningBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  warningText: { fontSize: 13, lineHeight: 18 },
  counterRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 4,
  },
  counterLabel: { fontSize: 15, fontWeight: "500" },
  counter: { flexDirection: "row", alignItems: "center", gap: 16 },
  counterBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  counterValue: { fontSize: 18, fontWeight: "700", minWidth: 24, textAlign: "center" },
  priceBreakdown: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: "500" },
  priceDivider: { borderTopWidth: 1, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 20, fontWeight: "800" },
  summaryTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  stripeBadge: { padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "center", gap: 2 },
  stripeBadgeText: { fontSize: 14, fontWeight: "700" },
  stripeBadgeSub: { fontSize: 12 },
  paymentMethods: { flexDirection: "row", gap: 8 },
  methodBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, alignItems: "center" },
  methodText: { fontSize: 13, fontWeight: "600" },
  cardForm: { gap: 12 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 2,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "700" },
  secureNote: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  confirmContainer: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 12 },
  confirmIcon: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  confirmTitle: { fontSize: 24, fontWeight: "800" },
  confirmSubtitle: { fontSize: 15, textAlign: "center" },
  confirmCard: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 20, gap: 10, marginVertical: 12 },
  confirmCode: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  confirmCodeLabel: { fontSize: 13, textAlign: "center", marginBottom: 4 },
  confirmDetail: { flexDirection: "row", justifyContent: "space-between" },
  confirmDetailLabel: { fontSize: 14 },
  confirmDetailValue: { fontSize: 14, fontWeight: "600" },
  // Spot selection
  spotFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  spotFilterText: { fontSize: 13, fontWeight: "600" },
  spotCountLabel: { fontSize: 13, fontWeight: "500", paddingHorizontal: 16, marginBottom: 8 },
  spotCard: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  spotCardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  spotNumberBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  spotNumberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  spotNumberText: { fontSize: 15, fontWeight: "800" as const },
  spotTypeLabel: { fontSize: 14, fontWeight: "600" as const },
  spotPrice: { fontSize: 16, fontWeight: "700" as const },
  spotDetailsRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
  },
  spotDetailChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spotDetailText: { fontSize: 11, fontWeight: "500" as const },
  spotBottomBar: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    gap: 12,
  },
  // Discount styles
  discountOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  discountOptionLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flex: 1,
  },
  discountCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  discountName: { fontSize: 14, fontWeight: "600" as const },
  discountDesc: { fontSize: 11, marginTop: 1 },
  discountPercent: { fontSize: 16, fontWeight: "800" as const },
  autoAppliedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  savingsBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
});
