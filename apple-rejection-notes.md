# Apple App Store Rejection Notes — April 13, 2026

## Review Environment
- Submission ID: 4a8e220b-4f81-4f99-ab4d-c0b5a3824a4d
- Review date: April 13, 2026
- Review Device: iPad Air 11-inch (M3)
- OS: iPadOS 26.4
- Version reviewed: 1.0
- Build: 10012 (version 1.0.5)

## Rejection Reasons (7 total across 2 reviews)

### 1. Guideline 2.3.10 — Accurate Metadata (Google Play references)
- "The app or metadata includes information about third-party platforms that may not be relevant for App Store users"
- **Next Steps**: "Revise the app's binary to remove Google Play references"
- ACTION: Search entire codebase for "Google Play", "Play Store", "Android" references visible to users

### 2. Guideline 2.2 — Beta Testing
- "Your app is designed to demonstrate the app concept to potential customers"
- "Apps designed only to demonstrate, showcase, or upsell an app concept or service are not appropriate"
- ACTION: Make sure the app feels like a complete, production-ready app, not a demo

### 3. Guideline 2.5.4 — Software Requirements (Background Audio)
- "The app declares support for audio in the UIBackgroundModes key in your Info.plist but we are unable to locate any features that require persistent audio"
- ACTION: Remove expo-audio and expo-video background playback plugins from app.config.ts

### 4. Guideline 2.1(b) — App Completeness (IAP not submitted)
- "one or more of the In-App Purchase products have not been submitted for review"
- "the app includes references to subscriptions but the associated In-App Purchase products have not been submitted for review"
- ACTION (App Store Connect): Submit IAP products with the app, accept Paid Apps Agreement

### 5. Guideline 2.1(b) — App Completeness (IAP bugs)
- "The In-App Purchase products in the app exhibited one or more bugs which create a poor user experience"
- "error message displayed when we attempted to subscribe membership"
- Tested on iPad Air 11-inch (M3), iPadOS 26.4
- ACTION: Fix subscription purchase flow error handling

### 6. Guideline 2.3.6 — Accurate Metadata (Age Rating)
- "The content description selected for the app's Age Rating indicates that the app includes In-App Controls"
- "we were unable to find either Parental Controls or Age Assurance mechanisms in the app"
- ACTION (App Store Connect): Set "Parental Controls" and "Age Assurance" to "None" in Age Rating

### 7. Guideline 5.1.2(i) — Privacy - Data Use and Sharing
- "The app privacy information provided in App Store Connect indicates the app collects data in order to track the user, including Precise Location"
- "the app does not use App Tracking Transparency to request the user's permission before tracking their activity"
- ACTION (App Store Connect): Update App Privacy to indicate app does NOT track users. Location is for functionality only.

## Premium Subscription Screen (from screenshot)
- Price: $49.99/year ($4.17/mo)
- 7-Day Free Trial
- Features listed: Interactive Map, Search Campgrounds, View 5 States (free), All 50 States (premium), Save 10 Favorites (free), Unlimited Favorites (premium), Trip Planner, Book Campsites, Offline Maps, RV Tools, Weather Forecasts, Community Access, RV Buying Guide, Weight Scale Finder, Discount Finder, Ad-Free Experience
