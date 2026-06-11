import { formatHsl, parseHsl } from "./colorUtils";
import { CSS_VARS, type ThemeValues } from "./types";

/**
 * Morphing preset transition: colors tween in HSL space whenever the
 * active preset or mode changes, taking the shortest path around the
 * hue wheel so e.g. magenta -> red never detours through green.
 */

export const MORPH_MS = 440;

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function hueLerp(a: number, b: number, t: number): number {
  let d = b - a;
  if (d > 180) d -= 360;
  else if (d < -180) d += 360;
  return a + d * t;
}

export function lerpThemeValues(
  from: ThemeValues,
  to: ThemeValues,
  t: number
): ThemeValues {
  const out = {} as ThemeValues;
  for (const key of CSS_VARS) {
    const a = parseHsl(from[key]);
    const b = parseHsl(to[key]);
    if (!a || !b) {
      out[key] = to[key];
      continue;
    }
    out[key] = formatHsl(
      hueLerp(a.h, b.h, t),
      a.s + (b.s - a.s) * t,
      a.l + (b.l - a.l) * t
    );
  }
  return out;
}
