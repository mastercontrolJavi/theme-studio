"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hexToHsl, hslToHex, normalizeHex, parseHsl } from "@/lib/colorUtils";
import type { CSSVar } from "@/lib/types";

// react-colorful is client-only; SSR-disabled to avoid hydration mismatch
const HexColorPicker = dynamic(
  () => import("react-colorful").then((m) => m.HexColorPicker),
  { ssr: false }
);

interface Props {
  varName: CSSVar;
  hslValue: string;
  onChange: (next: string) => void;
}

export function ColorInput({ varName, hslValue, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string>(hslToHex(hslValue));

  // Re-sync local draft when value changes externally (preset switch, URL
  // load) — render-time state adjustment, per React's derived-state pattern.
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

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Pick color for ${varName}`}
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
        <span className="font-mono text-[11px] text-ivory-ink truncate">
          --{varName}
        </span>
        {parsed && (
          <span className="font-mono text-[8.5px] text-ivory-faint">
            {Math.round(parsed.h)} {Math.round(parsed.s)}% {Math.round(parsed.l)}%
          </span>
        )}
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
        className="w-19.5 h-6.5 rounded-[5px] border border-ivory-border bg-ivory-base px-2 font-mono text-[10.5px] text-ivory-muted hover:text-ivory-ink focus:text-ivory-ink focus:outline-none focus:border-ivory-accent focus:bg-white transition-colors"
      />

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
  );
}
