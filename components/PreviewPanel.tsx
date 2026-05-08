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
import type { Mode, ThemeConfig, ThemeValues } from "@/lib/types";
import { CSS_VARS } from "@/lib/types";

interface Props {
  theme: ThemeConfig;
  mode: Mode;
}

function buildPreviewVars(values: ThemeValues): CSSProperties {
  const vars: Record<string, string> = {};
  for (const key of CSS_VARS) {
    vars[`--${key}`] = values[key];
  }
  vars["--radius"] = "0.5rem";
  return vars as CSSProperties;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b4a49c] mb-3">
        {label}
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}

export function PreviewPanel({ theme, mode }: Props) {
  const previewVars = buildPreviewVars(theme[mode]);

  return (
    <div
      className="preview-surface rounded-xl p-6 sm:p-8 space-y-8 ring-1 ring-[#d4c8bc]"
      style={previewVars}
    >
      <header className="flex items-baseline justify-between gap-4 pb-4 border-b border-border/60">
        <h2
          className="text-[clamp(20px,2.5vw,28px)] font-normal tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {theme.name}{" "}
          <span className="text-muted-foreground font-mono text-[12px] tracking-normal ml-2">
            {mode}
          </span>
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          live preview
        </span>
      </header>

      <Row label="buttons">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </Row>

      <Row label="inputs">
        <div className="flex flex-col gap-2 max-w-xs flex-1 min-w-[220px]">
          <Label htmlFor="preview-input" className="text-xs">
            Email address
          </Label>
          <Input
            id="preview-input"
            placeholder="hello@example.com"
            type="email"
          />
        </div>
        <div className="flex flex-col gap-2 max-w-xs flex-1 min-w-[220px]">
          <Label htmlFor="preview-textarea" className="text-xs">
            Message
          </Label>
          <Textarea
            id="preview-textarea"
            placeholder="Type a longer message..."
            rows={3}
          />
        </div>
      </Row>

      <Row label="card">
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Connection ready</CardTitle>
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
      </Row>

      <Row label="badges">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </Row>

      <Row label="alerts">
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
      </Row>

      <Row label="controls">
        <div className="flex items-center gap-2.5 min-w-[180px]">
          <Switch id="preview-switch" defaultChecked />
          <Label htmlFor="preview-switch" className="text-sm cursor-pointer">
            Notifications
          </Label>
        </div>
        <Tabs defaultValue="overview" className="min-w-[280px]">
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
      </Row>

      <Row label="skeleton">
        <div className="w-full max-w-md flex flex-col gap-2">
          <Skeleton className="h-4 w-48" style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite" }} />
          <Skeleton className="h-4 w-64" style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite", animationDelay: "0.15s" }} />
          <Skeleton className="h-4 w-40" style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite", animationDelay: "0.3s" }} />
        </div>
      </Row>

      <Row label="palette">
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
              className="flex items-center gap-2 rounded-md ring-1 ring-border bg-card/50 px-2 py-1.5"
            >
              <div
                className="h-4 w-4 rounded-sm ring-1 ring-foreground/15 shrink-0"
                style={{ background: `hsl(${theme[mode][key]})` }}
              />
              <span className="font-mono text-[10px] text-muted-foreground truncate">
                {key}
              </span>
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
}
