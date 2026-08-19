"use client";

import { Check, X } from "lucide-react";
import { FixContrastButton } from "./FixContrastButton";
import {
  findContrastFix,
  formatRatio,
  gradePairing,
  pairingsForVar,
  requiredRatio,
} from "@/lib/contrast";
import { TOKEN_INFO } from "@/lib/tokenInfo";
import type { CSSVar, ThemeValues } from "@/lib/types";

/**
 * The inline answer to "what does this one do".
 *
 * Everything here is about the token whose row it belongs to, and it never
 * navigates away: what it controls, somewhere in the live preview you can
 * point at right now, and whether it currently passes contrast in every
 * pairing that actually uses it.
 */
export function TokenDetails({
  varName,
  values,
  onVarChange,
}: {
  varName: CSSVar;
  values: ThemeValues;
  onVarChange: (key: CSSVar, hsl: string) => void;
}) {
  const info = TOKEN_INFO[varName];
  const pairings = pairingsForVar(varName);

  return (
    <div className="mb-1.5 ml-8.5 rounded-[7px] border border-ivory-border bg-ivory-elevated px-2.5 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-ivory-faint">
        --{varName}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-ivory-ink">
        {info.description}
      </p>
      <p className="mt-1.5 text-[10.5px] leading-relaxed text-ivory-muted">
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ivory-faint">
          in the preview{" "}
        </span>
        {info.example}
      </p>

      {info.note && (
        <p className="mt-2 rounded-[5px] border border-ivory-accent/20 bg-ivory-accent-tint px-2 py-1.5 text-[10px] leading-relaxed text-ivory-accent">
          {info.note}
        </p>
      )}

      <div className="mt-2.5 flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ivory-faint">
          contrast
        </span>
        <span className="h-px flex-1 bg-ivory-border" />
      </div>

      {pairings.length === 0 ? (
        <p className="mt-1.5 text-[10px] leading-relaxed text-ivory-muted">
          Not measured. No component in this set pairs it with anything, so
          there is no ratio to report.
        </p>
      ) : (
        <div className="mt-1.5 flex flex-col gap-1.5">
          {pairings.map((pairing) => {
            const result = gradePairing(values, pairing);
            const fix = result.aa
              ? null
              : findContrastFix(values, pairing);
            const counted = result.counted;
            return (
              <div key={pairing.id}>
                <div className="flex items-center gap-1.5">
                  <span
                    className={[
                      "h-[5px] w-[5px] shrink-0 rounded-full",
                      !counted
                        ? "bg-ivory-faint"
                        : result.aa
                          ? "bg-ivory-pass"
                          : "bg-ivory-fail",
                    ].join(" ")}
                  />
                  <span className="min-w-0 flex-1 truncate text-[10px] text-ivory-muted">
                    {pairing.label}
                  </span>
                  <span
                    className={[
                      "shrink-0 font-mono text-[9.5px] tabular-nums",
                      !counted
                        ? "text-ivory-muted"
                        : result.aa
                          ? "text-ivory-pass"
                          : "text-ivory-fail",
                    ].join(" ")}
                  >
                    {formatRatio(result.ratio)}
                  </span>
                  {counted ? (
                    <span
                      className={[
                        "inline-flex shrink-0 items-center gap-0.5 font-mono text-[9px] uppercase",
                        result.aa ? "text-ivory-pass" : "text-ivory-fail",
                      ].join(" ")}
                    >
                      {result.aa ? (
                        <Check size={9} strokeWidth={3} />
                      ) : (
                        <X size={9} strokeWidth={3} />
                      )}
                      <span className="sr-only">
                        {result.aa ? "passes " : "fails "}
                      </span>
                      AA
                    </span>
                  ) : (
                    <span className="shrink-0 font-mono text-[9px] text-ivory-faint">
                      not scored
                    </span>
                  )}
                </div>
                {fix && (
                  <div className="mt-1.5 ml-[11px]">
                    <FixContrastButton
                      fix={fix}
                      required={requiredRatio(pairing)}
                      onApply={(f) => onVarChange(f.token, f.hsl)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
