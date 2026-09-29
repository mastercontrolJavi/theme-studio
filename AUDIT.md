# Theme Studio product audit

Baseline captured locally on 2026-09-28 at 1440 × 900 and 390 × 844 before product code changes. Evidence is in [`audit-screenshots/before`](audit-screenshots/before). The app opens on the Ivory preset, with a first-run tour, a left editor, and a live component preview. There is no blank theme: Reset returns to the selected preset.

## Top 10 issues, ranked by user impact

| Rank | Observed problem | Why it matters | Fix |
| --- | --- | --- | --- |
| 1 | The color popover has only a saturation square, hue slider, and HEX field ([02](audit-screenshots/before/02-color-editing.png)). | Developers cannot tune opacity, sample a color, switch notation, or reuse a palette color in the primary editing flow. | Extend the existing solid picker with alpha, EyeDropper where supported, four formats, and saved swatches. |
| 2 | At 390px the color popover floats over the Customize sheet and nearby controls ([09](audit-screenshots/before/09-mobile-picker.png)). | The most precise controls become cramped and obscure the token being edited. | Present the picker as its own bottom sheet below 640px, with the token name and value in its header. |
| 3 | Theme state and CSS export are HSL triplets while the UI offers OKLCH only as a conversion; alpha is absent ([03](audit-screenshots/before/03-export.png)). | Copying a Tailwind v4 theme cannot preserve a transparent color and drifts from the requested canonical notation. | Store canonical OKLCH values and export valid `oklch(... / alpha)` in CSS, Tailwind, and JSON. Keep legacy shared links readable. |
| 4 | Switching to Advanced automatically expands a long contrast report ahead of all token rows ([10](audit-screenshots/before/10-advanced-contrast.png)). | The main editing task disappears below the fold exactly when users ask for more controls. | Keep the score visible and the detailed report collapsed until requested. |
| 5 | Token rows use very small names, values, and info buttons; only derived Simple rows show an inline contrast result ([01](audit-screenshots/before/01-default-1440.png)). | A developer must open separate details or scroll to the report to judge a token, and small targets slow scanning. | Give each row a 40px minimum target, mono token name/value, swatch, and a compact AA/AAA badge for relevant pairings. |
| 6 | The selected Ivory theme renders `#f8f5f1` and `#891a47`, while the shell specifies `#FAF6F0` and `#8B1A4A` ([01](audit-screenshots/before/01-default-1440.png)). | The first exported theme does not faithfully represent the product's own brand. | Correct the default preset values and preserve the shell's fixed brand tokens. |
| 7 | Export is a full-width 72vh sheet with a large dark code block and two similarly prominent actions ([03](audit-screenshots/before/03-export.png)). | The next action is less clear and the code dominates the task. | Make Copy the clear primary action, Download secondary, and tighten the sheet hierarchy. |
| 8 | Share succeeds by changing a small icon state and transient text with little visual prominence ([04](audit-screenshots/before/04-share-success.png)). | Users may click repeatedly or doubt whether a usable URL was copied. | Give share a persistent, screen-reader announced success/error message and clear retry state. |
| 9 | Many controls are under 40px and spacing includes half steps such as 10px and 18px in the editor ([01](audit-screenshots/before/01-default-1440.png), [08](audit-screenshots/before/08-mobile-editor.png)). | Touch and keyboard use are less reliable, and the dense sidebar feels inconsistent. | Apply a 4px spacing rhythm to the editing surfaces, enlarge icon targets, and use visible burgundy focus rings. |
| 10 | The live marker pulses and preset switching morphs through intermediate colors; precise preview is not always the exact selected theme ([01](audit-screenshots/before/01-default-1440.png)). | Decoration competes with the comparison task and delays trust in the color shown. | Remove the pulse, keep state motion to 150–200ms ease-out, and apply direct edits immediately. |

## Existing feature inventory

| Feature | Baseline state | Decision |
| --- | --- | --- |
| Simple / Advanced | Works. Simple shows four decision tokens and auto-derives button labels; Advanced exposes all 19. | Keep the model. Remove the automatic contrast expansion and improve row scanability. |
| WCAG checker | Works for defined shadcn foreground/background pairs. Uses luminance math and offers a lightness fix. | Keep its pair map and fix affordance. Adapt calculations to canonical OKLCH and composited alpha; make the badge visible on rows. |
| First-run walkthrough | Appears on a fresh session and can be reopened from the header ([00](audit-screenshots/before/00-first-run.png)). | Keep it. Recheck its targets after layout changes. |
| Export formats | CSS variables, Tailwind v4, and JSON exist; Copy and Download are functional. | Keep all three. Change output values to OKLCH and preserve alpha. |
| URL sharing | Edits write to the URL after 250ms; Copy link builds from current state, so a fast copy includes the latest edit. | Keep the debounce and copy behavior. Improve feedback and make parser accept both old HSL links and new OKLCH links. |
| Reset / empty | Reset restores the selected preset. A blank theme is not a product state. | Keep preset-backed reset. Treat empty/error states in export and share as explicit outcomes rather than inventing a blank canvas. |

## Capture sequence and limits

1. First-run tour: functional, but small copy and dense overlay.
2. Desktop default: editor and preview visible; core structure is sound.
3. Color editing: missing requested controls.
4. Export: three formats present; hierarchy needs work.
5. Share success: URL copies, feedback is easy to miss.
6. Edited state and reset: an edit changes preview and URL; Reset restores the preset.
7. Mobile default: preview is readable; Customize is reachable.
8. Mobile editor and picker: picker overlays sheet content.
9. Advanced contrast: details push editing controls below the fold.

Screenshots show layout and visible states, not full keyboard behavior, color conversion accuracy, persistence, or timing. Those require the Phase 4 interaction checks.
