"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

/**
 * A four-step spotlight over the real UI, shown once on a first visit and
 * re-openable from the header.
 *
 * It points at elements that are already on screen rather than describing them
 * in the abstract, which is the whole reason it beats a docs page. Each target
 * carries a data-tour attribute; the overlay measures it live so the highlight
 * survives scrolling, resizing, and a switch between Simple and Advanced.
 *
 * Below the mobile breakpoint the control panel lives inside a sheet, so none
 * of those targets are on screen to point at. Rather than draw a spotlight
 * around nothing, the same four steps run as plain centred cards and the copy
 * says where the controls actually are.
 */

interface Step {
  target: string;
  title: string;
  body: string;
  /** Used instead of `body` when there is no target to highlight. */
  mobileBody?: string;
}

const STEPS: Step[] = [
  {
    target: "presets",
    title: "Start here",
    body: "Pick a base palette. Each preset ships a complete light and dark set, so you are never starting from nothing. The score just below it tells you how that palette does on contrast.",
    mobileBody: "Tap Customize at the bottom of the screen to open the controls. The preset gallery sits at the top: each preset ships a complete light and dark set, and the score below it tells you how that palette does on contrast.",
  },
  {
    target: "mode",
    title: "Preview light and dark",
    body: "Both palettes live inside one theme. Switch modes to see and edit the other one instantly, and the export always includes both.",
    mobileBody: "Both palettes live inside one theme. The Mode switch inside Customize flips between them instantly, and the export always includes both.",
  },
  {
    target: "tokens",
    title: "Customize, or skip this entirely",
    body: "Tune individual colours if you want to. The presets are usable as they ship, so this part is optional. The info icon on any row explains what that colour controls.",
    mobileBody: "Below the Mode switch you can tune individual colours. The presets are usable as they ship, so this part is optional. The info icon on any row explains what that colour controls.",
  },
  {
    target: "export",
    title: "Get the code",
    body: "When you are happy, export paste-ready CSS with both the light and dark blocks. Your theme also lives in the URL, so the link is shareable as it stands.",
    mobileBody: "When you are happy, Export Theme at the bottom of Customize gives you paste-ready CSS with both the light and dark blocks. Your theme also lives in the URL, so the link is shareable as it stands.",
  },
];

const PAD = 6;
const CARD_WIDTH = 296;
const GAP = 14;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measure(target: string): Rect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/** Right of the target where it fits, otherwise below, always inside the viewport. */
function placeCard(rect: Rect | null, cardHeight: number) {
  if (typeof window === "undefined") return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!rect) {
    return {
      left: Math.max(GAP, (vw - CARD_WIDTH) / 2),
      top: Math.max(GAP, (vh - cardHeight) / 2),
    };
  }
  const clampTop = (t: number) =>
    Math.min(Math.max(GAP, t), Math.max(GAP, vh - cardHeight - GAP));

  const rightEdge = rect.left + rect.width + GAP;
  if (rightEdge + CARD_WIDTH + GAP <= vw) {
    return { left: rightEdge, top: clampTop(rect.top) };
  }
  const below = rect.top + rect.height + GAP;
  if (below + cardHeight + GAP <= vh) {
    return {
      left: Math.min(Math.max(GAP, rect.left), vw - CARD_WIDTH - GAP),
      top: below,
    };
  }
  return {
    left: Math.min(Math.max(GAP, rect.left), vw - CARD_WIDTH - GAP),
    top: clampTop(rect.top + rect.height - cardHeight),
  };
}

export function TourOverlay({
  open,
  onClose,
  spotlight = true,
}: {
  open: boolean;
  onClose: () => void;
  /** False where the targets are not on screen, so no highlight is drawn. */
  spotlight?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = useState(190);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const current = STEPS[step];

  const close = useCallback(() => {
    setStep(0);
    onClose();
  }, [onClose]);

  // Restart from the first step whenever the tour is reopened. Render-time
  // state adjustment, matching the derived-state pattern used elsewhere here.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setStep(0);
  }

  // Bring the target into view before measuring, since a token group can sit
  // below the fold in the scrolling control panel.
  useEffect(() => {
    if (!open || !spotlight) return;
    const el = document.querySelector<HTMLElement>(
      `[data-tour="${current.target}"]`
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open, spotlight, current.target]);

  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () =>
      setRect(spotlight ? measure(current.target) : null);
    update();
    // The smooth scroll above settles over a few frames; keep measuring until
    // it does so the highlight never lands on a stale position.
    const tick = () => {
      update();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const stop = setTimeout(() => cancelAnimationFrame(frame), 1000);
    window.addEventListener("resize", update);
    // Capture phase so a scroll on any ancestor counts, including the control
    // panel's own scroller. A smooth scrollIntoView can outlast the frame loop
    // above, and without this the highlight settles on a stale position.
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(stop);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, spotlight, current.target]);

  useLayoutEffect(() => {
    if (!open || !cardRef.current) return;
    setCardHeight(cardRef.current.offsetHeight);
  }, [open, step]);

  useEffect(() => {
    if (open) nextRef.current?.focus();
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStep((s) => (s > 0 ? s - 1 : s));
      } else if (e.key === "Tab") {
        // The card claims aria-modal, so it has to actually hold focus rather
        // than let Tab wander into the dimmed app behind it.
        const card = cardRef.current;
        if (!card) return;
        const focusable = card.querySelectorAll<HTMLElement>("button");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        const outside = !card.contains(active);
        if (e.shiftKey && (outside || active === first)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (outside || active === last)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const pos = placeCard(rect, cardHeight);
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-70">
      {/* Blocks interaction with the app while the tour is up, so the layout
          cannot shift out from under the highlight mid-step. */}
      <button
        type="button"
        aria-label="Dismiss the tour"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
      />

      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[12px] border-[1.5px] border-ivory-accent transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow:
              "0 0 0 9999px rgba(26,10,20,0.55), 0 0 0 3px var(--color-ivory-accent-tint)",
          }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(26,10,20,0.55)" }}
        />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="absolute w-[296px] rounded-[12px] border border-ivory-border bg-ivory-base p-4 shadow-[0_24px_60px_-16px_rgba(26,10,20,0.55)] animate-[ts-pop_0.22s_cubic-bezier(0.2,0.8,0.3,1)]"
        style={{ left: pos?.left ?? 0, top: pos?.top ?? 0 }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ivory-faint">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Skip the tour"
            className="-mt-1 -mr-1 cursor-pointer rounded-[4px] p-1 text-ivory-faint transition-colors hover:text-ivory-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
          >
            <X size={13} />
          </button>
        </div>

        <h2
          id="tour-title"
          className="mt-1.5 text-[19px] leading-tight text-ivory-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {current.title}
        </h2>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ivory-muted">
          {spotlight ? current.body : (current.mobileBody ?? current.body)}
        </p>

        <div className="mt-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5" aria-hidden>
            {STEPS.map((s, i) => (
              <span
                key={s.target}
                className={[
                  "h-[5px] rounded-full transition-all duration-200 motion-reduce:transition-none",
                  i === step
                    ? "w-3.5 bg-ivory-accent"
                    : "w-[5px] bg-ivory-border-strong",
                ].join(" ")}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-[7px] border border-ivory-border bg-ivory-elevated px-2.5 py-1.5 font-mono text-[10px] text-ivory-ink transition-colors hover:bg-ivory-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent"
              >
                <ArrowLeft size={11} />
                Back
              </button>
            )}
            <button
              ref={nextRef}
              type="button"
              onClick={() => (last ? close() : setStep((s) => s + 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-[7px] bg-ivory-accent px-3 py-1.5 font-mono text-[10px] text-ivory-accent-text transition-colors hover:bg-ivory-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent focus-visible:ring-offset-2"
            >
              {last ? "Done" : "Next"}
              {!last && <ArrowRight size={11} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
