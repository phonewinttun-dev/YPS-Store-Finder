---
name: a11y
description: Design, implement, audit, and test accessible web and Apple-platform interfaces against WCAG 2.2 AA and Apple HIG. Use for React, Next.js, HTML, CSS, JavaScript, TypeScript, Tailwind CSS, daisyUI, Preline, FlyonUI, Flowbite, Leaflet or other map UIs, PWAs, forms, navigation, data tables, charts, dialogs, drawers, design systems, user flows, responsive layouts, and whenever accessibility, a11y, ARIA, semantics, keyboard navigation, focus, screen readers, VoiceOver, Dynamic Type, contrast, motion, zoom, localization, or inclusive UX is mentioned.
---

# A11y

Build accessibility into the user journey and implementation. Target WCAG 2.2 Level AA unless the user specifies another standard. Prefer small changes that preserve the product's visual language while making the interface perceivable, operable, understandable, and robust.

## Workflow

1. Inspect the existing UI, design system, framework, localization, and test tooling before changing code.
2. Identify the primary user goal, content hierarchy, landmarks, keyboard path, dynamic states, and error/recovery path.
3. Reuse accessible native elements and established project components before adding custom widgets or dependencies.
4. Implement semantics, names, states, focus behavior, reflow, contrast, and reduced motion as part of the change.
5. Verify with the smallest relevant automated checks plus manual keyboard and screen-reader-oriented reasoning.
6. Report residual limitations and manual checks that still require a browser, device, or assistive technology.

Read only the reference needed for the task:

- Read [references/wcag-quick.md](references/wcag-quick.md) for WCAG 2.2 AA audits and implementation checks.
- Read [references/daisyui-a11y.md](references/daisyui-a11y.md) when daisyUI is used.
- Read [references/tailwind-libraries-a11y.md](references/tailwind-libraries-a11y.md) when Preline, FlyonUI, or Flowbite is used.
- Read [references/apple-hig-a11y.md](references/apple-hig-a11y.md) for iOS, iPadOS, macOS, watchOS, tvOS, or visionOS work.

## Core Implementation Rules

### Structure and semantics

- Give every page a unique, descriptive title and the correct document language.
- Use one primary `main` landmark. Use `header`, `nav`, `aside`, `section`, and `footer` according to meaning.
- Label repeated landmarks. Connect named sections with `aria-labelledby`.
- Keep headings hierarchical; do not choose heading levels for visual size.
- Use lists, tables, fieldsets, legends, captions, and labels when the content has those relationships.
- Use buttons for actions and links with real destinations for navigation.
- Keep DOM and reading order aligned with the visual order at every breakpoint.

### Names, roles, values, and states

- Give every interactive control a concise accessible name. Prefer visible text, then `aria-labelledby`, then `aria-label`.
- Hide decorative images and icons with empty `alt` or `aria-hidden="true"`. Give informative images useful alternative text.
- Expose state with native attributes or the appropriate ARIA state, such as `aria-expanded`, `aria-selected`, `aria-current`, `aria-pressed`, and `aria-invalid`.
- Prefer native HTML. Do not add redundant roles or incomplete ARIA widget patterns.
- Keep ARIA references unique and valid after React rerenders.

### Keyboard and focus

- Make every action available without a pointer.
- Preserve logical Tab order; do not use positive `tabindex`.
- Support Enter, Space, Escape, and arrow-key behavior where the native or ARIA pattern requires it.
- Keep a visible, high-contrast `:focus-visible` indicator. Never remove an outline without an equivalent replacement.
- On dialog, drawer, menu, and popover open, place focus predictably; contain it only when modal; restore it to the trigger on close.
- Provide a skip link when repeated navigation precedes the main content.
- Avoid keyboard traps and hover-only content.

### Forms and errors

- Associate every field with a persistent label.
- Use appropriate input types, `autocomplete`, `required`, input modes, and native constraints.
- Group related options with `fieldset` and `legend`.
- Connect hints and errors with `aria-describedby`; set `aria-invalid="true"` only while invalid.
- Summarize submission errors and move focus to the summary when the failed submission changes context.
- Keep validation messages specific and actionable. Do not convey errors by color alone.

### Dynamic content

- Announce important asynchronous changes with a restrained `role="status"` or `aria-live="polite"` region.
- Use assertive announcements only for urgent interruptions.
- Make loading, empty, success, offline, and error states available to assistive technology.
- Preserve focus when lists refresh; do not unexpectedly move users to newly rendered content.
- For disclosures, synchronize `aria-expanded` and `aria-controls` with the visible panel.

### Visual design, reflow, and motion

- Meet at least 4.5:1 contrast for normal text and 3:1 for large text, essential graphics, controls, and focus indicators.
- Use text, shape, iconography, or pattern in addition to color for status and selection.
- Support 200% text zoom and WCAG reflow without clipping, overlap, or loss of function.
- Do not disable browser zoom with `user-scalable=no` or a restrictive maximum scale.
- Use comfortable pointer targets. Aim for at least 44 by 44 CSS pixels for primary touch controls and meet WCAG 2.2 target-size requirements.
- Respect `prefers-reduced-motion`; avoid flashing and nonessential autoplay.
- Test light and dark themes independently.

### Tables, charts, maps, and media

- Give data tables a caption and scoped headers. Do not use table markup for layout.
- Give charts a concise text summary and an equivalent data table or accessible details when users need the values.
- Never make a map the only way to find, select, or understand a location. Provide a synchronized list or search result alternative.
- Label map controls and interactive markers, expose selected state, and provide keyboard-operable equivalents for pointer interactions.
- Express directions, distance, errors, and geolocation status as text, not only as lines, pins, or color.
- Provide captions or transcripts for meaningful audio/video and audio descriptions when visual information is essential.

## React, Next.js, Tailwind, and PWA Guidance

- Preserve semantic HTML through component abstractions; a component name does not create a role.
- Use stable IDs, including `useId` where suitable, for labels, descriptions, and control relationships.
- After client-side navigation, keep the page title current and ensure the new main heading or route context is discoverable.
- For portals and overlays, implement focus entry, Escape, focus containment when modal, background inertness, and focus restoration.
- Do not attach click behavior to a noninteractive `div` or `span`; use a native control.
- In Tailwind, include visible `focus-visible:` styles and `motion-reduce:` alternatives. Verify actual rendered color pairs rather than assuming token names are compliant.
- Avoid global `select-none` on readable content and avoid viewport rules that prevent zoom.
- For multilingual interfaces, update `lang` and `dir` with the active language; translate accessible names, errors, and announcements along with visible text.
- For PWAs, expose offline/update states, keep core tasks usable after recoverable network failures, and do not hide browser or system accessibility affordances.
- Treat geolocation as optional: explain why it is requested, handle denial and timeout, and provide manual location or browse-all alternatives.

## Apple HIG Guidance

When working on Apple platforms:

- Prefer standard system controls and text styles.
- Support Dynamic Type, VoiceOver, Voice Control, Switch Control, Full Keyboard Access, Increase Contrast, Dark Mode, and Reduce Motion where relevant.
- Give meaningful controls and images concise accessibility labels and values.
- Group related elements for coherent VoiceOver announcements.
- Offer a visible control for every gesture-only action.
- Pair important audio cues with visual or haptic feedback.

Read [references/apple-hig-a11y.md](references/apple-hig-a11y.md) for platform-specific target sizes and detailed checks.

## Inclusive UX and Design Systems

- Carry accessibility through research, information architecture, wireframes, prototypes, usability testing, and developer handoff.
- Check journeys for keyboard-only users, screen-reader users, low-vision and magnified browsing, voice and switch input, cognitive load, temporary impairments, and unreliable connectivity.
- Document component keyboard behavior, focus rules, accessible names, states, error behavior, contrast-safe token pairs, and target sizes.
- Prefer familiar interactions and clear recovery over novel gestures or time-limited behavior.
- Include loading, empty, error, permission-denied, and offline states in the design, not only the ideal path.

## Audit and Verification

For reviews, lead with concrete findings ordered by user impact. Include the affected file and line when available, the user-facing consequence, the relevant WCAG principle or criterion when known, and the smallest safe correction. Do not claim full compliance from static inspection or automated tooling alone.

Run relevant existing checks first:

- Framework lint, type check, and build.
- Existing accessibility lint or browser tests.
- Manual keyboard path: Tab, Shift+Tab, Enter, Space, arrows, and Escape.
- Focus visibility, focus restoration, and modal behavior.
- Screen-reader-oriented checks for names, roles, states, headings, landmarks, errors, and live updates.
- Zoom/reflow, narrow viewport, touch target, contrast, reduced-motion, language, and theme checks.

Do not add a new accessibility dependency for a one-off review unless the user asks or the project already uses that toolchain.

## Output Expectations

When producing UI code:

1. Use native semantics or standard platform components first.
2. Include only the ARIA needed to fill genuine semantic gaps.
3. Make controls keyboard and assistive-technology operable.
4. Provide accessible loading, empty, error, and success states.
5. Preserve responsive behavior, localization, zoom, and reduced-motion support.
6. State any remaining manual verification or platform limitation plainly.
