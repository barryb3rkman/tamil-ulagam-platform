"use client";

import { Alert, Container, StageProgress } from "@tamil-ulagam/ui";
import type {
  EligibleOrganisation,
  MemberProfile,
  Membership,
} from "@tamil-ulagam/shared";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { focusFirstInvalidField } from "@/components/application/form-fields";
import { usePlatform } from "@/features/enrollment/platform-provider";
import {
  isValid,
  type ValidationErrors,
} from "@/features/enrollment/validation";
import { useMembershipService } from "@/features/membership/use-membership-service";
import { validateMemberProfile } from "@/features/member/member-validation";

import {
  AffiliationTypeStage,
  type AffiliationType,
} from "./affiliation-type-stage";
import {
  MemberConfirmRequest,
  type ConnectionAnswer,
} from "./member-confirm-request";
import { MemberDirectory, MemberDirectorySkeleton } from "./member-directory";
import { MemberLoggedOut } from "./member-logged-out";
import { MemberProfileStage } from "./member-profile-stage";
import { MemberRequestSuccess } from "./member-request-success";

type DataState = "loading" | "loaded" | "error";
type Stage = "profile" | "type" | "directory" | "confirm" | "success";

const emptyAnswer: ConnectionAnswer = {
  connectionType: "",
  connectionContext: "",
  connectionContextExtra: "",
};

const memberStages = [
  "Your details",
  "Affiliation type",
  "Find your organisation",
  "Confirm",
  "Submitted",
] as const;

const memberStageNumber: Record<Stage, number> = {
  profile: 1,
  type: 2,
  directory: 3,
  confirm: 4,
  success: 5,
};

export function MemberRegistration() {
  const { isHydrated, currentUser } = usePlatform();
  const membershipService = useMembershipService();

  const [dataState, setDataState] = useState<DataState>("loading");
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [stage, setStage] = useState<Stage>("profile");
  const [profile, setProfile] = useState<MemberProfile>({
    fullName: "",
    phone: "",
    country: "",
    region: "",
    city: "",
  });
  const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
  const [profileFormError, setProfileFormError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [affiliationType, setAffiliationType] =
    useState<AffiliationType | null>(null);
  const [organisations, setOrganisations] = useState<
    readonly EligibleOrganisation[]
  >([]);
  const [myMemberships, setMyMemberships] = useState<readonly Membership[]>([]);
  const [selected, setSelected] = useState<EligibleOrganisation | null>(null);
  const [answer, setAnswer] = useState<ConnectionAnswer>(emptyAnswer);
  const [justSubmitted, setJustSubmitted] =
    useState<EligibleOrganisation | null>(null);

  useEffect(() => {
    if (!isHydrated || !currentUser || !membershipService) return;
    let cancelled = false;

    Promise.all([
      membershipService.getMyProfile(),
      membershipService.listEligibleOrganisations(),
      membershipService.listMyMemberships(),
    ])
      .then(([myProfile, eligibleOrganisations, memberships]) => {
        if (cancelled) return;
        setProfile(myProfile);
        setOrganisations(eligibleOrganisations);
        setMyMemberships(memberships);
        setLoadError("");
        setDataState("loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "The directory could not be loaded. Please try again.",
        );
        setDataState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, currentUser, membershipService, reloadKey]);

  const retry = useCallback(() => {
    setDataState("loading");
    setReloadKey((value) => value + 1);
  }, []);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateMemberProfile(profile);
    setProfileErrors(nextErrors);
    if (!isValid(nextErrors)) {
      focusFirstInvalidField(event.currentTarget);
      return;
    }
    if (!membershipService) return;
    setProfileSaving(true);
    setProfileFormError("");
    try {
      const saved = await membershipService.updateMyProfile(profile);
      setProfile(saved);
      setStage("type");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      setProfileFormError(
        error instanceof Error
          ? error.message
          : "Your details could not be saved.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleConfirm = useCallback(async () => {
    if (!selected || !membershipService) return;
    const membership = await membershipService.requestMembership(
      selected.id,
      undefined,
      {
        connectionType: answer.connectionType,
        connectionContext: answer.connectionContext,
        connectionContextExtra: answer.connectionContextExtra,
      },
    );
    setMyMemberships((previous) => [
      membership,
      ...previous.filter((item) => item.id !== membership.id),
    ]);
    setJustSubmitted(selected);
    setStage("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selected, membershipService, answer]);

  const addAnother = () => {
    setSelected(null);
    setAnswer(emptyAnswer);
    setJustSubmitted(null);
    setAffiliationType(null);
    setStage("type");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isHydrated) {
    return (
      <Container className="py-16 sm:py-20">
        <MemberDirectorySkeleton />
      </Container>
    );
  }

  if (!currentUser) {
    return <MemberLoggedOut />;
  }

  if (!membershipService) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="info" title="Member Registration is not available here">
          Member Registration is not configured for this deployment. Set
          NEXT_PUBLIC_ENROLLMENT_BACKEND=supabase with both public Supabase
          values and rebuild the site.
        </Alert>
      </Container>
    );
  }

  if (dataState === "loading") {
    return (
      <Container className="py-16 sm:py-20">
        <MemberDirectorySkeleton />
      </Container>
    );
  }

  if (dataState === "error") {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="error" role="alert" title="The directory could not load">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={retry}
            className="text-error focus-visible:ring-focus rounded-button mt-3 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Try again
          </button>
        </Alert>
      </Container>
    );
  }

  const myMembershipsByOrganisation = new Map<string, Membership>();
  for (const membership of myMemberships) {
    if (!myMembershipsByOrganisation.has(membership.organisationId)) {
      myMembershipsByOrganisation.set(membership.organisationId, membership);
    }
  }

  return (
    <Container className="py-10 sm:py-14 lg:py-16">
      <div className="mb-7 max-w-2xl">
        <p className="text-heritage-maroon text-eyebrow-sm">
          Member affiliation
        </p>
        <h1 className="text-global-navy mt-3 text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
          Connect your membership
        </h1>
        <p className="text-slate mt-3 leading-7">
          Connect your account to a Tamil Sangam or organisation you already
          belong to. The organisation confirms the affiliation after you submit
          it.
        </p>
      </div>
      <StageProgress
        stages={[...memberStages]}
        currentStage={memberStageNumber[stage]}
        label="Member affiliation progress"
      />
      {stage === "success" && justSubmitted ? (
        <MemberRequestSuccess
          organisation={justSubmitted}
          onAddAnother={addAnother}
        />
      ) : stage === "confirm" && selected ? (
        <MemberConfirmRequest
          organisation={selected}
          profile={profile}
          answer={answer}
          onAnswerChange={setAnswer}
          onBack={() => setStage("directory")}
          onConfirm={handleConfirm}
        />
      ) : stage === "directory" && affiliationType ? (
        <MemberDirectory
          kind={affiliationType}
          organisations={organisations}
          myMembershipsByOrganisation={myMembershipsByOrganisation}
          onBack={() => setStage("type")}
          onSelect={(organisation) => {
            setSelected(organisation);
            setAnswer(emptyAnswer);
            setStage("confirm");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : stage === "type" ? (
        <AffiliationTypeStage
          onSelect={(type) => {
            setAffiliationType(type);
            setStage("directory");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onBack={() => setStage("profile")}
        />
      ) : (
        <MemberProfileStage
          profile={profile}
          errors={profileErrors}
          formError={profileFormError}
          pending={profileSaving}
          onChange={setProfile}
          onSubmit={(event) => void submitProfile(event)}
        />
      )}
    </Container>
  );
}
