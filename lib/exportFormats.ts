import { hslToHex } from "./colorUtils";
import { TOKEN_INFO } from "./tokenInfo";
import { CSS_VARS, type ThemeConfig } from "./types";

/**
 * Three real output formats. Each one is complete and paste-ready on its own
 * terms, and every one carries both the light and the dark palette: a theme
 * that only ships half its modes is not a theme.
 */

export type ExportFormat = "css" | "tailwind" | "json";

export interface FormatSpec {
  id: ExportFormat;
  label: string;
  /** Syntax family for the highlighter. */
  language: "css" | "json";
  filename: string;
  mime: string;
  /** What this output is and where it goes. */
  blurb: string;
}

export const FORMATS: FormatSpec[] = [
  {
    id: "css",
    label: "CSS variables",
    language: "css",
    filename: "theme.css",
    mime: "text/css",
    blurb:
      "A drop-in @layer base block for an existing shadcn/ui project. Replace the block already in your app/globals.css.",
  },
  {
    id: "tailwind",
    label: "Tailwind v4",
    language: "css",
    filename: "globals.css",
    mime: "text/css",
    blurb:
      "A complete Tailwind v4 stylesheet: the import, the dark variant, both palettes, and the @theme mapping that turns them into utilities like bg-primary.",
  },
  {
    id: "json",
    label: "JSON tokens",
    language: "json",
    filename: "theme.json",
    mime: "application/json",
    blurb:
      "Design tokens in the W3C community-group shape, hex as the value and the HSL triplet under $extensions. For pipelines, Figma sync, or your own scripts.",
  },
];

export function getFormat(id: ExportFormat): FormatSpec {
  return FORMATS.find((f) => f.id === id) ?? FORMATS[0];
}

const DEFAULT_RADIUS = "0.5rem";

/**
 * The standard shadcn/ui @layer base block, both modes.
 * Drop the output into globals.css of any shadcn project.
 */
export function generateCSS(
  config: ThemeConfig,
  radius = DEFAULT_RADIUS
): string {
  const lines: string[] = [];

  lines.push("@layer base {");
  lines.push("  :root {");
  for (const key of CSS_VARS) {
    lines.push(`    --${key}: ${config.light[key]};`);
  }
  lines.push(`    --radius: ${radius};`);
  lines.push("  }");
  lines.push("");
  lines.push("  .dark {");
  for (const key of CSS_VARS) {
    lines.push(`    --${key}: ${config.dark[key]};`);
  }
  lines.push("  }");
  lines.push("}");

  return lines.join("\n");
}

/**
 * A whole Tailwind v4 stylesheet.
 *
 * v4 is CSS-first, so there is no tailwind.config.js to hand back: the theme
 * is declared in CSS with @theme. The `inline` keyword matters here, because
 * the values are references to the --background style variables rather than
 * literals, and that is what lets .dark reassign them at runtime.
 *
 * This mirrors the setup Theme Studio itself runs on, so the output is a
 * pattern already proven against Tailwind v4 rather than one assembled from
 * memory.
 */
export function generateTailwind(
  config: ThemeConfig,
  radius = DEFAULT_RADIUS
): string {
  const lines: string[] = [];

  lines.push('@import "tailwindcss";');
  lines.push("");
  lines.push("@custom-variant dark (&:is(.dark *));");
  lines.push("");
  lines.push(":root {");
  for (const key of CSS_VARS) {
    lines.push(`  --${key}: ${config.light[key]};`);
  }
  lines.push(`  --radius: ${radius};`);
  lines.push("}");
  lines.push("");
  lines.push(".dark {");
  for (const key of CSS_VARS) {
    lines.push(`  --${key}: ${config.dark[key]};`);
  }
  lines.push("}");
  lines.push("");
  lines.push("/* Maps the variables above onto Tailwind utilities: */");
  lines.push("/* bg-background, text-muted-foreground, border-border, ... */");
  lines.push("@theme inline {");
  for (const key of CSS_VARS) {
    lines.push(`  --color-${key}: hsl(var(--${key}));`);
  }
  lines.push("");
  lines.push("  --radius-sm: calc(var(--radius) * 0.6);");
  lines.push("  --radius-md: calc(var(--radius) * 0.8);");
  lines.push("  --radius-lg: var(--radius);");
  lines.push("  --radius-xl: calc(var(--radius) * 1.4);");
  lines.push("}");

  return lines.join("\n");
}

/**
 * Design tokens in the W3C Design Tokens Community Group shape: $type and
 * $value on every token, groups for the two modes.
 *
 * The HSL triplet goes under $extensions rather than as a sibling key, since
 * that is the spec's own escape hatch for format-specific data. The
 * descriptions are the same ones the info panels show, so an exported file
 * explains itself.
 */
export function generateJSON(
  config: ThemeConfig,
  radius = DEFAULT_RADIUS
): string {
  const group = (mode: "light" | "dark") =>
    Object.fromEntries(
      CSS_VARS.map((key) => [
        key,
        {
          $type: "color",
          $value: hslToHex(config[mode][key]),
          $description: TOKEN_INFO[key].description,
          $extensions: { "sh.shadcn.hsl": config[mode][key] },
        },
      ])
    );

  const doc = {
    $description: `shadcn/ui theme "${config.name}" generated with Theme Studio`,
    radius: {
      $type: "dimension",
      $value: radius,
      $description: "Base corner radius the other radii are derived from.",
    },
    light: group("light"),
    dark: group("dark"),
  };

  return JSON.stringify(doc, null, 2);
}

export function generateExport(
  format: ExportFormat,
  config: ThemeConfig,
  radius = DEFAULT_RADIUS
): string {
  switch (format) {
    case "tailwind":
      return generateTailwind(config, radius);
    case "json":
      return generateJSON(config, radius);
    case "css":
    default:
      return generateCSS(config, radius);
  }
}
