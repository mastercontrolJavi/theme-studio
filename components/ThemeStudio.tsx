"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sliders } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ControlPanel } from "./ControlPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ExportDrawer } from "./ExportDrawer";
import { DEFAULT_PRESET, PRESETS, getPreset } from "@/lib/themes";
import {
  CSS_VARS,
  type CSSVar,
  type Mode,
  type ThemeConfig,
} from "@/lib/types";

const MOBILE_BREAKPOINT = 768;

function cloneTheme(t: ThemeConfig): ThemeConfig {
  return {
    name: t.name,
    light: { ...t.light },
    dark: { ...t.dark },
  };
}

/**
 * URL state shape:
 *   ?p=Ivory&m=light&background=36+33%25+96%25&primary=336+68%25+32%25...
 * Only deltas vs the chosen preset are written to keep URLs short.
 */
function parseUrlState(search: string): {
  presetName: string;
  mode: Mode;
  overrides: { light: Partial<Record<CSSVar, string>>; dark: Partial<Record<CSSVar, string>> };
} {
  const sp = new URLSearchParams(search);
  const presetName =
    PRESETS.find((p) => p.name === sp.get("p"))?.name ?? DEFAULT_PRESET.name;
  const mode: Mode = sp.get("m") === "dark" ? "dark" : "light";

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

  return { presetName, mode, overrides };
}

function buildUrl(theme: ThemeConfig, mode: Mode): string {
  const sp = new URLSearchParams();
  sp.set("p", theme.name);
  sp.set("m", mode);
  const preset = getPreset(theme.name);
  if (preset) {
    for (const v of CSS_VARS) {
      if (theme.light[v] !== preset.light[v]) sp.set(`l.${v}`, theme.light[v]);
      if (theme.dark[v] !== preset.dark[v]) sp.set(`d.${v}`, theme.dark[v]);
    }
  }
  return `?${sp.toString()}`;
}

function applyOverrides(
  preset: ThemeConfig,
  overrides: ReturnType<typeof parseUrlState>["overrides"]
): ThemeConfig {
  const next = cloneTheme(preset);
  next.name = preset.name;
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
  const [mode, setMode] = useState<Mode>("light");
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const skipNextUrlSync = useRef(true);

  // Hydrate from URL on mount
  useEffect(() => {
    const { presetName, mode: urlMode, overrides } = parseUrlState(
      window.location.search
    );
    const preset = getPreset(presetName) ?? DEFAULT_PRESET;
    const hasOverrides =
      Object.keys(overrides.light).length > 0 ||
      Object.keys(overrides.dark).length > 0;
    setTheme(hasOverrides ? applyOverrides(preset, overrides) : cloneTheme(preset));
    setMode(urlMode);
    setHydrated(true);
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
    const url = buildUrl(theme, mode);
    window.history.replaceState(null, "", url);
  }, [theme, mode, hydrated]);

  const handlePresetSelect = useCallback((name: string) => {
    const preset = getPreset(name);
    if (!preset) return;
    setTheme(cloneTheme(preset));
  }, []);

  const handleVarChange = useCallback(
    (key: CSSVar, hsl: string) => {
      setTheme((prev) => {
        const next = cloneTheme(prev);
        next[mode][key] = hsl;
        return next;
      });
    },
    [mode]
  );

  const handleReset = useCallback(() => {
    const preset = getPreset(theme.name) ?? DEFAULT_PRESET;
    setTheme(cloneTheme(preset));
  }, [theme.name]);

  const controlPanelEl = useMemo(
    () => (
      <ControlPanel
        theme={theme}
        mode={mode}
        onModeChange={setMode}
        activePreset={theme.name}
        onPresetSelect={handlePresetSelect}
        onVarChange={handleVarChange}
        onReset={handleReset}
        onExportClick={() => {
          setExportOpen(true);
          setMobileSheetOpen(false);
        }}
      />
    ),
    [theme, mode, handlePresetSelect, handleVarChange, handleReset]
  );

  return (
    <div className="flex flex-col h-screen bg-[#faf6f0]">
      {/* Header */}
      <header className="h-[52px] shrink-0 border-b border-[#d4c8bc] bg-[#ede7de] flex items-center justify-between px-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className="h-7 w-7 rounded-md bg-[#8b1a4a] flex items-center justify-center text-[#faf6f0] font-mono text-[12px]"
            aria-hidden
          >
            ts
          </div>
          <span
            className="text-[18px] font-medium text-[#1a0a14]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Theme Studio
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-[#8a7a72]">
          <span>by Javier Padilla</span>
          <span className="text-[#d4c8bc]">·</span>
          <a
            href="https://javiertpadilla.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8b1a4a] hover:text-[#6e1239] transition-colors"
          >
            javiertpadilla.com
          </a>
        </div>
        <div className="sm:hidden font-mono text-[11px] text-[#8b1a4a]">
          <a
            href="https://javiertpadilla.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            javiertpadilla.com
          </a>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left control panel — desktop only */}
        {!isMobile && (
          <aside className="w-[300px] shrink-0 border-r border-[#d4c8bc] bg-[#ede7de] flex flex-col">
            {controlPanelEl}
          </aside>
        )}

        {/* Right preview */}
        <main className="flex-1 overflow-y-auto thin-scroll">
          <div className="p-6 sm:p-8 pb-24 md:pb-8 max-w-6xl mx-auto">
            <PreviewPanel theme={theme} mode={mode} />
          </div>
        </main>
      </div>

      {/* Mobile customize button */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#faf6f0] to-transparent pointer-events-none">
          <button
            type="button"
            onClick={() => setMobileSheetOpen(true)}
            className="pointer-events-auto w-full h-12 rounded-md bg-[#8b1a4a] text-[#faf6f0] text-[13px] font-medium shadow-lg hover:bg-[#6e1239] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2"
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
          className="h-[85vh] bg-[#ede7de] border-t border-[#d4c8bc] text-[#1a0a14] p-0 flex flex-col"
        >
          <div className="px-5 pt-5 pb-3 border-b border-[#d4c8bc]">
            <SheetTitle
              className="text-[18px] font-medium text-[#1a0a14]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Customize
            </SheetTitle>
            <SheetDescription className="text-[#8a7a72] text-xs">
              Pick a preset or tune individual variables.
            </SheetDescription>
          </div>
          <div className="flex-1 min-h-0">{controlPanelEl}</div>
        </SheetContent>
      </Sheet>

      {/* Export drawer */}
      <ExportDrawer open={exportOpen} onOpenChange={setExportOpen} theme={theme} />
    </div>
  );
}
