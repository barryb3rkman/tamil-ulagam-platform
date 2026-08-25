"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { IconButton } from "./icon-button";
import { cx } from "./utils";

export interface SheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  /** `bottom` (default) for the mobile bottom-sheet treatment, `right`
   * for a desktop side drawer. A consumer typically switches this by
   * breakpoint rather than picking one permanently. */
  readonly side?: "bottom" | "right";
  readonly className?: string;
}

/**
 * Drawer/Sheet foundation — same controlled open/close contract as
 * `Dialog` (native `<dialog>`, focus trap and Escape-to-close for
 * free), positioned and animated as an edge-anchored slide instead of a
 * centered modal. Intended consumers: a workspace switcher, a mobile
 * navigation panel, a decision dialog that reads better as a bottom
 * sheet on small screens.
 */
export function Sheet({
  children,
  className,
  onClose,
  open,
  side = "bottom",
  title,
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      data-side={side}
      aria-labelledby={titleId}
      className={cx(
        "motion-sheet backdrop:bg-deep-navy/70 shadow-navigation border-0 p-0",
        side === "bottom" &&
          "rounded-t-large inset-x-0 bottom-0 m-0 mt-auto max-h-[85vh] w-full",
        side === "right" &&
          "rounded-l-large inset-y-0 right-0 m-0 ml-auto h-full max-w-[24rem]",
        className,
      )}
      onClose={onClose}
    >
      <div className="surface-card flex max-h-full flex-col overflow-y-auto border-0 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-global-navy text-xl font-bold">
            {title}
          </h2>
          <IconButton aria-label="Close" onClick={onClose}>
            <span aria-hidden="true" className="text-xl leading-none">
              &times;
            </span>
          </IconButton>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}
