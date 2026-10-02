"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { normalizeHex } from "@/lib/colorUtils";
import { chipBands, genFromSeed } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/types";

const HexColorPicker = dynamic(
  () => import("react-colorful").then((m) => m.HexColorPicker),
  { ssr: false }
);

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (theme: ThemeConfig, seedHex: string) => void;
}

const CURATED_SEEDS = [
  "#8b1a4a",
  "#6f2445",
  "#a63c68",
  "#1a0a14",
];

function BandPreview({ label, bands }: { label: string; bands: string[] }) {
  return (
    <div>
      <span className="block mb-2 font-mono text-[9.5px] uppercase tracking-widest text-ivory-muted">
        {label}
      </span>
      <div className="flex h-12 rounded-[9px] overflow-hidden border border-ivory-border">
        {bands.map((c, i) => (
          <span
            key={i}
            className="block"
            style={{ background: c, flex: i === 1 ? 1.6 : 1 }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Seed generator: pick one color, preview the generated light + dark
 * palettes live, then apply it as the "Custom" preset.
 */
export function SeedModal({ open, onClose, onApply }: Props) {
  const [hex, setHex] = useState("#8b1a4a");

  if (!open) return null;

  const valid = normalizeHex(hex);
  const theme = genFromSeed(valid ?? "#8b1a4a");

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-5 bg-[rgba(26,10,20,0.45)] backdrop-blur-[2px] animate-[ts-fade_0.18s_ease]"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Generate from a seed"
    >
      <div
        className="w-[580px] max-w-full bg-ivory-base border border-ivory-border rounded-[14px] overflow-hidden shadow-[0_30px_70px_-20px_rgba(26,10,20,0.5)] animate-[ts-pop_0.2s_cubic-bezier(0.2,0.8,0.3,1)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-ivory-border">
          <div>
            <div
              className="text-[23px] text-ivory-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Generate from a seed
            </div>
            <div className="text-[12.5px] text-ivory-muted mt-1">
              One colour in. A balanced light + dark palette out.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-[16px] text-ivory-muted transition-colors hover:text-ivory-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 p-6">
          {/* Picker + curated swatches */}
          <div className="w-[200px] shrink-0">
            <div className="seed-picker-wrapper">
              <HexColorPicker color={valid ?? "#8b1a4a"} onChange={setHex} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-ivory-muted">
                seed
              </span>
              <input
                type="text"
                value={hex}
                spellCheck={false}
                onChange={(e) => setHex(e.target.value)}
                className="h-10 min-w-0 flex-1 rounded-md border border-ivory-border bg-ivory-base px-2 font-mono text-[10.5px] text-ivory-muted transition-colors focus:border-ivory-accent focus:bg-ivory-base focus:text-ivory-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CURATED_SEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-label={`Use seed ${s}`}
                  onClick={() => setHex(s)}
                  className={[
                    "h-10 w-10 cursor-pointer rounded-md border border-ivory-border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent",
                    s === valid
                      ? "shadow-[0_0_0_2px_var(--color-ivory-base),0_0_0_3.5px_var(--color-ivory-accent)]"
                      : "",
                  ].join(" ")}
                  style={{ background: s }}
                />
              ))}
            </div>
          </div>

          {/* Live light/dark palette preview */}
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <BandPreview label="Light" bands={chipBands(theme, "light")} />
            <BandPreview label="Dark" bands={chipBands(theme, "dark")} />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-ivory-border bg-ivory-surface px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg bg-ivory-elevated border border-ivory-border text-ivory-ink text-[13px] font-medium hover:bg-ivory-border transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!valid) return;
              onApply(genFromSeed(valid), valid);
              onClose();
            }}
            className="h-10 px-5 rounded-lg bg-ivory-accent text-ivory-accent-text text-[13px] font-medium hover:bg-ivory-accent-hover transition-colors cursor-pointer"
          >
            Use this theme
          </button>
        </div>
      </div>

      <style jsx global>{`
        .seed-picker-wrapper .react-colorful {
          width: 200px;
          height: 162px;
        }
        .seed-picker-wrapper .react-colorful__saturation {
          border-radius: 7px;
          border-bottom: none;
        }
        .seed-picker-wrapper .react-colorful__hue {
          height: 12px;
          border-radius: 999px;
          margin-top: 11px;
        }
        .seed-picker-wrapper .react-colorful__pointer {
          width: 16px;
          height: 16px;
          border-width: 2px;
        }
      `}</style>
    </div>
  );
}
