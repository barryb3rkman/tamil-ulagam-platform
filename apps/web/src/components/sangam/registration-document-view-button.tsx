"use client";

import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

const REGISTRATION_DOCUMENT_BUCKET = "sangam-registration-documents";
const SIGNED_URL_TTL_SECONDS = 120;

export function RegistrationDocumentViewButton({
  filename,
  path,
}: {
  readonly path: string;
  readonly filename: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleView = async () => {
    if (!isSupabasePublicEnvironmentConfigured()) return;
    setPending(true);
    setError("");
    try {
      const client = getSupabaseBrowserClient();
      const { data, error: signedError } = await client.storage
        .from(REGISTRATION_DOCUMENT_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (signedError || !data) throw signedError ?? new Error("no data");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("Couldn't open the document. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <span className="flex flex-wrap items-center gap-3">
      <span className="text-charcoal">{filename}</span>
      <button
        type="button"
        onClick={() => void handleView()}
        disabled={pending}
        className="text-global-navy focus-visible:ring-focus text-sm font-semibold underline underline-offset-4 disabled:opacity-60"
      >
        {pending ? "Opening…" : "View"}
      </button>
      {error ? <span className="text-error text-sm">{error}</span> : null}
    </span>
  );
}
