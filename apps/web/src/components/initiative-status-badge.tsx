import type { InitiativeStatus } from "@tamil-ulagam/shared";
import { Badge } from "@tamil-ulagam/ui";

const statusPresentation = {
  available: { label: "Available", tone: "success" },
  pilot: { label: "Pilot", tone: "warning" },
  "in-development": { label: "In development", tone: "warning" },
  planned: { label: "Planned", tone: "maroon" },
  "partner-discussions": {
    label: "Partner discussions",
    tone: "neutral",
  },
} as const;

export interface InitiativeStatusBadgeProps {
  readonly status: InitiativeStatus;
}

export function InitiativeStatusBadge({ status }: InitiativeStatusBadgeProps) {
  const presentation = statusPresentation[status];

  return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
}
