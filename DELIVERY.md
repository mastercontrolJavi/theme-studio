# Theme Studio revamp handoff

Branch: `revamp/senior-design`. The ranked baseline and feature inventory are in [AUDIT.md](AUDIT.md).

## Product decisions

- Keep the existing Simple/Advanced model, walkthrough, contrast pair map, three export formats, and URL sharing. Improve their weak states without replacing their workflows.
- Store theme colors as OKLCH, including alpha. Convert only at the picker input and display edges. Live preview updates on every edit; URL writes remain debounced.
- Keep the Ivory preset as the ready-to-edit starting point. Reset returns to that preset rather than inventing an empty canvas.
- Put one primary action in Export: Copy. Keep Download secondary and give copy, download, and sharing explicit feedback.

## Untitled UI CLI review

`npx untitledui@latest add color-picker` was run. The CLI reported that `color-picker` requires PRO access and added or modified **zero files**. It did not touch `app/globals.css`, Tailwind configuration, or any component. The CLI diff is therefore empty. The user explicitly directed: “Continue with the existing picker.” The implementation extends the installed `react-colorful` picker, with no new dependency and no second token system.

## Every changed file

| File | Reason |
| --- | --- |
| `AUDIT.md` | Ranked pre-change issues and inventoried working features before implementation. |
| `DELIVERY.md` | Records decisions, CLI result, screenshot pairs, verification, and limits. |
| `audit-screenshots/before/*.png` | Eleven baseline views at desktop and mobile sizes. |
| `audit-screenshots/after/*.png` | Eleven matching final views. |
| `app/globals.css` | Makes shadcn CSS variables the sole theme token source, preserves brand surfaces, styles picker focus/motion, and supports reduced motion. |
| `components/CodeBlock.tsx` | Aligns export code spacing to the 4px scale. |
| `components/ColorInput.tsx` | Makes token rows scannable with swatch, mono name/value, contrast badge, and an anchored desktop picker or mobile sheet. |
| `components/SolidColorPicker.tsx` | Adds solid-only saturation/hue/alpha editing, four formats, feature-detected EyeDropper, and saved swatches. |
| `components/ContrastPanel.tsx` | Displays AA/AAA results and direct fixes using the updated contrast calculations. |
| `components/ControlPanel.tsx` | Guards saved-swatch storage, seeds the current palette, improves mode and share states, and retains the existing editor structure. |
| `components/ExportDrawer.tsx` | Gives Copy priority, adds copy/download feedback, improves spacing and touch targets. |
| `components/FixContrastButton.tsx` | Applies the canonical OKLCH fix value. |
| `components/HelpModal.tsx` | Updates stale HSL and picker instructions and improves close target. |
| `components/PresetSelector.tsx` | Reduces mobile gallery height so token editing remains visible. |
| `components/PreviewPanel.tsx` | Removes decorative live pulse and displays current canonical values. |
| `components/SeedModal.tsx` | Uses brand-aligned curated seeds and larger controls. |
| `components/ThemeStudio.tsx` | Fixes viewport scrolling, sidebar hierarchy, responsive header, and live preview wiring. |
| `components/TokenDetails.tsx` | Aligns details and spacing with revised token rows. |
| `components/TourOverlay.tsx` | Enlarges controls while keeping the existing walkthrough. |
| `components/ui/sheet.tsx` | Gives sheet close controls a 40px target and burgundy focus ring. |
| `lib/colorValue.ts` | Parses, converts, and serializes Hex, RGB, HSL, and OKLCH with alpha. |
| `lib/contrast.ts` | Uses WCAG relative luminance with alpha compositing and searches minimally along OKLCH lightness for a passing fix. |
| `lib/exportFormats.ts` | Emits OKLCH and alpha in CSS, Tailwind v4, and JSON exports. |
| `lib/morph.ts` | Keeps preset motion at 180ms ease-out and applies direct edits immediately. |
| `lib/themes.ts` | Canonicalizes presets once and sets the Ivory brand colors to the specified hex values. |
| `lib/types.ts` | Defines the supported color formats. |
| `lib/urlState.ts` | Writes canonical OKLCH URLs and continues to read legacy HSL URLs. |

## Before and after

| State | Before | After |
| --- | --- | --- |
| First-run walkthrough | [Before](audit-screenshots/before/00-first-run.png) | [After](audit-screenshots/after/00-first-run.png) |
| Desktop, 1440px | [Before](audit-screenshots/before/01-default-1440.png) | [After](audit-screenshots/after/01-default-1440.png) |
| Color editing | [Before](audit-screenshots/before/02-color-editing.png) | [After](audit-screenshots/after/02-color-editing.png) |
| Export | [Before](audit-screenshots/before/03-export.png) | [After](audit-screenshots/after/03-export.png) |
| Share success | [Before](audit-screenshots/before/04-share-success.png) | [After](audit-screenshots/after/04-share-success.png) |
| Edited, reset available | [Before](audit-screenshots/before/05-edited-reset-available.png) | [After](audit-screenshots/after/05-edited-reset-available.png) |
| Reset | [Before](audit-screenshots/before/06-reset.png) | [After](audit-screenshots/after/06-reset.png) |
| Mobile, 390px | [Before](audit-screenshots/before/07-mobile-390.png) | [After](audit-screenshots/after/07-mobile-390.png) |
| Mobile editor | [Before](audit-screenshots/before/08-mobile-editor.png) | [After](audit-screenshots/after/08-mobile-editor.png) |
| Mobile picker | [Before](audit-screenshots/before/09-mobile-picker.png) | [After](audit-screenshots/after/09-mobile-picker.png) |
| Advanced contrast | [Before](audit-screenshots/before/10-advanced-contrast.png) | [After](audit-screenshots/after/10-advanced-contrast.png) |

## Visual critique and correction

| Pass | Three weakest details seen in captures | Correction |
| --- | --- | --- |
| 1 | Desktop picker overlapped the preview; long token names truncated; the document could scroll into blank space. | Anchored the picker to the editor edge, rebalanced row widths, and constrained the app to the viewport with scrolling inside panels. |
| 2 | Mobile preset cards displaced editing; header and sheet icon targets were too small; the guide described old HSL behavior. | Compressed mobile cards, enlarged controls to 40px, and corrected the guide copy. |

## Verification and remaining limits

- `npm run build`, `npm run lint`, and `npx tsc --noEmit` pass with no errors or new warnings.
- Manually edited in Hex, RGB, HSL, and OKLCH; adjusted alpha and slider values with arrow keys; opened and closed the picker with the keyboard and checked focus return.
- Added and removed saved swatches, reloaded to verify persistence, copied OKLCH CSS with alpha, copied and opened a share URL in a fresh tab, used a one-click contrast fix, and checked the 390px layout.
- The EyeDropper worked in the available in-app Chromium browser. A separate Chrome browser was unavailable, so that specific browser check remains unverified.
- The export download action reported a started download, but the browser tool did not expose a completed file event. Copy output was verified from the clipboard.
- The preview path applies edits synchronously and debounces URL writes. A sub-16ms render time was not instrumented.
