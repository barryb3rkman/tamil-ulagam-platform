"use client";

import { Button, Dialog } from "@tamil-ulagam/ui";
import { useState } from "react";

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  pendingLabel = "Working…",
  title,
  tone = "default",
}: {
  readonly cancelLabel?: string;
  readonly confirmLabel: string;
  readonly description: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => Promise<void>;
  readonly pendingLabel?: string;
  readonly title: string;
  readonly tone?: "default" | "destructive";
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <Dialog open onClose={onCancel} title={title}>
      <p className="text-slate leading-7">{description}</p>
      {error ? (
        <p role="alert" className="text-error mt-4 font-semibold">
          {error}
        </p>
      ) : null}
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          className={
            tone === "destructive"
              ? "bg-heritage-maroon hover:bg-deep-navy"
              : undefined
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
