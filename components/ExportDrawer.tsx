"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { generateCSS } from "@/lib/cssExport";
import type { ThemeConfig } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ThemeConfig;
}

/** Renders the generated CSS with light syntax tinting on a dark plum ground. */
function TintedCSS({ css }: { css: string }) {
  return (
    <pre className="flex-1 min-h-0 overflow-y-auto thin-scroll m-0 px-4.5 py-4 font-mono text-[12px] leading-[1.75]">
      <code>
        {css.split("\n").map((line, i) => {
          const varMatch = line.match(/^(\s*)(--[\w-]+)(:\s*)(.+)(;)$/);
          if (varMatch) {
            return (
              <div key={i} className="whitespace-pre">
                {varMatch[1]}
                <span className="text-[#e4a6bf]">{varMatch[2]}</span>
                <span className="text-[#6b5560]">{varMatch[3]}</span>
                <span className="text-[#d8b48a]">{varMatch[4]}</span>
                <span className="text-[#6b5560]">{varMatch[5]}</span>
              </div>
            );
          }
          const selMatch = line.match(/^(\s*)([@.:][\w\s-]*?)(\s*\{)$/);
          if (selMatch) {
            return (
              <div key={i} className="whitespace-pre">
                {selMatch[1]}
                <span className="text-[#cf6f95] font-medium">{selMatch[2]}</span>
                <span className="text-[#6b5560]">{selMatch[3]}</span>
              </div>
            );
          }
          return (
            <div key={i} className="whitespace-pre">
              <span className="text-[#6b5560]">{line}</span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}

export function ExportDrawer({ open, onOpenChange, theme }: Props) {
  const css = useMemo(() => generateCSS(theme), [theme]);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (copyState === "idle") return;
    const t = setTimeout(() => setCopyState("idle"), 1800);
    return () => clearTimeout(t);
  }, [copyState]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(css);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  function handleDownload() {
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "globals.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-ivory-base border-t border-ivory-border text-ivory-ink p-0 flex flex-col shadow-[0_-20px_60px_-20px_rgba(26,10,20,0.4)]"
        style={{ height: "64vh" }}
      >
        <SheetClose asChild>
          <button
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 text-ivory-ink hover:opacity-60 transition-opacity text-lg leading-none cursor-pointer z-10"
          >
            ✕
          </button>
        </SheetClose>
        <SheetHeader className="px-6 pt-5 pb-4 border-b border-ivory-border">
          <SheetTitle
            className="text-[24px] font-normal text-ivory-ink"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            Export Theme
          </SheetTitle>
          <SheetDescription className="text-ivory-muted text-[13px]">
            Drop this block into your{" "}
            <span className="font-mono text-[12px] text-ivory-ink">
              app/globals.css
            </span>{" "}
            inside any shadcn/ui project.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden px-6 pt-4.5 pb-5.5 flex flex-col gap-3.5">
          {/* Terminal-style code window */}
          <div className="flex-1 min-h-0 flex flex-col rounded-[11px] overflow-hidden border border-[#2a1822] bg-[#160812] text-[#f2ead8]">
            <div className="h-8.5 shrink-0 flex items-center gap-1.5 px-3 bg-[#20121a] border-b border-[#2a1822]">
              <span className="w-[9px] h-[9px] rounded-full bg-[#e06c75]" />
              <span className="w-[9px] h-[9px] rounded-full bg-[#e5c07b]" />
              <span className="w-[9px] h-[9px] rounded-full bg-[#98c379]" />
              <span className="font-mono text-[11px] text-ivory-muted ml-2">
                globals.css
              </span>
            </div>
            <TintedCSS css={css} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="h-10 px-4 rounded-lg bg-ivory-accent text-ivory-accent-text text-[13px] font-medium hover:bg-ivory-accent-hover active:translate-y-px transition-all cursor-pointer min-w-[180px]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {copyState === "copied"
                ? "✓ Copied"
                : copyState === "error"
                  ? "Copy failed"
                  : "Copy to clipboard"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="h-10 px-4 rounded-lg bg-ivory-elevated border border-ivory-border text-ivory-ink text-[13px] font-medium hover:bg-ivory-border active:translate-y-px transition-all cursor-pointer min-w-[180px]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Download globals.css
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
