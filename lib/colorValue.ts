import {
  hslToRgb,
  normalizeHex,
  oklchToRgb,
  parseHslLoose,
  rgbToHslString,
  rgbToOklch,
} from "./colorUtils";
import type { ColorFormat } from "./types";

export interface OklchValue {
  l: number;
  c: number;
  h: number;
  a: number;
}

const round = (value: number, places: number) =>
  Number(value.toFixed(places));
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function formatOklch({ l, c, h, a }: OklchValue): string {
  const hue = ((h % 360) + 360) % 360;
  const channels = `${round(l, 6)} ${round(c, 6)} ${round(hue, 3)}`;
  return `oklch(${channels}${a < 1 ? ` / ${round(a, 4)}` : ""})`;
}

function parseAlpha(raw: string | undefined): number | null {
  if (raw === undefined) return 1;
  const text = raw.trim();
  const value = Number(text.replace(/%$/, ""));
  if (!Number.isFinite(value)) return null;
  const alpha = text.endsWith("%") ? value / 100 : value;
  return alpha >= 0 && alpha <= 1 ? alpha : null;
}

export function parseOklch(input: string): OklchValue | null {
  const text = input.trim();
  const match = text.match(/^oklch\s*\((.*)\)$/i);
  if (!match) return null;
  const [channels, alphaText] = match[1].split("/").map((part) => part.trim());
  if (match[1].split("/").length > 2) return null;
  const parts = channels.split(/\s+/);
  if (parts.length !== 3) return null;
  const l = Number(parts[0].replace(/%$/, "")) / (parts[0].endsWith("%") ? 100 : 1);
  const c = Number(parts[1]);
  const h = Number(parts[2].replace(/deg$/i, ""));
  const a = parseAlpha(alphaText);
  if (![l, c, h].every(Number.isFinite) || a === null) return null;
  if (l < 0 || l > 1 || c < 0 || c > 0.6) return null;
  return { l, c, h, a };
}

export function colorFromRgb(rgb: [number, number, number], alpha = 1): string {
  const { l, c, h } = rgbToOklch(rgb);
  return formatOklch({ l, c, h, a: clamp(alpha, 0, 1) });
}

export function colorFromHex(raw: string): string | null {
  const text = raw.trim();
  const hex8 = text.match(/^#?([0-9a-f]{8})$/i);
  const hex = hex8 ? `#${hex8[1].slice(0, 6)}` : normalizeHex(text);
  if (!hex) return null;
  const rgb: [number, number, number] = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  return colorFromRgb(rgb, hex8 ? parseInt(hex8[1].slice(6), 16) / 255 : 1);
}

function parseRgb(input: string): string | null {
  const match = input.trim().match(/^rgba?\s*\((.*)\)$/i);
  if (!match) return null;
  const [channels, alphaText] = match[1].split("/").map((part) => part.trim());
  const parts = channels.split(/[\s,]+/).filter(Boolean);
  if (parts.length !== 3) return null;
  const rgb = parts.map(Number);
  const a = parseAlpha(alphaText);
  if (rgb.some((value) => !Number.isInteger(value) || value < 0 || value > 255) || a === null) return null;
  return colorFromRgb(rgb as [number, number, number], a);
}

function parseHslColor(input: string): string | null {
  const match = input.trim().match(/^hsla?\s*\((.*)\)$/i);
  const body = match?.[1] ?? input.trim();
  const [channels, alphaText] = body.split("/").map((part) => part.trim());
  const parsed = parseHslLoose(channels);
  const rgb = parsed ? hslToRgb(parsed) : null;
  const a = parseAlpha(alphaText);
  return rgb && a !== null ? colorFromRgb(rgb, a) : null;
}

/** Accepts canonical OKLCH plus legacy HSL triplets and common CSS entry formats. */
export function canonicalColor(input: string): string | null {
  const oklch = parseOklch(input);
  if (oklch) return formatOklch(oklch);
  return colorFromHex(input) ?? parseRgb(input) ?? parseHslColor(input);
}

export function colorToRgb(input: string): [number, number, number] | null {
  const value = parseOklch(canonicalColor(input) ?? "");
  return value ? oklchToRgb(value.l, value.c, value.h) : null;
}

export function colorToHex(input: string): string {
  const rgb = colorToRgb(input);
  if (!rgb) return "#000000";
  return `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

export function colorAlpha(input: string): number {
  return parseOklch(canonicalColor(input) ?? "")?.a ?? 1;
}

export function withAlpha(input: string, alpha: number): string {
  const color = parseOklch(canonicalColor(input) ?? "");
  return color ? formatOklch({ ...color, a: clamp(alpha, 0, 1) }) : input;
}

export function displayColor(input: string, format: ColorFormat): string {
  const canonical = canonicalColor(input) ?? "oklch(0 0 0)";
  if (format === "oklch") return canonical;
  if (format === "hex") return colorToHex(canonical);
  const rgb = colorToRgb(canonical) ?? [0, 0, 0];
  if (format === "rgb") return `rgb(${rgb.map(Math.round).join(" ")})`;
  return `hsl(${rgbToHslString(rgb)})`;
}

export function parseDisplayColor(
  raw: string,
  format: ColorFormat,
  previous: string
): string | null {
  const next =
    format === "oklch"
      ? parseOklch(raw)
      : format === "hex"
        ? parseOklch(colorFromHex(raw) ?? "")
        : format === "rgb"
          ? parseOklch(parseRgb(raw) ?? "")
          : parseOklch(parseHslColor(raw) ?? "");
  if (!next) return null;
  const explicitAlpha = raw.includes("/") || /^#?[0-9a-f]{8}$/i.test(raw.trim());
  return formatOklch({ ...next, a: explicitAlpha ? next.a : colorAlpha(previous) });
}
