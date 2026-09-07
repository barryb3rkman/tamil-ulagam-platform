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
  /** Set on a dialog that is playing its exit before the caller unmounts it. */
  readonly closing?: boolean;
}

export function Dialog({
  children,
  className,
  closing = false,
  onClose,
  open,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Dismiss on a backdrop click. A click outside the panel lands on the dialog
  // element itself rather than anything inside it, which is what separates
  // "outside" from "inside" without an overlay element to intercept it. Bound
  // here rather than as a JSX prop because the target is the element, not a
  // control someone tabs to — Escape already covers the keyboard, natively.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const dismissOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };
    dialog.addEventListener("click", dismissOnBackdrop);
    return () => dialog.removeEventListener("click", dismissOnBackdrop);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-closing={closing ? "true" : undefined}
      className={cx(
        "motion-dialog rounded-large shadow-elevated m-auto max-h-[90vh] w-[min(92vw,36rem)] overflow-y-auto border-0 p-0",
        className,
      )}
      onClose={onClose}
    >
      <div className="surface-card relative overflow-hidden border-0 p-6 sm:p-8">
        <span
          aria-hidden="true"
          className="gradient-gold-leaf dialog-crest absolute inset-x-0 top-0 h-[3px] origin-left"
        />
        <div className="flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="text-global-navy text-2xl font-bold tracking-[-0.01em]"
          >
            {title}
          </h2>
          <IconButton ref={closeButtonRef} aria-label="Close" onClick={onClose}>
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
