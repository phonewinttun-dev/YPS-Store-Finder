---
name: YPS Store Finder
colors:
  surface: "#f9f9fc"
  surface-dim: "#dadadc"
  surface-bright: "#f9f9fc"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f3f6"
  surface-container: "#eeeef0"
  surface-container-high: "#e8e8ea"
  surface-container-highest: "#e2e2e5"
  on-surface: "#1a1c1e"
  on-surface-variant: "#4d4632"
  inverse-surface: "#2f3133"
  inverse-on-surface: "#f0f0f3"
  outline: "#7f765f"
  outline-variant: "#d1c6ab"
  surface-tint: "#725c00"
  primary: "#725c00"
  on-primary: "#ffffff"
  primary-container: "#ffd200"
  on-primary-container: "#705b00"
  inverse-primary: "#ecc200"
  secondary: "#1d5fa8"
  on-secondary: "#ffffff"
  secondary-container: "#7ab0ff"
  on-secondary-container: "#00417e"
  tertiary: "#585f64"
  on-tertiary: "#ffffff"
  tertiary-container: "#d0d7dd"
  on-tertiary-container: "#565e63"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffe07c"
  primary-fixed-dim: "#ecc200"
  on-primary-fixed: "#231b00"
  on-primary-fixed-variant: "#564500"
  secondary-fixed: "#d5e3ff"
  secondary-fixed-dim: "#a6c8ff"
  on-secondary-fixed: "#001c3b"
  on-secondary-fixed-variant: "#004787"
  tertiary-fixed: "#dce3e9"
  tertiary-fixed-dim: "#c0c7cd"
  on-tertiary-fixed: "#151d21"
  on-tertiary-fixed-variant: "#40484d"
  background: "#f9f9fc"
  on-background: "#1a1c1e"
  surface-variant: "#e2e2e5"
typography:
  headline-lg:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
  button-text:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  margin-mobile: 16px
  gutter-mobile: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  touch-target: 48px
---

## Brand & Style

The design system is built to serve the daily commuters of Yangon, emphasizing reliability, speed, and civic utility. The brand personality is **authoritative yet helpful**, acting as a trustworthy companion for urban navigation.

The aesthetic follows a **Corporate / Modern** approach with a high-utility focus. It leverages a clean, structured layout to reduce cognitive load in high-stress transit environments. Visual clarity is prioritized through generous whitespace, high-contrast action colors, and a systematic approach to iconography. The emotional response should be one of confidence and ease—ensuring users feel that their next top-up or service point is always within reach.

## Colors

The palette is rooted in the recognizable identity of Yangon’s transit infrastructure.

- **Primary (YBS Yellow):** Used for high-visibility elements, key highlights, and status indicators. It ensures the app feels connected to the physical buses.
- **Secondary (Transit Blue):** The primary color for interaction, navigation, and core branding. It provides the professional weight needed for a payment-related service.
- **Tertiary (Cloud Blue):** A soft, low-saturation blue used for background surfaces and subtle groupings to prevent visual fatigue.
- **Neutral:** A range of deep greys and off-whites to handle typography and structural borders.

Success, warning, and error states should utilize standard semantic green, amber, and red, but adjusted to maintain high legibility against the primary yellow.

## Typography

This design system utilizes **Work Sans** for its exceptional legibility and professional, grounded character. As a grotesque sans-serif, it performs well on low-resolution mobile screens and in outdoor lighting conditions.

- **Headlines:** Set in bold weights with tighter letter spacing for a modern, impactful look.
- **Body:** Standardized at 16px for optimal readability during movement.
- **Labels:** **JetBrains Mono** is introduced for secondary metadata, such as store IDs, distances, and timestamps, to provide a subtle "technical/functional" feel that distinguishes data from instructional text.

## Layout & Spacing

The layout utilizes a **fluid grid** logic optimized for one-handed mobile use.

1. **Grid:** A 4-column grid for mobile with 16px side margins.
2. **Rhythm:** A 4px baseline grid governs all vertical spacing. Elements are typically separated by increments of 8px (stack-sm) or 16px (stack-md).
3. **Safe Zones:** High-priority actions (like "Find Near Me") are placed within the natural "thumb zone" at the bottom third of the screen.
4. **Touch Targets:** All interactive elements maintain a minimum hit area of 48x48px to accommodate users who may be commuting on moving vehicles.

## Elevation & Depth

To maintain a clean and efficient look, this design system avoids heavy shadows. Instead, it uses **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Base):** White (#FFFFFF) or Tertiary Blue (#EBF2F8) for the main background.
- **Level 1 (Cards):** White surfaces with a 1px border in a light neutral tone (#E2E8F0).
- **Level 2 (Floating/Active):** Reserved for the search bar and primary action buttons, using a soft, 12% opacity shadow of the Secondary Blue to suggest interactability without cluttering the interface.
- **Backdrop:** A 20px background blur is used for modal overlays and bottom-sheet handles to maintain context of the underlying map.

## Shapes

The shape language is **Soft (0.25rem - 0.75rem)**.

- **Standard Elements:** 4px radius for a crisp, professional look on small components like checkboxes or input fields.
- **Large Components:** 8px (rounded-lg) for store cards and bottom sheets to feel approachable.
- **Buttons:** 8px for standard buttons; however, search bars and category chips may use a fully rounded (pill) style to differentiate them from functional data cards.

## Components

### Buttons

- **Primary Action (Navigation):** Solid Secondary Blue background with White text. Used for "Start Navigation" or "Get Directions."
- **Secondary Action (Search):** Solid Primary Yellow background with Neutral Black text. This ensures the most common action—finding a store—is the most visible.
- **Ghost Buttons:** Transparent background with Blue borders for secondary filters.

### Chips & Store Categories

- Use a combination of a colored icon and a light-fill background.
- **Top-up Points:** Yellow icon / light yellow tint.
- **Retail Stores:** Blue icon / light blue tint.
- **Service Centers:** Grey icon / light grey tint.

### Inputs

- **Search Bar:** Large, 56px height, pill-shaped with a soft shadow and a prominent search icon.
- **Filtering:** Use bottom sheets for filter selection to keep the map view visible.

### Cards

- **Store Cards:** Elevated white surfaces. Title in bold Work Sans, distance and status (Open/Closed) using JetBrains Mono labels. Include a clear "Directions" icon button in the bottom right corner.

### Lists

- Lists should feature high-contrast dividers (1px) and generous vertical padding (12px) to ensure no mis-taps occur while traveling.
