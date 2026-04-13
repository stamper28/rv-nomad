# RV Nomad — Apple App Store Resubmission Guide

**Date:** April 13, 2026
**Build:** 1.0.5 (Build 10012)
**Submission ID:** 4a8e220b-4f81-4f99-ab4d-c0b5a3824a4d

This guide covers every rejection issue from Apple's review, what has already been fixed in the code, and what you need to do manually in App Store Connect before resubmitting.

---

## Summary of All 7 Issues

| # | Guideline | Issue | Fixed In | Status |
|---|-----------|-------|----------|--------|
| 1 | 2.3.10 | Google Play references in app binary | Code | **Done** |
| 2 | 2.5.4 | Unused background audio permission | Code | **Done** |
| 3 | 2.2 | App appears like a beta/demo | Code | **Done** |
| 4 | 2.1(b) | IAP subscription shows error on purchase | Code | **Done** |
| 5 | 2.1(b) | IAP products not submitted for review | App Store Connect | **You must do** |
| 6 | 2.3.6 | Age Rating includes "In-App Controls" | App Store Connect | **You must do** |
| 7 | 5.1.2(i) | Privacy labels say app tracks users | App Store Connect | **You must do** |

---

## Code Fixes Already Applied

The following changes have been made in this build. You do not need to do anything for these; they will take effect when you build and submit the new binary.

### 1. Google Play References Removed (Guideline 2.3.10)

The legal text on the Premium subscription screen previously included platform-conditional references to "Google Play" and "Google Play Store." Even though the text was only shown on Android, Apple's automated scanner detected it in the compiled binary. The legal text now reads generically:

> "Payment will be charged to your App Store account at confirmation of purchase..."

All developer comments referencing Google Play in `lib/iap-service.ts` have also been cleaned up.

### 2. Background Audio Permission Removed (Guideline 2.5.4)

The `expo-audio` and `expo-video` plugins were declared in `app.config.ts`, which caused `UIBackgroundModes: audio` to be added to the iOS Info.plist. Since RV Nomad does not use audio playback or video features, both plugins have been removed entirely. This eliminates the background audio entitlement from the build.

### 3. Beta/Demo Appearance Fixed (Guideline 2.2)

Several screens had placeholder behaviors that could make the app appear unfinished:

- **"Who's Here" screen:** The "Create a Meetup" button previously showed "Meetup creation form coming soon!" — this has been replaced with a functional meetup type selector that confirms creation.
- **Profile "Rate" button:** Previously showed a generic alert saying "Rating will open the app store." Now uses `expo-store-review` to trigger the native iOS review prompt, with a fallback that opens the App Store review page directly.
- **Cancellation Scanner:** The "Book Now" button on found openings previously showed a dead-end alert. It now opens Recreation.gov with a search for the campground, matching the behavior of the other booking buttons.

### 4. IAP Error Handling Improved (Guideline 2.1(b))

The subscription purchase flow now handles specific error scenarios with clear, user-friendly messages instead of generic errors:

| Error Scenario | Message Shown |
|----------------|---------------|
| Store not connected | "Unable to connect to the App Store. Please check your internet connection and try again." |
| Product unavailable | "This subscription is temporarily unavailable. Please try again later or contact support." |
| Purchases not allowed | "Purchases are not allowed on this device. Please check your device settings." |
| Deferred (Ask to Buy) | "Your purchase requires approval. You will be notified when it is approved." |
| User cancelled | No message (silent dismiss) |
| Unknown error | "We were unable to process your subscription. Please ensure you are signed into your Apple ID and try again." |

---

## What You Must Do in App Store Connect

These three issues cannot be fixed in code. You need to make changes in [App Store Connect](https://appstoreconnect.apple.com) before resubmitting.

### 5. Submit IAP Products for Review (Guideline 2.1(b))

This is likely the **most critical issue** — Apple's reviewer tried to subscribe and got an error because the In-App Purchase products were not submitted alongside the app.

**Steps:**

1. Go to **App Store Connect** and open your app (RV Nomad).
2. Navigate to **Monetization** (left sidebar) then **Subscriptions**.
3. You should have a subscription group called **"RV Nomad Premium"** with two products:
   - `rvnomad_premium_monthly` — $5.99/month
   - `rvnomad_premium_yearly` — $49.99/year
4. If these products do not exist yet, create them now:
   - Click **+** to create a new subscription group named "RV Nomad Premium"
   - Add each subscription with the product IDs above, set pricing, and add a description and screenshot
5. For each subscription product, ensure the status is **"Ready to Submit"** (not "Missing Metadata" or "Developer Action Needed").
6. Each product needs: a **Reference Name**, **Subscription Duration**, **Subscription Price**, **Localization** (display name + description), and a **Review Screenshot**.
7. Also verify that the **Paid Applications Agreement** is accepted under **Agreements, Tax, and Banking**.
8. When you submit the new app version, make sure to **include the IAP products** in the submission. App Store Connect should prompt you to select them.

### 6. Fix Age Rating (Guideline 2.3.6)

Apple found that your Age Rating questionnaire indicates the app includes "In-App Controls" (Parental Controls or Age Assurance), but the app does not actually have these features.

**Steps:**

1. In App Store Connect, go to your app and click **App Information** in the left sidebar.
2. Scroll down to **Age Rating** and click **Edit**.
3. Find the questions about **"Parental Controls"** and **"Age Assurance"** mechanisms.
4. Set both to **"None"** (or uncheck them).
5. Save your changes.

### 7. Fix Privacy Labels (Guideline 5.1.2(i))

Your App Privacy information currently states that the app collects **Precise Location** data for the purpose of **tracking users**. RV Nomad uses location to find nearby campgrounds and show weather — this is **app functionality**, not tracking.

**Steps:**

1. In App Store Connect, go to your app and click **App Privacy** in the left sidebar.
2. Click **Edit** next to your privacy responses.
3. For **Location** data:
   - **Purpose:** Change from "Tracking" to **"App Functionality"** (or "Analytics" if you also use it for analytics).
   - If asked "Do you or your third-party partners use this data for tracking?", select **"No"**.
4. Review all other data types and ensure none are marked as used for "Tracking" unless you actually use App Tracking Transparency (ATT).
5. Save your changes.

> **Note:** If you do want to track users in the future (for advertising attribution, etc.), you would need to implement the App Tracking Transparency framework and request permission. For now, since RV Nomad only uses location for finding campgrounds and weather, "App Functionality" is the correct purpose.

---

## Resubmission Checklist

Before you submit the new build, verify each item:

| Step | Action | Done? |
|------|--------|-------|
| 1 | Build new binary from the updated code (Publish button in Manus) | |
| 2 | IAP subscription products created and in "Ready to Submit" status | |
| 3 | Paid Applications Agreement accepted in App Store Connect | |
| 4 | Age Rating: "Parental Controls" and "Age Assurance" set to "None" | |
| 5 | App Privacy: Location purpose changed from "Tracking" to "App Functionality" | |
| 6 | App Privacy: "Do you track users?" set to "No" | |
| 7 | Upload new build to App Store Connect | |
| 8 | Select IAP products to include with submission | |
| 9 | Submit for review | |

---

## Optional: Add a Review Note

When resubmitting, you can add a note to the reviewer in the **App Review Information** section. A suggested note:

> "This resubmission addresses all 7 issues from the previous review. Code changes: removed Google Play references from binary, removed unused background audio permission, fixed all placeholder/demo behaviors, and improved IAP error handling. App Store Connect changes: IAP subscription products are now submitted for review, Age Rating corrected (no In-App Controls), and App Privacy updated to reflect that location is used for app functionality only, not tracking."

This helps the reviewer understand what changed and speeds up the review process.
