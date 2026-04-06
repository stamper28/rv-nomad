/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Pressable, StyleSheet } from "react-native";

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const router = useRouter();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );

  const P = ({ children }: { children: React.ReactNode }) => (
    <Text style={[styles.paragraph, { color: colors.muted }]}>{children}</Text>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Privacy Policy</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy Policy</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Last updated: April 5, 2026</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Kieran Woll Creative Works LLC</Text>

        <Section title="1. Introduction">
          <P>Welcome to RV Nomad ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.</P>
          <P>By using the RV Nomad mobile application ("App"), you agree to the collection and use of information in accordance with this policy.</P>
        </Section>

        <Section title="2. Information We Collect">
          <P>We collect information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products and services, or otherwise contact us.</P>
          <P>Personal Information: Name, email address, and account credentials when you create an account.</P>
          <P>Usage Data: Information about how you use the App, including campgrounds viewed, searches performed, saved locations, and trip plans created. This data is stored locally on your device.</P>
          <P>Device Information: Device type, operating system, and unique device identifiers for app functionality and crash reporting.</P>
          <P>Location Data: With your permission, we may access your device's location to show nearby campgrounds and services. Location data is processed on-device and is not stored on our servers.</P>
        </Section>

        <Section title="3. How We Use Your Information">
          <P>We use the information we collect to:</P>
          <P>• Provide, operate, and maintain the App{"\n"}• Improve, personalize, and expand the App{"\n"}• Understand and analyze how you use the App{"\n"}• Develop new products, services, features, and functionality{"\n"}• Send you push notifications about campground cancellations and alerts (with your permission){"\n"}• Find and prevent fraud</P>
        </Section>

        <Section title="4. Data Storage">
          <P>Most of your data (saved campgrounds, preferences, trip plans, excluded campgrounds) is stored locally on your device using AsyncStorage. This means your data stays on your device and is not transmitted to our servers unless you explicitly use features that require server communication, such as AI Trip Planning.</P>
        </Section>

        <Section title="5. Third-Party Services">
          <P>Our App may contain links to third-party websites and services, including but not limited to:</P>
          <P>• Recreation.gov — for federal campground reservations{"\n"}• ReserveAmerica — for state park reservations{"\n"}• KOA.com — for KOA campground reservations{"\n"}• Campspot — for private RV park reservations{"\n"}• Google Maps — for directions and navigation{"\n"}• Amazon — for camping gear purchases</P>
          <P>These third-party services have their own privacy policies. We are not responsible for the privacy practices of these external sites and encourage you to read their privacy policies.</P>
        </Section>

        <Section title="6. Affiliate Disclosure">
          <P>RV Nomad participates in affiliate programs, which means we may earn a commission when you make a reservation or purchase through links in our App. This does not affect the price you pay. Affiliate partners include Recreation.gov, KOA, Good Sam, Amazon Associates, and others.</P>
        </Section>

        <Section title="7. Children's Privacy">
          <P>Our App is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</P>
        </Section>

        <Section title="8. Your Privacy Rights">
          <P>Depending on your location, you may have the following rights:</P>
          <P>• The right to access your personal data{"\n"}• The right to request correction of your personal data{"\n"}• The right to request deletion of your personal data{"\n"}• The right to opt out of marketing communications{"\n"}• The right to data portability</P>
          <P>To exercise any of these rights, please contact us at the email address below.</P>
        </Section>

        <Section title="9. Data Security">
          <P>We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</P>
        </Section>

        <Section title="10. Changes to This Policy">
          <P>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the App and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</P>
        </Section>

        <Section title="11. Contact Us">
          <P>If you have any questions about this Privacy Policy, please contact us:</P>
          <P>Kieran Woll Creative Works LLC{"\n"}Email: privacy@rvnomadapp.com{"\n"}Website: https://rvnomadapp.com</P>
        </Section>

        <View style={{ height: 60 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backBtn: { width: 70 },
  backText: { fontSize: 16, fontWeight: "600" },
  headerTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 4 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  paragraph: { fontSize: 14, lineHeight: 22, marginBottom: 8 },
});
