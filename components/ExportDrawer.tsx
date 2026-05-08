"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
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
        showCloseButton
        className="h-[60vh] sm:h-[60vh] bg-[#faf6f0] border-t border-[#d4c8bc] text-[#1a0a14] p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#d4c8bc]">
          <SheetTitle
            className="text-[22px] font-normal text-[#1a0a14]"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            Export Theme
          </SheetTitle>
          <SheetDescription className="text-[#8a7a72] text-sm">
            Drop this block into your{" "}
            <span className="font-mono text-[12px] text-[#1a0a14]">
              app/globals.css
            </span>{" "}
            inside any shadcn/ui project.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden px-6 py-5 flex flex-col gap-4">
          <pre
            className="flex-1 overflow-auto thin-scroll rounded-lg bg-[#1a0a14] text-[#f2ead8] p-5 font-mono text-[12px] leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <code>{css}</code>
          </pre>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={handleCopy}
              className="h-10 px-4 rounded-md bg-[#8b1a4a] text-[#faf6f0] text-[13px] font-medium hover:bg-[#6e1239] active:translate-y-[1px] transition-all cursor-pointer min-w-[180px]"
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
              className="h-10 px-4 rounded-md bg-[#ede7de] border border-[#d4c8bc] text-[#1a0a14] text-[13px] font-medium hover:bg-[#e4dcd2] hover:border-[#b8a89a] active:translate-y-[1px] transition-all cursor-pointer min-w-[180px]"
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
