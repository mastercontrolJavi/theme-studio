"use client";

import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Mode, ThemeValues } from "@/lib/types";
import { CSS_VARS } from "@/lib/types";

interface Props {
  name: string;
  mode: Mode;
  /** Display values - these morph during preset/mode transitions. */
  values: ThemeValues;
  /**
   * Replaces the "live preview" indicator in the header. The comparison view
   * passes each mode's contrast score here, where two pulsing dots would be
   * noise and the numbers are the reason you opened the view.
   */
  headerNote?: React.ReactNode;
}

function buildPreviewVars(values: ThemeValues): CSSProperties {
  const vars: Record<string, string> = {};
  for (const key of CSS_VARS) {
    vars[`--${key}`] = values[key];
  }
  vars["--radius"] = "0.5rem";
  return vars as CSSProperties;
}

const DEPLOYS: Array<{
  commit: string;
  branch: string;
  status: string;
  duration: string;
  badge: "default" | "secondary" | "destructive" | "outline";
  selected?: boolean;
}> = [
  {
    commit: "a3f9c21",
    branch: "main",
    status: "Ready",
    duration: "42s",
    badge: "default",
    selected: true,
  },
  {
    commit: "7b2e004",
    branch: "main",
    status: "Ready",
    duration: "38s",
    badge: "secondary",
  },
  {
    commit: "c81d5fa",
    branch: "fix/auth",
    status: "Building",
    duration: "12s",
    badge: "outline",
  },
  {
    commit: "19ee7b3",
    branch: "main",
    status: "Error",
    duration: "8s",
    badge: "destructive",
  },
];

/** Section with a mono kicker, hairline rule, and optional right-aligned hint. */
function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">
          {label}
        </span>
        <span className="flex-1 h-px bg-border" />
        {hint && (
          <span className="font-mono text-[9.5px] text-muted-foreground opacity-70 whitespace-nowrap">
            {hint}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}

export function PreviewPanel({ name, mode, values, headerNote }: Props) {
  const previewVars = buildPreviewVars(values);

  return (
    <div
      /*
       * The `dark` class is what makes this an honest dark preview. The dark
       * variant is defined as `&:is(.dark *)`, so without an ancestor carrying
       * the class every dark: utility baked into the shadcn components stayed
       * inert and dark mode was previewing on swapped variables alone.
       */
      className={[
        "preview-surface rounded-2xl p-6 sm:px-8 sm:pt-7.5 sm:pb-8.5 space-y-7.5",
        mode === "dark" ? "dark" : "",
      ].join(" ")}
      style={previewVars}
    >
      <header className="flex items-baseline justify-between gap-4 pb-4.5 border-b border-border">
        <div className="flex items-baseline gap-3">
          <h2
            className="text-[clamp(24px,2.4vw,31px)] font-medium tracking-tight m-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </h2>
          <span className="font-mono text-[12px] text-muted-foreground capitalize">
            {mode}
          </span>
        </div>
        {headerNote ?? (
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{ animation: "ts-livepulse 2s ease-in-out infinite" }}
            />
            live preview
          </span>
        )}
      </header>

      <Section label="buttons">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </Section>

      <Section label="form">
        <div className="flex flex-col gap-2 max-w-xs flex-1 min-w-55">
          <Label htmlFor="preview-input" className="text-xs">
            Email address
          </Label>
          <Input
            id="preview-input"
            placeholder="hello@example.com"
            type="email"
          />
        </div>
        <div className="flex flex-col gap-2 max-w-xs flex-1 min-w-55">
          <Label htmlFor="preview-textarea" className="text-xs">
            Message
          </Label>
          <Textarea
            id="preview-textarea"
            placeholder="Type a longer message..."
            rows={3}
          />
        </div>
      </Section>

      <Section label="card">
        <Card className="max-w-sm w-full shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-14px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle
              className="text-[21px] font-medium tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Connection ready
            </CardTitle>
            <CardDescription>
              Your project is linked. Deploy whenever you&apos;re happy with this
              theme.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center gap-2">
              <Badge>v1.0</Badge>
              <Badge variant="secondary">stable</Badge>
              <Badge variant="outline">free tier</Badge>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Deploy</Button>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section label="badges">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </Section>

      <Section label="alerts">
        <div className="flex flex-col gap-3 w-full max-w-xl">
          <Alert>
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              Your theme is auto-saved to the URL - share the link to share the
              theme.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive alert</AlertTitle>
            <AlertDescription>
              Use this pattern for errors, warnings, or irreversible actions.
            </AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section label="controls">
        <div className="flex items-center gap-2.5 min-w-45">
          <Switch id="preview-switch" defaultChecked />
          <Label htmlFor="preview-switch" className="text-sm cursor-pointer">
            Notifications
          </Label>
        </div>
        <Tabs defaultValue="overview" className="min-w-70">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          <TabsContent
            value="overview"
            className="mt-3 text-xs text-muted-foreground"
          >
            Tab content syncs with theme.
          </TabsContent>
          <TabsContent
            value="settings"
            className="mt-3 text-xs text-muted-foreground"
          >
            Configuration options.
          </TabsContent>
          <TabsContent
            value="logs"
            className="mt-3 text-xs text-muted-foreground"
          >
            Recent activity.
          </TabsContent>
        </Tabs>
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Pick a region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iad1">us-east-1 · iad1</SelectItem>
            <SelectItem value="sfo1">us-west-1 · sfo1</SelectItem>
            <SelectItem value="fra1">eu-central-1 · fra1</SelectItem>
            <SelectItem value="hnd1">ap-northeast-1 · hnd1</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      <Section label="loading state">
        <div className="w-full max-w-md flex flex-col gap-2">
          <Skeleton className="h-4 w-48" style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite" }} />
          <Skeleton className="h-4 w-64" style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite", animationDelay: "0.15s" }} />
          <Skeleton className="h-4 w-40" style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite", animationDelay: "0.3s" }} />
        </div>
      </Section>

      {/* The one surface the rest of the preview was missing: --muted as a
          real fill, --border doing structural work, and --accent visible
          without needing a hover or an open menu. */}
      <Section label="data table" hint="border · muted · accent">
        {/* The table keeps its natural column widths and scrolls inside this
            wrapper rather than stretching the panel on a narrow screen. */}
        <div className="w-full overflow-x-auto rounded-xl ring-1 ring-border bg-card">
          <table className="w-full border-collapse text-left text-[13px]">
            <caption className="sr-only">Recent deploys</caption>
            <thead>
              <tr className="bg-muted">
                {["Commit", "Branch", "Status", "Duration"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEPLOYS.map((row) => (
                <tr
                  key={row.commit}
                  aria-selected={row.selected || undefined}
                  className={[
                    "border-t border-border transition-colors",
                    row.selected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/60",
                  ].join(" ")}
                >
                  <td className="px-3 py-2 font-mono text-[12px]">
                    {row.commit}
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">
                    {row.branch}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={row.badge}>{row.status}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground tabular-nums">
                    {row.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              4 of 24 deploys
            </span>
            <div className="flex gap-1.5">
              <Button size="xs" variant="outline">
                Prev
              </Button>
              <Button size="xs" variant="outline">
                Next
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section label="palette" hint={`${CSS_VARS.length} variables`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 w-full">
          {(
            [
              "background",
              "foreground",
              "primary",
              "secondary",
              "muted",
              "accent",
              "destructive",
              "border",
              "card",
              "popover",
              "ring",
              "input",
            ] as const
          ).map((key) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-lg ring-1 ring-border bg-card px-2.5 py-2"
            >
              <div
                className="h-4 w-4 rounded-[5px] ring-1 ring-foreground/15 shrink-0"
                style={{ background: `hsl(${values[key]})` }}
              />
              <span className="font-mono text-[10px] text-muted-foreground truncate">
                {key}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
