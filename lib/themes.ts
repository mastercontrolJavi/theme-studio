import { formatHsl, hexToHsl, hslToHex, parseHsl } from "./colorUtils";
import type { Mode, ThemeConfig, ThemeValues } from "./types";

/**
 * Five preset themes. Each defines a complete light + dark palette.
 * Values are HSL strings ("h s% l%") matching shadcn/ui's CSS variable format.
 */

export const PRESETS: ThemeConfig[] = [
  {
    name: "Ivory",
    light: {
      background: "36 33% 96%",
      foreground: "330 45% 8%",
      card: "34 27% 93%",
      "card-foreground": "330 45% 8%",
      popover: "36 33% 96%",
      "popover-foreground": "330 45% 8%",
      primary: "336 68% 32%",
      "primary-foreground": "36 33% 96%",
      secondary: "30 22% 89%",
      "secondary-foreground": "330 45% 8%",
      muted: "30 22% 89%",
      "muted-foreground": "21 14% 50%",
      accent: "336 20% 94%",
      "accent-foreground": "336 68% 32%",
      destructive: "0 60% 42%",
      "destructive-foreground": "36 33% 96%",
      border: "27 21% 80%",
      input: "27 21% 80%",
      ring: "336 68% 32%",
    },
    dark: {
      background: "330 18% 9%",
      foreground: "36 33% 96%",
      card: "330 14% 13%",
      "card-foreground": "36 33% 96%",
      popover: "330 14% 13%",
      "popover-foreground": "36 33% 96%",
      primary: "336 60% 56%",
      "primary-foreground": "330 45% 8%",
      secondary: "330 12% 18%",
      "secondary-foreground": "36 33% 96%",
      muted: "330 10% 18%",
      "muted-foreground": "27 14% 65%",
      accent: "336 30% 22%",
      "accent-foreground": "336 60% 80%",
      destructive: "0 62% 50%",
      "destructive-foreground": "36 33% 96%",
      border: "330 10% 22%",
      input: "330 10% 22%",
      ring: "336 60% 56%",
    },
  },
  {
    name: "Zinc",
    light: {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "0 0% 100%",
      "card-foreground": "240 10% 3.9%",
      popover: "0 0% 100%",
      "popover-foreground": "240 10% 3.9%",
      primary: "240 5.9% 10%",
      "primary-foreground": "0 0% 98%",
      secondary: "240 4.8% 95.9%",
      "secondary-foreground": "240 5.9% 10%",
      muted: "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      accent: "240 4.8% 95.9%",
      "accent-foreground": "240 5.9% 10%",
      destructive: "0 84.2% 60.2%",
      "destructive-foreground": "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "240 5.9% 10%",
    },
    dark: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      popover: "240 10% 3.9%",
      "popover-foreground": "0 0% 98%",
      primary: "0 0% 98%",
      "primary-foreground": "240 5.9% 10%",
      secondary: "240 3.7% 15.9%",
      "secondary-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      accent: "240 3.7% 15.9%",
      "accent-foreground": "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      "destructive-foreground": "0 0% 98%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "240 4.9% 83.9%",
    },
  },
  {
    name: "Midnight",
    light: {
      background: "210 40% 98%",
      foreground: "222 47% 11%",
      card: "0 0% 100%",
      "card-foreground": "222 47% 11%",
      popover: "0 0% 100%",
      "popover-foreground": "222 47% 11%",
      primary: "217 91% 60%",
      "primary-foreground": "210 40% 98%",
      secondary: "210 40% 96%",
      "secondary-foreground": "222 47% 11%",
      muted: "210 40% 96%",
      "muted-foreground": "215 16% 47%",
      accent: "217 91% 96%",
      "accent-foreground": "217 91% 35%",
      destructive: "0 84% 60%",
      "destructive-foreground": "210 40% 98%",
      border: "214 32% 91%",
      input: "214 32% 91%",
      ring: "217 91% 60%",
    },
    dark: {
      background: "222 47% 8%",
      foreground: "210 40% 98%",
      card: "222 45% 11%",
      "card-foreground": "210 40% 98%",
      popover: "222 45% 11%",
      "popover-foreground": "210 40% 98%",
      primary: "217 91% 60%",
      "primary-foreground": "222 47% 8%",
      secondary: "217 33% 17%",
      "secondary-foreground": "210 40% 98%",
      muted: "217 33% 17%",
      "muted-foreground": "215 20% 65%",
      accent: "217 91% 22%",
      "accent-foreground": "217 91% 80%",
      destructive: "0 62% 45%",
      "destructive-foreground": "210 40% 98%",
      border: "217 33% 20%",
      input: "217 33% 20%",
      ring: "217 91% 60%",
    },
  },
  {
    name: "Sage",
    light: {
      background: "60 14% 97%",
      foreground: "120 14% 12%",
      card: "60 12% 94%",
      "card-foreground": "120 14% 12%",
      popover: "60 14% 97%",
      "popover-foreground": "120 14% 12%",
      primary: "142 30% 38%",
      "primary-foreground": "60 14% 97%",
      secondary: "90 14% 90%",
      "secondary-foreground": "120 14% 12%",
      muted: "90 14% 90%",
      "muted-foreground": "120 8% 42%",
      accent: "142 30% 92%",
      "accent-foreground": "142 30% 28%",
      destructive: "12 70% 48%",
      "destructive-foreground": "60 14% 97%",
      border: "90 14% 82%",
      input: "90 14% 82%",
      ring: "142 30% 38%",
    },
    dark: {
      background: "120 12% 8%",
      foreground: "60 14% 95%",
      card: "120 12% 11%",
      "card-foreground": "60 14% 95%",
      popover: "120 12% 11%",
      "popover-foreground": "60 14% 95%",
      primary: "142 35% 55%",
      "primary-foreground": "120 14% 8%",
      secondary: "120 10% 18%",
      "secondary-foreground": "60 14% 95%",
      muted: "120 10% 18%",
      "muted-foreground": "120 8% 60%",
      accent: "142 30% 22%",
      "accent-foreground": "142 30% 78%",
      destructive: "12 65% 50%",
      "destructive-foreground": "60 14% 95%",
      border: "120 10% 22%",
      input: "120 10% 22%",
      ring: "142 35% 55%",
    },
  },
  {
    name: "Slate",
    light: {
      background: "210 20% 98%",
      foreground: "222 20% 12%",
      card: "0 0% 100%",
      "card-foreground": "222 20% 12%",
      popover: "0 0% 100%",
      "popover-foreground": "222 20% 12%",
      primary: "199 89% 48%",
      "primary-foreground": "210 20% 98%",
      secondary: "210 16% 94%",
      "secondary-foreground": "222 20% 12%",
      muted: "210 16% 94%",
      "muted-foreground": "215 14% 46%",
      accent: "199 89% 94%",
      "accent-foreground": "199 89% 30%",
      destructive: "0 72% 51%",
      "destructive-foreground": "210 20% 98%",
      border: "214 20% 88%",
      input: "214 20% 88%",
      ring: "199 89% 48%",
    },
    dark: {
      background: "222 20% 10%",
      foreground: "210 20% 96%",
      card: "222 18% 13%",
      "card-foreground": "210 20% 96%",
      popover: "222 18% 13%",
      "popover-foreground": "210 20% 96%",
      primary: "199 89% 48%",
      "primary-foreground": "222 20% 10%",
      secondary: "222 16% 18%",
      "secondary-foreground": "210 20% 96%",
      muted: "222 16% 18%",
      "muted-foreground": "215 14% 64%",
      accent: "199 89% 22%",
      "accent-foreground": "199 89% 80%",
      destructive: "0 62% 45%",
      "destructive-foreground": "210 20% 96%",
      border: "222 16% 22%",
      input: "222 16% 22%",
      ring: "199 89% 48%",
    },
  },
];

export const DEFAULT_PRESET = PRESETS[0];

export function getPreset(name: string): ThemeConfig | undefined {
  return PRESETS.find((p) => p.name === name);
}

/**
 * Thumbnail swatch bands for the paint-chip preset gallery:
 * [background, primary, accent, secondary, foreground] as hex.
 */
export function chipBands(theme: ThemeConfig, mode: Mode): string[] {
  const v = theme[mode];
  return (
    ["background", "primary", "accent", "secondary", "foreground"] as const
  ).map((k) => hslToHex(v[k]));
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/**
 * Seed generator: one color in, a balanced light + dark palette out.
 * The seed's hue carries through every variable; chroma is clamped so
 * neutrals stay neutral and saturated seeds don't blow out surfaces.
 */
export function genFromSeed(hex: string): ThemeConfig {
  const seedHsl = parseHsl(hexToHsl(hex) ?? "0 0% 50%") ?? { h: 0, s: 0, l: 50 };
  const h = seedHsl.h;
  const chroma = clamp(seedHsl.s, 18, 80);
  const tint = (s: number, l: number) => formatHsl(h, s, l);

  const light: ThemeValues = {
    background: tint(Math.min(chroma, 24), 97),
    foreground: tint(Math.min(chroma, 30), 10),
    card: tint(Math.min(chroma, 20), 99),
    "card-foreground": tint(Math.min(chroma, 30), 10),
    popover: tint(Math.min(chroma, 20), 99),
    "popover-foreground": tint(Math.min(chroma, 30), 10),
    primary: formatHsl(h, chroma, clamp(seedHsl.l, 34, 50)),
    "primary-foreground": tint(Math.min(chroma, 24), 98),
    secondary: tint(Math.min(chroma, 22), 92),
    "secondary-foreground": tint(Math.min(chroma, 30), 14),
    muted: tint(Math.min(chroma, 20), 92),
    "muted-foreground": tint(Math.min(chroma, 16), 46),
    accent: tint(Math.min(chroma + 6, 40), 93),
    "accent-foreground": formatHsl(h, chroma, clamp(seedHsl.l - 6, 28, 42)),
    destructive: "0 72% 48%",
    "destructive-foreground": tint(Math.min(chroma, 24), 98),
    border: tint(Math.min(chroma, 20), 84),
    input: tint(Math.min(chroma, 20), 84),
    ring: formatHsl(h, chroma, clamp(seedHsl.l, 34, 50)),
  };
  const dark: ThemeValues = {
    background: tint(Math.min(chroma, 22), 8),
    foreground: tint(Math.min(chroma, 24), 96),
    card: tint(Math.min(chroma, 20), 12),
    "card-foreground": tint(Math.min(chroma, 24), 96),
    popover: tint(Math.min(chroma, 20), 12),
    "popover-foreground": tint(Math.min(chroma, 24), 96),
    primary: formatHsl(h, clamp(chroma + 4, 30, 78), clamp(seedHsl.l + 14, 52, 64)),
    "primary-foreground": tint(Math.min(chroma, 24), 8),
    secondary: tint(Math.min(chroma, 18), 18),
    "secondary-foreground": tint(Math.min(chroma, 24), 96),
    muted: tint(Math.min(chroma, 16), 18),
    "muted-foreground": tint(Math.min(chroma, 16), 64),
    accent: formatHsl(h, clamp(chroma, 24, 50), 24),
    "accent-foreground": formatHsl(h, clamp(chroma, 30, 70), 80),
    destructive: "0 62% 48%",
    "destructive-foreground": tint(Math.min(chroma, 24), 96),
    border: tint(Math.min(chroma, 16), 22),
    input: tint(Math.min(chroma, 16), 22),
    ring: formatHsl(h, clamp(chroma + 4, 30, 78), clamp(seedHsl.l + 14, 52, 64)),
  };
  return { name: "Custom", light, dark };
}
