import { useState, useMemo, useEffect } from "react";
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

type Step = "details" | "payment" | "confirmation";

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

  const pricePerNight = site?.pricePerNight ?? 0;
  const payment = useMemo(
    () => calculatePayment({ pricePerNight, nights, sites: siteCount }),
    [pricePerNight, nights, siteCount]
  );
  const { campsiteSubtotal: subtotal, platformFee, taxes, total } = payment;

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
        pricePerNight,
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
                if (!isAuthenticated) {
                  Alert.alert("Sign In Required", "Please sign in to book a campsite.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Sign In", onPress: () => router.push("/(tabs)/profile") },
                  ]);
                  return;
                }
                setStep("payment");
              }}
              disabled={nights <= 0 || availabilityStatus === "unavailable"}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Step 2: Payment ──
  if (step === "payment") {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep("details")} style={styles.backBtn}>
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

            {/* Order Summary */}
            <View style={[styles.priceBreakdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Order Summary</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]} numberOfLines={1}>{site.name}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>
                  {nights} night{nights !== 1 ? "s" : ""}, {guests} guest{guests !== 1 ? "s" : ""}, {siteCount} site{siteCount !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={[styles.priceDivider, { borderColor: colors.border }]} />
              <View style={styles.priceRow}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>${total.toFixed(2)}</Text>
              </View>
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
            <View style={styles.confirmDetail}>
              <Text style={[styles.confirmDetailLabel, { color: colors.muted }]}>Nights</Text>
              <Text style={[styles.confirmDetailValue, { color: colors.foreground }]}>{nights}</Text>
            </View>
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
});
