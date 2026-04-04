# RV Nomad - Mobile App Interface Design

## Overview

RV Nomad is a comprehensive RV lifestyle companion app designed for full-time and part-time RV travelers. The interactive map is the centerpiece of the app, displaying immediately on launch. The app follows Apple Human Interface Guidelines for a native iOS feel, designed for one-handed portrait use.

---

## Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| primary | #2E7D32 | #66BB6A | Forest green — nature/outdoors brand |
| background | #FAFAFA | #121212 | Screen backgrounds |
| surface | #FFFFFF | #1E1E1E | Cards, sheets, elevated surfaces |
| foreground | #1B1B1B | #E8E8E8 | Primary text |
| muted | #6B7280 | #9CA3AF | Secondary text, labels |
| border | #E0E0E0 | #333333 | Dividers, card borders |
| success | #43A047 | #66BB6A | Positive states |
| warning | #FB8C00 | #FFA726 | Caution states |
| error | #E53935 | #EF5350 | Error states |
| accent | #1565C0 | #42A5F5 | Water/lake features, links |

---

## Screen List

### 1. Map (Home / Tab 1) — Primary Screen
- **Content**: Full-screen interactive map with campground/RV park markers
- **Functionality**:
  - Map fills entire screen below status bar
  - Floating search bar at top for searching locations
  - Cluster markers for nearby campgrounds
  - Tap marker to see campground preview card (name, rating, price, amenities icons)
  - "Locate Me" floating button (bottom-right) to center on user location
  - Filter button (bottom-left) to filter by: Free camping, RV parks, National parks, State parks, Rest areas
  - Map type toggle (standard / satellite / terrain)

### 2. Explore (Tab 2)
- **Content**: Scrollable list/grid of nearby campgrounds and RV parks
- **Functionality**:
  - Search bar at top
  - Category chips: All, Free, National Parks, State Parks, RV Parks, Rest Areas
  - Card-based list with: photo placeholder, name, distance, rating stars, price range, key amenities icons
  - Pull-to-refresh
  - Tap card to see detail

### 3. Trips (Tab 3)
- **Content**: Trip planning and saved trips
- **Functionality**:
  - "New Trip" button at top
  - List of saved trips with: trip name, date range, number of stops, total miles
  - Tap trip to see route overview with stops on a mini-map
  - Add/remove/reorder stops
  - Each stop shows: campground name, dates, notes

### 4. Checklists (Tab 4)
- **Content**: Pre-departure and maintenance checklists
- **Functionality**:
  - Pre-built checklists: Pre-Departure, Arrival Setup, Departure Teardown, Maintenance
  - Custom checklist creation
  - Checkbox items with swipe-to-delete
  - Progress bar per checklist
  - Reset checklist button

### 5. Settings (Tab 5)
- **Content**: App preferences and profile
- **Functionality**:
  - RV Profile: RV type, length, height, weight (for route planning)
  - Map preferences: Default map type, default zoom
  - Units: Miles/Kilometers
  - Dark mode toggle
  - About section

---

## Key User Flows

### Flow 1: Find a Campground
1. App opens → Map screen with user location centered
2. User pans/zooms map or uses search bar
3. Campground markers appear as clusters/pins
4. User taps a marker → Preview card slides up from bottom
5. User taps preview card → Full detail view (modal)
6. User can save to favorites or add to a trip

### Flow 2: Plan a Trip
1. User taps Trips tab → Sees saved trips
2. Taps "New Trip" → Enter trip name, start date, end date
3. Taps "Add Stop" → Opens map picker or search
4. Selects campground → Added as a stop
5. Reorder stops by drag handle
6. View route overview on mini-map

### Flow 3: Pre-Departure Check
1. User taps Checklists tab
2. Selects "Pre-Departure" checklist
3. Checks off items one by one
4. Progress bar fills as items complete
5. All done → Success haptic + completion message
6. Can reset for next departure

---

## Navigation Structure

- **Tab Bar** (5 tabs): Map | Explore | Trips | Checklists | Settings
- Map tab uses a map icon (map.fill)
- Explore tab uses a compass icon (safari.fill)  
- Trips tab uses a route icon (point.topleft.down.to.point.bottomright.curvepath.fill)
- Checklists tab uses a checklist icon (checklist)
- Settings tab uses a gear icon (gearshape.fill)

---

## Layout Principles

- Map screen: Edge-to-edge map, floating UI elements over map
- All other screens: Standard iOS list/card layouts with ScreenContainer
- Bottom sheet pattern for campground details on map
- Cards have 12px border radius, subtle shadow
- 16px horizontal padding on list screens
- Touch targets minimum 44pt
