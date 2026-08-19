import type { CSSVar } from "./types";

/**
 * Plain-language names for each shadcn variable, for Simple mode.
 *
 * The rule for these: name the thing a person can point at on screen, not the
 * abstraction. "Button color" beats "Primary", which beats "--primary".
 */
export interface TokenInfo {
  label: string;
}

export const TOKEN_INFO: Record<CSSVar, TokenInfo> = {
  background: { label: "Page background" },
  foreground: { label: "Body text" },
  card: { label: "Card background" },
  "card-foreground": { label: "Card text" },
  popover: { label: "Menu background" },
  "popover-foreground": { label: "Menu text" },
  primary: { label: "Button color" },
  "primary-foreground": { label: "Button label" },
  secondary: { label: "Secondary button" },
  "secondary-foreground": { label: "Secondary button label" },
  muted: { label: "Muted background" },
  "muted-foreground": { label: "Muted text" },
  accent: { label: "Highlight background" },
  "accent-foreground": { label: "Highlight text" },
  destructive: { label: "Delete and error color" },
  "destructive-foreground": { label: "Delete button label" },
  border: { label: "Borders and dividers" },
  input: { label: "Input outlines" },
  ring: { label: "Focus ring" },
};

export function tokenLabel(v: CSSVar): string {
  return TOKEN_INFO[v].label;
}
