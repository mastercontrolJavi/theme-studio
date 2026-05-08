"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ColorInput } from "./ColorInput";
import { PresetSelector } from "./PresetSelector";
import { VAR_GROUPS, type CSSVar, type Mode, type ThemeConfig } from "@/lib/types";

interface Props {
  theme: ThemeConfig;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  activePreset: string;
  onPresetSelect: (name: string) => void;
  onVarChange: (key: CSSVar, hsl: string) => void;
  onReset: () => void;
  onExportClick: () => void;
}

export function ControlPanel({
  theme,
  mode,
  onModeChange,
  activePreset,
  onPresetSelect,
  onVarChange,
  onReset,
  onExportClick,
}: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    base: true,
    primary: true,
    secondary: false,
    semantic: false,
    surfaces: false,
    borders: false,
  });

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const values = theme[mode];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto thin-scroll px-5 pt-5 pb-4">
        {/* Preset row */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8a7a72]">
              Preset
            </span>
            <button
              type="button"
              onClick={onReset}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#8a7a72] hover:text-[#8b1a4a] transition-colors cursor-pointer"
            >
              reset
            </button>
          </div>
          <PresetSelector activeName={activePreset} onSelect={onPresetSelect} />
        </section>

        {/* Mode toggle */}
        <section className="mb-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8a7a72] mb-2.5">
            Mode
          </div>
          <div className="flex gap-1.5">
            {(["light", "dark"] as const).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onModeChange(m)}
                  className={[
                    "flex-1 h-7 rounded font-mono text-[11px] capitalize transition-all border cursor-pointer",
                    active
                      ? "bg-[#8b1a4a] text-[#faf6f0] border-[#8b1a4a]"
                      : "bg-[#faf6f0] text-[#8a7a72] border-[#d4c8bc] hover:border-[#b8a89a] hover:text-[#1a0a14]",
                  ].join(" ")}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </section>

        {/* Variable groups */}
        <div className="space-y-1.5">
          {VAR_GROUPS.map((group) => {
            const isOpen = openGroups[group.id];
            return (
              <section key={group.id} className="border-b border-[#d4c8bc] pb-1.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between py-2 group cursor-pointer"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a7a72] group-hover:text-[#1a0a14] transition-colors">
                    {group.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={[
                      "text-[#8a7a72] transition-transform duration-150",
                      isOpen ? "rotate-0" : "-rotate-90",
                    ].join(" ")}
                  />
                </button>
                {isOpen && (
                  <div className="pb-1.5">
                    {group.vars.map((v) => (
                      <ColorInput
                        key={v}
                        varName={v}
                        hslValue={values[v]}
                        onChange={(next) => onVarChange(v, next)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* Export button pinned to bottom */}
      <div className="border-t border-[#d4c8bc] p-4 bg-[#ede7de]">
        <button
          type="button"
          onClick={onExportClick}
          className="w-full h-10 rounded-md bg-[#8b1a4a] text-[#faf6f0] text-[13px] font-medium hover:bg-[#6e1239] active:translate-y-[1px] transition-all cursor-pointer"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Export Theme
        </button>
      </div>
    </div>
  );
}
