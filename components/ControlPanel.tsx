"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { ColorInput } from "./ColorInput";
import { ContrastPanel } from "./ContrastPanel";
import { PresetSelector } from "./PresetSelector";
import { Collapse } from "./Collapse";
import {
  SIMPLE_AUTO_PAIRS,
  SIMPLE_GROUP_IDS,
  SIMPLE_GROUP_VARS,
  CSS_VARS,
  VAR_GROUPS,
  type CSSVar,
  type DetailLevel,
  type Mode,
  type ThemeConfig,
} from "@/lib/types";

/**
 * Simple opens the three groups it shows. Advanced opens Base, Primary and
 * Semantic, leaving the rarely-touched Surfaces and Borders collapsed.
 */
function defaultOpenGroups(detail: DetailLevel): Record<string, boolean> {
  return detail === "simple"
    ? { base: true, primary: true, secondary: true }
    : {
        base: true,
        primary: true,
        secondary: false,
        semantic: true,
        surfaces: false,
        borders: false,
      };
}

interface Props {
  theme: ThemeConfig;
  customTheme: ThemeConfig | null;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  detail: DetailLevel;
  onDetailChange: (detail: DetailLevel) => void;
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
  detail,
  onDetailChange,
  activePreset,
  onPresetSelect,
  onVarChange,
  onReset,
  onExportClick,
  onSeedOpen,
}: Props) {
  const simple = detail === "simple";

  const [showValues, setShowValues] = useState(false);
  const [contrastOpen, setContrastOpen] = useState(() => detail === "advanced");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    defaultOpenGroups(detail)
  );

  // Switching detail level re-seeds the disclosure defaults, so Advanced opens
  // on the full breakdown and Simple falls back to the score alone. Render-time
  // state adjustment, per React's derived-state pattern.
  const [prevDetail, setPrevDetail] = useState(detail);
  if (prevDetail !== detail) {
    setPrevDetail(detail);
    setOpenGroups(defaultOpenGroups(detail));
    setContrastOpen(detail === "advanced");
    if (detail === "advanced") setShowValues(false);
  }

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const values = theme[mode];

  // Simple mode narrows both the group list and the rows inside each group.
  const groups = simple
    ? VAR_GROUPS.filter((g) =>
        (SIMPLE_GROUP_IDS as readonly string[]).includes(g.id)
      ).map((g) => ({ ...g, vars: SIMPLE_GROUP_VARS[g.id] ?? g.vars }))
    : VAR_GROUPS;
  const shownCount = groups.reduce((n, g) => n + g.vars.length, 0);

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
          showRaw={!simple || showValues}
        />

        {/* Sunken tactile wells: which palette, and how much of it */}
        <section className="mb-5.5 grid grid-cols-2 gap-2.5">
          <div>
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
                    aria-pressed={active}
                    onClick={() => onModeChange(m)}
                    className={[
                      "flex-1 flex items-center justify-center gap-1 py-2 rounded-[7px] font-mono text-[10.5px] capitalize cursor-pointer transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent",
                      active
                        ? "bg-ivory-base text-ivory-ink shadow-[0_1px_3px_rgba(26,10,20,0.16)]"
                        : "bg-transparent text-ivory-faint hover:text-ivory-muted",
                    ].join(" ")}
                  >
                    <span
                      className="w-2 h-2 shrink-0 rounded-full border border-ivory-border-strong"
                      style={{ background: m === "light" ? "#faf6f0" : "#1a0a14" }}
                    />
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory-muted mb-3">
              Detail
            </div>
            <div className="flex bg-ivory-elevated rounded-[10px] p-1 shadow-[inset_0_2px_5px_rgba(26,10,20,0.12)]">
              {(["simple", "advanced"] as const).map((d) => {
                const active = detail === d;
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onDetailChange(d)}
                    title={
                      d === "simple"
                        ? "Plain-language names, the colours most themes actually change"
                        : "Every variable, raw names and HSL values"
                    }
                    className={[
                      "flex-1 flex items-center justify-center py-2 rounded-[7px] font-mono text-[10.5px] capitalize cursor-pointer transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent",
                      active
                        ? "bg-ivory-base text-ivory-ink shadow-[0_1px_3px_rgba(26,10,20,0.16)]"
                        : "bg-transparent text-ivory-faint hover:text-ivory-muted",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Colour rows. Simple mode shows fewer groups and fewer rows in each. */}
        {simple && (
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory-muted">
              Colors
            </span>
            <button
              type="button"
              onClick={() => setShowValues((v) => !v)}
              aria-pressed={showValues}
              className="font-mono text-[9.5px] uppercase tracking-widest text-ivory-faint hover:text-ivory-accent transition-colors cursor-pointer rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-2"
            >
              {showValues ? "hide css values" : "show css values"}
            </button>
          </div>
        )}

        <div className="flex flex-col">
          {groups.map((group) => {
            const isOpen = openGroups[group.id] ?? false;
            return (
              <section key={group.id} className="border-b border-ivory-border">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between py-2.5 px-0.5 group cursor-pointer rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
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
                        "text-ivory-muted transition-transform duration-200 motion-reduce:transition-none",
                        isOpen ? "rotate-0" : "-rotate-90",
                      ].join(" ")}
                    />
                  </span>
                </button>
                <Collapse open={isOpen}>
                  <div className="pb-2">
                    {group.vars.map((v) => {
                      const paired = simple ? SIMPLE_AUTO_PAIRS[v] : undefined;
                      return (
                        <ColorInput
                          key={v}
                          varName={v}
                          hslValue={values[v]}
                          onChange={(next) => onVarChange(v, next)}
                          plainLabel={simple}
                          showRaw={!simple || showValues}
                          autoPair={
                            paired
                              ? { token: paired, hslValue: values[paired] }
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>
                </Collapse>
              </section>
            );
          })}
        </div>

        {simple && (
          <p className="mt-3 text-[10.5px] leading-relaxed text-ivory-muted">
            Showing {shownCount} of {CSS_VARS.length} variables. Button labels
            are paired for you as you pick. Switch to{" "}
            <button
              type="button"
              onClick={() => onDetailChange("advanced")}
              className="text-ivory-accent hover:text-ivory-accent-hover underline underline-offset-2 cursor-pointer rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
            >
              Advanced
            </button>{" "}
            for the full token list.
          </p>
        )}
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
