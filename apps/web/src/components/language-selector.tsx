export function LanguageSelector() {
  return (
    <div
      aria-label="Language selection"
      className="inline-flex items-center rounded-full border border-current/20 px-3 py-1.5 text-sm"
    >
      <span aria-hidden="true" className="font-semibold">
        EN
      </span>
      <span aria-hidden="true" className="mx-2 opacity-40">
        /
      </span>
      <span className="font-tamil" lang="ta">
        தமிழ்
      </span>
      <span className="sr-only">
        Bilingual language selection will be available in a future release.
      </span>
    </div>
  );
}
