/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useMemo, useState, useCallback } from "react";
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet, Alert, RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface CheckedInUser {
  id: string;
  username: string;
  rig: string;
  rigType: string;
  spotNumber: string;
  checkedInDate: string;
  stayingUntil: string;
  isOpenToMeetup: boolean;
  interests: string[];
  avatar: string; // emoji
}

interface UpcomingMeetup {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  host: string;
  attendees: number;
  maxAttendees: number;
  description: string;
  type: "potluck" | "campfire" | "hike" | "happy_hour" | "kids" | "pet";
}

// Simulated check-in data
const CHECKED_IN_USERS: CheckedInUser[] = [
  { id: "u1", username: "DesertNomad_Rick", rig: "2022 Winnebago View 24D", rigType: "Class C", spotNumber: "A12", checkedInDate: "04-03-2026", stayingUntil: "04-08-2026", isOpenToMeetup: true, interests: ["hiking", "photography", "happy hour"], avatar: "🤠" },
  { id: "u2", username: "PineTreeSally", rig: "2023 Airstream Classic 33FB", rigType: "Travel Trailer", spotNumber: "B7", checkedInDate: "04-02-2026", stayingUntil: "04-10-2026", isOpenToMeetup: true, interests: ["birding", "yoga", "cooking"], avatar: "🌲" },
  { id: "u3", username: "BigRigBob", rig: "2021 Tiffin Allegro Bus 45OPP", rigType: "Class A", spotNumber: "C3", checkedInDate: "04-04-2026", stayingUntil: "04-06-2026", isOpenToMeetup: false, interests: ["fishing", "grilling"], avatar: "🚐" },
  { id: "u4", username: "AdventureFam_Jones", rig: "2024 Grand Design Imagine 2910BH", rigType: "Travel Trailer", spotNumber: "D15", checkedInDate: "04-01-2026", stayingUntil: "04-07-2026", isOpenToMeetup: true, interests: ["kids activities", "hiking", "s'mores"], avatar: "👨‍👩‍👧‍👦" },
  { id: "u5", username: "RetiredRoamers", rig: "2020 Newmar Dutch Star 4369", rigType: "Class A", spotNumber: "A5", checkedInDate: "04-03-2026", stayingUntil: "04-15-2026", isOpenToMeetup: true, interests: ["happy hour", "cards", "history"], avatar: "🎉" },
  { id: "u6", username: "VanLifeVicky", rig: "2023 Storyteller Overland Mode 4x4", rigType: "Class B", spotNumber: "E2", checkedInDate: "04-04-2026", stayingUntil: "04-05-2026", isOpenToMeetup: true, interests: ["climbing", "photography", "coffee"], avatar: "📸" },
  { id: "u7", username: "DogsOnWheels", rig: "2022 Jayco Jay Flight 264BH", rigType: "Travel Trailer", spotNumber: "B11", checkedInDate: "04-02-2026", stayingUntil: "04-09-2026", isOpenToMeetup: true, interests: ["dog walks", "hiking", "campfires"], avatar: "🐕" },
];

const MEETUPS: UpcomingMeetup[] = [
  { id: "m1", title: "Friday Happy Hour", date: "04-05-2026", time: "5:00 PM", location: "Pavilion by the lake", host: "RetiredRoamers", attendees: 8, maxAttendees: 20, description: "BYOB happy hour at the pavilion. Bring a chair and your favorite drink. Meet your neighbors!", type: "happy_hour" },
  { id: "m2", title: "Saturday Morning Group Hike", date: "04-06-2026", time: "8:00 AM", location: "Trailhead parking lot", host: "DesertNomad_Rick", attendees: 5, maxAttendees: 12, description: "Moderate 4-mile loop trail. Bring water and snacks. Dogs welcome on leash.", type: "hike" },
  { id: "m3", title: "Community Potluck Dinner", date: "04-06-2026", time: "6:00 PM", location: "Group fire ring", host: "PineTreeSally", attendees: 12, maxAttendees: 25, description: "Bring a dish to share! Main course, side, or dessert. Paper plates and utensils provided.", type: "potluck" },
  { id: "m4", title: "Kids Craft & S'mores", date: "04-05-2026", time: "3:00 PM", location: "Playground area", host: "AdventureFam_Jones", attendees: 6, maxAttendees: 15, description: "Nature crafts for kids followed by s'mores around the fire. All ages welcome!", type: "kids" },
  { id: "m5", title: "Dog Playdate", date: "04-07-2026", time: "10:00 AM", location: "Open field by site D", host: "DogsOnWheels", attendees: 4, maxAttendees: 10, description: "Bring your pup for off-leash play in the open field. Treats provided!", type: "pet" },
];

const MEETUP_ICONS: Record<string, string> = {
  potluck: "restaurant",
  campfire: "local-fire-department",
  hike: "terrain",
  happy_hour: "local-bar",
  kids: "child-care",
  pet: "pets",
};

const MEETUP_COLORS: Record<string, string> = {
  potluck: "#E65100",
  campfire: "#BF360C",
  hike: "#1B5E20",
  happy_hour: "#6A1B9A",
  kids: "#1565C0",
  pet: "#8D6E63",
};

export default function WhosHereScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [tab, setTab] = useState<"people" | "meetups">("people");
  const [refreshing, setRefreshing] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const campgroundName = (params.name as string) || "This Campground";

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleCheckIn = () => {
    setCheckedIn(true);
    Alert.alert("Checked In!", `You're now visible to other RV Nomad members at ${campgroundName}. Happy camping!`);
  };

  const handleJoinMeetup = (meetup: UpcomingMeetup) => {
    Alert.alert("Joined!", `You've joined "${meetup.title}". See you ${meetup.date} at ${meetup.time}!`);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Who's Here</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]} numberOfLines={1}>{campgroundName}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Check-in Banner */}
      {!checkedIn ? (
        <TouchableOpacity
          onPress={handleCheckIn}
          style={[styles.checkinBanner, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-location-alt" size={24} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.checkinTitle}>Check In Here</Text>
            <Text style={styles.checkinSubtitle}>Let other RVers know you're at this campground</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={[styles.checkinBanner, { backgroundColor: colors.success }]}>
          <MaterialIcons name="check-circle" size={24} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.checkinTitle}>You're Checked In!</Text>
            <Text style={styles.checkinSubtitle}>Other members can see you're here</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab("people")}
          style={[styles.tab, { borderBottomColor: tab === "people" ? colors.primary : "transparent" }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="group" size={20} color={tab === "people" ? colors.primary : colors.muted} />
          <Text style={[styles.tabText, { color: tab === "people" ? colors.primary : colors.muted }]}>
            People ({CHECKED_IN_USERS.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("meetups")}
          style={[styles.tab, { borderBottomColor: tab === "meetups" ? colors.primary : "transparent" }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="event" size={20} color={tab === "meetups" ? colors.primary : colors.muted} />
          <Text style={[styles.tabText, { color: tab === "meetups" ? colors.primary : colors.muted }]}>
            Meetups ({MEETUPS.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {tab === "people" ? (
          <>
            {CHECKED_IN_USERS.map((user) => (
              <View key={user.id} style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.userHeader}>
                  <Text style={styles.avatar}>{user.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.username, { color: colors.foreground }]}>{user.username}</Text>
                      {user.isOpenToMeetup && (
                        <View style={[styles.openBadge, { backgroundColor: colors.success + "15" }]}>
                          <Text style={[styles.openText, { color: colors.success }]}>Open to Meetup</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.userRig, { color: colors.muted }]}>{user.rig}</Text>
                    <Text style={[styles.userSpot, { color: colors.primary }]}>Site {user.spotNumber} • {user.rigType}</Text>
                  </View>
                </View>
                <View style={styles.stayInfo}>
                  <MaterialIcons name="date-range" size={14} color={colors.muted} />
                  <Text style={[styles.stayText, { color: colors.muted }]}>{user.checkedInDate} — {user.stayingUntil}</Text>
                </View>
                <View style={styles.interestsRow}>
                  {user.interests.map((interest, i) => (
                    <View key={i} style={[styles.interestChip, { backgroundColor: colors.primary + "10" }]}>
                      <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
                    </View>
                  ))}
                </View>
                {user.isOpenToMeetup && (
                  <TouchableOpacity
                    style={[styles.waveBtn, { borderColor: colors.primary }]}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert("Wave Sent!", `You waved at ${user.username}. They'll get a notification!`)}
                  >
                    <Text style={[styles.waveBtnText, { color: colors.primary }]}>👋 Wave Hello</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        ) : (
          <>
            {/* Create Meetup Button */}
            <TouchableOpacity
              style={[styles.createMeetupBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => Alert.alert(
                "Create a Meetup",
                "What type of meetup would you like to host?",
                [
                  { text: "Happy Hour", onPress: () => Alert.alert("Meetup Created!", "Your Happy Hour meetup has been posted. Other campers at this campground will be notified!") },
                  { text: "Group Hike", onPress: () => Alert.alert("Meetup Created!", "Your Group Hike meetup has been posted. Other campers at this campground will be notified!") },
                  { text: "Potluck Dinner", onPress: () => Alert.alert("Meetup Created!", "Your Potluck Dinner meetup has been posted. Other campers at this campground will be notified!") },
                  { text: "Cancel", style: "cancel" },
                ]
              )}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.createMeetupText}>Create a Meetup</Text>
            </TouchableOpacity>

            {MEETUPS.map((meetup) => {
              const iconName = MEETUP_ICONS[meetup.type] || "event";
              const meetupColor = MEETUP_COLORS[meetup.type] || colors.primary;
              const spotsLeft = meetup.maxAttendees - meetup.attendees;
              return (
                <View key={meetup.id} style={[styles.meetupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.meetupHeader}>
                    <View style={[styles.meetupIcon, { backgroundColor: meetupColor + "15" }]}>
                      <MaterialIcons name={iconName as any} size={24} color={meetupColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.meetupTitle, { color: colors.foreground }]}>{meetup.title}</Text>
                      <Text style={[styles.meetupHost, { color: colors.muted }]}>Hosted by {meetup.host}</Text>
                    </View>
                  </View>
                  <View style={styles.meetupDetails}>
                    <View style={styles.meetupDetail}>
                      <MaterialIcons name="event" size={14} color={colors.muted} />
                      <Text style={[styles.meetupDetailText, { color: colors.foreground }]}>{meetup.date}</Text>
                    </View>
                    <View style={styles.meetupDetail}>
                      <MaterialIcons name="schedule" size={14} color={colors.muted} />
                      <Text style={[styles.meetupDetailText, { color: colors.foreground }]}>{meetup.time}</Text>
                    </View>
                    <View style={styles.meetupDetail}>
                      <MaterialIcons name="place" size={14} color={colors.muted} />
                      <Text style={[styles.meetupDetailText, { color: colors.foreground }]}>{meetup.location}</Text>
                    </View>
                  </View>
                  <Text style={[styles.meetupDesc, { color: colors.muted }]}>{meetup.description}</Text>
                  <View style={styles.meetupFooter}>
                    <View style={styles.attendeeInfo}>
                      <MaterialIcons name="group" size={16} color={colors.muted} />
                      <Text style={[styles.attendeeText, { color: colors.foreground }]}>
                        {meetup.attendees}/{meetup.maxAttendees}
                      </Text>
                      <Text style={[styles.spotsLeft, { color: spotsLeft < 5 ? colors.warning : colors.success }]}>
                        ({spotsLeft} spots left)
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleJoinMeetup(meetup)}
                      style={[styles.joinBtn, { backgroundColor: meetupColor }]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.joinBtnText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 11, marginTop: 1 },
  checkinBanner: { marginHorizontal: 16, padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  checkinTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  checkinSubtitle: { fontSize: 11, color: "#fff", opacity: 0.9 },
  tabRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 12 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 10, borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontWeight: "600" },
  userCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 8 },
  userHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  avatar: { fontSize: 32 },
  username: { fontSize: 15, fontWeight: "700" },
  userRig: { fontSize: 12, marginTop: 2 },
  userSpot: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  openBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  openText: { fontSize: 9, fontWeight: "700" },
  stayInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  stayText: { fontSize: 11 },
  interestsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  interestChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  interestText: { fontSize: 10, fontWeight: "500" },
  waveBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  waveBtnText: { fontSize: 13, fontWeight: "600" },
  createMeetupBtn: { marginHorizontal: 16, padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  createMeetupText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  meetupCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 10 },
  meetupHeader: { flexDirection: "row", gap: 10, alignItems: "center" },
  meetupIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  meetupTitle: { fontSize: 15, fontWeight: "700" },
  meetupHost: { fontSize: 11, marginTop: 2 },
  meetupDetails: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  meetupDetail: { flexDirection: "row", alignItems: "center", gap: 4 },
  meetupDetailText: { fontSize: 12 },
  meetupDesc: { fontSize: 12, lineHeight: 17 },
  meetupFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  attendeeInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  attendeeText: { fontSize: 12, fontWeight: "600" },
  spotsLeft: { fontSize: 11 },
  joinBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  joinBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});
