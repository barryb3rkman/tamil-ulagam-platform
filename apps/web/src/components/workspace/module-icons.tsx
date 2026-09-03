import type { SVGProps } from "react";

import type { WorkspaceModule } from "@/content/workspace-modules";

type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "fill">;

function Icon({
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      className="size-[1.15rem] shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

function EventsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="14" height="13" rx="1.5" strokeWidth="1.5" />
      <path d="M3 8h14" strokeWidth="1.5" />
      <path d="M7 2.5v3M13 2.5v3" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

function OpportunitiesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="7" width="14" height="9" rx="1.5" strokeWidth="1.5" />
      <path
        d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h3A1.5 1.5 0 0 1 13 5.5V7"
        strokeWidth="1.5"
      />
      <path d="M3 11.5h14" strokeWidth="1.5" />
    </Icon>
  );
}

function ServicesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 6h6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11.5" cy="6" r="2" strokeWidth="1.5" />
      <path d="M15.5 6H17" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 14h2" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="14" r="2" strokeWidth="1.5" />
      <path d="M11 14h6" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

function CommunityIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="7.5" cy="10" r="4.75" strokeWidth="1.5" />
      <circle cx="12.5" cy="10" r="4.75" strokeWidth="1.5" />
    </Icon>
  );
}

function CultureIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="15" r="2" strokeWidth="1.5" />
      <circle cx="13" cy="12.5" r="2" strokeWidth="1.5" />
      <path
        d="M8 15V4.5L15 3v9.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function EducationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M1.7 7.5 10 4l8.3 3.5L10 11 1.7 7.5Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5.7 9.2v3.3c0 1.1 1.9 2 4.3 2s4.3-.9 4.3-2V9.2"
        strokeWidth="1.5"
      />
      <path d="M18 7.5v4.7" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

function BusinessIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3" width="8" height="14" strokeWidth="1.5" />
      <rect x="12.5" y="8" width="4" height="9" strokeWidth="1.5" />
      <path
        d="M6 6h1.2M9.3 6h1.2M6 9h1.2M9.3 9h1.2M6 12h1.2M9.3 12h1.2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function HealthcareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="10" r="7.3" strokeWidth="1.5" />
      <path
        d="M10 6.3v7.4M6.3 10h7.4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function ResearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8.5" cy="8.5" r="5" strokeWidth="1.5" />
      <path d="M12.2 12.2 17 17" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

function HeritageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M2 8 10 3.2 18 8M3 17h14M4.3 17V8.7M7.6 17V8.7M10 17V8.7M12.4 17V8.7M15.7 17V8.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function PartnershipsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect
        x="1.8"
        y="8.5"
        width="8"
        height="5"
        rx="2.5"
        strokeWidth="1.5"
        transform="rotate(-42 5.8 11)"
      />
      <rect
        x="10.2"
        y="6.5"
        width="8"
        height="5"
        rx="2.5"
        strokeWidth="1.5"
        transform="rotate(-42 14.2 9)"
      />
    </Icon>
  );
}

const iconById: Record<string, (props: IconProps) => React.JSX.Element> = {
  events: EventsIcon,
  opportunities: OpportunitiesIcon,
  services: ServicesIcon,
  "community-programmes": CommunityIcon,
  "cultural-programmes": CultureIcon,
  education: EducationIcon,
  business: BusinessIcon,
  healthcare: HealthcareIcon,
  research: ResearchIcon,
  "heritage-arts": HeritageIcon,
  partnerships: PartnershipsIcon,
};

export function ModuleIcon({
  moduleId,
  ...props
}: IconProps & { readonly moduleId: WorkspaceModule["id"] }) {
  const Component = iconById[moduleId];
  if (!Component) return null;
  return <Component {...props} />;
}
