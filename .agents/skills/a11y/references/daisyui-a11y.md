# daisyUI Accessibility Notes

daisyUI is a pure CSS component library. It supplies styles and some structural conventions; full accessibility is the responsibility of the consuming application.

## Patterns observed in high-quality daisyUI dashboards

### Drawer / sidebar

```html
<body class="drawer lg:drawer-open">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" aria-label="Toggle sidebar" />
  <main class="drawer-content">
    <!-- primary content -->
  </main>
  <aside class="drawer-side">
    <label for="my-drawer" class="drawer-overlay" aria-label="Close sidebar"></label>
    <nav aria-label="Primary">
      <!-- menu -->
    </nav>
  </aside>
</body>
```

- The checkbox **must** have an accessible name (`aria-label` or associated label).
- Prefer putting page content inside `<main>`.
- On large screens (`lg:drawer-open`) the sidebar is always visible; the toggle is primarily for smaller viewports.

### Icon-only controls

Every icon button needs an accessible name:

```html
<button class="btn btn-circle btn-ghost" aria-label="Open notifications">
  <div class="indicator">
    <span class="status indicator-item status-error"></span>
    <svg data-src="..." class="size-5" aria-hidden="true"></svg>
  </div>
</button>
```

### Theme controller

```html
<label class="btn btn-circle btn-ghost swap swap-rotate" aria-label="Toggle theme">
  <input type="checkbox" value="light" data-set-theme aria-label="Toggle theme" />
  <svg class="swap-on" aria-hidden="true">...</svg>
  <svg class="swap-off" aria-hidden="true">...</svg>
</label>
```

### Stats and metric cards

Use headings and clear text; do not rely solely on color for positive/negative change:

```html
<div class="stat">
  <div class="stat-title">Revenue</div>
  <div class="stat-value">$842K</div>
  <div class="stat-desc text-success">+12.8% vs prior period</div>
</div>
```

### Tables

Standard semantic table markup works with daisyUI’s `.table` class. Always include `<th scope="col">` (or row headers) and consider a `<caption>`.

### Dropdowns / popovers (Popover API)

Modern daisyUI examples use the Popover API. Ensure:

- The trigger has an accessible name.
- Focus moves appropriately when the popover opens.
- Escape closes the popover.

### Components that need extra care

| Component | Issue | Recommended mitigation |
|-----------|-------|------------------------|
| Tabs (CSS-only) | Incomplete tablist pattern | Prefer radio + label pattern or add full ARIA + keyboard JS |
| Rating | Unlabeled radios | Provide a fieldset/legend or `aria-label` on the group |
| Radial progress | Missing valuemin/valuemax/valuenow | Add the ARIA attributes and keep text alternative |
| Countdown | Pseudo-element numbers | Use a live region or visible text that updates |
| Tooltip | Hover/focus content rules | Prefer visible text or a properly implemented disclosure |
| Timeline | Decorative dividers read by SR | Hide pure decoration with `aria-hidden` |

### Color themes

- daisyUI tests many color pairs, but not every combination in every theme meets AA under all conditions.
- When a theme fails contrast for critical text or controls, override the specific CSS variables.
- Always test both the default light and dark (or chosen) themes.

### Reduced motion

Add a global rule (or rely on daisyUI updates that respect `prefers-reduced-motion`) so animations do not cause vestibular issues.

## Recommended pairing

For complex interactive widgets (menus, listboxes, dialogs, tabs with panels), pair daisyUI styling with a headless accessible library (Headless UI, Radix, React Aria, etc.) so behavior and ARIA are correct by default while retaining the visual design.