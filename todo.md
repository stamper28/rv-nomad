# RV Nomad - Project TODO

## Completed (v1.0)
- [x] Configure theme colors (forest green brand palette)
- [x] Generate app logo and configure branding in app.config.ts
- [x] Add icon mappings for all tabs in icon-symbol.tsx
- [x] Install react-native-maps and expo-location
- [x] Build interactive Map screen (full-screen map with markers)
- [x] Add floating search bar on map
- [x] Add "Locate Me" button on map
- [x] Add campground marker pins with sample data
- [x] Add campground preview card on marker tap
- [x] Add map filter chips

## Navigation Restructure
- [x] Restructure to 5 tabs: Home (Map), Explore, Trips, Saved, Profile
- [x] Update icon mappings for new tab structure

## Data & State Directory
- [x] Build comprehensive campsite data for all 50 states
- [x] Add boondocking/BLM sites per state
- [x] Add Military FamCamps data
- [x] Add Harvest Hosts data
- [x] Add Walmart/Cracker Barrel overnight parking data
- [x] Add dump station data
- [x] Add discount info (Passport America, Good Sam, Military)

## Map Screen (Home)
- [x] Add dump station map layer toggle
- [x] Add Walmart/Cracker Barrel overnight layer
- [ ] Show weather info on campground preview cards
- [ ] RV-safe route warnings (height/weight/length alerts)

## Explore Screen
- [x] Category sections with horizontal card scrolling (like reference screenshots)
- [x] State Parks section
- [x] Free Camping / Boondocking section
- [x] Military FamCamps section
- [x] Harvest Hosts section
- [x] State-by-state directory browser
- [x] RV Buying Guide promo card

## Trips Screen
- [ ] Trip planner with stops (keep existing, enhance)
- [ ] Fuel Cost Calculator per trip
- [ ] Route overview with RV dimension warnings

## Saved Screen
- [x] Save/favorite campgrounds
- [x] Organize saved spots by category or state
- [x] Quick access to saved campground details

## Profile Screen
- [x] My RV card (nickname, type, year/make/model, dimensions)
- [x] Stats tabs: Spots Visited, Reviews, Miles
- [x] Settings: Distance units toggle
- [x] Rate RV Nomad link
- [x] Contact Support link
- [x] About RV Nomad
- [x] Privacy Policy page
- [x] Terms of Service page
- [x] Pricing display: $39.99/yr or $5.99/mo

## Utility Features
- [x] Maintenance Log with reminders
- [x] Packing/Inventory Tracker
- [x] Checklists (pre-departure, arrival, winterization)

## Community & Reviews
- [x] Community Feed / Forum UI
- [x] Campground Reviews & Photos UI
- [x] User-submitted review form

## Weather & Alerts
- [x] Weather display per campground (placeholder for API)
- [x] Severe weather warning UI

## Monetization & Premium
- [x] Premium/Free tier gating structure
- [x] Subscription UI ($39.99/yr or $5.99/mo)
- [x] Offline download UI for premium users
- [x] RV Gear recommendations section (affiliate-ready)
- [x] Campground booking placeholder (affiliate-ready)

## State Laws & Restrictions
- [x] RV parking laws per state
- [x] Boondocking legality per state
- [x] Overnight parking rules per state
- [x] Length/weight/height restrictions per state
- [x] Propane tunnel restrictions per state
- [x] State laws detail screen accessible from state directory

## Trip Planner (Enhanced)
- [x] Create new trips with name, start/end dates
- [x] Add stops from campsite database to trips
- [x] Reorder trip stops
- [x] Remove stops from trips
- [x] Track number of nights per stop
- [x] Add notes to trips
- [x] View trip history (past trips)
- [x] Edit existing trips
- [x] Delete trips
- [x] Trip summary (total nights, total cost estimate, total miles)

## Booking & Payment
- [x] Book Now button on site detail screen
- [x] Booking flow: date selection, nights, guests
- [x] Payment form UI (card number, expiry, CVC)
- [x] Booking confirmation screen
- [x] My Bookings section in Trips tab
- [x] View/cancel existing bookings
- [x] Booking history with status (upcoming, completed, cancelled)

## Booking Fee & Stripe Integration
- [x] Add $2.00/night RV Nomad Booking Fee to price breakdown
- [x] Set up Stripe integration hooks (ready for Stripe account connection)
- [x] Stripe payment intent creation placeholder
- [x] Stripe Connect payout split logic placeholder

## RV Buying Guide
- [x] Best RVs to buy by class (A, B, C, Travel Trailer, Fifth Wheel)
- [x] Worst RVs to avoid by class
- [x] Expert ratings, pros/cons, price ranges
- [x] Link from Explore screen RV Buying Guide promo card

## Monthly RV Buying Guide Updates
- [x] Move guide data to server-fetchable JSON endpoint
- [x] Add "Last Updated" timestamp to guide screen
- [x] Add pull-to-refresh on guide screen
- [x] Cache guide data locally with AsyncStorage fallback
- [x] Set up monthly scheduled task to refresh guide data

## Weight Scale Locations
- [x] Add CAT Scale and public weigh station data per state
- [x] Weight scale map layer toggle on interactive map
- [x] Weight scale detail cards (address, hours, cost, type)

## Bugs
- [x] App won't download and open due to a bug (fixed: lazy-loaded all large data imports to prevent Expo Go crash)
- [x] Published APK crashes on launch on Android device (fixed: disabled newArch, added maps config plugin, error boundary, try-catch on map load)
- [x] APK build fails: react-native-maps has no config plugin (fixed: replaced react-native-maps with expo-maps, removed broken plugin from app.config.ts)
- [x] APK still crashes on launch after switching to expo-maps (fixed: removed ALL native map libraries, replaced home screen with list-based campground finder, tap opens in Google Maps/Apple Maps)
