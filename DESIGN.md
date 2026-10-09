# YPS Store Finder Design System

The application uses a map-first transit console layout with a restrained soft-pastel palette. YPS yellow is the brand anchor; feature meaning is communicated with both color and iconography.

## Semantic color roles

All component colors use RGB CSS variables so Tailwind opacity modifiers remain available.

| Role | Light | Dark | Meaning |
| --- | --- | --- | --- |
| Canvas | `#F7F8FF` | `#121521` | Page and map shell |
| Surface | `#FFFFFF` | `#1B2030` | Cards and panels |
| Brand | `#FFF1A8 / #6B5600` | `#F6D867 / #2D2600` | YPS identity |
| Store | `#FFE3DA / #A23F2B` | `#FF9C85 / #231B19` | Stores and pins |
| Bus | `#DCEEFF / #0B5F9B` | `#75B9F7 / #10212F` | Buses and stops |
| GPS | `#DFF7EC / #137455` | `#72D4B3 / #10251D` | Location and distance |
| Route | `#EEE7FF / #6546AD` | `#B59AFF / #211A32` | Directions and focus |
| Danger | `#FFE3EF / #A83D69` | `#F58CB3 / #2B111C` | Errors |

## Typography

- Sora: English UI and display text.
- Noto Sans Myanmar: Myanmar UI and content.
- JetBrains Mono: route numbers, distances, counts, and other numeric metadata.

Fonts are loaded with `next/font`; no render-blocking font stylesheet is used.

## Layout

- Desktop: 80px navigation rail, 400–420px store explorer, remaining space for the live map.
- Mobile: 64px utility bar, full map, and a draggable explorer with 112px, 55dvh, and 88dvh snap points.
- Bus and detail routes reuse the same rail and mobile utility bar.

## Interaction and accessibility

- Minimum interactive target: 44px.
- Keyboard-visible violet focus ring.
- Explorer handle: pointer drag plus Arrow Up/Down, Home, and End.
- Dialogs trap focus, close with Escape, and restore focus.
- Motion is disabled under `prefers-reduced-motion`.
- Language, theme, and state labels are never communicated by color alone.
- Browser zoom remains unrestricted.

The transit ribbon is the signature accent: coral for stores, sky for buses, mint for GPS, and violet for routes. It is limited to shell and route hierarchy so map data remains visually dominant.
