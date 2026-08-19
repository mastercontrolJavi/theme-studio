import type { CSSVar } from "./types";

/**
 * What each shadcn variable is for, in the words of someone looking at the
 * screen rather than at the stylesheet.
 *
 * Three fields, and each earns its place:
 *   label       plain-language name, used instead of --var in Simple mode
 *   description what the token controls
 *   example     one place in the live preview you can point at right now
 *   note        only where the honest answer is surprising
 *
 * The examples deliberately name things visible in this app's own preview
 * panel, so the explanation can be checked against the thing it describes
 * without leaving the page.
 */
export interface TokenInfo {
  label: string;
  description: string;
  example: string;
  note?: string;
}

export const TOKEN_INFO: Record<CSSVar, TokenInfo> = {
  background: {
    label: "Page background",
    description: "The page itself. Every other surface sits on top of this.",
    example: "The ground behind this entire preview panel.",
  },
  foreground: {
    label: "Body text",
    description: "Default text colour for body copy and headings.",
    example: "Every paragraph and section heading in the preview.",
  },
  card: {
    label: "Card background",
    description:
      "Raised surfaces that sit above the page: cards, and both alert styles.",
    example: 'The panel behind "Connection ready" in the Card section.',
  },
  "card-foreground": {
    label: "Card text",
    description: "Text sitting on a card surface.",
    example: 'The "Connection ready" title.',
  },
  popover: {
    label: "Menu background",
    description:
      "Floating layers that open above everything else: menus, popovers, selects.",
    example: 'The panel that opens when you click "Pick a region".',
  },
  "popover-foreground": {
    label: "Menu text",
    description: "Text inside a floating layer.",
    example: "Each region name in the open Select menu.",
  },
  primary: {
    label: "Button color",
    description:
      "Your main action colour: filled buttons, active states, and links.",
    example: 'The filled "Default" button and the "v1.0" badge.',
  },
  "primary-foreground": {
    label: "Button label",
    description: "The label colour that sits on top of the primary fill.",
    example: 'The word "Default" inside the filled button.',
  },
  secondary: {
    label: "Secondary button",
    description: "A quieter fill for lower-priority actions.",
    example: 'The "Secondary" button and the "stable" badge.',
  },
  "secondary-foreground": {
    label: "Secondary button label",
    description: "The label colour that sits on the secondary fill.",
    example: 'The word "Secondary" inside its button.',
  },
  muted: {
    label: "Muted background",
    description:
      "Low-emphasis fill for inert surfaces and the trough behind inactive controls.",
    example: "The tab bar behind Overview, Settings and Logs.",
  },
  "muted-foreground": {
    label: "Muted text",
    description:
      "De-emphasised text. It is meant to recede, but it still has to be readable.",
    example: "Placeholder text, card descriptions, and the section labels.",
    note: "This is the token most themes get wrong. Pushing it lighter reads as elegant and fails AA at the same time.",
  },
  accent: {
    label: "Highlight background",
    description: "Highlight fill for the hovered or selected row in a menu.",
    example: "The row under your cursor in an open Select menu.",
  },
  "accent-foreground": {
    label: "Highlight text",
    description: "Text on a highlighted row.",
    example: "The region name you are hovering in the Select menu.",
  },
  destructive: {
    label: "Delete and error color",
    description: "Errors, warnings, and actions that cannot be undone.",
    example:
      'The "Destructive" button, the destructive badge, and the error alert.',
    note: "This component style tints the background and colours the text, so this value is measured as text against --card and --background rather than as a solid fill.",
  },
  "destructive-foreground": {
    label: "Delete button label",
    description: "The label colour for a solid destructive fill.",
    example: "Nothing in this preview reads it.",
    note: "Unused by this component set. The radix-nova style paints destructive as a tinted background plus coloured text, so no component references this variable. It is exported for compatibility with shadcn styles that do use it.",
  },
  border: {
    label: "Borders and dividers",
    description: "Hairlines: dividers, outlines, and the edges of components.",
    example: "The rules between preview sections and the edge of the card.",
  },
  input: {
    label: "Input outlines",
    description: "The outline colour for form fields.",
    example: "The border around the email input and the message textarea.",
  },
  ring: {
    label: "Focus ring",
    description:
      "The focus indicator drawn when someone reaches a control with the keyboard.",
    example: "Press Tab into the preview to see it on the first button.",
  },
};

export function tokenLabel(v: CSSVar): string {
  return TOKEN_INFO[v].label;
}
