export const CSS_VARS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
] as const;

export type CSSVar = (typeof CSS_VARS)[number];

export type Mode = "light" | "dark";

/** How much of the editor is on screen. Persisted to localStorage. */
export type DetailLevel = "simple" | "advanced";

/** Which notation the value inputs speak. Simple mode is always hex. */
export type ColorFormat = "hex" | "hsl" | "oklch";

export type ThemeValues = Record<CSSVar, string>;

export interface ThemeConfig {
  name: string;
  light: ThemeValues;
  dark: ThemeValues;
}

export const VAR_GROUPS: Array<{
  id: string;
  label: string;
  vars: CSSVar[];
}> = [
  {
    id: "base",
    label: "Base",
    vars: ["background", "foreground"],
  },
  {
    id: "primary",
    label: "Primary",
    vars: ["primary", "primary-foreground"],
  },
  {
    id: "secondary",
    label: "Secondary",
    vars: ["secondary", "secondary-foreground"],
  },
  {
    id: "semantic",
    label: "Semantic",
    vars: [
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "destructive-foreground",
    ],
  },
  {
    id: "surfaces",
    label: "Surfaces",
    vars: ["card", "card-foreground", "popover", "popover-foreground"],
  },
  {
    id: "borders",
    label: "Borders",
    vars: ["border", "input", "ring"],
  },
];

/**
 * Simple mode shows the first three groups and, inside them, only the colours
 * a person actually decides on. Page background and body text stay editable
 * because "what colour is my text" is a real decision; the labels that sit on
 * buttons are not, so they are derived (see SIMPLE_AUTO_PAIRS).
 */
export const SIMPLE_GROUP_VARS: Record<string, CSSVar[]> = {
  base: ["background", "foreground"],
  primary: ["primary"],
  secondary: ["secondary"],
};

/**
 * Ground -> foreground pairs that Simple mode maintains for you. Changing the
 * ground re-derives the label to the nearest lightness that reads on it.
 *
 * Deliberately not every *-foreground token: --muted-foreground is supposed to
 * sit low against its ground, so auto-maximising it would destroy the very
 * effect it exists for. Those stay hand-edited in Advanced mode.
 */
export const SIMPLE_AUTO_PAIRS: Partial<Record<CSSVar, CSSVar>> = {
  primary: "primary-foreground",
  secondary: "secondary-foreground",
};

/** Groups visible in Simple mode, in order. */
export const SIMPLE_GROUP_IDS = ["base", "primary", "secondary"] as const;
