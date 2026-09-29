import { formatOklch, parseOklch } from "./colorValue";
import { CSS_VARS, type ThemeValues } from "./types";

/**
 * Morphing preset transition: colors tween in OKLCH space whenever the
 * active preset or mode changes, taking the shortest path around the
 * hue wheel so e.g. magenta -> red never detours through green.
 */

export const MORPH_MS = 180;

export function easeInOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
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
    const a = parseOklch(from[key]);
    const b = parseOklch(to[key]);
    if (!a || !b) {
      out[key] = to[key];
      continue;
    }
    out[key] = formatOklch({
      h: hueLerp(a.h, b.h, t),
      c: a.c + (b.c - a.c) * t,
      l: a.l + (b.l - a.l) * t,
      a: a.a + (b.a - a.a) * t,
    });
  }
  return out;
}
