export type InitiativeStatus =
  "available" | "pilot" | "in-development" | "planned" | "partner-discussions";

export interface NavigationEntry {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
  readonly children?: readonly NavigationEntry[];
}

export interface CallToAction {
  readonly label: string;
  readonly href: string;
  readonly variant?: "primary" | "secondary" | "text";
}

export interface SocialLink {
  readonly platform: string;
  readonly href: string;
  readonly accessibleLabel: string;
}

export interface InitiativeEntry {
  readonly slug: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly status: InitiativeStatus;
  readonly href: string;
  readonly imageKey: string;
}

interface ImageMetadataBase {
  readonly path: `/${string}`;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: `${number}/${number}`;
  readonly objectPosition: `${number}% ${number}%` | "center";
  readonly aboveFold: boolean;
  readonly available: boolean;
}

export type ImageMetadata = ImageMetadataBase &
  (
    | {
        readonly mobileAlternative: true;
        readonly mobilePath: `/${string}`;
        readonly mobileWidth: number;
        readonly mobileHeight: number;
        readonly mobileAspectRatio: `${number}/${number}`;
        readonly mobileObjectPosition: `${number}% ${number}%` | "center";
      }
    | {
        readonly mobileAlternative: false;
        readonly mobilePath?: never;
        readonly mobileWidth?: never;
        readonly mobileHeight?: never;
        readonly mobileAspectRatio?: never;
        readonly mobileObjectPosition?: never;
      }
  );

export interface RoadmapPhase {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly timeframe: string;
  readonly status: "current" | "future";
  readonly statusLabel: string;
  readonly summary: string;
  readonly purpose: string;
  readonly capabilities: readonly string[];
  readonly dependencies: readonly string[];
  readonly readinessGates: readonly string[];
  readonly deliberatelyExcluded: readonly string[];
  readonly linkedRoutes: readonly CallToAction[];
  readonly category:
    | "foundation"
    | "identity"
    | "community"
    | "services"
    | "mobile"
    | "expansion";
}
