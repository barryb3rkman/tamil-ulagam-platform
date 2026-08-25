"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { IconButton } from "./icon-button";
import { cx } from "./utils";

export interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * A controlled wrapper over the native `<dialog>` element — generalizes
 * the existing `admin-registration-review.tsx` dialog pattern
 * (`showModal()`/`close()`, backdrop styling) into a reusable primitive.
 * Native `<dialog>` already provides focus trapping and Escape-to-close;
 * this wrapper only synchronizes the imperative open/close calls with a
 * declarative `open` prop and calls `onClose` for every close path
 * (Escape, the close button, or a caller-driven `open={false}`).
 */
export function Dialog({
  children,
  className,
  onClose,
  open,
  title,
}: DialogProps) {
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
      aria-labelledby={titleId}
      className={cx(
        "backdrop:bg-deep-navy/70 rounded-large shadow-navigation m-auto max-h-[90vh] w-[min(92vw,36rem)] overflow-y-auto border-0 p-0",
        className,
      )}
      onClose={onClose}
    >
      <div className="surface-card border-0 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-global-navy text-2xl font-bold">
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
