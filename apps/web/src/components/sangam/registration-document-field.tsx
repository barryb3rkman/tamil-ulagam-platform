"use client";

import { useId, useRef } from "react";

export type DocumentUploadStatus = "idle" | "uploading" | "uploaded" | "error";

const ACCEPTED_TYPES = "application/pdf,image/jpeg,image/jpg,image/png";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function documentIcon(filename: string): string {
  return filename.toLowerCase().endsWith(".pdf") ? "📄" : "🖼️";
}

/**
 * Phase H3 — a real upload component (H3 brief section 9: "Do not create
 * a fake file input"), not a generic <input type="file"> left bare after
 * selection. Three renders: empty (a labelled dropzone-style button),
 * in-flight (H3 brief section 24 — a distinct "Uploading…" state, never
 * folded into the text-field autosave indicator), and uploaded (filename
 * + size + Replace/Remove, H3 brief section 14 — never looks like a
 * generic browser file input once a file exists).
 */
export function RegistrationDocumentField({
  error,
  fileSize,
  filename,
  onRemove,
  onSelect,
  status,
}: {
  readonly status: DocumentUploadStatus;
  readonly filename?: string;
  readonly fileSize?: number;
  readonly error?: string;
  readonly onSelect: (file: File) => void;
  readonly onRemove: () => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const statusId = `${inputId}-status`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
    // Allow re-selecting the exact same file (e.g. after Remove).
    event.target.value = "";
  };

  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={inputId}
        className="text-global-navy text-sm font-semibold"
      >
        Registration document
        <span className="text-heritage-maroon ml-1" aria-hidden="true">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </label>

      {status === "uploaded" && filename ? (
        <div className="border-global-navy/15 rounded-button flex items-center gap-3 border bg-white px-4 py-3">
          <span aria-hidden="true" className="text-xl">
            {documentIcon(filename)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-charcoal truncate text-sm font-semibold">
              {filename}
            </p>
            {typeof fileSize === "number" ? (
              <p className="text-slate text-xs">{formatFileSize(fileSize)}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="focus-visible:ring-focus rounded-sm text-sm font-semibold underline underline-offset-4"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-heritage-maroon focus-visible:ring-focus rounded-sm text-sm font-semibold underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          aria-describedby={statusId}
          className="motion-control border-global-navy/25 hover:border-global-navy/45 focus-visible:ring-focus rounded-button flex min-h-11 w-full items-center justify-center gap-2 border border-dashed bg-white px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "uploading" ? (
            <>
              <span
                aria-hidden="true"
                className="border-slate/40 border-t-slate size-3.5 animate-spin rounded-full border-2"
              />
              Uploading…
            </>
          ) : (
            <>
              <span aria-hidden="true">⬆</span>
              Upload registration document
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        onChange={handleChange}
      />

      <p
        id={statusId}
        aria-live="polite"
        className="text-slate text-xs leading-5"
      >
        {status === "error"
          ? ""
          : status === "uploading"
            ? "Uploading your registration document…"
            : "PDF, JPG or PNG · up to 10 MB"}
      </p>

      {error ? (
        <p role="alert" className="text-error text-sm">
          {error}
          {status === "error" ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="focus-visible:ring-focus ml-2 rounded-sm font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
