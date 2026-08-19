"use client";

import type { JSX } from "react";

/**
 * Line-based syntax tinting for the export preview.
 *
 * Deliberately not a parser: the only inputs are the three generators in
 * lib/exportFormats.ts, whose shape is known, so matching per line stays
 * accurate and keeps the bundle free of a highlighting dependency.
 */

const C = {
  prop: "text-[#e4a6bf]",
  value: "text-[#d8b48a]",
  punct: "text-[#6b5560]",
  selector: "text-[#cf6f95]",
  comment: "text-[#6b5560] italic",
  key: "text-[#e4a6bf]",
  string: "text-[#d8b48a]",
  number: "text-[#c8a2c8]",
  literal: "text-[#cf6f95]",
};

function cssLine(line: string, i: number): JSX.Element {
  const comment = line.match(/^(\s*)(\/\*.*\*\/)\s*$/);
  if (comment) {
    return (
      <div key={i} className="whitespace-pre">
        {comment[1]}
        <span className={C.comment}>{comment[2]}</span>
      </div>
    );
  }

  const decl = line.match(/^(\s*)(--[\w-]+)(:\s*)(.+)(;)$/);
  if (decl) {
    return (
      <div key={i} className="whitespace-pre">
        {decl[1]}
        <span className={C.prop}>{decl[2]}</span>
        <span className={C.punct}>{decl[3]}</span>
        <span className={C.value}>{decl[4]}</span>
        <span className={C.punct}>{decl[5]}</span>
      </div>
    );
  }

  // @import "tailwindcss"; and @custom-variant dark (...);
  const atRule = line.match(/^(\s*)(@[\w-]+)(\s+)(.*?)(;)$/);
  if (atRule) {
    return (
      <div key={i} className="whitespace-pre">
        {atRule[1]}
        <span className={C.selector}>{atRule[2]}</span>
        {atRule[3]}
        <span className={C.value}>{atRule[4]}</span>
        <span className={C.punct}>{atRule[5]}</span>
      </div>
    );
  }

  const block = line.match(/^(\s*)([@.:][\w\s-]*?)(\s*\{)$/);
  if (block) {
    return (
      <div key={i} className="whitespace-pre">
        {block[1]}
        <span className={`${C.selector} font-medium`}>{block[2]}</span>
        <span className={C.punct}>{block[3]}</span>
      </div>
    );
  }

  return (
    <div key={i} className="whitespace-pre">
      <span className={C.punct}>{line}</span>
    </div>
  );
}

function jsonLine(line: string, i: number): JSX.Element {
  const kv = line.match(/^(\s*)("(?:[^"\\]|\\.)*")(:\s*)(.*)$/);
  if (kv) {
    const [, indent, key, colon, rest] = kv;
    const trailing = rest.match(/,$/) ? "," : "";
    const bare = trailing ? rest.slice(0, -1) : rest;
    let valueClass = C.literal;
    if (/^"/.test(bare)) valueClass = C.string;
    else if (/^-?\d/.test(bare)) valueClass = C.number;
    else if (bare === "{" || bare === "[") valueClass = C.punct;
    return (
      <div key={i} className="whitespace-pre">
        {indent}
        <span className={C.key}>{key}</span>
        <span className={C.punct}>{colon}</span>
        <span className={valueClass}>{bare}</span>
        <span className={C.punct}>{trailing}</span>
      </div>
    );
  }
  return (
    <div key={i} className="whitespace-pre">
      <span className={C.punct}>{line}</span>
    </div>
  );
}

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: "css" | "json";
}) {
  const render = language === "json" ? jsonLine : cssLine;
  return (
    <pre className="flex-1 min-h-0 overflow-auto thin-scroll m-0 px-4.5 py-4 font-mono text-[12px] leading-[1.75]">
      <code>
        {code.split("\n").map((line, i) =>
          // An empty div has no line box, which would silently swallow the
          // blank lines the generators use to separate blocks.
          line.trim() === "" ? (
            <div key={i} className="whitespace-pre">
              {"\u00A0"}
            </div>
          ) : (
            render(line, i)
          )
        )}
      </code>
    </pre>
  );
}
