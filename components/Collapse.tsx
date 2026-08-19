"use client";

/**
 * Height-animated disclosure without measuring anything in JS: the wrapper is
 * a one-row grid whose track animates between 0fr and 1fr, so the content
 * keeps its natural height and reflows freely. Respects reduced motion.
 */
export function Collapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
        className ?? "",
      ].join(" ")}
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      {/* inert keeps collapsed content out of the tab order and the a11y tree */}
      <div className="min-h-0 overflow-hidden" inert={!open}>
        {children}
      </div>
    </div>
  );
}
