"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { ColorInput } from "./ColorInput";
import { ContrastPanel } from "./ContrastPanel";
import { PresetSelector } from "./PresetSelector";
import { VAR_GROUPS, type CSSVar, type Mode, type ThemeConfig } from "@/lib/types";

interface Props {
  theme: ThemeConfig;
  customTheme: ThemeConfig | null;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  activePreset: string;
  onPresetSelect: (name: string) => void;
  onVarChange: (key: CSSVar, hsl: string) => void;
  onReset: () => void;
  onExportClick: () => void;
  onSeedOpen: () => void;
}

export function ControlPanel({
  theme,
  customTheme,
  mode,
  onModeChange,
  activePreset,
  onPresetSelect,
  onVarChange,
  onReset,
  onExportClick,
  onSeedOpen,
}: Props) {
  // Collapsed by default: the score is the headline, the breakdown is on
  // demand. Step 3's Simple/Advanced toggle will drive this default.
  const [contrastOpen, setContrastOpen] = useState(false);
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden thin-scroll px-4.5 pt-4.5 pb-3.5">
        {/* Paint-chip preset gallery */}
        <section className="mb-5.5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory-muted">
              Preset Gallery
            </span>
            <button
              type="button"
              onClick={onReset}
              className="font-mono text-[10px] uppercase tracking-widest text-ivory-faint hover:text-ivory-accent transition-colors cursor-pointer"
            >
              reset
            </button>
          </div>
          <PresetSelector
            customTheme={customTheme}
            mode={mode}
            activeName={activePreset}
            onSelect={onPresetSelect}
            onSeedOpen={onSeedOpen}
          />
        </section>

        {/* Live WCAG audit of the mode being edited */}
        <ContrastPanel
          values={values}
          otherMode={{
            label: mode === "light" ? "dark" : "light",
            values: theme[mode === "light" ? "dark" : "light"],
          }}
          onVarChange={onVarChange}
          open={contrastOpen}
          onOpenChange={setContrastOpen}
        />

        {/* Sunken tactile mode well */}
        <section className="mb-5.5">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory-muted mb-3">
            Mode
          </div>
          <div className="flex bg-ivory-elevated rounded-[10px] p-1 shadow-[inset_0_2px_5px_rgba(26,10,20,0.12)]">
            {(["light", "dark"] as const).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onModeChange(m)}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[7px] font-mono text-[11px] capitalize cursor-pointer transition-all duration-200",
                    active
                      ? "bg-ivory-base text-ivory-ink shadow-[0_1px_3px_rgba(26,10,20,0.16)]"
                      : "bg-transparent text-ivory-faint",
                  ].join(" ")}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-ivory-border-strong"
                    style={{ background: m === "light" ? "#faf6f0" : "#1a0a14" }}
                  />
                  {m}
                </button>
              );
            })}
          </div>
        </section>

        {/* Variable groups */}
        <div className="flex flex-col">
          {VAR_GROUPS.map((group) => {
            const isOpen = openGroups[group.id];
            return (
              <section key={group.id} className="border-b border-ivory-border">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between py-2.5 px-0.5 group cursor-pointer"
                >
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory-muted group-hover:text-ivory-ink transition-colors">
                    {group.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[9.5px] text-ivory-faint">
                      {group.vars.length}
                    </span>
                    <ChevronDown
                      size={13}
                      className={[
                        "text-ivory-muted transition-transform duration-150",
                        isOpen ? "rotate-0" : "-rotate-90",
                      ].join(" ")}
                    />
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-2">
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
      <div className="border-t border-ivory-border p-3.5 bg-ivory-surface shrink-0">
        <button
          type="button"
          onClick={onExportClick}
          className="w-full h-10.5 rounded-[9px] bg-ivory-accent text-ivory-accent-text text-[13.5px] font-medium hover:bg-ivory-accent-hover active:translate-y-px transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_14px_-6px_rgba(139,26,74,0.5)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Download size={14} />
          Export Theme
        </button>
      </div>
    </div>
  );
}
