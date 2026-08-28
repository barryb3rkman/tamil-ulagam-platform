"use client";

import type {
  DuplicateOrganisationSignals,
  OrganisationApplication,
  TamilCommunityProfile,
} from "@tamil-ulagam/shared";
import { Alert, Button, Dialog, StageProgress } from "@tamil-ulagam/ui";
import { useEffect, useState, type ReactNode } from "react";

import { getOrganisationDisplayLabel } from "@/content/enrollment";
import { sangamReviewContent, sangamStages } from "@/content/sangam";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useSangamRegistrationService } from "@/features/sangam/use-sangam-registration-service";

import { RegistrationDocumentViewButton } from "./registration-document-view-button";

/**
 * The Sangam journey's own Review & Submit screen — rewritten for Phase
 * H3 as one dense composed surface (H3 brief section 21), replacing the
 * six-stacked-DetailGroup-cards pattern H2's visual QA flagged as a
 * MEDIUM defect on the shared ApplicationDetails composition. This is a
 * Sangam-only rewrite: ApplicationDetails/DetailGroup themselves are
 * untouched, so the Organisation review screen and Admin's own
 * application-review rendering (both of which still use
 * ApplicationDetails) keep their exact current appearance (H3 brief
 * section 28).
 */
export function SangamReview({
  application,
  onEdit,
  onSubmitted,
}: {
  readonly application: OrganisationApplication;
  readonly onEdit: (stage: 1 | 2 | 3) => void;
  readonly onSubmitted: (updated: OrganisationApplication) => void;
}) {
  const { checkDuplicateSignals } = usePlatform();
  const service = useSangamRegistrationService();
  const [duplicateSignals, setDuplicateSignals] =
    useState<DuplicateOrganisationSignals | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void checkDuplicateSignals({
      name: application.organisation.name,
      officialEmail: application.organisation.officialEmail,
      registrationNumber: application.organisation.registrationNumber,
      excludeOrganisationId: application.organisation.id,
    })
      .then((signals) => {
        if (active) setDuplicateSignals(signals);
      })
      .catch(() => {
        // Best-effort only; review can proceed without it.
      });
    return () => {
      active = false;
    };
  }, [application, checkDuplicateSignals]);

  const submit = async () => {
    if (!service) return;
    setPending(true);
    setError("");
    try {
      const updated = await service.submit(application.registration.id);
      setConfirmOpen(false);
      onSubmitted(updated);
    } catch (submissionError: unknown) {
      setConfirmOpen(false);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Your Tamil Sangam registration could not be submitted. Please try again.",
      );
    } finally {
      setPending(false);
    }
  };

  const profile =
    application.registration.categoryProfile?.category === "tamil_community"
      ? application.registration.categoryProfile
      : null;
  const representative = application.registration.representative;
  const organisation = application.organisation;
  const isRegistered = organisation.registrationStatus === "registered";

  return (
    <section className="gradient-warm-welcome">
      <div className="mx-auto max-w-[74rem] px-5 py-10 sm:px-7 sm:py-14 lg:px-10">
        <div className="mb-7 max-w-3xl">
          <p className="text-heritage-maroon text-xs font-bold tracking-[0.18em] uppercase">
            {sangamReviewContent.eyebrow}
          </p>
          <h1 className="text-global-navy mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            {sangamReviewContent.title}
          </h1>
          <p className="text-slate mt-3 leading-7">
            {sangamReviewContent.description}
          </p>
        </div>
        <StageProgress stages={[...sangamStages]} currentStage={4} />

        {error ? (
          <Alert tone="error" role="alert" className="mb-5">
            {error}
          </Alert>
        ) : null}
        {duplicateSignals &&
        (duplicateSignals.nameMatch ||
          duplicateSignals.emailMatch ||
          duplicateSignals.registrationNumberMatch) ? (
          <Alert tone="warning" title="Possible duplicate" className="mb-6">
            {duplicateSignals.nameMatch
              ? "Similar organisation name already exists. "
              : ""}
            {duplicateSignals.registrationNumberMatch
              ? "Registration number matches another organisation. "
              : ""}
            You can still submit — a reviewer will confirm before verifying.
          </Alert>
        ) : null}

        <div className="border-global-navy/12 rounded-card border bg-white p-5 sm:p-7 lg:p-8">
          <ReviewSection title="Sangam" onEdit={() => onEdit(1)}>
            <ReviewRow label="Name" value={organisation.name} />
            <ReviewRow
              label="Category"
              value={getOrganisationDisplayLabel(
                organisation.category,
                profile,
              )}
            />
            <ReviewRow
              label="Year of commencement"
              value={organisation.yearEstablished}
            />
            <ReviewRow
              label="Approximate members"
              value={profile?.memberCount}
            />
            <ReviewRow
              label="Location"
              value={[
                organisation.city,
                organisation.region,
                organisation.country,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          </ReviewSection>

          <ReviewSection title="Registration" onEdit={() => onEdit(2)}>
            <ReviewRow
              label="Status"
              value={isRegistered ? "Registered" : "Not formally registered"}
            />
            {isRegistered ? (
              <>
                <ReviewRow
                  label="Registration number"
                  value={organisation.registrationNumber}
                />
                <div>
                  <dt className="text-slate text-xs font-bold tracking-[0.1em] uppercase">
                    Registration certificate
                  </dt>
                  <dd className="mt-1 leading-6">
                    {profile?.registrationDocumentPath ? (
                      <RegistrationDocumentViewButton
                        path={profile.registrationDocumentPath}
                        filename={
                          profile.registrationDocumentFilename ||
                          "Registration document"
                        }
                      />
                    ) : (
                      <span className="text-slate italic">Not provided</span>
                    )}
                  </dd>
                </div>
              </>
            ) : null}
          </ReviewSection>

          <ReviewSection title="Leadership & contact" onEdit={() => onEdit(3)}>
            <ReviewRow
              label="SPOC — full name"
              value={representative.fullName}
            />
            <ReviewRow label="SPOC — email" value={representative.email} />
            <ReviewRow label="SPOC — phone" value={representative.phone} />
            <ReviewRow
              label="President — full name"
              value={profile?.presidentFullName}
            />
            <ReviewRow
              label="President — email"
              value={profile?.presidentEmail}
            />
            <ReviewRow
              label="President — phone"
              value={profile?.presidentPhone}
            />
          </ReviewSection>

          <ReviewSection title="Digital presence" onEdit={() => onEdit(3)}>
            <ReviewRow label="Website" value={organisation.website} />
            <div className="sm:col-span-2">
              <dt className="text-slate text-xs font-bold tracking-[0.1em] uppercase">
                Social media links
              </dt>
              <dd className="mt-1 leading-6">
                {profile?.socialLinks.length ? (
                  <ul className="grid gap-1">
                    {profile.socialLinks.map((link) => (
                      <li key={link}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-global-navy focus-visible:ring-focus underline underline-offset-4"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate italic">Not provided</span>
                )}
              </dd>
            </div>
          </ReviewSection>

          <ReviewSection title="Network affiliation" onEdit={() => onEdit(2)}>
            <ReviewRow
              label="Connected to a wider network"
              value={networkAffiliationLabel(profile)}
            />
          </ReviewSection>

          <ReviewSection title="Declaration" onEdit={() => onEdit(3)}>
            <ReviewRow
              label="Authorised representative, accurate information"
              value={
                representative.authorisedDeclaration &&
                representative.accuracyDeclaration
                  ? "Confirmed"
                  : "Not confirmed"
              }
            />
          </ReviewSection>
        </div>

        <div className="bg-deep-navy rounded-card mt-7 grid gap-6 p-6 text-white sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-heritage-gold text-xs font-bold tracking-[0.14em] uppercase">
              What happens next
            </p>
            <ol className="mt-4 grid gap-3 text-sm text-white/75 sm:grid-cols-3">
              {sangamReviewContent.whatHappensNext.map((item) => (
                <li key={item.title}>
                  <strong className="block text-white">{item.title}</strong>
                  {item.description}
                </li>
              ))}
            </ol>
          </div>
          <Button
            size="large"
            onClick={() => setConfirmOpen(true)}
            disabled={!service}
            className="bg-heritage-gold text-deep-navy hover:bg-white"
          >
            {sangamReviewContent.submitCta}
          </Button>
        </div>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={sangamReviewContent.confirmDialogTitle}
        >
          <p className="text-slate leading-7">
            {sangamReviewContent.confirmDialogBody}
          </p>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Continue reviewing
            </Button>
            <Button
              onClick={() => void submit()}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? "Submitting…" : "Confirm submission"}
            </Button>
          </div>
        </Dialog>
      </div>
    </section>
  );
}

function networkAffiliationLabel(
  profile: TamilCommunityProfile | null,
): string {
  if (!profile || profile.networkAffiliated === "") return "";
  if (profile.networkAffiliated === "no") return "No";
  return profile.networkName ? `Yes — ${profile.networkName}` : "Yes";
}

function ReviewSection({
  children,
  onEdit,
  title,
}: {
  readonly title: string;
  readonly onEdit: () => void;
  readonly children: ReactNode;
}) {
  return (
    <div className="border-global-navy/10 grid gap-4 border-t pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-global-navy text-base font-bold">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-global-navy focus-visible:ring-focus hover:text-heritage-maroon decoration-heritage-gold min-h-8 text-sm font-semibold underline decoration-2 underline-offset-4"
        >
          Edit
        </button>
      </div>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | undefined;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-slate text-xs font-bold tracking-[0.1em] uppercase">
        {label}
      </dt>
      <dd
        className={`mt-1 leading-6 break-words ${value ? "text-charcoal" : "text-slate italic"}`}
      >
        {value || "Not provided"}
      </dd>
    </div>
  );
}
