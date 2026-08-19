"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Wand2, X } from "lucide-react";
import { Collapse } from "./Collapse";
import {
  auditTheme,
  findContrastFix,
  formatRatio,
  type PairingResult,
} from "@/lib/contrast";
import type { CSSVar, Mode, ThemeValues } from "@/lib/types";

interface Props {
  values: ThemeValues;
  /** The mode not currently being edited, scored so it cannot slip by unseen. */
  otherMode: { label: Mode; values: ThemeValues };
  onVarChange: (key: CSSVar, hsl: string) => void;
  /** Controlled disclosure, so the detail level can set the default. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Simple mode leads with the plain-language name and hides --var names. */
  showRaw: boolean;
}

/** Small pass/fail chip. Never colour alone: each carries a glyph and a label. */
function LevelChip({
  level,
  passed,
}: {
  level: "AA" | "AAA";
  passed: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] border",
        passed
          ? "bg-ivory-pass-tint border-ivory-pass/30 text-ivory-pass"
          : "bg-ivory-fail-tint border-ivory-fail/30 text-ivory-fail",
      ].join(" ")}
    >
      {passed ? <Check size={9} strokeWidth={3} /> : <X size={9} strokeWidth={3} />}
      {level}
    </span>
  );
}

function PairingRow({
  result,
  values,
  onVarChange,
  onFixed,
  flash,
  showRaw,
}: {
  result: PairingResult;
  values: ThemeValues;
  onVarChange: (key: CSSVar, hsl: string) => void;
  onFixed: (id: string) => void;
  flash: boolean;
  showRaw: boolean;
}) {
  const { pairing, ratio, aa, aaa, aaLarge, aaaApplies, required } = result;
  const informational = !result.counted;

  const fix = useMemo(
    () => (aa || informational ? null : findContrastFix(values, pairing)),
    [aa, informational, values, pairing]
  );

  const statusColor = informational
    ? "bg-ivory-faint"
    : aa
      ? "bg-ivory-pass"
      : "bg-ivory-fail";

  return (
    <div
      className={[
        "rounded-[7px] border px-2.5 py-2 transition-colors duration-200 motion-reduce:transition-none",
        flash
          ? "border-ivory-pass/45 bg-ivory-pass-tint"
          : "border-ivory-border bg-ivory-base",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-[5px] w-[5px] shrink-0 rounded-full ${statusColor}`}
        />
        <span className="min-w-0 flex-1 truncate text-[11.5px] text-ivory-ink">
          {pairing.label}
        </span>
        <span
          className={[
            "shrink-0 font-mono text-[10.5px] tabular-nums",
            informational
              ? "text-ivory-muted"
              : aa
                ? "text-ivory-pass"
                : "text-ivory-fail",
          ].join(" ")}
        >
          {formatRatio(ratio)}
        </span>
      </div>

      {showRaw ? (
        <div className="mt-0.5 ml-[13px] truncate font-mono text-[9px] text-ivory-faint">
          --{pairing.fg} on --{pairing.bg}
        </div>
      ) : (
        <div className="mt-0.5 ml-[13px] truncate text-[9.5px] text-ivory-faint">
          {pairing.example}
        </div>
      )}

      <div className="mt-1.5 ml-[13px] flex flex-wrap items-center gap-1.5">
        {informational ? (
          <span className="font-mono text-[9px] text-ivory-muted">
            not counted · decorative boundary
          </span>
        ) : (
          <>
            <LevelChip level="AA" passed={aa} />
            {aaaApplies ? (
              <LevelChip level="AAA" passed={aaa} />
            ) : (
              <span className="font-mono text-[9px] text-ivory-muted">
                non-text · no AAA level
              </span>
            )}
            {!aa && aaLarge && (
              <span className="font-mono text-[9px] text-ivory-muted">
                large text only
              </span>
            )}
          </>
        )}
      </div>

      {/* A fix always exists for a well-formed value: holding hue and
          saturation, lightness can always reach effectively black or white,
          and one of those clears AA against any ground. `fix` is null only
          for an unparseable value, where there is nothing honest to offer. */}
      {!aa && !informational && fix && (
        <div className="mt-2 ml-[13px]">
          <button
            type="button"
            onClick={() => {
              onVarChange(fix.token, fix.hsl);
              onFixed(pairing.id);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-ivory-accent/30 bg-ivory-accent-tint px-2 py-1 font-mono text-[9.5px] text-ivory-accent transition-colors hover:bg-ivory-accent hover:text-ivory-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-1"
            title={`Sets --${fix.token} to ${fix.hsl}, reaching ${required}:1`}
          >
            <Wand2 size={10} />
            Fix contrast
            <span className="opacity-70">
              L {Math.round(fix.fromL)}% to {Math.round(fix.toL)}%
            </span>
          </button>
          {fix.breaks.length > 0 && (
            <p className="mt-1 font-mono text-[9px] leading-relaxed text-ivory-fail">
              Heads up: this drops {fix.breaks.map((b) => b.label).join(", ")}{" "}
              below AA. No single lightness satisfies both.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Live WCAG audit of the pairings this component set actually paints.
 * Collapsed it is a single score; expanded it is the full breakdown with a
 * one-click lightness fix on every failing pairing.
 */
export function ContrastPanel({
  values,
  otherMode,
  onVarChange,
  open,
  onOpenChange,
  showRaw,
}: Props) {
  const report = useMemo(() => auditTheme(values), [values]);
  const otherReport = useMemo(
    () => auditTheme(otherMode.values),
    [otherMode.values]
  );
  const [flashed, setFlashed] = useState<string | null>(null);

  useEffect(() => {
    if (!flashed) return;
    const t = setTimeout(() => setFlashed(null), 900);
    return () => clearTimeout(t);
  }, [flashed]);

  const allPass = report.passAA === report.total;
  const counted = report.results.filter((r) => r.counted);
  const informational = report.results.filter((r) => !r.counted);

  return (
    <section className="mb-5.5">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-2 rounded-[4px]"
      >
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory-muted transition-colors group-hover:text-ivory-ink">
          Accessibility
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={[
              "inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-[3px] font-mono text-[9.5px] tabular-nums transition-colors duration-200 motion-reduce:transition-none",
              allPass
                ? "border-ivory-pass/30 bg-ivory-pass-tint text-ivory-pass"
                : "border-ivory-fail/30 bg-ivory-fail-tint text-ivory-fail",
            ].join(" ")}
          >
            {allPass ? (
              <Check size={9} strokeWidth={3} />
            ) : (
              <X size={9} strokeWidth={3} />
            )}
            {report.passAA}/{report.total} pass AA
          </span>
          <ChevronDown
            size={13}
            className={[
              "text-ivory-muted transition-transform duration-200 motion-reduce:transition-none",
              open ? "rotate-0" : "-rotate-90",
            ].join(" ")}
          />
        </span>
      </button>

      <Collapse open={open}>
        <div className="pt-3">
          <p className="mb-2.5 text-[10.5px] leading-relaxed text-ivory-muted">
            Measured with the WCAG relative luminance formula against the
            pairings shadcn/ui actually paints. Text needs 4.5:1 for AA and 7:1
            for AAA. Focus rings and solid fills need 3:1.
          </p>

          <div className="flex flex-col gap-1.5">
            {counted.map((r) => (
              <PairingRow
                key={r.pairing.id}
                result={r}
                values={values}
                onVarChange={onVarChange}
                onFixed={setFlashed}
                flash={flashed === r.pairing.id}
                showRaw={showRaw}
              />
            ))}
          </div>

          <div className="mt-3 mb-1.5 flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ivory-faint">
              measured, not scored
            </span>
            <span className="h-px flex-1 bg-ivory-border" />
          </div>
          <p className="mb-2 text-[10px] leading-relaxed text-ivory-muted">
            WCAG 1.4.11 covers boundaries that identify a control or its state,
            not decorative rules. These are shown so you can judge them, and
            left out of the score.
          </p>
          <div className="flex flex-col gap-1.5">
            {informational.map((r) => (
              <PairingRow
                key={r.pairing.id}
                result={r}
                values={values}
                onVarChange={onVarChange}
                onFixed={setFlashed}
                flash={false}
                showRaw={showRaw}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 rounded-[6px] border border-ivory-border bg-ivory-elevated px-2.5 py-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ivory-muted">
              {otherMode.label} mode
            </span>
            <span
              className={[
                "inline-flex items-center gap-1 font-mono text-[9.5px] tabular-nums",
                otherReport.passAA === otherReport.total
                  ? "text-ivory-pass"
                  : "text-ivory-fail",
              ].join(" ")}
            >
              {otherReport.passAA === otherReport.total ? (
                <Check size={9} strokeWidth={3} />
              ) : (
                <X size={9} strokeWidth={3} />
              )}
              {otherReport.passAA}/{otherReport.total} pass AA
            </span>
          </div>

          <p className="mt-2 font-mono text-[9px] leading-relaxed text-ivory-faint">
            {report.passAAA}/{report.aaaEligible} text pairs also reach AAA in
            this mode. Switch modes to fix the other palette.
          </p>
        </div>
      </Collapse>
    </section>
  );
}
