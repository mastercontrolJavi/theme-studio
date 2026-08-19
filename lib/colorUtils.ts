/**
 * Color conversion helpers.
 * shadcn stores colors as space-separated HSL strings ("336 68% 32%").
 * Color pickers and exports speak hex. These utilities round-trip between them.
 */

export function normalizeHex(input: string): string | null {
  const trimmed = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(trimmed) && !/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    return null;
  }
  const expanded =
    trimmed.length === 3
      ? trimmed
          .split("")
          .map((c) => c + c)
          .join("")
      : trimmed;
  return `#${expanded.toLowerCase()}`;
}

/** "336 68% 32%" → { h: 336, s: 68, l: 32 } */
export function parseHsl(hsl: string): { h: number; s: number; l: number } | null {
  const match = hsl
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/);
  if (!match) return null;
  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
  };
}

export function formatHsl(h: number, s: number, l: number): string {
  const round = (n: number) => Math.round(n * 10) / 10;
  return `${round(h)} ${round(s)}% ${round(l)}%`;
}

export function hexToHsl(hex: string): string | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return formatHsl(h, s * 100, l * 100);
}

/** "336 68% 32%" -> [r, g, b] with each channel in 0-255. */
export function hslToRgb(hsl: string): [number, number, number] | null {
  const parsed = parseHsl(hsl);
  if (!parsed) return null;
  const { h, s, l } = parsed;
  const sNorm = Math.min(Math.max(s, 0), 100) / 100;
  const lNorm = Math.min(Math.max(l, 0), 100) / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const hPrime = ((((h % 360) + 360) % 360) / 60);
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  const m = lNorm - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hPrime >= 0 && hPrime < 1) [r1, g1, b1] = [c, x, 0];
  else if (hPrime < 2) [r1, g1, b1] = [x, c, 0];
  else if (hPrime < 3) [r1, g1, b1] = [0, c, x];
  else if (hPrime < 4) [r1, g1, b1] = [0, x, c];
  else if (hPrime < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

export function hslToHex(hsl: string): string {
  const rgb = hslToRgb(hsl);
  if (!rgb) return "#000000";
  const toHex = (n: number) =>
    Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

/** True if a color (hsl string) is dark enough that white text reads on it */
export function isHslDark(hsl: string): boolean {
  const parsed = parseHsl(hsl);
  if (!parsed) return false;
  return parsed.l < 50;
}

/* ------------------------------------------------------------------------- *
 * OKLCH
 *
 * The theme is stored as HSL because that is shadcn's on-disk format, but
 * OKLCH is how a lot of people reason about colour now, so Advanced mode
 * accepts and shows it. Conversion runs the full path in both directions:
 * sRGB <-> linear sRGB <-> LMS <-> OKLab <-> OKLCH.
 *
 * One honest caveat, surfaced in the UI rather than buried: OKLCH can name
 * colours outside the sRGB gamut and HSL cannot, so an out-of-gamut value is
 * clamped on the way in. Round-tripping such a value will not return what you
 * typed, because the colour you typed is not expressible in the format the
 * theme is stored in.
 * ------------------------------------------------------------------------- */

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** [r, g, b] 0-255 -> { l, c, h } with l in 0-1, h in degrees. */
export function rgbToOklch([r, g, b]: [number, number, number]): {
  l: number;
  c: number;
  h: number;
} {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const chroma = Math.sqrt(okA * okA + okB * okB);
  let hue = (Math.atan2(okB, okA) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  // A neutral has no meaningful hue; reporting the numerical noise would be
  // worse than reporting zero.
  return { l: okL, c: chroma, h: chroma < 1e-6 ? 0 : hue };
}

/** { l, c, h } -> [r, g, b] 0-255, clamped into the sRGB gamut. */
export function oklchToRgb(
  okL: number,
  okC: number,
  okH: number
): [number, number, number] {
  const hRad = (okH * Math.PI) / 180;
  const okA = okC * Math.cos(hRad);
  const okB = okC * Math.sin(hRad);

  const l = (okL + 0.3963377774 * okA + 0.2158037573 * okB) ** 3;
  const m = (okL - 0.1055613458 * okA - 0.0638541728 * okB) ** 3;
  const s = (okL - 0.0894841775 * okA - 1.291485548 * okB) ** 3;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n * 255)));
  return [
    clamp(linearToSrgb(lr)),
    clamp(linearToSrgb(lg)),
    clamp(linearToSrgb(lb)),
  ];
}

/** [r, g, b] 0-255 -> the "h s% l%" string the theme stores. */
export function rgbToHslString([r, g, b]: [number, number, number]): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return hexToHsl(`#${toHex(r)}${toHex(g)}${toHex(b)}`) ?? "0 0% 0%";
}

/** "336 68% 32%" -> "oklch(0.412 0.145 5.4)" */
export function hslToOklch(hsl: string): string {
  const rgb = hslToRgb(hsl);
  if (!rgb) return "oklch(0 0 0)";
  const { l, c, h } = rgbToOklch(rgb);
  // Four places on L and C, two on H. Coarser rounding shifts 46 of the 190
  // preset values by a hex level on a round trip; this brings that to 11, and
  // the input guards the rest by treating a re-entered display value as a
  // no-op rather than a new colour.
  const r4 = (n: number) => Math.round(n * 10000) / 10000;
  return `oklch(${r4(l)} ${r4(c)} ${Math.round(h * 100) / 100})`;
}

/**
 * Accepts "oklch(0.412 0.145 5.4)", the bare "0.412 0.145 5.4", and
 * percentage lightness such as "oklch(41.2% 0.145 5.4)".
 * Returns the theme's HSL string, or null when the input is not valid.
 */
export function oklchToHsl(input: string): string | null {
  const body = input
    .trim()
    .replace(/^oklch\s*\(/i, "")
    .replace(/\)$/, "")
    .trim();
  const parts = body.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const num = (raw: string, pctScale: number): number | null => {
    const m = raw.match(/^(-?\d*\.?\d+)(%?)$/);
    if (!m) return null;
    const value = Number(m[1]);
    if (!Number.isFinite(value)) return null;
    return m[2] === "%" ? value / pctScale : value;
  };

  const l = num(parts[0], 100);
  const c = num(parts[1], 250); // per CSS Color 4, 100% chroma is 0.4
  const h = num(parts[2], 1);
  if (l === null || c === null || h === null) return null;
  if (l < 0 || l > 1 || c < 0 || c > 0.6) return null;

  return rgbToHslString(oklchToRgb(l, c, h));
}

/** True when an OKLCH value falls outside what sRGB, and so HSL, can express. */
export function isOutOfSrgbGamut(okL: number, okC: number, okH: number): boolean {
  const hRad = (okH * Math.PI) / 180;
  const okA = okC * Math.cos(hRad);
  const okB = okC * Math.sin(hRad);
  const l = (okL + 0.3963377774 * okA + 0.2158037573 * okB) ** 3;
  const m = (okL - 0.1055613458 * okA - 0.0638541728 * okB) ** 3;
  const s = (okL - 0.0894841775 * okA - 1.291485548 * okB) ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(linearToSrgb);
  return channels.some((c) => c < -0.001 || c > 1.001);
}


/**
 * Lenient HSL entry. Accepts "336 68% 32%", "336, 68%, 32%", "336 68 32", and
 * "hsl(336 68% 32%)", because someone typing a colour by hand should not have
 * to match one exact spelling. Returns the canonical stored form, or null when
 * the input is not three numbers in range.
 */
export function parseHslLoose(input: string): string | null {
  const body = input
    .trim()
    .replace(/^hsl\s*\(/i, "")
    .replace(/\)$/, "")
    .trim();
  const parts = body.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const nums: number[] = [];
  for (const raw of parts.slice(0, 3)) {
    const m = raw.match(/^(-?\d*\.?\d+)(deg|%)?$/i);
    if (!m) return null;
    const value = Number(m[1]);
    if (!Number.isFinite(value)) return null;
    nums.push(value);
  }
  const [h, sat, light] = nums;
  if (sat < 0 || sat > 100 || light < 0 || light > 100) return null;
  return formatHsl(((h % 360) + 360) % 360, sat, light);
}
