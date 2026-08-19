"use client";

import { useId, useState } from "react";
import dynamic from "next/dynamic";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapse } from "./Collapse";
import { TokenDetails } from "./TokenDetails";
import {
  hexToHsl,
  hslToHex,
  hslToOklch,
  normalizeHex,
  oklchToHsl,
  parseHsl,
  parseHslLoose,
} from "@/lib/colorUtils";
import { contrastRatio, formatRatio } from "@/lib/contrast";
import type { ColorFormat, CSSVar, ThemeValues } from "@/lib/types";
import { tokenLabel } from "@/lib/tokenInfo";

// react-colorful is client-only; SSR-disabled to avoid hydration mismatch
const HexColorPicker = dynamic(
  () => import("react-colorful").then((m) => m.HexColorPicker),
  { ssr: false }
);

/** The label Simple mode derives for you, shown so the pairing is never magic. */
export interface AutoPair {
  token: CSSVar;
  hslValue: string;
}

interface Props {
  varName: CSSVar;
  hslValue: string;
  onChange: (next: string) => void;
  /** Simple mode names the thing on screen; Advanced names the variable. */
  plainLabel?: boolean;
  /** Advanced always shows --var and HSL. Simple hides them behind a toggle. */
  showRaw?: boolean;
  autoPair?: AutoPair;
  /** Full palette for the mode being edited, so the info panel can score it. */
  values: ThemeValues;
  onVarChange: (key: CSSVar, hsl: string) => void;
  /** Notation the text input reads and writes. */
  format?: ColorFormat;
}

/** The stored HSL rendered in the notation the input is showing. */
function toDisplay(hsl: string, format: ColorFormat): string {
  if (format === "hex") return hslToHex(hsl);
  if (format === "oklch") return hslToOklch(hsl);
  return hsl;
}

/** Parse a typed value back to the stored form, or null when it is not valid. */
function fromDisplay(raw: string, format: ColorFormat): string | null {
  if (format === "hex") {
    const normalized = normalizeHex(raw);
    return normalized ? hexToHsl(normalized) : null;
  }
  if (format === "oklch") return oklchToHsl(raw);
  return parseHslLoose(raw);
}

const FORMAT_HINT: Record<ColorFormat, string> = {
  hex: "Expected a hex colour, like #8b1a4a or #8b1.",
  hsl: "Expected hue, saturation, lightness, like 336 68% 32%.",
  oklch: "Expected oklch(L C H), like oklch(0.41 0.145 5.4).",
};

/**
 * Simple mode derives the label colour that sits on this swatch. Showing the
 * swatch and its measured ratio keeps that from being a black box: you can see
 * what was chosen and whether it reads.
 */
function AutoPairReadout({
  ground,
  pair,
}: {
  ground: string;
  pair: AutoPair;
}) {
  const ratio = contrastRatio(pair.hslValue, ground);
  const passes = ratio >= 4.5;
  return (
    <span className="mt-0.5 flex items-center gap-1 font-mono text-[8.5px] text-ivory-faint">
      <span
        className="h-2 w-2 shrink-0 rounded-[2px] border border-ivory-border"
        style={{ background: hslToHex(pair.hslValue) }}
      />
      <span className="truncate">label auto</span>
      <span className={passes ? "text-ivory-pass" : "text-ivory-fail"}>
        {formatRatio(ratio)}{" "}
        <span className="sr-only">{passes ? "passes " : "fails "}</span>
        {passes ? "AA" : "fails AA"}
      </span>
    </span>
  );
}

export function ColorInput({
  varName,
  hslValue,
  onChange,
  plainLabel = false,
  showRaw = true,
  autoPair,
  values,
  onVarChange,
  format = "hex",
}: Props) {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoId = useId();
  const errorId = useId();
  const [draft, setDraft] = useState<string>(() => toDisplay(hslValue, format));
  const [invalid, setInvalid] = useState(false);

  // Re-sync the draft when the value or the notation changes from outside
  // (preset switch, URL load, format toggle). Render-time state adjustment,
  // per React's derived-state pattern.
  const [prevSync, setPrevSync] = useState(`${hslValue}|${format}`);
  if (prevSync !== `${hslValue}|${format}`) {
    setPrevSync(`${hslValue}|${format}`);
    setDraft(toDisplay(hslValue, format));
    setInvalid(false);
  }

  /**
   * Commit a typed value.
   *
   * An unparseable entry leaves the text alone and says what was expected.
   * Silently reverting, which is what this used to do, throws away the typing
   * and never explains why.
   *
   * A value that renders back to the same display string is treated as a
   * no-op. OKLCH is shown rounded, so re-committing what is already on screen
   * would otherwise nudge the colour by a hex level without the user changing
   * anything.
   */
  function commitValue(raw: string) {
    if (raw.trim() === "") {
      setDraft(toDisplay(hslValue, format));
      setInvalid(false);
      return;
    }
    const next = fromDisplay(raw, format);
    if (!next) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (toDisplay(next, format) !== toDisplay(hslValue, format)) {
      onChange(next);
    }
    setDraft(toDisplay(next, format));
  }

  /** Escape abandons the edit and puts the current value back. */
  function cancelEdit() {
    setDraft(toDisplay(hslValue, format));
    setInvalid(false);
  }

  const currentHex = hslToHex(hslValue);
  const parsed = parseHsl(hslValue);

  const label = plainLabel ? tokenLabel(varName) : `--${varName}`;

  /*
   * Hex is short enough to sit in the row. HSL and OKLCH are not: at the
   * 322px panel width they squeezed "--background" down to "--backgr..." and
   * still clipped their own value. Those get a full-width line of their own.
   */
  const inline = format === "hex";

  const valueInput = (
    <input
      type="text"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        if (invalid) setInvalid(false);
      }}
      onBlur={(e) => commitValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commitValue(e.currentTarget.value);
        } else if (e.key === "Escape") {
          cancelEdit();
        }
      }}
      spellCheck={false}
      autoComplete="off"
      aria-label={`${format} value for ${label}`}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? errorId : undefined}
      className={[
        "h-6.5 rounded-[5px] border bg-ivory-base px-2 font-mono text-[10.5px] text-ivory-muted hover:text-ivory-ink focus:text-ivory-ink focus:outline-none focus:bg-white transition-colors",
        inline ? "w-19.5 shrink-0" : "w-full",
        invalid
          ? "border-ivory-fail bg-ivory-fail-tint text-ivory-fail focus:border-ivory-fail"
          : "border-ivory-border focus:border-ivory-accent",
      ].join(" ")}
    />
  );

  return (
    <div>
      <div className="flex items-center gap-2.5 py-1.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Pick color for ${label}`}
              className="h-6 w-6 shrink-0 rounded-md border border-ivory-border hover:border-ivory-border-strong hover:scale-105 transition-[border-color,transform] cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.18),inset_0_-1px_1px_rgba(255,255,255,0.25)] ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
              style={{ background: currentHex }}
            />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="right"
            sideOffset={8}
            className="w-auto p-3 rounded-[10px] border-ivory-border bg-ivory-base shadow-[0_12px_32px_-8px_rgba(26,10,20,0.28)]"
          >
            <div className="color-picker-wrapper">
              <HexColorPicker
                color={currentHex}
                onChange={(next) => {
                  const hsl = hexToHsl(next);
                  if (hsl) onChange(hsl);
                  setDraft(toDisplay(hsl ?? hslValue, format));
                  setInvalid(false);
                }}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ivory-muted">
                {format}
              </span>
              <input
                type="text"
                value={draft}
                aria-label={`${format} value for ${label}`}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (invalid) setInvalid(false);
                }}
                onBlur={(e) => commitValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitValue(e.currentTarget.value);
                    if (fromDisplay(e.currentTarget.value, format)) setOpen(false);
                  } else if (e.key === "Escape") {
                    cancelEdit();
                  }
                }}
                className={[
                  "flex-1 h-7 rounded border bg-ivory-base px-2 font-mono text-[11px] text-ivory-ink focus:outline-none",
                  invalid
                    ? "border-ivory-fail focus:border-ivory-fail"
                    : "border-ivory-border focus:border-ivory-accent",
                ].join(" ")}
              />
            </div>
            {invalid && (
              <p className="mt-1.5 font-mono text-[9.5px] leading-relaxed text-ivory-fail">
                {FORMAT_HINT[format]}
              </p>
            )}
          </PopoverContent>
        </Popover>

        <div className="flex-1 min-w-0 flex flex-col">
          {plainLabel ? (
            <span className="text-[11.5px] text-ivory-ink truncate">
              {tokenLabel(varName)}
            </span>
          ) : (
            <span className="font-mono text-[11px] text-ivory-ink truncate">
              --{varName}
            </span>
          )}
          {showRaw && parsed && (
            <span className="font-mono text-[8.5px] text-ivory-faint truncate">
              {plainLabel ? `--${varName} · ` : ""}
              {Math.round(parsed.h)} {Math.round(parsed.s)}% {Math.round(parsed.l)}%
            </span>
          )}
          {autoPair && <AutoPairReadout ground={hslValue} pair={autoPair} />}
        </div>

        {inline && valueInput}

        <button
          type="button"
          onClick={() => setInfoOpen((v) => !v)}
          aria-expanded={infoOpen}
          aria-controls={infoId}
          aria-label={`What does ${label} do?`}
          className={[
            "shrink-0 cursor-pointer rounded-[4px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent",
            infoOpen
              ? "text-ivory-accent"
              : "text-ivory-faint hover:text-ivory-accent",
          ].join(" ")}
        >
          <Info size={13} />
        </button>

        <style jsx global>{`
          .color-picker-wrapper .react-colorful {
            width: 200px;
            height: 180px;
          }
          .color-picker-wrapper .react-colorful__saturation {
            border-radius: 6px;
            border-bottom: none;
          }
          .color-picker-wrapper .react-colorful__hue {
            height: 12px;
            border-radius: 999px;
            margin-top: 10px;
          }
          .color-picker-wrapper .react-colorful__pointer {
            width: 16px;
            height: 16px;
            border-width: 2px;
          }
        `}</style>
      </div>

      {!inline && <div className="mb-1.5 ml-8.5">{valueInput}</div>}

      {invalid && (
        <p
          id={errorId}
          role="alert"
          className="mb-1.5 ml-8.5 font-mono text-[9.5px] leading-relaxed text-ivory-fail"
        >
          {FORMAT_HINT[format]} Press Escape to put the old value back.
        </p>
      )}

      <Collapse open={infoOpen}>
        <div id={infoId}>
          <TokenDetails
            varName={varName}
            values={values}
            onVarChange={onVarChange}
          />
        </div>
      </Collapse>
    </div>
  );
}
