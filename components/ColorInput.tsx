"use client";

import { useId, useState } from "react";
import dynamic from "next/dynamic";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapse } from "./Collapse";
import { TokenDetails } from "./TokenDetails";
import { hexToHsl, hslToHex, normalizeHex, parseHsl } from "@/lib/colorUtils";
import { contrastRatio, formatRatio } from "@/lib/contrast";
import type { CSSVar, ThemeValues } from "@/lib/types";
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
}

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
}: Props) {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoId = useId();
  const [draft, setDraft] = useState<string>(hslToHex(hslValue));

  // Re-sync local draft when value changes externally (preset switch, URL
  // load) - render-time state adjustment, per React's derived-state pattern.
  const [prevHsl, setPrevHsl] = useState(hslValue);
  if (prevHsl !== hslValue) {
    setPrevHsl(hslValue);
    setDraft(hslToHex(hslValue));
  }

  function commitHex(raw: string) {
    const normalized = normalizeHex(raw);
    if (!normalized) {
      // Invalid input - reset to current
      setDraft(hslToHex(hslValue));
      return;
    }
    const nextHsl = hexToHsl(normalized);
    if (nextHsl) onChange(nextHsl);
    setDraft(normalized);
  }

  const currentHex = hslToHex(hslValue);
  const parsed = parseHsl(hslValue);

  const label = plainLabel ? tokenLabel(varName) : `--${varName}`;

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
                  setDraft(next);
                }}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ivory-muted">
                hex
              </span>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={(e) => commitHex(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitHex(e.currentTarget.value);
                    setOpen(false);
                  }
                }}
                className="flex-1 h-7 rounded border border-ivory-border bg-ivory-base px-2 font-mono text-[11px] text-ivory-ink focus:outline-none focus:border-ivory-accent"
              />
            </div>
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

        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commitHex(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitHex(e.currentTarget.value);
              (e.target as HTMLInputElement).blur();
            }
          }}
          spellCheck={false}
          aria-label={`Hex value for ${label}`}
          className="w-19.5 h-6.5 rounded-[5px] border border-ivory-border bg-ivory-base px-2 font-mono text-[10.5px] text-ivory-muted hover:text-ivory-ink focus:text-ivory-ink focus:outline-none focus:border-ivory-accent focus:bg-white transition-colors"
        />

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
