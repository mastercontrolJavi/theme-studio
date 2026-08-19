import { normalizeHex } from "./colorUtils";
import { DEFAULT_PRESET, genFromSeed, getPreset } from "./themes";
import { CSS_VARS, type CSSVar, type Mode, type ThemeConfig } from "./types";

/**
 * The whole theme, encoded into search params so a link carries a specific
 * theme rather than the name of a starting point.
 *
 *   ?p=Ivory&m=light&l.primary=336+68%25+32%25&d.primary=...
 *
 * Seed-generated themes carry the seed they came from, since the generator is
 * deterministic and one hex reproduces the whole palette:
 *
 *   ?p=Custom&seed=6d28d9&m=dark
 *
 * Only the values that diverge from that base are written. Base plus deltas
 * still reconstructs all 38 values exactly, and it keeps a shared link short
 * and readable instead of a wall of opaque triplets.
 */

export interface UrlOverrides {
  light: Partial<Record<CSSVar, string>>;
  dark: Partial<Record<CSSVar, string>>;
}

export interface UrlState {
  base: ThemeConfig;
  seedHex: string | null;
  mode: Mode;
  overrides: UrlOverrides;
}

export function cloneTheme(t: ThemeConfig): ThemeConfig {
  return {
    name: t.name,
    light: { ...t.light },
    dark: { ...t.dark },
  };
}

export function parseUrlState(search: string): UrlState {
  const sp = new URLSearchParams(search);
  const mode: Mode = sp.get("m") === "dark" ? "dark" : "light";

  let base: ThemeConfig | undefined;
  let seedHex: string | null = null;
  if (sp.get("p") === "Custom") {
    const seed = normalizeHex(sp.get("seed") ?? "");
    if (seed) {
      base = genFromSeed(seed);
      seedHex = seed;
    }
  } else {
    base = getPreset(sp.get("p") ?? "");
  }
  base = base ?? DEFAULT_PRESET;

  const overrides: UrlOverrides = { light: {}, dark: {} };
  for (const v of CSS_VARS) {
    const lv = sp.get(`l.${v}`);
    if (lv) overrides.light[v] = lv;
    const dv = sp.get(`d.${v}`);
    if (dv) overrides.dark[v] = dv;
  }

  return { base, seedHex, mode, overrides };
}

export function buildUrl(
  theme: ThemeConfig,
  mode: Mode,
  seedHex: string | null
): string {
  const sp = new URLSearchParams();
  sp.set("p", theme.name);
  sp.set("m", mode);

  const base =
    theme.name === "Custom"
      ? seedHex
        ? genFromSeed(seedHex)
        : null
      : (getPreset(theme.name) ?? null);

  if (theme.name === "Custom" && seedHex) {
    sp.set("seed", seedHex.replace(/^#/, ""));
  }

  if (base) {
    for (const v of CSS_VARS) {
      if (theme.light[v] !== base.light[v]) sp.set(`l.${v}`, theme.light[v]);
      if (theme.dark[v] !== base.dark[v]) sp.set(`d.${v}`, theme.dark[v]);
    }
  } else {
    // No reconstructable base, so nothing may be left implicit: write every
    // value. Without this a Custom theme whose seed went missing would encode
    // as a bare name and silently reopen as the default palette.
    for (const v of CSS_VARS) {
      sp.set(`l.${v}`, theme.light[v]);
      sp.set(`d.${v}`, theme.dark[v]);
    }
  }

  return `?${sp.toString()}`;
}

export function applyOverrides(
  base: ThemeConfig,
  overrides: UrlOverrides
): ThemeConfig {
  const next = cloneTheme(base);
  for (const [k, v] of Object.entries(overrides.light)) {
    if (v) next.light[k as CSSVar] = v;
  }
  for (const [k, v] of Object.entries(overrides.dark)) {
    if (v) next.dark[k as CSSVar] = v;
  }
  return next;
}

/** The theme a given search string resolves to, for round-trip checks. */
export function themeFromSearch(search: string): {
  theme: ThemeConfig;
  mode: Mode;
  seedHex: string | null;
} {
  const { base, seedHex, mode, overrides } = parseUrlState(search);
  return { theme: applyOverrides(base, overrides), mode, seedHex };
}
