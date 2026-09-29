"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Eye, Plus, Trash2 } from "lucide-react";
import {
  colorAlpha,
  colorFromHex,
  colorToHex,
  displayColor,
  parseDisplayColor,
  withAlpha,
} from "@/lib/colorValue";
import type { ColorFormat } from "@/lib/types";

const HexColorPicker = dynamic(
  () => import("react-colorful").then((module) => module.HexColorPicker),
  { ssr: false }
);

type EyeDropperResult = { sRGBHex: string };
type EyeDropperWindow = Window & {
  EyeDropper?: new () => { open: () => Promise<EyeDropperResult> };
};

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  saved: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

const FORMATS: { value: ColorFormat; label: string }[] = [
  { value: "hex", label: "Hex" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
  { value: "oklch", label: "OKLCH" },
];

export function SolidColorPicker({ label, value, onChange, saved, onAdd, onRemove }: Props) {
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [draft, setDraft] = useState(() => displayColor(value, "hex"));
  const [invalid, setInvalid] = useState(false);
  const eyeDropperSupported = typeof window !== "undefined" &&
    typeof (window as EyeDropperWindow).EyeDropper === "function";
  const [eyeDropperError, setEyeDropperError] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [previous, setPrevious] = useState(`${value}|${format}`);
  if (previous !== `${value}|${format}`) {
    setPrevious(`${value}|${format}`);
    setDraft(displayColor(value, format));
    setInvalid(false);
  }

  function commit(raw: string) {
    const next = parseDisplayColor(raw, format, value);
    if (!next) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onChange(next);
    setDraft(displayColor(next, format));
  }

  async function sampleScreen() {
    const EyeDropper = (window as EyeDropperWindow).EyeDropper;
    if (!EyeDropper) return;
    setEyeDropperError(false);
    try {
      const result = await new EyeDropper().open();
      const sampled = colorFromHex(result.sRGBHex);
      if (sampled) onChange(withAlpha(sampled, colorAlpha(value)));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setEyeDropperError(true);
      }
    }
  }

  function clearLongPress() {
    if (longPress.current) clearTimeout(longPress.current);
    longPress.current = null;
  }

  const hex = colorToHex(value);
  const alpha = Math.round(colorAlpha(value) * 100);

  return (
    <div className="solid-picker w-full space-y-4 text-ivory-ink sm:w-[304px]">
      <div className="solid-picker-color" aria-label={`Saturation and hue for ${label}`}>
        <HexColorPicker
          color={hex}
          onChange={(nextHex) => {
            const next = colorFromHex(nextHex);
            if (next) onChange(withAlpha(next, colorAlpha(value)));
          }}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-xs text-ivory-muted">
          <label htmlFor={`alpha-${label}`}>Opacity</label>
          <span>{alpha}%</span>
        </div>
        <div className="relative h-10">
          <div aria-hidden="true" className="absolute inset-x-0 top-3 h-4 overflow-hidden rounded-md border border-ivory-border"
            style={{ backgroundImage: "conic-gradient(#d4c8bc 25%, #faf6f0 0 50%, #d4c8bc 0 75%, #faf6f0 0)", backgroundSize: "12px 12px" }}>
            <div className="h-full w-full" style={{ background: `linear-gradient(90deg, transparent, ${hex})` }} />
          </div>
          <input
            id={`alpha-${label}`}
            type="range"
            min="0"
            max="100"
            step="1"
            value={alpha}
            aria-label={`Opacity for ${label}`}
            onChange={(event) => onChange(withAlpha(value, Number(event.target.value) / 100))}
            className="solid-picker-alpha relative h-10 w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {eyeDropperSupported && (
          <button
            type="button"
            onClick={sampleScreen}
            aria-label="Sample a color from the screen"
            title="Sample a color from the screen"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-ivory-border bg-ivory-base text-ivory-accent hover:border-ivory-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
          >
            <Eye size={16} aria-hidden="true" />
          </button>
        )}
        <select
          value={format}
          onChange={(event) => setFormat(event.target.value as ColorFormat)}
          aria-label="Color format"
          className="h-10 w-[88px] shrink-0 rounded-md border border-ivory-border bg-ivory-base px-2 font-mono text-xs text-ivory-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
        >
          {FORMATS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={draft}
          onChange={(event) => { setDraft(event.target.value); setInvalid(false); }}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(event.currentTarget.value);
            if (event.key === "Escape") { setDraft(displayColor(value, format)); setInvalid(false); }
          }}
          aria-label={`${format.toUpperCase()} value for ${label}`}
          aria-invalid={invalid || undefined}
          spellCheck={false}
          className={`h-10 min-w-0 flex-1 rounded-md border bg-ivory-base px-2 font-mono text-xs text-ivory-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent ${invalid ? "border-ivory-fail" : "border-ivory-border"}`}
        />
        <label className="sr-only" htmlFor={`opacity-value-${label}`}>Opacity percentage</label>
        <input
          id={`opacity-value-${label}`}
          type="number"
          min="0"
          max="100"
          value={alpha}
          onChange={(event) => onChange(withAlpha(value, Number(event.target.value) / 100))}
          aria-label={`Opacity percentage for ${label}`}
          className="h-10 w-14 shrink-0 rounded-md border border-ivory-border bg-ivory-base px-1 text-center font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
        />
        <span className="font-mono text-xs text-ivory-muted">%</span>
      </div>
      {invalid && <p role="alert" className="text-xs text-ivory-fail">Enter a valid {format.toUpperCase()} color.</p>}
      {eyeDropperError && <p role="alert" className="text-xs text-ivory-fail">Screen sampling failed. Try again.</p>}

      <div className="border-t border-ivory-border pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-ivory-muted">Saved</span>
          <span className="font-mono text-xs text-ivory-faint">{saved.length}/10</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {saved.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Apply saved color ${colorToHex(swatch)}`}
              title={swatch}
              onClick={() => onChange(swatch)}
              onMouseEnter={() => setRemoveTarget(swatch)}
              onTouchStart={() => { clearLongPress(); longPress.current = setTimeout(() => setRemoveTarget(swatch), 500); }}
              onTouchEnd={clearLongPress}
              onTouchCancel={clearLongPress}
              className={`h-10 w-10 rounded-md border border-ivory-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent ${swatch === value ? "ring-2 ring-ivory-accent ring-offset-2 ring-offset-ivory-base" : ""}`}
              style={{ background: swatch }}
            />
          ))}
          {saved.length < 10 && (
            <button
              type="button"
              onClick={() => onAdd(value)}
              aria-label="Add current color to saved swatches"
              className="flex h-10 items-center gap-1 rounded-md border border-dashed border-ivory-border-strong px-2 font-mono text-xs text-ivory-accent hover:border-ivory-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
            >
              <Plus size={14} aria-hidden="true" /> Add
            </button>
          )}
        </div>
        {saved.length === 0 && <p className="mt-2 text-xs text-ivory-muted">No saved colors. Add the current color to start a palette.</p>}
        {removeTarget && saved.includes(removeTarget) && (
          <button
            type="button"
            onClick={() => { onRemove(removeTarget); setRemoveTarget(null); }}
            className="mt-2 flex h-10 items-center gap-2 rounded-md px-2 font-mono text-xs text-ivory-fail hover:bg-ivory-fail-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
          >
            <Trash2 size={14} aria-hidden="true" /> Remove {colorToHex(removeTarget)}
          </button>
        )}
      </div>
    </div>
  );
}
