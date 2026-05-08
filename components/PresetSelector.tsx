"use client";

import { PRESETS } from "@/lib/themes";

interface Props {
  activeName: string;
  onSelect: (name: string) => void;
}

export function PresetSelector({ activeName, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map((preset) => {
        const active = preset.name === activeName;
        return (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset.name)}
            className={[
              "px-2.5 h-7 rounded font-mono text-[11px] transition-all border cursor-pointer",
              active
                ? "bg-[#8b1a4a] text-[#faf6f0] border-[#8b1a4a]"
                : "bg-[#faf6f0] text-[#8a7a72] border-[#d4c8bc] hover:border-[#b8a89a] hover:text-[#1a0a14]",
            ].join(" ")}
          >
            {preset.name}
          </button>
        );
      })}
    </div>
  );
}
