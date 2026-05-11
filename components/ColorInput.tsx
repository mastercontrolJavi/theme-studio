"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hexToHsl, hslToHex, normalizeHex } from "@/lib/colorUtils";
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

  // Re-sync local draft when value changes externally (preset switch, URL load)
  useEffect(() => {
    setDraft(hslToHex(hslValue));
  }, [hslValue]);

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

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Pick color for ${varName}`}
            className="h-6 w-6 shrink-0 rounded border border-[#d4c8bc] hover:border-[#b8a89a] transition-colors cursor-pointer ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1a4a]"
            style={{ background: currentHex }}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="right"
          sideOffset={8}
          className="w-auto p-3 rounded-md border-[#d4c8bc] bg-[#faf6f0] shadow-lg"
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
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8a7a72]">
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
              className="flex-1 h-7 rounded border border-[#d4c8bc] bg-[#faf6f0] px-2 font-mono text-[11px] text-[#1a0a14] focus:outline-none focus:border-[#8b1a4a]"
            />
          </div>
        </PopoverContent>
      </Popover>

      <span className="font-mono text-[12px] text-[#1a0a14] flex-1 truncate">
        --{varName}
      </span>

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
        className="w-[80px] h-7 rounded border border-[#d4c8bc] bg-[#faf6f0] px-2 font-mono text-[11px] text-[#8a7a72] hover:text-[#1a0a14] focus:text-[#1a0a14] focus:outline-none focus:border-[#8b1a4a] focus:bg-white transition-colors"
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
