"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Download, Link2 } from "lucide-react";
import { ColorInput } from "./ColorInput";
import { canonicalColor } from "@/lib/colorValue";
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
  onVarChange: (key: CSSVar, value: string) => void;
  onReset: () => void;
  onExportClick: () => void;
  onSeedOpen: () => void;
  /** Resolves false when the clipboard is unavailable. */
  onCopyLink: () => Promise<boolean>;
  isMobile: boolean;
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
  onCopyLink,
  isMobile,
}: Props) {
  const simple = detail === "simple";

  const [showValues, setShowValues] = useState(false);
  const [linkState, setLinkState] = useState<"idle" | "copying" | "copied" | "error">(
    "idle"
  );
  const [savedOverride, setSavedOverride] = useState<string[] | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("theme-studio:saved-swatches:v1");
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length > 10) return null;
      const colors = parsed.map((entry: unknown) =>
        typeof entry === "string" ? canonicalColor(entry) : null
      );
      if (colors.some((entry) => entry === null)) return null;
      return colors as string[];
    } catch {
      // Corrupt or unavailable storage falls back to the current palette.
      return null;
    }
  });

  useEffect(() => {
    if (linkState === "idle" || linkState === "copying") return;
    const t = setTimeout(() => setLinkState("idle"), 1800);
    return () => clearTimeout(t);
  }, [linkState]);
  const [contrastOpen, setContrastOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    defaultOpenGroups(detail)
  );

  // Switching detail level re-seeds the group defaults, while contrast stays
  // collapsed so the token rows remain visible. Render-time
  // state adjustment, per React's derived-state pattern.
  const [prevDetail, setPrevDetail] = useState(detail);
  if (prevDetail !== detail) {
    setPrevDetail(detail);
    setOpenGroups(defaultOpenGroups(detail));
    setContrastOpen(false);
    if (detail === "advanced") setShowValues(false);
  }

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const values = theme[mode];
  const paletteSwatches = Array.from(new Set(CSS_VARS.map((key) => values[key]))).slice(0, 5);
  const savedSwatches = savedOverride ?? paletteSwatches;
  function persistSwatches(next: string[]) {
    setSavedOverride(next);
    try {
      window.localStorage.setItem("theme-studio:saved-swatches:v1", JSON.stringify(next));
    } catch {
      // The current session still has the saved colors.
    }
  }
  function saveSwatch(value: string) {
    const canonical = canonicalColor(value);
    if (!canonical || savedSwatches.includes(canonical) || savedSwatches.length >= 10) return;
    persistSwatches([...savedSwatches, canonical]);
  }
  function removeSwatch(value: string) {
    persistSwatches(savedSwatches.filter((entry) => entry !== value));
  }

  // Simple mode narrows both the group list and the rows inside each group.
  const groups = simple
    ? VAR_GROUPS.filter((g) =>
        (SIMPLE_GROUP_IDS as readonly string[]).includes(g.id)
      ).map((g) => ({ ...g, vars: SIMPLE_GROUP_VARS[g.id] ?? g.vars }))
    : VAR_GROUPS;
  const shownCount = groups.reduce((n, g) => n + g.vars.length, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain thin-scroll px-5 pt-5 pb-4">
        {/* Paint-chip preset gallery */}
        <section className="mb-6" data-tour="presets">
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
        <section className="mb-6 grid grid-cols-2 gap-3">
          <div data-tour="mode">
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
                      "min-h-10 flex-1 flex items-center justify-center gap-1 py-2 rounded-[7px] font-mono text-[10.5px] capitalize cursor-pointer transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent",
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
                        : "Every variable and raw token names"
                    }
                    className={[
                      "min-h-10 flex-1 flex items-center justify-center py-2 rounded-[7px] font-mono text-[10.5px] capitalize cursor-pointer transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent",
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
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory-muted">
            Colors
          </span>
          {simple ? (
            <button
              type="button"
              onClick={() => setShowValues((v) => !v)}
              aria-pressed={showValues}
              className="font-mono text-[9.5px] uppercase tracking-widest text-ivory-faint hover:text-ivory-accent transition-colors cursor-pointer rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-2"
            >
              {showValues ? "hide css values" : "show css values"}
            </button>
          ) : <span className="font-mono text-[10px] text-ivory-muted">19 tokens</span>}
        </div>

        <div className="flex flex-col" data-tour="tokens">
          {groups.map((group) => {
            const isOpen = openGroups[group.id] ?? false;
            return (
              <section key={group.id} className="border-b border-ivory-border">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between py-3 px-1 group cursor-pointer rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
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
                          value={values[v]}
                          onChange={(next) => onVarChange(v, next)}
                          values={values}
                          onVarChange={onVarChange}
                          plainLabel={simple}
                          showRaw={showValues}
                          isMobile={isMobile}
                          savedSwatches={savedSwatches}
                          onSaveSwatch={saveSwatch}
                          onRemoveSwatch={removeSwatch}
                          onPickerOpen={() => {
                            if (savedOverride === null) persistSwatches(paletteSwatches);
                          }}
                          autoPair={
                            paired
                              ? { token: paired }
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

      {/* Take-it-away actions, pinned to the bottom */}
      <div
        className="border-t border-ivory-border p-4 bg-ivory-surface shrink-0 flex gap-2"
        data-tour="export"
      >
        <button
          type="button"
          onClick={onExportClick}
          className="flex-1 h-11 rounded-[9px] bg-ivory-accent text-ivory-accent-text text-[13.5px] font-medium hover:bg-ivory-accent-hover active:translate-y-px transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_14px_-6px_rgba(139,26,74,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Download size={14} />
          Export Theme
        </button>
        <button
          type="button"
          onClick={async () => {
            setLinkState("copying");
            setLinkState((await onCopyLink()) ? "copied" : "error");
          }}
          disabled={linkState === "copying"}
          aria-label="Copy a link to this theme"
          title={
            linkState === "copied"
              ? "Link copied"
              : linkState === "copying"
                ? "Copying link"
              : linkState === "error"
                ? "Could not reach the clipboard"
                : "Copy a link to this theme"
          }
          className={[
            "h-11 w-11 shrink-0 rounded-[9px] border transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-2",
            linkState === "copied"
              ? "border-ivory-pass/40 bg-ivory-pass-tint text-ivory-pass"
              : linkState === "error"
                ? "border-ivory-fail/40 bg-ivory-fail-tint text-ivory-fail"
                : "border-ivory-border bg-ivory-elevated text-ivory-muted hover:text-ivory-accent hover:border-ivory-accent/40",
          ].join(" ")}
        >
          {linkState === "copied" ? <Check size={15} /> : <Link2 size={15} />}
        </button>
      </div>
      <p aria-live="polite" role="status" className="px-4 pb-2 font-mono text-xs text-ivory-muted min-h-6">
        {linkState === "copied"
          ? "Link copied to clipboard"
          : linkState === "copying"
            ? "Copying link..."
          : linkState === "error"
            ? "Could not copy the link. Try again."
            : ""}
      </p>
    </div>
  );
}
