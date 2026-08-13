# Apple Human Interface Guidelines — Accessibility Reference

Source: [Apple HIG – Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) and related pages (VoiceOver, Inclusion, Typography, etc.).

Use this guidance when designing for iOS, iPadOS, macOS, watchOS, tvOS, or visionOS, or when the user references Apple HIG.

## Core definition

An accessible interface is:
- **Intuitive** — familiar, consistent interactions that make tasks straightforward
- **Perceivable** — does not rely on any single sense (sight, hearing, speech, or touch)
- **Adaptable** — supports system accessibility features and lets people personalize settings

Audit with **Accessibility Inspector**. Communicate support via **Accessibility Nutrition Labels** on the App Store when relevant.

## Vision

### Dynamic Type & text sizing
- Support text enlargement of at least **200%** (140% on watchOS).
- Prefer system text styles / Dynamic Type over fixed sizes.
- Recommended defaults / minimums for custom type:

| Platform     | Default size | Minimum size |
|--------------|--------------|--------------|
| iOS, iPadOS  | 17 pt        | 11 pt        |
| macOS        | 13 pt        | 10 pt        |
| tvOS         | 29 pt        | 23 pt        |
| visionOS     | 17 pt        | 12 pt        |
| watchOS      | 16 pt        | 12 pt        |

- Thin custom fonts may need larger sizes for legibility.
- Test at Accessibility sizes (AX1–AX5).

### Color & contrast
- Target WCAG AA ratios (used by Accessibility Inspector):
  - ≤17 pt text: **4.5:1**
  - ≥18 pt or bold: **3:1**
- Prefer **system colors** — they adapt to Increase Contrast and Dark Mode.
- If default contrast is insufficient, provide a higher-contrast scheme when Increase Contrast is on.
- Check both light and dark appearances.
- **Never rely on color alone** — add shapes, icons, patterns, or text labels (especially red-green / blue-orange pairs).

### VoiceOver
- Provide **accessibility labels** for every key interface element (more descriptive than generic system defaults).
- Describe meaningful images; exclude purely decorative ones.
- Provide concise descriptions for charts and infographics; expose interactive chart actions to VoiceOver.
- Use unique page/screen titles and accurate section headings.
- Group related elements so VoiceOver announces image + caption together.
- Notify assistive technologies when content or layout changes.
- Support the VoiceOver rotor (headings, links, custom rotors) where useful.

## Hearing

- Do not communicate critical information through audio alone.
- Provide:
  - **Captions** (synced with media)
  - **Subtitles**
  - **Audio descriptions** (spoken narration of visual-only information)
  - **Transcripts** (full text of longer media)
- Pair audio cues (success, error, game feedback) with **haptics** or visual indicators.
- For games / spatial apps, add visual indicators when audio is used to guide attention off-screen.

## Mobility

### Control sizes

| Platform     | Default control size | Minimum control size |
|--------------|----------------------|----------------------|
| iOS, iPadOS  | 44×44 pt             | 28×28 pt             |
| macOS        | 28×28 pt             | 20×20 pt             |
| tvOS         | 66×66 pt             | 56×56 pt             |
| visionOS     | 60×60 pt             | 28×28 pt             |
| watchOS      | 44×44 pt             | 28×28 pt             |

- Add sufficient padding between controls (~12 pt around bezeled elements, ~24 pt around visible edges of non-bezeled elements).
- Prefer **simple gestures** for frequent actions. Avoid complex multi-finger / multi-hand gestures when possible.
- Always offer a **non-gesture alternative** (e.g. visible Delete button in addition to swipe-to-delete).
- Support **Voice Control**, **Switch Control**, **Full Keyboard Access**, **AssistiveTouch**, and **Pointer Control**.
- Integrate with **Siri** and **Shortcuts** for important/repetitive tasks when appropriate.

## Speech

- Ensure the interface is fully operable with keyboard alone (Full Keyboard Access).
- Do not override system keyboard shortcuts without good reason.
- Support Switch Control for alternative input hardware / sounds.

## Cognitive

- Prefer familiar system gestures and patterns over custom ones that must be learned.
- Keep actions simple, consistent, and easy to remember.
- Avoid time-boxed / auto-dismissing UI that can disappear before people using assistive technology can act.
- Prefer explicit dismiss actions.

## Reduce Motion & other accommodations

- Respect the system **Reduce Motion** setting; prefer cross-fades or reduced animation when it is on.
- Support other Display Accommodations (Increase Contrast, Reduce Transparency, etc.) where relevant.
- Test with grayscale and color-blindness simulation.

## Platform notes

- **visionOS**: Custom gestures may be disabled while VoiceOver is active (unless Direct Gesture mode is enabled). Prefer standard components that respond consistently to eye / hand input.
- Use Accessibility Inspector and real-device testing with VoiceOver, Voice Control, and Switch Control.

## Quick checklist (Apple platforms)

- [ ] Dynamic Type / text scaling supported
- [ ] Contrast meets AA (both appearances)
- [ ] System colors preferred or custom colors tested with Increase Contrast
- [ ] Color never the sole indicator
- [ ] All interactive elements have accessibility labels
- [ ] Meaningful images described; decorative images hidden
- [ ] Charts/infographics have text alternatives
- [ ] Related elements grouped for VoiceOver
- [ ] Control sizes meet platform minimums
- [ ] Non-gesture alternatives for critical actions
- [ ] Full Keyboard Access / Switch Control / Voice Control work
- [ ] Reduce Motion respected
- [ ] No critical auto-dismissing timed UI
- [ ] Tested with Accessibility Inspector + real assistive technologies

## Related HIG pages

- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [VoiceOver](https://developer.apple.com/design/human-interface-guidelines/voiceover)
- [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion)
- [Typography / Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics)