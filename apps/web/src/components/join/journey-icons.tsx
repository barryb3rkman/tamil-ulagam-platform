import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function OrganisationMark(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 16 20 7l14 9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 16v15M14 16v15M20 16v15M26 16v15M32 16v15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M5 31h30"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SangamMark(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <circle
        cx="20"
        cy="20"
        r="3.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <path
          key={angle}
          d="M20 20 L20 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      <circle
        cx="20"
        cy="20"
        r="13"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  );
}

export function MemberMark(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <circle cx="14" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="27" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="30"
        cy="27"
        r="2.25"
        strokeDasharray="2 2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16.5 16.5 23.5 15.5M15.5 17.5 19 24.5M25 16.5 21 24.5M22.5 26.5 27.5 26.7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PartnerMark(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <circle cx="16" cy="20" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="26"
        cy="20"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.7"
      />
    </svg>
  );
}
