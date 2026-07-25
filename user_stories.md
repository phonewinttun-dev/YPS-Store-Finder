# 📱 YPS Store Finder - User Stories

This document outlines the user stories for the **YPS Store Finder** application. As a user-only application designed for Yangon commuters and Yangon Payment Services (YPS) cardholders, all stories represent end-user interactions.

---

## 🎯 User Persona

* **Commuter / YPS Cardholder**: An individual in Yangon who relies on public transit (YBS) or YPS payment cards and needs to quickly locate nearby YPS card top-up points, service kiosks, agents, and retail partners.

---

## 🗺️ 1. Interactive Map & Store Location

### US-1.1: Interactive Map & Store Display

* **As a** commuter in Yangon,
* **I want to** view all available YPS stores and partner locations on an interactive map and list view,
* **So that** I can visually inspect YPS service points across the city.

**Acceptance Criteria:**
* Map renders with interactive zoom, pan, and tile controls.
* Distinct pin markers display store locations based on latitude and longitude coordinates.
* Tapping/clicking a store pin highlights the store and displays quick details.

---

### US-1.2: Store Details View

* **As a** commuter,
* **I want to** view detailed information about a selected store,
* **So that** I know its exact address, category, operating hours, and contact information before traveling.

**Acceptance Criteria:**
* Selecting a store pin or list item opens a detail drawer/modal.
* Shows store title, branch name, category tag, full address, coordinates, and contact details.
* Clean design adapted for mobile and desktop screens.

---

## 📍 2. Geolocation & Nearby Store Discovery

### US-2.1: Live GPS Location Tracking

* **As a** commuter,
* **I want to** enable GPS tracking to pinpoint my current location on the map,
* **So that** I can see where I am relative to nearby YPS stores and top-up points.

**Acceptance Criteria:**
* Includes a "Locate Me" / "GPS Active" toggle button.
* Requests browser/device location permissions smoothly.
* Displays current user position marker on the map with real-time updates.

---

### US-2.2: Distance Calculation & Radius Filtering

* **As a** commuter on the move,
* **I want to** filter stores within a specific radius (e.g., 1 km, 3 km, 5 km, 10 km) from my location,
* **So that** I can quickly find YPS stores near me without traveling far.

**Acceptance Criteria:**
* Distance to each store is dynamically calculated and displayed in kilometers (`km away`).
* A distance radius slider/selector filters stores within the chosen range.
* Stores outside the chosen radius are hidden from the map and list.

---

## 🚌 3. YBS Bus Transit Integration

### US-3.1: Reachable Bus Lines to YPS Stores

* **As a** transit commuter,
* **I want to** see which YBS bus numbers and stops are near a selected YPS store,
* **So that** I can easily plan my bus trip to reach the store.

**Acceptance Criteria:**
* Store detail view displays a section listing nearby YBS bus stops within walking distance.
* Lists all YBS bus line numbers (e.g., YBS 21, YBS 37, YBS 65) that service those stops.
* Displays approximate walking distance or time from the nearest YBS stop to the YPS store.

---

### US-3.2: YPS Card Accepted Bus Checker

* **As a** YPS cardholder,
* **I want to** check which YBS bus lines accept YPS cards for fare payment,
* **So that** I know whether I can tap my YPS card or need cash before boarding.

**Acceptance Criteria:**
* Dedicated searchable list/filter showing YBS bus line numbers along with their YPS payment support status.
* Clear visual indicator (e.g., a green "YPS Card Accepted" badge) on YBS route detail pages or list items.
* Filter option allowing users to toggle between "All YBS Lines" and "YPS-Supported Lines Only."

---

## 🔍 4. Search & Category Filtering

### US-4.1: Store Keyword Search

* **As a** commuter,
* **I want to** search for stores by typing a name, branch, township, or address keyword,
* **So that** I can quickly locate specific outlets.

**Acceptance Criteria:**
* Search input filters the store list and map pins dynamically as the user types.
* Works seamlessly across English and Myanmar text inputs.
* Displays a clear "No stores found" fallback message when no matches exist.

---

### US-4.2: Category Filtering

* **As a** commuter looking for a specific service type,
* **I want to** filter stores by category (e.g., YPS Service Kiosks, YPS Agents, G&G Stores, Capital HyperMarkets, Mingalar Cinemas, Bus Terminals),
* **So that** I only see locations that offer the specific service I need.

**Acceptance Criteria:**
* Category chips / dropdown filter store list and map pins.
* Category summary counts display the total number of stores in each category.
* "All Categories" option resets the category filter.

---

## 🗺️ 5. Navigation & External Directions

### US-5.1: One-Click Navigation Directions

* **As a** commuter,
* **I want to** click a "Directions" button for a selected store,
* **So that** my default map application (Google Maps / Apple Maps) opens with routes to that store.

**Acceptance Criteria:**
* Each store card and detail view features a prominent "Directions" button.
* Clicking the button launches an external mapping service with pre-filled destination coordinates.

---

## 🌐 6. Internationalization & Accessibility

### US-6.1: Language Switching (English & Myanmar)

* **As a** local commuter or international user,
* **I want to** switch the application language between English and Myanmar (Burmese),
* **So that** I can comfortably read store information, YBS bus numbers, and interface text in my preferred language.

**Acceptance Criteria:**
* A language toggle switcher is accessible at all times in the header.
* Instantly translates interface labels, YBS bus info tags, placeholders, status text, and category names without requiring a page reload.

---

### US-6.2: Mobile Responsive & PWA Experience

* **As a** mobile user on a bus or walking outside,
* **I want** a touch-friendly interface and PWA installation capability,
* **So that** I can use the app smoothly on mobile devices with low battery/network overhead.

**Acceptance Criteria:**
* Touch targets conform to minimum 48x48px hit areas for easy one-handed operation.
* Bottom sheet drawer allows easy toggling between map and list views.
* Progressive Web App (PWA) manifest and service worker allow adding the app to home screen.
