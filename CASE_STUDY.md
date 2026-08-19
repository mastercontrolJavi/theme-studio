# Theme Studio

Most shadcn theme editors are color pickers with a preview bolted on. You pick a burgundy you like, the buttons turn burgundy, everyone moves on. Nobody tells you the label sitting on that button fails WCAG AA.

I rebuilt mine to answer that question first.

## A picker without contrast math is a toy

Theme Studio measures every foreground and background pairing the components actually paint, using the real relative luminance formula. Thirteen pairings, scored live, AA and AAA badges backed by numbers you can check.

I built that pairing list by reading the component source instead of pairing token names that look symmetrical. It caught something I would have gotten wrong. The style I ship paints destructive buttons as a tinted background with colored text, so `--destructive-foreground` is never read by anything. Zero references. Scoring it against `--destructive` would have shipped a badge that measures nothing.

The uncomfortable part is that every preset I ship fails something. Ivory light passes 10 of 13. Slate light puts near-white text on a blue button at 2.72:1. I could have quietly corrected the presets before turning the audit on. I left them, because a tool that only ever shows green is not measuring anything.

## One interface, two depths

The obvious move was three modes for three skill levels. I did not want to maintain three UIs, and I do not think a beginner and an expert want different tools. They want the same tool showing different amounts of itself.

So there is one interface with a Simple and Advanced toggle. Simple says "Button color" and hides fifteen variables. Advanced says `--primary` and shows all nineteen, with hex, HSL, and OKLCH entry. Same state, same math underneath, different surface area.

## The interaction I am proud of

Fix contrast. A failing pairing gets a button that nudges the foreground lightness until it passes.

The naive version plays whack-a-mole. `--muted-foreground` sits on three different backgrounds, so fixing it against one breaks another. Instead the search looks for a lightness that fixes the target without dropping any related pairing that currently passes, and says so plainly when no single value can satisfy both.

One click on `--muted-foreground` in Ivory takes light mode from 10 of 13 to 13 of 13.

[Try it](https://theme.javiertpadilla.com)
