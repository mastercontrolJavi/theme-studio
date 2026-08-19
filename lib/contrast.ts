import { formatHsl, hslToRgb, parseHsl } from "./colorUtils";
import type { CSSVar, ThemeValues } from "./types";

/**
 * Real WCAG 2.1 contrast math for the pairings shadcn/ui actually paints.
 *
 * Two rules apply here:
 *   1.4.3 / 1.4.6 Contrast (text)      AA 4.5:1, AAA 7:1
 *                                      large text: AA 3:1, AAA 4.5:1
 *   1.4.11        Non-text contrast    AA 3:1 (no AAA level exists)
 *
 * Every pairing below was chosen by reading components/ui/*.tsx rather than
 * by pairing token names that look symmetrical. Notably --destructive-foreground
 * is never referenced by this component set: the radix-nova style paints
 * destructive as `bg-destructive/10 text-destructive`, so the pairings that
 * matter are --destructive against --card and --background.
 */

export type PairKind = "text" | "ui";

export interface Pairing {
  id: string;
  fg: CSSVar;
  bg: CSSVar;
  kind: PairKind;
  /** Plain-language name of what this pairing paints. */
  label: string;
  /** Where it shows up in the live preview. */
  example: string;
  /**
   * Measured and shown, but excluded from the pass/fail tally. WCAG 1.4.11
   * covers boundaries needed to identify a control or its state, not
   * decorative rules, and shadcn borders are mostly decorative dividers.
   */
  informational?: boolean;
}

export const PAIRINGS: Pairing[] = [
  {
    id: "body-text",
    fg: "foreground",
    bg: "background",
    kind: "text",
    label: "Body text",
    example: "Every paragraph and heading on the page",
  },
  {
    id: "card-text",
    fg: "card-foreground",
    bg: "card",
    kind: "text",
    label: "Text inside cards",
    example: "The card title in the Card section",
  },
  {
    id: "popover-text",
    fg: "popover-foreground",
    bg: "popover",
    kind: "text",
    label: "Text in menus and popovers",
    example: "Region names inside the open Select menu",
  },
  {
    id: "primary-label",
    fg: "primary-foreground",
    bg: "primary",
    kind: "text",
    label: "Label on primary buttons",
    example: 'The word "Default" on the filled primary button',
  },
  {
    id: "secondary-label",
    fg: "secondary-foreground",
    bg: "secondary",
    kind: "text",
    label: "Label on secondary buttons",
    example: 'The word "Secondary" on the secondary button and badge',
  },
  {
    id: "muted-on-muted",
    fg: "muted-foreground",
    bg: "muted",
    kind: "text",
    label: "Muted text on muted fills",
    example: "Inactive tab labels in the Controls section",
  },
  {
    id: "muted-on-bg",
    fg: "muted-foreground",
    bg: "background",
    kind: "text",
    label: "Helper text and placeholders",
    example: 'The "hello@example.com" placeholder in the form',
  },
  {
    id: "muted-on-card",
    fg: "muted-foreground",
    bg: "card",
    kind: "text",
    label: "Card descriptions",
    example: 'The "Your project is linked" line under the card title',
  },
  {
    id: "accent-text",
    fg: "accent-foreground",
    bg: "accent",
    kind: "text",
    label: "Highlighted menu item",
    example: "The row under your cursor in an open Select menu",
  },
  {
    id: "destructive-on-card",
    fg: "destructive",
    bg: "card",
    kind: "text",
    label: "Error alert text",
    example: 'The "Destructive alert" banner in the Alerts section',
  },
  {
    id: "destructive-on-bg",
    fg: "destructive",
    bg: "background",
    kind: "text",
    label: "Destructive button label",
    example: 'The word "Destructive" on the delete button',
  },
  {
    id: "primary-fill",
    fg: "primary",
    bg: "background",
    kind: "ui",
    label: "Primary button against the page",
    example: "The filled primary button's edge where it meets the background",
  },
  {
    id: "focus-ring",
    fg: "ring",
    bg: "background",
    kind: "ui",
    label: "Keyboard focus ring",
    example: "The ring drawn when you tab to a button or input",
  },
  {
    id: "border-on-bg",
    fg: "border",
    bg: "background",
    kind: "ui",
    label: "Divider and outline lines",
    example: "The hairline rules between preview sections",
    informational: true,
  },
  {
    id: "input-on-bg",
    fg: "input",
    bg: "background",
    kind: "ui",
    label: "Form field outlines",
    example: "The border around the email input",
    informational: true,
  },
];

export const COUNTED_PAIRINGS = PAIRINGS.filter((p) => !p.informational);

/** Pairings that use `token` as their foreground, for the info affordance. */
export function pairingsForVar(v: CSSVar): Pairing[] {
  return PAIRINGS.filter((p) => p.fg === v || p.bg === v);
}

/** WCAG relative luminance of an sRGB triplet (channels 0-255). */
export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two HSL strings. Returns 1 if either fails to parse. */
export function contrastRatio(hslA: string, hslB: string): number {
  const a = hslToRgb(hslA);
  const b = hslToRgb(hslB);
  if (!a || !b) return 1;
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** The AA threshold that applies to a pairing. */
export function requiredRatio(pairing: Pairing): number {
  return pairing.kind === "text" ? 4.5 : 3;
}

export interface PairingResult {
  pairing: Pairing;
  ratio: number;
  /** AA at the threshold that applies to this pairing's kind. */
  aa: boolean;
  /** AAA at 7:1. Always false for non-text: WCAG defines no AAA level there. */
  aaa: boolean;
  /** Text only: AA at the large-text threshold of 3:1. */
  aaLarge: boolean;
  /** Text only: AAA at the large-text threshold of 4.5:1. */
  aaaLarge: boolean;
  /** WCAG defines no AAA requirement for non-text contrast. */
  aaaApplies: boolean;
  required: number;
  counted: boolean;
}

export function gradePairing(
  values: ThemeValues,
  pairing: Pairing
): PairingResult {
  const ratio = contrastRatio(values[pairing.fg], values[pairing.bg]);
  const isText = pairing.kind === "text";
  const required = requiredRatio(pairing);
  return {
    pairing,
    ratio,
    aa: ratio >= required,
    aaa: isText && ratio >= 7,
    aaLarge: isText && ratio >= 3,
    aaaLarge: isText && ratio >= 4.5,
    aaaApplies: isText,
    required,
    counted: !pairing.informational,
  };
}

export interface ContrastReport {
  results: PairingResult[];
  /** Counted pairings only. */
  passAA: number;
  passAAA: number;
  /** Counted pairings that have an AAA level to reach (text pairings). */
  aaaEligible: number;
  total: number;
}

export function auditTheme(values: ThemeValues): ContrastReport {
  const results = PAIRINGS.map((p) => gradePairing(values, p));
  const counted = results.filter((r) => r.counted);
  return {
    results,
    passAA: counted.filter((r) => r.aa).length,
    passAAA: counted.filter((r) => r.aaaApplies && r.aaa).length,
    aaaEligible: counted.filter((r) => r.aaaApplies).length,
    total: counted.length,
  };
}

export interface ContrastFix {
  token: CSSVar;
  /** The nudged HSL string to write back. */
  hsl: string;
  /** Signed lightness delta applied, for the "L 32% -> 26%" readout. */
  fromL: number;
  toL: number;
  /**
   * False when the only lightness that fixes this pairing pushes another
   * pairing that touches the same token below AA. The fix is still offered,
   * but the caller should say so rather than claim a clean win.
   */
  keepsOthersPassing: boolean;
  /** The currently-passing pairings this fix would drop below AA, if any. */
  breaks: Pairing[];
}

const SEARCH_STEP = 0.5;

/**
 * Find the smallest lightness nudge to `pairing.fg` that brings the pairing to
 * AA, holding hue and saturation fixed.
 *
 * Most tokens appear in more than one pairing (--muted-foreground sits on three
 * different grounds; --primary is both a fill and the ground under its own
 * label), so the search first looks for a lightness that fixes the target
 * without dropping any related pairing that currently passes. Only if no such
 * value exists does it fall back to fixing the target alone, flagging that in
 * the result so the UI can be honest about the tradeoff.
 *
 * Returns null when no lightness reaches AA at this hue and saturation.
 */
export function findContrastFix(
  values: ThemeValues,
  pairing: Pairing
): ContrastFix | null {
  if (pairing.informational) return null;
  const fg = parseHsl(values[pairing.fg]);
  if (!fg) return null;

  const bg = values[pairing.bg];
  const target = requiredRatio(pairing);

  // Any other counted pairing that touches this token, on either side. Nudging
  // --primary to fix its fill contrast also moves the ground that
  // --primary-foreground sits on, so both directions have to be checked.
  const related = COUNTED_PAIRINGS.filter(
    (p) =>
      p.id !== pairing.id && (p.fg === pairing.fg || p.bg === pairing.fg)
  );
  const relatedPassingNow = related.filter(
    (p) => contrastRatio(values[p.fg], values[p.bg]) >= requiredRatio(p)
  );

  // Walk outward from the current lightness so the nudge stays as small as
  // possible. At equal distance, try the direction away from the background
  // first, since that is the side that gains contrast.
  const bgRgb = hslToRgb(bg);
  const bgIsLight = bgRgb ? relativeLuminance(bgRgb) > 0.18 : true;

  const candidates: number[] = [];
  for (let d = SEARCH_STEP; d <= 100; d += SEARCH_STEP) {
    const darker = fg.l - d;
    const lighter = fg.l + d;
    const first = bgIsLight ? darker : lighter;
    const second = bgIsLight ? lighter : darker;
    if (first >= 0 && first <= 100) candidates.push(first);
    if (second >= 0 && second <= 100) candidates.push(second);
  }

  /** Which currently-passing related pairings this candidate would drop. */
  const regressions = (candidate: string): Pairing[] =>
    relatedPassingNow.filter(
      (p) =>
        contrastRatio(
          p.fg === pairing.fg ? candidate : values[p.fg],
          p.bg === pairing.fg ? candidate : values[p.bg]
        ) < requiredRatio(p)
    );

  let fallback: number | null = null;

  for (const l of candidates) {
    const candidate = formatHsl(fg.h, fg.s, l);
    if (contrastRatio(candidate, bg) < target) continue;

    if (fallback === null) fallback = l;

    if (regressions(candidate).length === 0) {
      return {
        token: pairing.fg,
        hsl: candidate,
        fromL: fg.l,
        toL: l,
        keepsOthersPassing: true,
        breaks: [],
      };
    }
  }

  if (fallback === null) return null;
  const hsl = formatHsl(fg.h, fg.s, fallback);
  const breaks = regressions(hsl);
  return {
    token: pairing.fg,
    hsl,
    fromL: fg.l,
    toL: fallback,
    keepsOthersPassing: breaks.length === 0,
    breaks,
  };
}

/** "4.53:1", or "21:1" where the trailing zeros are noise. */
export function formatRatio(ratio: number): string {
  const rounded = Math.round(ratio * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}:1`;
}

/**
 * Pick the foreground lightness that reads on `ground`, keeping the current
 * hue and saturation so a tinted label stays tinted.
 *
 * Aims for AAA (7:1) with the smallest move from where the token already is,
 * which keeps a near-white label near-white instead of snapping it to pure
 * white. Where 7:1 is out of reach at this hue, it returns whichever end of
 * the lightness range contrasts most, so the result is always the best
 * available rather than a value that quietly fails.
 */
export function deriveForeground(
  ground: string,
  currentFg: string,
  target = 7
): string {
  const fg = parseHsl(currentFg);
  if (!fg) return currentFg;

  const groundRgb = hslToRgb(ground);
  const groundIsLight = groundRgb ? relativeLuminance(groundRgb) > 0.18 : true;

  for (let d = 0; d <= 100; d += SEARCH_STEP) {
    const first = groundIsLight ? fg.l - d : fg.l + d;
    const second = groundIsLight ? fg.l + d : fg.l - d;
    for (const l of d === 0 ? [fg.l] : [first, second]) {
      if (l < 0 || l > 100) continue;
      const candidate = formatHsl(fg.h, fg.s, l);
      if (contrastRatio(candidate, ground) >= target) return candidate;
    }
  }

  // Nothing reaches the target at this hue and saturation: take the extreme
  // that contrasts most.
  const darkest = formatHsl(fg.h, fg.s, 0);
  const lightest = formatHsl(fg.h, fg.s, 100);
  return contrastRatio(darkest, ground) >= contrastRatio(lightest, ground)
    ? darkest
    : lightest;
}
