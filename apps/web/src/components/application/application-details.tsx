import type { OrganisationApplication } from "@tamil-ulagam/shared";
import type { ReactNode } from "react";

import {
  getCategoryLabel,
  getRepresentativeRoleLabel,
  registrationStatusPresentation,
} from "@/content/enrollment";

interface DetailItem {
  readonly label: string;
  readonly value: ReactNode;
}

export function DetailGroup({
  action,
  title,
  items,
}: {
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
  readonly title: string;
  readonly items: readonly DetailItem[];
}) {
  return (
    <section className="border-global-navy/12 rounded-card border bg-white p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-global-navy text-xl font-bold">{title}</h2>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="text-global-navy focus-visible:ring-focus hover:text-heritage-maroon decoration-heritage-gold min-h-10 px-2 text-sm font-semibold underline decoration-2 underline-offset-4"
          >
            {action.label}
          </button>
        ) : null}
      </div>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-global-navy/8 min-w-0 border-t pt-4"
          >
            <dt className="text-slate text-xs font-bold tracking-[0.1em] uppercase">
              {item.label}
            </dt>
            <dd
              className={`mt-1.5 leading-6 break-words ${item.value ? "text-charcoal" : "text-slate italic"}`}
            >
              {item.value || "Not provided (optional)"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ApplicationDetails({
  application,
  onEdit,
  includeTimeline = false,
}: {
  readonly application: OrganisationApplication;
  readonly onEdit?: (step: 1 | 2 | 3) => void;
  readonly includeTimeline?: boolean;
}) {
  const { organisation, registration } = application;
  const profile = registration.categoryProfile;
  return (
    <div className="grid gap-5">
      <DetailGroup
        title="Organisation Details"
        action={
          onEdit ? { label: "Edit", onClick: () => onEdit(1) } : undefined
        }
        items={[
          { label: "Organisation name", value: organisation.name },
          { label: "Category", value: getCategoryLabel(organisation.category) },
          {
            label: "Location",
            value: [
              organisation.city,
              organisation.region,
              organisation.country,
            ]
              .filter(Boolean)
              .join(", "),
          },
          { label: "Description", value: organisation.description },
          ...(organisation.yearEstablished
            ? [
                {
                  label: "Year established",
                  value: organisation.yearEstablished,
                },
              ]
            : []),
        ]}
      />
      <DetailGroup
        title="Contact Information"
        action={
          onEdit ? { label: "Edit", onClick: () => onEdit(2) } : undefined
        }
        items={[
          { label: "Official email", value: organisation.officialEmail },
          { label: "Official phone", value: organisation.officialPhone },
          ...(organisation.website
            ? [{ label: "Website", value: organisation.website }]
            : []),
        ]}
      />
      <DetailGroup
        title="Registration Information"
        action={
          onEdit ? { label: "Edit", onClick: () => onEdit(3) } : undefined
        }
        items={[
          {
            label: "Organisation status",
            value:
              organisation.registrationStatus === "registered"
                ? "Registered organisation"
                : "Unregistered / informal organisation",
          },
          ...(organisation.registrationNumber
            ? [
                {
                  label: "Registration number",
                  value: organisation.registrationNumber,
                },
              ]
            : []),
          ...(organisation.registrationAuthority
            ? [
                {
                  label: "Registration authority",
                  value: organisation.registrationAuthority,
                },
              ]
            : []),
          ...(organisation.registrationCountry
            ? [
                {
                  label: "Registration country",
                  value: organisation.registrationCountry,
                },
              ]
            : []),
        ]}
      />
      {profile ? (
        <DetailGroup
          title="Category Information"
          action={
            onEdit ? { label: "Edit", onClick: () => onEdit(3) } : undefined
          }
          items={categoryItems(profile)}
        />
      ) : null}
      <DetailGroup
        title="Representative"
        action={
          onEdit ? { label: "Edit", onClick: () => onEdit(2) } : undefined
        }
        items={[
          { label: "Full name", value: registration.representative.fullName },
          { label: "Email", value: registration.representative.email },
          { label: "Phone", value: registration.representative.phone },
          {
            label: "Role",
            value: getRepresentativeRoleLabel(
              registration.representative.relationship,
            ),
          },
          ...(registration.representative.designation
            ? [
                {
                  label: "Designation",
                  value: registration.representative.designation,
                },
              ]
            : []),
        ]}
      />
      <DetailGroup
        title="Declaration"
        action={
          onEdit ? { label: "Edit", onClick: () => onEdit(3) } : undefined
        }
        items={[
          {
            label: "Authorised representative, accurate information",
            value:
              registration.representative.authorisedDeclaration &&
              registration.representative.accuracyDeclaration
                ? "Confirmed"
                : "Not confirmed",
          },
        ]}
      />
      {includeTimeline ? (
        <>
          <DetailGroup
            title="Application Timeline / Status"
            items={[
              {
                label: "Status",
                value:
                  registrationStatusPresentation[registration.status].label,
              },
              { label: "Created", value: formatDate(registration.createdAt) },
              {
                label: "Submitted",
                value: formatDate(registration.submittedAt),
              },
              { label: "Reviewed", value: formatDate(registration.reviewedAt) },
              { label: "Reviewed by", value: registration.reviewedBy },
              { label: "Feedback", value: registration.adminFeedback },
            ]}
          />
          {application.reviewHistory?.length ? (
            <section className="border-global-navy/12 rounded-card border bg-white p-5 sm:p-7">
              <h2 className="text-global-navy text-xl font-bold">
                Review history
              </h2>
              <ol className="border-global-navy/10 mt-5 grid gap-0 border-l pl-5">
                {application.reviewHistory.map((event) => (
                  <li
                    key={event.id}
                    className="border-global-navy/10 relative border-b py-4 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-heritage-gold absolute top-5 -left-[1.45rem] size-2 rounded-full first:top-1"
                    />
                    <p className="text-global-navy font-semibold">
                      {registrationStatusPresentation[event.newStatus].label}
                    </p>
                    <p className="text-slate mt-1 text-sm">
                      {formatDate(event.createdAt)}
                    </p>
                    {event.feedback ? (
                      <p className="text-charcoal mt-2 leading-6">
                        {event.feedback}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

// Lean V2 intake only collects one or two classifying fields per
// category; everything else here is optional profile-enrichment data
// that may or may not exist yet. To avoid a wall of "Not provided
// (optional)" rows, enrichment items are only included when they
// actually have a value — the core intake field(s) always show.
function categoryItems(
  profile: NonNullable<
    OrganisationApplication["registration"]["categoryProfile"]
  >,
): DetailItem[] {
  const withValue = (items: readonly DetailItem[]) =>
    items.filter((item) => Boolean(item.value));

  switch (profile.category) {
    case "tamil_community":
      return [
        { label: "Subtype", value: profile.subtype },
        ...withValue([
          {
            label: "Primary activities",
            value: profile.primaryActivities.join(", "),
          },
          { label: "Membership size", value: profile.membershipSize },
          { label: "Area served", value: profile.geographicAreaServed },
          { label: "Chairperson", value: profile.chairpersonName },
          { label: "Secretary", value: profile.secretaryName },
          { label: "Languages", value: profile.languages },
        ]),
      ];
    case "education":
      return [
        { label: "Institution type", value: profile.institutionType },
        ...withValue([
          { label: "Governance", value: profile.governanceType },
          {
            label: "Tamil programmes",
            value:
              profile.tamilProgrammesOffered === ""
                ? ""
                : profile.tamilProgrammesOffered === "yes"
                  ? "Yes"
                  : "No",
          },
          {
            label: "Programme description",
            value: profile.tamilProgrammesDescription,
          },
          {
            label: "Recognition authority",
            value: profile.accreditationAuthority,
          },
          { label: "Study areas", value: profile.studyAreas.join(", ") },
        ]),
      ];
    case "healthcare":
      return [
        { label: "Facility type", value: profile.facilityType },
        ...withValue([
          { label: "Ownership", value: profile.ownershipType },
          {
            label: "Systems of healthcare",
            value: profile.systemsOfMedicine.join(", "),
          },
          { label: "Main services", value: profile.mainServices },
          {
            label: "Licensed",
            value:
              profile.licensed === ""
                ? ""
                : profile.licensed === "yes"
                  ? "Yes"
                  : "No",
          },
          { label: "Licence number", value: profile.licenceNumber },
          { label: "Licensing authority", value: profile.licensingAuthority },
        ]),
      ];
    case "business":
      return [
        { label: "Business type", value: profile.businessType },
        { label: "Industry", value: profile.industry },
        ...withValue([
          { label: "Products / services", value: profile.productsServices },
          { label: "Employee size", value: profile.employeeSize },
          { label: "Operating countries", value: profile.operatingCountries },
        ]),
      ];
    case "nonprofit":
      return [
        { label: "Subtype", value: profile.subtype },
        ...withValue([
          { label: "Primary areas", value: profile.primaryAreas.join(", ") },
          { label: "Beneficiary regions", value: profile.beneficiaryRegions },
          { label: "Organisation size", value: profile.organisationSize },
        ]),
      ];
    case "other":
      return [
        { label: "Organisation type", value: profile.organisationType },
        { label: "Primary purpose", value: profile.primaryPurpose },
      ];
  }
}

export function formatDate(value: string): string {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
