import { StatusBadge, Surface } from "@tamil-ulagam/ui";
import {
  isTamilSangam,
  type EligibleOrganisation,
  type Membership,
} from "@tamil-ulagam/shared";

import { OrganisationMark, SangamMark } from "@/components/join/journey-icons";

import {
  organisationKindLabel,
  organisationLocationLabel,
} from "./organisation-presentation";

const relationshipPresentation: Record<
  Membership["status"],
  {
    readonly label: string;
    readonly tone: "neutral" | "success" | "warning" | "maroon";
  }
> = {
  pending: { label: "Pending confirmation", tone: "warning" },
  approved: { label: "Active", tone: "success" },
  rejected: { label: "Not confirmed", tone: "neutral" },
  revoked: { label: "Previously affiliated", tone: "neutral" },
};

export function OrganisationDiscoveryCard({
  organisation,
  existingMembership,
  onSelect,
}: {
  readonly organisation: EligibleOrganisation;
  readonly existingMembership?: Membership;
  readonly onSelect: () => void;
}) {
  const isSangam = isTamilSangam(organisation);
  const Icon = isSangam ? SangamMark : OrganisationMark;
  const relationship = existingMembership
    ? relationshipPresentation[existingMembership.status]
    : undefined;
  const canRequest =
    !existingMembership ||
    existingMembership.status === "rejected" ||
    existingMembership.status === "revoked";

  return (
    <Surface
      level="card"
      density="comfortable"
      className="motion-card border-global-navy/10 flex h-full flex-col"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={
            isSangam
              ? "bg-teal-depth/12 text-teal-depth grid size-11 shrink-0 place-items-center rounded-full"
              : "bg-heritage-gold/12 text-heritage-gold grid size-11 shrink-0 place-items-center rounded-full"
          }
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-heritage-maroon text-xs font-bold tracking-[0.1em] uppercase">
            {organisationKindLabel(organisation)}
          </p>
          <h3 className="text-global-navy mt-1 truncate text-lg font-bold">
            {organisation.name}
          </h3>
        </div>
      </div>

      <p className="text-slate mt-3 text-sm">
        {organisationLocationLabel(organisation) || "Location not specified"}
      </p>

      <div className="mt-3">
        <StatusBadge label="Verified" tone="success" />
      </div>

      <div className="mt-5 flex-1" />

      {relationship ? (
        <div className="flex items-center justify-between gap-3">
          <StatusBadge label={relationship.label} tone={relationship.tone} />
          {canRequest ? (
            <button
              type="button"
              onClick={onSelect}
              className="text-global-navy hover:text-heritage-maroon focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
            >
              Submit again
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 w-full items-center justify-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
        >
          Select
        </button>
      )}
    </Surface>
  );
}
