---
name: YPS Store Finder Design System
colors:
  surface: "#f9f9fc"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f3f6"
  surface-container: "#eeeef0"
  surface-container-high: "#e8e8ea"
  surface-container-highest: "#e2e2e5"
  on-surface: "#1a1c1e"
  on-surface-variant: "#4d4632"
  outline: "#7f765f"
  outline-variant: "#d1c6ab"

  /* Primary YBS Warm Gold / Yellow Tokens */
  primary: "#725c00"
  primary-dark: "#564500"
  primary-light: "#ffd200"
  primary-container: "#fff9e6"
  primary-border: "#ffe07c"
  on-primary: "#ffffff"

  /* Secondary Transit Blue Tokens */
  secondary: "#1d5fa8"
  secondary-dark: "#00417e"
  secondary-light: "#7ab0ff"
  secondary-container: "#ebf2f8"
  on-secondary: "#ffffff"

  /* Neutral & Utility */
  cloud-blue: "#ebf2f8"
  error: "#ba1a1a"
  error-container: "#ffdad6"
  on-error: "#ffffff"

typography:
  font-family-sans: "Work Sans, sans-serif"
  font-family-mono: "JetBrains Mono, monospace"

  headline-lg:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
  body-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  meta-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: "600"
    lineHeight: 16px
---

# YPS Store Finder Design System & Color Specs

This document defines the authoritative color scheme, typography, depth system, and UI component specifications used in the YPS Store Finder Web Application.

---

## 1. Color Palette & Utility System

### Primary Identity: YBS Warm Gold & Yellow
The primary color scheme captures the iconic Yangon Payment Service (YPS) / Yangon Bus Service (YBS) visual identity, offering high contrast and legibility across mobile and web viewports.

- **Primary Action Accent (`#725c00`)**: Deep warm gold used for primary CTA buttons ("Show Direction", "View Map"), active badges, and key icons.
- **Primary Hover (`#564500`)**: Darker shade for interactive button hover states.
- **Soft Yellow Container (`#fff9e6`)**: Light warm cream background for badges, active chips, and store bus stop pills.
- **Yellow Border Highlight (`#ffe07c`)**: Subtle 1px borders paired with `#fff9e6` containers.

### Secondary Identity: Transit Blue
The secondary color scheme represents transit navigation, route tracking, and bus stop indicators.

- **Transit Blue (`#1d5fa8`)**: Used for user location pulse markers, bus route numbers, and transit links.
- **Transit Blue Dark (`#00417e`)**: Text color for high-contrast transit metadata.
- **Transit Blue Container (`#ebf2f8`)**: Soft blue background used for bus stop pills and badges.
- **Transit Blue Light Border (`#7ab0ff`)**: Border accent for bus stop badges.

### Surface & Background Tokens
- **Base Background (`#f9f9fc`)**: Very light cool gray surface for card containers and drawer scroll panes.
- **Card Surface (`#ffffff`)**: Pure white background for elevated store cards and popup windows.
- **Borders (`#e2e2e5` / `#f3f3f6`)**: Soft dividers providing visual structure without clutter.

---

## 2. Glassmorphism & Depth Layers

- **Glass Panels (`.glass-panel`)**:
  - `background: rgba(255, 255, 255, 0.88)`
  - `backdrop-filter: blur(20px)`
  - Used for floating headers, search inputs, and mobile navigation tabs to preserve map context.
- **Card Depth**:
  - Standard Cards: 1px border (`#e2e2e5`), soft shadow (`shadow-slate-200/50`).
  - Active/Selected Store Card: White surface with 1px `#725c00` or `#3b82f6` border highlight.

---

## 3. Component Specs

### Nearest Bus Stop Badges
- **Container**: `#fff9e6` (Soft Warm Cream)
- **Text**: `#725c00` (Bold 11px Work Sans)
- **Border**: `#ffe07c` (1px solid)
- **Border Radius**: `8px` (`rounded-lg`)

### Primary Buttons ("Show Direction")
- **Background**: `#725c00` (Solid Warm Gold)
- **Text**: `#ffffff` (White, Bold 12px)
- **Shadow**: `shadow-md shadow-[#725c00]/20`
- **Border Radius**: `12px` (`rounded-xl`)

### Secondary Buttons ("Show Bus Lines")
- **Background**: `#ffffff` (White) / `#fff9e6` (Active)
- **Text**: `#374151` / `#725c00`
- **Border**: `1px solid #e5e7eb` / `#ffe07c`
- **Border Radius**: `12px` (`rounded-xl`)

---

## 4. Typography Rules

- **Work Sans**: Used for all UI headings, body text, store names, and button labels.
- **JetBrains Mono**: Used for numerical metadata (distances e.g. `0.3km`, bus line numbers e.g. `YBS 3`, store IDs).

