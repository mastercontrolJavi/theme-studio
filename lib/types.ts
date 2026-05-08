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
