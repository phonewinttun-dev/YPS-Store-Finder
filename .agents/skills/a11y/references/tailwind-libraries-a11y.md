# Tailwind Component Libraries — Accessibility Notes

Quick reference for Preline UI, FlyonUI, and Flowbite when building accessible interfaces.

## Preline UI

- **Docs**: https://preline.co/docs/accessibility.html
- **Key feature**: `HSAccessibilityObserver` — centralized keyboard + focus manager
- Components auto-register for:
  - Arrow / Home / End / Enter / Space / Escape navigation
  - Focus trapping and restoration in nested overlays
  - First-letter typeahead in lists and selects
- Accessibility is a stated product priority; components ship with ARIA-friendly patterns
- **Your responsibilities**:
  - Accessible names on all controls
  - Color contrast of your theme
  - Real device / screen-reader testing
- Prefer the official component markup; do not strip data attributes or ARIA the library expects

## FlyonUI

- **Docs**: https://flyonui.com/docs/getting-started/accessibility/
- Architecture: Tailwind + daisyUI semantic classes + Preline-style headless JS plugins
- Shares the same `HSAccessibilityObserver` model as Preline
- Marketed as meeting accessibility criteria out of the box for its 80+/800+ examples
- Best choice when you want daisyUI-style class names **plus** interactive accessibility behavior
- Same responsibilities as Preline: names, contrast, testing

## Flowbite

- **Docs**: https://flowbite.com/docs/getting-started/introduction/
- Interactive behavior via data attributes + bundled vanilla JS (`initFlowbite()` or individual constructors)
- Examples commonly include correct ARIA for tabs (`role="tab"`, `aria-selected`, `role="tabpanel"`), modals, dropdowns, etc.
- Known historical issues (watch for these):
  - `aria-hidden` left on elements that receive focus (especially dropdowns containing inputs)
  - Incomplete state synchronization in some dynamic components
- Prefer keeping the library’s recommended attributes and using the JS API when you need precise focus control
- Dark mode and RTL are supported; verify contrast ratios in both modes

## Comparison (a11y perspective)

| Library   | JS model                  | Built-in keyboard manager | Semantic classes | Notes                                      |
|-----------|---------------------------|---------------------------|------------------|--------------------------------------------|
| daisyUI   | None (CSS only)           | No                        | Yes              | You own all interactive a11y               |
| Preline   | Headless plugins          | Yes (`HSAccessibilityObserver`) | Utility-heavy   | Strong keyboard/focus foundation           |
| FlyonUI   | Preline plugins + daisyUI | Yes                       | Yes (daisyUI)    | Best of both for many teams                |
| Flowbite  | Data-attribute + vanilla  | Partial (per component)   | Utility-heavy    | Good examples; verify ARIA state carefully |

## Practical checklist when using any of these

- [ ] Icon-only triggers have `aria-label` (or visible text)
- [ ] Focus styles are visible and not overridden to `outline: none` without replacement
- [ ] Modals / drawers move focus inside and restore it on close
- [ ] Escape closes overlays
- [ ] Color contrast meets 4.5:1 (text) / 3:1 (UI components)
- [ ] Live regions used for dynamic status messages
- [ ] Tested with keyboard only + at least one screen reader
- [ ] Library-provided ARIA attributes and data attributes left intact

## When to prefer a headless accessible library instead

For highly custom or complex widgets (advanced combobox, multi-select, tree view, date range picker), consider pairing the visual styles from these libraries with a dedicated headless accessible library (React Aria, Headless UI, Radix, Ariakit, etc.) so behavior and ARIA are guaranteed correct.