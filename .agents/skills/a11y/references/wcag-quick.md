# WCAG 2.2 Level AA — Quick Reference

Focus on the criteria most commonly relevant when building web UIs and dashboards.

## Perceivable

| Criterion | Requirement | Practical check |
|-----------|-------------|-----------------|
| 1.1.1 Non-text Content | Text alternative for non-text content | Meaningful `alt`, or `alt=""` + `aria-hidden` for decorative |
| 1.3.1 Info and Relationships | Structure and relationships programmatically determinable | Headings, lists, tables with headers, labels, landmarks |
| 1.3.2 Meaningful Sequence | Reading order makes sense | DOM order matches visual order |
| 1.3.3 Sensory Characteristics | Instructions do not rely solely on shape, size, location, or sound | “Click the green button” is not enough |
| 1.4.1 Use of Color | Color is not the only visual means of conveying information | Add text, icons, or patterns |
| 1.4.3 Contrast (Minimum) | 4.5:1 for normal text, 3:1 for large text | Check with browser tools or axe |
| 1.4.4 Resize Text | Text can be resized to 200% without loss of content or functionality | Avoid fixed heights that clip |
| 1.4.10 Reflow | Content reflows at 320 CSS px width | Responsive design |
| 1.4.11 Non-text Contrast | 3:1 for UI components and graphical objects | Focus rings, icons, borders |
| 1.4.12 Text Spacing | No loss when user adjusts spacing | Avoid tight fixed containers |
| 1.4.13 Content on Hover or Focus | Hover/focus content is dismissible, hoverable, persistent | Tooltips must meet these rules |

## Operable

| Criterion | Requirement | Practical check |
|-----------|-------------|-----------------|
| 2.1.1 Keyboard | All functionality available from keyboard | Tab through the whole page |
| 2.1.2 No Keyboard Trap | Focus can move away | Modals must allow Escape / close |
| 2.4.1 Bypass Blocks | Skip repetitive content | Skip link or landmarks |
| 2.4.2 Page Titled | Descriptive page title | Unique and meaningful |
| 2.4.3 Focus Order | Focus order preserves meaning | Logical DOM order |
| 2.4.4 Link Purpose | Link purpose clear from text or context | Avoid “click here” |
| 2.4.6 Headings and Labels | Descriptive headings and labels | Clear hierarchy |
| 2.4.7 Focus Visible | Keyboard focus indicator is visible | Never remove outline without replacement |
| 2.4.11 Focus Not Obscured (Minimum) | Focused element is not entirely hidden | Sticky headers, modals |
| 2.5.3 Label in Name | Accessible name contains the visible label text | Important for speech input |
| 2.5.7 Dragging Movements | Dragging has a single-pointer alternative | Provide buttons as alternative |
| 2.5.8 Target Size (Minimum) | 24×24 CSS px minimum target size | Buttons, links, form controls |

## Understandable

| Criterion | Requirement | Practical check |
|-----------|-------------|-----------------|
| 3.1.1 Language of Page | `lang` attribute on `<html>` | Correct language code |
| 3.2.1 On Focus | Focus does not initiate unexpected change of context | No auto-submit on focus |
| 3.2.2 On Input | Changing a setting does not automatically cause change of context | Confirm or provide submit |
| 3.3.1 Error Identification | Errors are identified and described in text | Clear error messages |
| 3.3.2 Labels or Instructions | Labels or instructions provided | Visible labels preferred |
| 3.3.3 Error Suggestion | Suggestions for fixing errors when known | Helpful validation messages |
| 3.3.4 Error Prevention (Legal, Financial, Data) | Reversible, checked, or confirmed | Especially for destructive actions |

## Robust

| Criterion | Requirement | Practical check |
|-----------|-------------|-----------------|
| 4.1.1 Parsing | No major HTML validation issues that break AT | Valid nesting, unique IDs |
| 4.1.2 Name, Role, Value | Name, role, value exposed to AT | Correct roles and states |
| 4.1.3 Status Messages | Status messages can be programmatically determined | Use live regions |

## Quick test tools

- Browser DevTools → Accessibility pane / Lighthouse
- axe DevTools extension
- Keyboard-only navigation
- Screen reader smoke test (VoiceOver, NVDA, or TalkBack)