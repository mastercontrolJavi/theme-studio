"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CodeBlock } from "./CodeBlock";
import {
  FORMATS,
  generateExport,
  getFormat,
  type ExportFormat,
} from "@/lib/exportFormats";
import type { ThemeConfig } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ThemeConfig;
}

export function ExportDrawer({ open, onOpenChange, theme }: Props) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const spec = getFormat(format);
  const code = useMemo(
    () => generateExport(format, theme),
    [format, theme]
  );
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  );

  useEffect(() => {
    if (copyState === "idle") return;
    const t = setTimeout(() => setCopyState("idle"), 1800);
    return () => clearTimeout(t);
  }, [copyState]);

  // A stale "Copied" against a different format's code would be a lie.
  const [prevFormat, setPrevFormat] = useState(format);
  if (prevFormat !== format) {
    setPrevFormat(format);
    setCopyState("idle");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  function handleDownload() {
    const blob = new Blob([code], { type: spec.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = spec.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const lineCount = code.split("\n").length;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /** Arrow-key navigation, which the tabs pattern requires. */
  function onTabKeyDown(e: React.KeyboardEvent) {
    const i = FORMATS.findIndex((f) => f.id === format);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % FORMATS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + FORMATS.length) % FORMATS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = FORMATS.length - 1;
    else return;
    e.preventDefault();
    const id = FORMATS[next].id;
    setFormat(id);
    tabRefs.current[id]?.focus();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-ivory-base border-t border-ivory-border text-ivory-ink p-0 flex flex-col shadow-[0_-20px_60px_-20px_rgba(26,10,20,0.4)]"
        style={{ height: "72vh" }}
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

        <SheetHeader className="px-6 pt-5 pb-4 border-b border-ivory-border gap-0">
          <SheetTitle
            className="text-[24px] font-normal text-ivory-ink"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            Export Theme
          </SheetTitle>
          <SheetDescription className="text-ivory-muted text-[13px] mt-0.5">
            Every format carries both the light and the dark palette.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden px-6 pt-4 pb-5.5 flex flex-col gap-3">
          {/* Format selector */}
          <div className="flex flex-col gap-2 shrink-0 sm:flex-row sm:items-center sm:gap-3.5">
            <div
              role="tablist"
              aria-label="Export format"
              onKeyDown={onTabKeyDown}
              className="flex bg-ivory-elevated rounded-[10px] p-1 shadow-[inset_0_2px_5px_rgba(26,10,20,0.12)] shrink-0"
            >
              {FORMATS.map((f) => {
                const active = f.id === format;
                return (
                  <button
                    key={f.id}
                    ref={(el) => {
                      tabRefs.current[f.id] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`export-tab-${f.id}`}
                    aria-selected={active}
                    aria-controls="export-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => setFormat(f.id)}
                    className={[
                      "px-3 py-1.5 rounded-[7px] font-mono text-[10.5px] whitespace-nowrap cursor-pointer transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent",
                      active
                        ? "bg-ivory-base text-ivory-ink shadow-[0_1px_3px_rgba(26,10,20,0.16)]"
                        : "bg-transparent text-ivory-faint hover:text-ivory-muted",
                    ].join(" ")}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11.5px] leading-relaxed text-ivory-muted min-w-0">
              {spec.blurb}
            </p>
          </div>

          {/* Terminal-style code window */}
          <div
            role="tabpanel"
            id="export-panel"
            aria-labelledby={`export-tab-${format}`}
            className="flex-1 min-h-0 flex flex-col rounded-[11px] overflow-hidden border border-[#2a1822] bg-[#160812] text-[#f2ead8]"
          >
            <div className="h-8.5 shrink-0 flex items-center gap-1.5 px-3 bg-[#20121a] border-b border-[#2a1822]">
              <span className="w-[9px] h-[9px] rounded-full bg-[#e06c75]" />
              <span className="w-[9px] h-[9px] rounded-full bg-[#e5c07b]" />
              <span className="w-[9px] h-[9px] rounded-full bg-[#98c379]" />
              <span className="font-mono text-[11px] text-ivory-muted ml-2">
                {spec.filename}
              </span>
              <span className="ml-auto font-mono text-[10px] text-ivory-faint tabular-nums">
                {lineCount} lines
              </span>
            </div>
            <CodeBlock code={code} language={spec.language} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="h-10 px-4 rounded-lg bg-ivory-accent text-ivory-accent-text text-[13px] font-medium hover:bg-ivory-accent-hover active:translate-y-px transition-all cursor-pointer min-w-[180px] inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {copyState === "copied" ? (
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}
              {copyState === "copied"
                ? "Copied"
                : copyState === "error"
                  ? "Copy failed"
                  : "Copy to clipboard"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="h-10 px-4 rounded-lg bg-ivory-elevated border border-ivory-border text-ivory-ink text-[13px] font-medium hover:bg-ivory-border active:translate-y-px transition-all cursor-pointer min-w-[180px] inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Download size={14} />
              Download {spec.filename}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
