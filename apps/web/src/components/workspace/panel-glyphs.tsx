function Glyph({ children }: { readonly children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      className="size-[1.15rem]"
    >
      {children}
    </svg>
  );
}

export function StatusGlyph() {
  return (
    <Glyph>
      <path
        d="M10 2.5 16.5 5v5c0 3.4-2.6 6.2-6.5 7.5C6.1 16.2 3.5 13.4 3.5 10V5L10 2.5Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.4 10.1 9.2 12l3.6-3.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Glyph>
  );
}

export function PeopleGlyph() {
  return (
    <Glyph>
      <circle cx="7" cy="6.5" r="2.5" strokeWidth="1.5" />
      <circle cx="14" cy="8" r="2" strokeWidth="1.5" />
      <path
        d="M2.8 16c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 12.2c2.7-.5 4.5.8 5 3.3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function ContactGlyph() {
  return (
    <Glyph>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" strokeWidth="1.5" />
      <path
        d="m3.2 5.6 6.8 5 6.8-5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Glyph>
  );
}

export function LinkGlyph() {
  return (
    <Glyph>
      <circle cx="7" cy="10" r="3.4" strokeWidth="1.5" />
      <circle cx="13.4" cy="10" r="3.4" strokeWidth="1.5" />
    </Glyph>
  );
}
