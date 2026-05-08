import { CSS_VARS, type ThemeConfig } from "./types";

/**
 * Generates a paste-ready @layer base block in the standard shadcn/ui format.
 * Drop the output into globals.css of any shadcn project.
 */
export function generateCSS(config: ThemeConfig, radius = "0.5rem"): string {
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
