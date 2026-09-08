"use client";

import { Button, Dialog } from "@tamil-ulagam/ui";
import { useEffect, useRef, useState } from "react";

/** Matches --tu-motion-base, so the exit finishes before the caller unmounts. */
const exitDuration = 280;

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  description,
  detail,
  onCancel,
  onConfirm,
  pendingLabel = "Working…",
  title,
  tone = "default",
}: {
  readonly cancelLabel?: string;
  readonly confirmLabel: string;
  readonly description: string;
  /** An optional second line for a consequence worth spelling out. */
  readonly detail?: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => Promise<void>;
  readonly pendingLabel?: string;
  readonly title: string;
  readonly tone?: "default" | "destructive";
}) {
  const [pending, setPending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");
  const exitTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(exitTimer.current), []);

  const dismiss = () => {
    if (pending || closing) return;
    setClosing(true);
    exitTimer.current = window.setTimeout(onCancel, exitDuration);
  };

  const submit = async () => {
    setPending(true);
    setError("");
    try {
      await onConfirm();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "That action could not be completed.",
      );
      setPending(false);
    }
  };

  const destructive = tone === "destructive";

  return (
    <Dialog open={!closing} closing={closing} onClose={dismiss} title={title}>
      <p className="text-fg-muted leading-7">{description}</p>
      {detail ? (
        <p
          className={
            destructive
              ? "border-heritage-maroon/25 bg-heritage-maroon/[0.06] text-fg-accent rounded-card mt-4 border px-4 py-3 text-sm leading-6 font-semibold"
              : "border-hairline/12 bg-sunken text-fg-body rounded-card mt-4 border px-4 py-3 text-sm leading-6"
          }
        >
          {detail}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-error mt-4 font-semibold">
          {error}
        </p>
      ) : null}
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={dismiss} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          className={
            destructive ? "bg-heritage-maroon hover:bg-deep-navy" : undefined
          }
          disabled={pending}
          aria-busy={pending}
          onClick={() => void submit()}
        >
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
