export function BrandMark({
  className = "size-10",
  orbit = false,
  title,
}: {
  readonly className?: string;
  readonly orbit?: boolean;
  readonly title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
    >
      <defs>
        <linearGradient id="tu-mark-gold" x1="12%" y1="4%" x2="88%" y2="96%">
          <stop offset="0%" stopColor="var(--tu-gold-mid)" />
          <stop offset="26%" stopColor="var(--tu-gold-light)" />
          <stop offset="44%" stopColor="var(--tu-gold-highlight)" />
          <stop offset="62%" stopColor="var(--tu-color-lux-gold)" />
          <stop offset="100%" stopColor="var(--tu-gold-shade)" />
        </linearGradient>
        <linearGradient id="tu-mark-core" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="var(--tu-gold-pale)" />
          <stop offset="50%" stopColor="var(--tu-color-heritage-gold)" />
          <stop offset="100%" stopColor="var(--tu-gold-deep)" />
        </linearGradient>
      </defs>

      {orbit ? (
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="url(#tu-mark-gold)"
          strokeWidth="1"
          strokeOpacity="0.55"
          strokeDasharray="3 9"
          strokeLinecap="round"
          className="tu-orbit"
          style={{ transformOrigin: "50% 50%" }}
        />
      ) : null}

      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="url(#tu-mark-gold)"
        strokeWidth="7"
      />
      <circle
        cx="50"
        cy="50"
        r="22"
        fill="none"
        stroke="url(#tu-mark-gold)"
        strokeWidth="6"
      />
      <circle cx="50" cy="50" r="9.5" fill="url(#tu-mark-core)" />
    </svg>
  );
}
