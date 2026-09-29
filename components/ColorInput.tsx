"use client";

import { useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { canonicalColor, colorToHex, displayColor, parseDisplayColor } from "@/lib/colorValue";
import { formatRatio, gradePairing, pairingsForVar } from "@/lib/contrast";
import type { CSSVar, ThemeValues } from "@/lib/types";
import { tokenLabel } from "@/lib/tokenInfo";
import { Collapse } from "./Collapse";
import { SolidColorPicker } from "./SolidColorPicker";
import { TokenDetails } from "./TokenDetails";

export interface AutoPair { token: CSSVar }

interface Props {
  varName: CSSVar;
  value: string;
  onChange: (next: string) => void;
  plainLabel?: boolean;
  showRaw?: boolean;
  autoPair?: AutoPair;
  values: ThemeValues;
  onVarChange: (key: CSSVar, value: string) => void;
  isMobile: boolean;
  savedSwatches: string[];
  onSaveSwatch: (value: string) => void;
  onRemoveSwatch: (value: string) => void;
  onPickerOpen: () => void;
}

export function ColorInput({ varName, value, onChange, plainLabel = false,
  showRaw = false, autoPair, values, onVarChange, isMobile, savedSwatches,
  onSaveSwatch, onRemoveSwatch, onPickerOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [draft, setDraft] = useState(() => displayColor(value, "hex"));
  const [invalid, setInvalid] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const infoId = useId();
  const errorId = useId();

  if (previousValue !== value) {
    setPreviousValue(value);
    setDraft(displayColor(value, "hex"));
    setInvalid(false);
  }

  const label = plainLabel ? tokenLabel(varName) : `--${varName}`;
  const pairs = pairingsForVar(varName).filter((pair) => !pair.informational)
    .map((pair) => gradePairing(values, pair));
  const worst = pairs.reduce((a, b) => (!a || b.ratio < a.ratio ? b : a), pairs[0]);
  const aaPass = pairs.length > 0 && pairs.every((result) => result.aa);
  const textPairs = pairs.filter((result) => result.aaaApplies);
  const aaaPass = textPairs.length > 0 && textPairs.every((result) => result.aaa);

  function commit(raw: string) {
    if (!raw.trim()) { setDraft(colorToHex(value)); setInvalid(false); return; }
    const parsed = parseDisplayColor(raw, "hex", value);
    if (!parsed) { setInvalid(true); return; }
    setInvalid(false);
    if (parsed !== canonicalColor(value)) onChange(parsed);
    setDraft(colorToHex(parsed));
  }

  const picker = <SolidColorPicker label={label} value={value} onChange={onChange}
    saved={savedSwatches} onAdd={onSaveSwatch} onRemove={onRemoveSwatch} />;
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) onPickerOpen();
  }
  const swatchTrigger = <button ref={triggerRef} type="button"
    aria-label={`Pick color for ${label}`} aria-expanded={open}
    onClick={isMobile ? () => handleOpenChange(true) : undefined}
    className="h-10 w-10 shrink-0 rounded-md border border-ivory-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] transition-colors duration-150 ease-out hover:border-ivory-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent motion-reduce:transition-none"
    style={{ background: value }} />;

  return <div className="border-t border-ivory-border/70 py-2 first:border-t-0">
    <div className="flex min-h-10 items-center gap-2">
      {isMobile ? <>
        {swatchTrigger}
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent side="bottom" className="max-h-[calc(100dvh-16px)] overflow-y-auto rounded-t-xl border-ivory-border bg-ivory-base p-4 text-ivory-ink"
            onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }}>
            <SheetTitle className="font-display text-2xl font-normal text-ivory-ink">{label}</SheetTitle>
            <SheetDescription className="mb-4 font-mono text-xs text-ivory-muted">Solid color</SheetDescription>
            {picker}
          </SheetContent>
        </Sheet>
      </> : <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{swatchTrigger}</PopoverTrigger>
        <PopoverContent side="right" sideOffset={316}
          className="max-h-[calc(100dvh-32px)] w-[336px] overflow-y-auto rounded-xl border-ivory-border bg-ivory-base p-4 shadow-[0_16px_48px_rgba(26,10,20,0.22)] duration-150 ease-out motion-reduce:animate-none"
          onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }}>
          <div className="mb-4 font-mono text-xs text-ivory-muted">{label}</div>
          {picker}
        </PopoverContent>
      </Popover>}
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-ivory-ink" title={label}>{label}</span>
      <input type="text" value={draft} spellCheck={false}
        onChange={(event) => { setDraft(event.target.value); setInvalid(false); }}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit(event.currentTarget.value);
          if (event.key === "Escape") { setDraft(colorToHex(value)); setInvalid(false); }
        }}
        aria-label={`Hex value for ${label}`} aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        className={`h-10 w-[88px] shrink-0 rounded-md border bg-ivory-base px-2 font-mono text-xs text-ivory-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent ${invalid ? "border-ivory-fail" : "border-ivory-border"}`} />
    </div>
    <div className="ml-12 flex min-h-10 items-center justify-between gap-1 font-mono text-[10px]">
      <span className="flex flex-wrap items-center gap-1">
        {worst ? <>
          <span className={aaPass ? "text-ivory-pass" : "text-ivory-fail"}>{aaPass ? "✓" : "×"} AA</span>
          {textPairs.length > 0 && <span className={aaaPass ? "text-ivory-pass" : "text-ivory-fail"}>{aaaPass ? "✓" : "×"} AAA</span>}
          <span className="text-ivory-muted">{formatRatio(worst.ratio)}</span>
          {pairs.length > 1 && <span className="text-ivory-faint">worst of {pairs.length}</span>}
        </> : <span className="text-ivory-faint">No contrast pair</span>}
        {autoPair && <span className="text-ivory-faint">· label auto</span>}
      </span>
      <button type="button" onClick={() => setInfoOpen((current) => !current)}
        aria-expanded={infoOpen} aria-controls={infoId} aria-label={`What does ${label} do?`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ivory-muted hover:text-ivory-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-accent">
        <Info size={16} aria-hidden="true" />
      </button>
    </div>
    {showRaw && <p className="ml-12 mt-1 break-all font-mono text-[10px] text-ivory-muted">{value}</p>}
    {invalid && <p id={errorId} role="alert" className="ml-12 mt-1 text-xs text-ivory-fail">Enter a valid hex color.</p>}
    <Collapse open={infoOpen}><div id={infoId}><TokenDetails varName={varName} values={values} onVarChange={onVarChange} /></div></Collapse>
  </div>;
}
