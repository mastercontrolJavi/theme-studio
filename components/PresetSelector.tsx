"use client";

import { PRESETS, chipBands } from "@/lib/themes";
import type { Mode, ThemeConfig } from "@/lib/types";

interface Props {
  customTheme: ThemeConfig | null;
  mode: Mode;
  activeName: string;
  onSelect: (name: string) => void;
  onSeedOpen: () => void;
}

/**
 * Paint-chip preset gallery: each preset renders as a card of five
 * color bands (bg / primary / accent / secondary / fg) that re-render
 * to match the active light/dark mode, plus a dashed "+ seed" tile.
 */
export function PresetSelector({
  customTheme,
  mode,
  activeName,
  onSelect,
  onSeedOpen,
}: Props) {
  const all = customTheme ? [...PRESETS, customTheme] : PRESETS;

  return (
    <div className="grid grid-cols-2 gap-2">
      {all.map((preset) => {
        const active = preset.name === activeName;
        const bands = chipBands(preset, mode);
        return (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset.name)}
            className={[
              "rounded-[10px] overflow-hidden bg-ivory-base cursor-pointer p-0 text-left",
              "transition-[border-color,box-shadow,transform] duration-150",
              active
                ? "border-[1.5px] border-ivory-accent shadow-[0_0_0_3px_var(--color-ivory-accent-tint),0_6px_16px_-8px_rgba(139,26,74,0.35)]"
                : "border border-ivory-border shadow-[0_1px_2px_rgba(26,10,20,0.05)] hover:border-ivory-border-strong hover:-translate-y-px hover:shadow-[0_4px_12px_-6px_rgba(26,10,20,0.2)]",
            ].join(" ")}
          >
            <div className="flex h-[42px]">
              {bands.map((c, i) => (
                <span
                  key={i}
                  className="block"
                  style={{ background: c, flex: i === 1 ? 1.6 : 1 }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 border-t border-ivory-border bg-ivory-base">
              <span
                className={[
                  "font-mono text-[10.5px] truncate",
                  active ? "text-ivory-accent" : "text-ivory-muted",
                ].join(" ")}
              >
                {preset.name}
              </span>
              {active && (
                <span className="w-[5px] h-[5px] shrink-0 rounded-full bg-ivory-accent" />
              )}
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onSeedOpen}
        className="flex flex-col items-center justify-center gap-1 min-h-[71px] rounded-[10px] border border-dashed border-ivory-border-strong bg-transparent text-ivory-muted cursor-pointer transition-colors hover:bg-ivory-accent-tint hover:border-ivory-accent hover:text-ivory-accent"
      >
        <span className="text-[17px] leading-none">+</span>
        <span className="font-mono text-[10.5px]">seed</span>
      </button>
    </div>
  );
}
