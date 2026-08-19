"use client";

import { Wand2 } from "lucide-react";
import type { ContrastFix } from "@/lib/contrast";

/**
 * The one-click lightness nudge. Shared so the control in a token's info panel
 * and the one in the accessibility breakdown are literally the same button,
 * rather than two things that happen to look alike.
 */
export function FixContrastButton({
  fix,
  required,
  onApply,
}: {
  fix: ContrastFix;
  required: number;
  onApply: (fix: ContrastFix) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onApply(fix)}
        title={`Sets --${fix.token} to ${fix.hsl}, reaching ${required}:1`}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-ivory-accent/30 bg-ivory-accent-tint px-2 py-1 font-mono text-[9.5px] text-ivory-accent transition-colors hover:bg-ivory-accent hover:text-ivory-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-1"
      >
        <Wand2 size={10} />
        Fix contrast
        <span className="opacity-70">
          L {Math.round(fix.fromL)}% to {Math.round(fix.toL)}%
        </span>
      </button>
      {fix.breaks.length > 0 && (
        <p className="mt-1 font-mono text-[9px] leading-relaxed text-ivory-fail">
          Heads up: this drops {fix.breaks.map((b) => b.label).join(", ")} below
          AA. No single lightness satisfies both.
        </p>
      )}
    </>
  );
}
