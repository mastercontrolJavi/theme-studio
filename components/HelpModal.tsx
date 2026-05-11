"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Palette,
  Sparkles,
  SunMoon,
  Pipette,
  Layers,
  Eye,
  Share2,
  Download,
  RotateCcw,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SectionProps {
  number: number;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

function Section({ number, icon: Icon, title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          className="shrink-0 w-6 h-6 rounded-full bg-[#8b1a4a] text-[#faf6f0] flex items-center justify-center font-mono text-[10px] font-medium"
        >
          {number}
        </span>
        <Icon size={14} className="shrink-0 text-[#8b1a4a]" />
        <h3
          className="text-[13px] font-medium text-[#1a0a14]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em", fontSize: "15px" }}
        >
          {title}
        </h3>
      </div>
      <div className="ml-9 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] leading-relaxed text-[#3d2b35]">{children}</p>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-md bg-[#8b1a4a]/8 border border-[#8b1a4a]/20 px-3 py-2.5">
      <span className="font-mono text-[10px] text-[#8b1a4a] uppercase tracking-[0.1em] shrink-0 mt-0.5">
        tip
      </span>
      <p className="text-[12px] leading-relaxed text-[#5a2a3a]">{children}</p>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-mono text-[11px] bg-[#1a0a14]/8 text-[#1a0a14] rounded px-1 py-0.5"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </code>
  );
}

function GroupRow({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-[#d4c8bc] last:border-0">
      <span
        className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-[#8b1a4a] w-24 pt-0.5"
      >
        {label}
      </span>
      <span className="text-[12px] text-[#3d2b35] leading-relaxed">{description}</span>
    </div>
  );
}

export function HelpModal({ open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="bg-[#faf6f0] border-l border-[#d4c8bc] text-[#1a0a14] p-0 flex flex-col"
        style={{ maxWidth: "560px" }}
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-5 border-b border-[#d4c8bc] bg-[#ede7de] relative">
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute top-4 right-4 text-[#1a0a14] hover:opacity-60 transition-opacity text-base leading-none cursor-pointer z-10"
            >
              ✕
            </button>
          </SheetClose>
          <SheetTitle
            className="text-[22px] font-normal text-[#1a0a14] mb-1"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            How to Use Theme Studio
          </SheetTitle>
          <SheetDescription className="text-[#8a7a72] text-[12px] font-mono">
            A complete walkthrough of every feature - start to finish.
          </SheetDescription>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto thin-scroll px-6 py-6 space-y-7">

          {/* 1. Overview */}
          <Section number={1} icon={Palette} title="What Is Theme Studio?">
            <P>
              Theme Studio is a live color-theme editor for{" "}
              <strong className="font-medium text-[#1a0a14]">shadcn/ui</strong>{" "}
              projects. shadcn/ui components are styled entirely through CSS
              custom properties (variables), so swapping a handful of
              HSL values changes the look of your entire UI - buttons, cards,
              inputs, alerts, and more - all at once.
            </P>
            <P>
              The workflow is simple: pick a preset palette as your
              starting point, adjust individual color variables to match
              your brand, preview the result live, then export the CSS
              and drop it into your project. That&apos;s it.
            </P>
          </Section>

          <div className="border-t border-[#d4c8bc]" />

          {/* 2. Presets */}
          <Section number={2} icon={Sparkles} title="Choosing a Preset">
            <P>
              Five hand-crafted palettes are available from the{" "}
              <strong className="font-medium text-[#1a0a14]">Preset</strong>{" "}
              dropdown at the top of the control panel. Each one ships
              with a complete set of light and dark color values:
            </P>
            <div className="flex flex-col gap-0 rounded-md border border-[#d4c8bc] overflow-hidden">
              {[
                ["Ivory", "Warm off-white base with deep rose accents - the default."],
                ["Zinc", "Neutral gray scale, clean and versatile for any product."],
                ["Midnight", "Deep, moody darks with muted blue-gray highlights."],
                ["Sage", "Earthy greens and warm neutrals, calm and natural."],
                ["Slate", "Cool slate-blue tones, polished and professional."],
              ].map(([name, desc]) => (
                <div
                  key={name}
                  className="flex items-start gap-3 px-3 py-2 border-b border-[#d4c8bc] last:border-0 bg-[#ede7de]/50"
                >
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-[#8b1a4a] w-16 pt-0.5">
                    {name}
                  </span>
                  <span className="text-[12px] text-[#3d2b35] leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>
            <Tip>
              Switching presets resets all your color overrides - it&apos;s a
              fresh start from that palette. If you want to keep your
              changes, export first.
            </Tip>
          </Section>

          <div className="border-t border-[#d4c8bc]" />

          {/* 3. Light / Dark Mode */}
          <Section number={3} icon={SunMoon} title="Light & Dark Mode">
            <P>
              Use the{" "}
              <strong className="font-medium text-[#1a0a14]">Mode</strong>{" "}
              toggle to switch between editing your light and dark
              palettes. Both modes live inside the same theme - your
              exported CSS will include a{" "}
              <Mono>:root</Mono> block for light and a{" "}
              <Mono>.dark</Mono> block for dark, so your shadcn/ui
              project can switch themes at runtime without any extra
              configuration.
            </P>
            <P>
              Every color variable is independently editable per mode.
              Your primary brand color in light mode can differ from
              the one used in dark mode - Theme Studio tracks them
              separately.
            </P>
            <Tip>
              Design your light mode first, then switch to dark and
              adjust until the contrast and mood feel right. The live
              preview updates immediately so you can compare side by side
              by toggling back and forth.
            </Tip>
          </Section>

          <div className="border-t border-[#d4c8bc]" />

          {/* 4. Customizing Colors */}
          <Section number={4} icon={Pipette} title="Customizing Colors">
            <P>
              Each color variable appears as a row in the control panel
              with two ways to change its value:
            </P>
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-start">
                <span className="shrink-0 w-5 h-5 rounded bg-[#8b1a4a] mt-0.5" />
                <div>
                  <p className="text-[12px] font-medium text-[#1a0a14] mb-0.5">Color swatch</p>
                  <p className="text-[12px] text-[#3d2b35] leading-relaxed">
                    Click the colored square to open a pop-up color
                    picker with a saturation/brightness canvas, a hue
                    slider, and an opacity slider. Drag to any color you
                    like.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="shrink-0 w-5 h-5 rounded bg-[#ede7de] border border-[#d4c8bc] mt-0.5 flex items-center justify-center">
                  <span className="font-mono text-[7px] text-[#8a7a72]">#</span>
                </span>
                <div>
                  <p className="text-[12px] font-medium text-[#1a0a14] mb-0.5">Hex input</p>
                  <p className="text-[12px] text-[#3d2b35] leading-relaxed">
                    Type a 6-digit hex code directly into the input
                    field next to the swatch. Paste values from Figma,
                    a brand style guide, or any other source.
                  </p>
                </div>
              </div>
            </div>
            <P>
              Both inputs stay in sync - changing one updates the other.
              The preview panel reflects your change instantly without
              any save or apply step.
            </P>
          </Section>

          <div className="border-t border-[#d4c8bc]" />

          {/* 5. Color Groups */}
          <Section number={5} icon={Layers} title="Understanding the Color Groups">
            <P>
              The variables are organized into six collapsible groups.
              Click a group header to expand or collapse it. Here&apos;s
              what each group controls:
            </P>
            <div className="rounded-md border border-[#d4c8bc] overflow-hidden bg-[#ede7de]/40">
              <GroupRow
                label="Base"
                description="Page background and default body text. These are the foundational colors everything else sits on top of."
              />
              <GroupRow
                label="Primary"
                description="Your brand's main action color - used for primary buttons, active states, links, and key interactive elements."
              />
              <GroupRow
                label="Secondary"
                description="Subtle secondary actions and surface fills, used for secondary buttons and lower-priority UI elements."
              />
              <GroupRow
                label="Semantic"
                description="Muted (de-emphasized text and backgrounds), Accent (highlighted or selected content), and Destructive (errors, warnings, and delete actions)."
              />
              <GroupRow
                label="Surfaces"
                description="Card and Popover backgrounds with their paired foreground text colors. Used wherever elevated surfaces appear."
              />
              <GroupRow
                label="Borders"
                description="Border lines for layout and components, Input backgrounds for form fields, and Ring for keyboard-focus outlines."
              />
            </div>
            <Tip>
              shadcn/ui components reference these variables by name, so
              changing <Mono>--primary</Mono> updates every primary
              button across your entire app simultaneously.
            </Tip>
          </Section>

          <div className="border-t border-[#d4c8bc]" />

          {/* 6. Live Preview */}
          <Section number={6} icon={Eye} title="The Live Preview">
            <P>
              The main panel on the right is a live preview of real
              shadcn/ui components rendered using your current theme
              values. It includes:
            </P>
            <ul className="text-[12px] text-[#3d2b35] leading-relaxed space-y-1.5 list-none">
              {[
                "Buttons in all five variants (Default, Secondary, Outline, Ghost, Destructive)",
                "Text inputs and a textarea",
                "A Card component with badges, a description, and footer actions",
                "Badge variants",
                "Default and Destructive alert banners",
                "Switch toggles, Tabs, and Select dropdowns",
                "Skeleton loading placeholders",
                "A full color palette grid showing all 12 theme values at a glance",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="shrink-0 text-[#8b1a4a] mt-0.5">›</span>
                  {item}
                </li>
              ))}
            </ul>
            <P>
              Every component updates the moment you change a color -
              no save button, no refresh needed. Toggle between light
              and dark mode to see how your theme looks in both contexts.
            </P>
          </Section>

          <div className="border-t border-[#d4c8bc]" />

          {/* 7. Reset */}
          <Section number={7} icon={RotateCcw} title="Resetting to Defaults">
            <P>
              Clicked &ldquo;reset&rdquo; next to the Preset label to discard all
              your color overrides and return to the preset&apos;s original
              values for the active mode. Both light and dark overrides
              are cleared at once.
            </P>
            <P>
              You can also switch to a different preset using the
              dropdown - this implicitly resets the theme to that
              preset&apos;s defaults, giving you a clean slate to
              customize from.
            </P>
          </Section>

          <div className="border-t border-[#d4c8bc]" />

          {/* 8. Sharing */}
          <Section number={8} icon={Share2} title="Sharing Your Theme via URL">
            <P>
              Your theme is automatically encoded into the page URL as
              query parameters. As soon as you change any color, the
              address bar updates - no save button required.
            </P>
            <P>
              To share your customization, copy the URL from your
              browser and send it. The recipient will see your exact
              preset, mode, and all color overrides the moment they
              open it.
            </P>
            <Tip>
              Only the <em>differences</em> from the chosen preset are
              written to the URL, keeping it short and readable. A theme
              with no overrides has a URL like{" "}
              <Mono>?p=Ivory&m=light</Mono>.
            </Tip>
          </Section>

          <div className="border-t border-[#d4c8bc]" />

          {/* 9. Exporting */}
          <Section number={9} icon={Download} title="Exporting Your Theme">
            <P>
              When you&apos;re happy with your theme, click{" "}
              <strong className="font-medium text-[#1a0a14]">Export Theme</strong>{" "}
              at the bottom of the control panel. A panel slides up
              showing the generated CSS - a complete{" "}
              <Mono>@layer base</Mono> block with both{" "}
              <Mono>:root</Mono> (light) and{" "}
              <Mono>.dark</Mono> variable definitions.
            </P>
            <div className="flex flex-col gap-1.5 text-[12px] text-[#3d2b35]">
              <p className="font-medium text-[#1a0a14] text-[12px]">To use it in your project:</p>
              {[
                ["1", 'Click “Copy to clipboard” or “Download globals.css”.'],
                ["2", "Open your project's app/globals.css file."],
                ["3", "Paste the block, replacing any existing @layer base block."],
                ["4", "Save the file - your components will update immediately."],
              ].map(([step, text]) => (
                <div key={step} className="flex gap-2.5">
                  <span className="shrink-0 font-mono text-[10px] text-[#8b1a4a] w-4 text-right pt-0.5">{step}.</span>
                  <span className="leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
            <Tip>
              The exported CSS works with any shadcn/ui project
              regardless of the shadcn version or how your components were
              installed - it only touches CSS variables, nothing else.
            </Tip>
          </Section>

          {/* Footer spacer */}
          <div className="pt-2 text-center">
            <p className="font-mono text-[10px] text-[#b8a89a] uppercase tracking-[0.12em]">
              Built by Javier Padilla
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
