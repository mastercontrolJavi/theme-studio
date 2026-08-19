"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HelpCircle, Sliders } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ControlPanel } from "./ControlPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ExportDrawer } from "./ExportDrawer";
import { HelpModal } from "./HelpModal";
import { SeedModal } from "./SeedModal";
import { Logo } from "./Logo";
import { normalizeHex } from "@/lib/colorUtils";
import { DEFAULT_PRESET, genFromSeed, getPreset } from "@/lib/themes";
import { MORPH_MS, easeInOut, lerpThemeValues } from "@/lib/morph";
import { deriveForeground } from "@/lib/contrast";
import {
  CSS_VARS,
  SIMPLE_AUTO_PAIRS,
  type CSSVar,
  type DetailLevel,
  type Mode,
  type ThemeConfig,
  type ThemeValues,
} from "@/lib/types";

const MOBILE_BREAKPOINT = 768;
const DETAIL_KEY = "theme-studio:detail";

function readStoredDetail(): DetailLevel | null {
  try {
    const raw = window.localStorage.getItem(DETAIL_KEY);
    return raw === "simple" || raw === "advanced" ? raw : null;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The editor
    // works fine without persistence, so this is not worth surfacing.
    return null;
  }
}

function cloneTheme(t: ThemeConfig): ThemeConfig {
  return {
    name: t.name,
    light: { ...t.light },
    dark: { ...t.dark },
  };
}

/**
 * URL state shape:
 *   ?p=Ivory&m=light&l.background=36+33%25+96%25...
 * Custom (seed-generated) themes are encoded by their seed:
 *   ?p=Custom&seed=6d28d9&m=dark
 * Only deltas vs the base theme are written to keep URLs short.
 */
function parseUrlState(search: string): {
  base: ThemeConfig;
  seedHex: string | null;
  mode: Mode;
  overrides: { light: Partial<Record<CSSVar, string>>; dark: Partial<Record<CSSVar, string>> };
} {
  const sp = new URLSearchParams(search);
  const mode: Mode = sp.get("m") === "dark" ? "dark" : "light";

  let base: ThemeConfig | undefined;
  let seedHex: string | null = null;
  if (sp.get("p") === "Custom") {
    const seed = normalizeHex(sp.get("seed") ?? "");
    if (seed) {
      base = genFromSeed(seed);
      seedHex = seed;
    }
  } else {
    base = getPreset(sp.get("p") ?? "");
  }
  base = base ?? DEFAULT_PRESET;

  const overrides: {
    light: Partial<Record<CSSVar, string>>;
    dark: Partial<Record<CSSVar, string>>;
  } = { light: {}, dark: {} };

  for (const v of CSS_VARS) {
    const lv = sp.get(`l.${v}`);
    if (lv) overrides.light[v] = lv;
    const dv = sp.get(`d.${v}`);
    if (dv) overrides.dark[v] = dv;
  }

  return { base, seedHex, mode, overrides };
}

function buildUrl(theme: ThemeConfig, mode: Mode, seedHex: string | null): string {
  const sp = new URLSearchParams();
  sp.set("p", theme.name);
  sp.set("m", mode);
  const base =
    theme.name === "Custom"
      ? seedHex
        ? genFromSeed(seedHex)
        : null
      : (getPreset(theme.name) ?? null);
  if (theme.name === "Custom" && seedHex) sp.set("seed", seedHex.replace(/^#/, ""));
  if (base) {
    for (const v of CSS_VARS) {
      if (theme.light[v] !== base.light[v]) sp.set(`l.${v}`, theme.light[v]);
      if (theme.dark[v] !== base.dark[v]) sp.set(`d.${v}`, theme.dark[v]);
    }
  }
  return `?${sp.toString()}`;
}

function applyOverrides(
  base: ThemeConfig,
  overrides: ReturnType<typeof parseUrlState>["overrides"]
): ThemeConfig {
  const next = cloneTheme(base);
  for (const [k, v] of Object.entries(overrides.light)) {
    if (v) next.light[k as CSSVar] = v;
  }
  for (const [k, v] of Object.entries(overrides.dark)) {
    if (v) next.dark[k as CSSVar] = v;
  }
  return next;
}

export function ThemeStudio() {
  // Initial state hydrates from preset; URL sync happens in effect after mount
  const [theme, setTheme] = useState<ThemeConfig>(() => cloneTheme(DEFAULT_PRESET));
  const [customTheme, setCustomTheme] = useState<ThemeConfig | null>(null);
  const [seedHex, setSeedHex] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("light");
  // Simple by default: a first-time visitor should see the decisions, not the
  // token list. The choice is remembered from the first time it is changed.
  const [detail, setDetail] = useState<DetailLevel>("simple");
  // Display values are what the preview renders - they tween during morphs.
  const [display, setDisplay] = useState<ThemeValues>(() => ({
    ...DEFAULT_PRESET.light,
  }));
  const [exportOpen, setExportOpen] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const skipNextUrlSync = useRef(true);

  // Ref mirror of `display` so morphTo can read the latest values without
  // re-creating its callback every frame. Written only via updateDisplay.
  const displayRef = useRef<ThemeValues>({ ...DEFAULT_PRESET.light });
  const rafRef = useRef<number | null>(null);
  const finishRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateDisplay = useCallback((next: ThemeValues) => {
    displayRef.current = next;
    setDisplay(next);
  }, []);

  /** Tween display values to the target palette in HSL space. */
  const morphTo = useCallback((target: ThemeValues) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (finishRef.current !== null) clearTimeout(finishRef.current);
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      updateDisplay({ ...target });
      return;
    }
    const start = { ...displayRef.current };
    const t0 = performance.now();
    const finish = () => updateDisplay({ ...target });
    const step = (now: number) => {
      const p = Math.min((now - t0) / MORPH_MS, 1);
      updateDisplay(lerpThemeValues(start, target, easeInOut(p)));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else finish();
    };
    rafRef.current = requestAnimationFrame(step);
    // Safety net: guarantee the target lands even if rAF is throttled
    // (e.g. background tab).
    finishRef.current = setTimeout(finish, MORPH_MS + 80);
  }, [updateDisplay]);

  /** Cancel any in-flight morph so it can't overwrite a direct edit. */
  const cancelMorph = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (finishRef.current !== null) clearTimeout(finishRef.current);
    rafRef.current = null;
    finishRef.current = null;
  }, []);

  useEffect(() => cancelMorph, [cancelMorph]);

  // Hydrate from URL on mount. The page is statically prerendered, so the
  // shared-link state can only be read post-mount; the one-time cascading
  // render is intentional.
  useEffect(() => {
    const { base, seedHex: urlSeed, mode: urlMode, overrides } = parseUrlState(
      window.location.search
    );
    const hasOverrides =
      Object.keys(overrides.light).length > 0 ||
      Object.keys(overrides.dark).length > 0;
    const next = hasOverrides ? applyOverrides(base, overrides) : cloneTheme(base);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(next);
    setMode(urlMode);
    updateDisplay({ ...next[urlMode] });
    if (urlSeed) {
      setSeedHex(urlSeed);
      setCustomTheme(genFromSeed(urlSeed));
    }
    const storedDetail = readStoredDetail();
    if (storedDetail) setDetail(storedDetail);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track viewport size for mobile mode
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync state → URL (skip first run after hydration to avoid loop)
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    const url = buildUrl(theme, mode, seedHex);
    window.history.replaceState(null, "", url);
  }, [theme, mode, seedHex, hydrated]);

  // Persist the detail level once hydration has settled, so the initial
  // default never overwrites a stored preference.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DETAIL_KEY, detail);
    } catch {
      // Nothing to do: the session still works, it just will not be remembered.
    }
  }, [detail, hydrated]);

  const handlePresetSelect = useCallback(
    (name: string) => {
      const src = name === "Custom" ? customTheme : getPreset(name);
      if (!src) return;
      setTheme(cloneTheme(src));
      morphTo(src[mode]);
    },
    [customTheme, mode, morphTo]
  );

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return;
      setMode(m);
      morphTo(theme[m]);
    },
    [mode, theme, morphTo]
  );

  const handleVarChange = useCallback(
    (key: CSSVar, hsl: string) => {
      // In Simple mode the label that sits on a colour is derived rather than
      // asked for, so a ground edit writes both variables at once.
      const pairedKey = detail === "simple" ? SIMPLE_AUTO_PAIRS[key] : undefined;
      const pairedHsl = pairedKey
        ? deriveForeground(hsl, theme[mode][pairedKey])
        : undefined;

      setTheme((prev) => {
        const next = cloneTheme(prev);
        next[mode][key] = hsl;
        if (pairedKey && pairedHsl) next[mode][pairedKey] = pairedHsl;
        return next;
      });
      cancelMorph();
      updateDisplay({
        ...displayRef.current,
        [key]: hsl,
        ...(pairedKey && pairedHsl ? { [pairedKey]: pairedHsl } : {}),
      });
    },
    [mode, detail, theme, cancelMorph, updateDisplay]
  );

  const handleReset = useCallback(() => {
    const src =
      theme.name === "Custom"
        ? seedHex
          ? genFromSeed(seedHex)
          : customTheme
        : getPreset(theme.name);
    if (!src) return;
    setTheme(cloneTheme(src));
    morphTo(src[mode]);
  }, [theme.name, seedHex, customTheme, mode, morphTo]);

  const handleSeedApply = useCallback(
    (generated: ThemeConfig, hex: string) => {
      setCustomTheme(generated);
      setSeedHex(hex);
      setTheme(cloneTheme(generated));
      morphTo(generated[mode]);
    },
    [mode, morphTo]
  );

  const controlPanelEl = (
    <ControlPanel
      theme={theme}
      customTheme={customTheme}
      mode={mode}
      onModeChange={handleModeChange}
      detail={detail}
      onDetailChange={setDetail}
      activePreset={theme.name}
      onPresetSelect={handlePresetSelect}
      onVarChange={handleVarChange}
      onReset={handleReset}
      onExportClick={() => {
        setExportOpen(true);
        setMobileSheetOpen(false);
      }}
      onSeedOpen={() => {
        setSeedOpen(true);
        setMobileSheetOpen(false);
      }}
    />
  );

  return (
    <div className="flex flex-col h-screen bg-ivory-base">
      {/* Burgundy accent rail */}
      <div className="h-[3px] shrink-0 bg-[linear-gradient(90deg,#8b1a4a,#b54373_70%,#c97a98)]" />

      {/* Header */}
      <header className="h-[58px] shrink-0 border-b border-ivory-border bg-ivory-surface flex items-center justify-between px-5 sm:px-5.5">
        <div className="flex items-center gap-[11px]">
          <Logo size={26} />
          <div className="flex flex-col">
            <span
              className="text-[22px] leading-none text-ivory-ink whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Theme Studio
            </span>
            <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-ivory-muted mt-[3px]">
              shadcn · theme editor
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1.5 font-mono text-[10.5px] text-ivory-muted hover:text-ivory-accent transition-colors cursor-pointer"
            aria-label="Open guide"
          >
            <HelpCircle size={13} />
            <span>Guide</span>
          </button>
          <span className="hidden sm:block w-px h-3.5 bg-ivory-border" />
          <span className="hidden sm:block font-mono text-[10px] text-ivory-faint tracking-[0.04em]">
            v1.0 · {CSS_VARS.length} vars
          </span>
          <span className="hidden sm:block w-px h-3.5 bg-ivory-border" />
          <a
            href="https://javiertpadilla.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10.5px] text-ivory-accent hover:text-ivory-accent-hover transition-colors"
          >
            by Javier Padilla
          </a>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left control panel - desktop only */}
        {!isMobile && (
          <aside className="w-[322px] shrink-0 border-r border-ivory-border bg-ivory-surface flex flex-col min-h-0">
            {controlPanelEl}
          </aside>
        )}

        {/* Right preview */}
        <main className="flex-1 overflow-y-auto thin-scroll">
          <div className="px-6 pt-6 sm:px-8.5 sm:pt-7.5 pb-24 md:pb-15 max-w-[1040px] mx-auto">
            <PreviewPanel name={theme.name} mode={mode} values={display} />
          </div>
        </main>
      </div>

      {/* Mobile customize button */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-ivory-base to-transparent pointer-events-none">
          <button
            type="button"
            onClick={() => setMobileSheetOpen(true)}
            className="pointer-events-auto w-full h-12 rounded-[9px] bg-ivory-accent text-ivory-accent-text text-[13px] font-medium shadow-[0_4px_14px_-6px_rgba(139,26,74,0.5)] hover:bg-ivory-accent-hover active:translate-y-px transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Sliders size={15} />
            Customize
          </button>
        </div>
      )}

      {/* Mobile bottom sheet */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton
          className="h-[85vh] bg-ivory-surface border-t border-ivory-border text-ivory-ink p-0 flex flex-col"
        >
          <div className="px-5 pt-5 pb-3 border-b border-ivory-border">
            <SheetTitle
              className="text-[18px] font-medium text-ivory-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Customize
            </SheetTitle>
            <SheetDescription className="text-ivory-muted text-xs">
              Pick a preset or tune individual variables.
            </SheetDescription>
          </div>
          <div className="flex-1 min-h-0">{controlPanelEl}</div>
        </SheetContent>
      </Sheet>

      {/* Seed generator */}
      <SeedModal
        open={seedOpen}
        onClose={() => setSeedOpen(false)}
        onApply={handleSeedApply}
      />

      {/* Export drawer */}
      <ExportDrawer open={exportOpen} onOpenChange={setExportOpen} theme={theme} />

      {/* Help / tutorial guide */}
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
