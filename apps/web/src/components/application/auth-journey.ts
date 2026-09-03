export type AuthJourney = "general" | "member" | "organisation" | "sangam";

export interface AuthJourneyPresentation {
  readonly journey: AuthJourney;
  readonly portalLabel: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly supportingCopy: string;
  readonly accountLead: string;
  readonly successLead: string;
}

export function authJourneyPresentation(
  returnTarget: string | null,
  mode: "login" | "signup",
): AuthJourneyPresentation {
  const journey = journeyFromTarget(returnTarget);
  const action = mode === "login" ? "Sign in" : "Create your account";

  if (journey === "member") {
    return {
      journey,
      portalLabel: "Member journey",
      eyebrow: "Connect your membership",
      description: `${action} to connect with a Tamil Sangam or organisation you already belong to.`,
      supportingCopy:
        "Your selected membership journey will be waiting after account access is complete.",
      accountLead: "Continue connecting your membership after this step.",
      successLead:
        "Your account is ready. Continue to connect your membership.",
    };
  }
  if (journey === "sangam") {
    return {
      journey,
      portalLabel: "Tamil Sangam journey",
      eyebrow: "Tamil Sangam registration",
      description: `${action} to continue your Sangam's federation registration.`,
      supportingCopy:
        "Your Sangam registration path stays with you through account confirmation.",
      accountLead: "Your Sangam details come next.",
      successLead: "Your account is ready. Continue your Sangam registration.",
    };
  }
  if (journey === "organisation") {
    return {
      journey,
      portalLabel: "Organisation journey",
      eyebrow: "Organisation registration",
      description: `${action} to continue your organisation's federation registration.`,
      supportingCopy:
        "Your organisation registration path stays with you through account confirmation.",
      accountLead: "Your organisation details come next.",
      successLead:
        "Your account is ready. Continue your organisation registration.",
    };
  }
  return {
    journey,
    portalLabel: "Secure account access",
    eyebrow: "Secure account access",
    description:
      mode === "login"
        ? "Sign in to open your Tamil Ulagam workspace."
        : "Create one secure account for membership, Sangam and organisation journeys.",
    supportingCopy:
      "One account gives you access to every Tamil Ulagam workspace you are entitled to use.",
    accountLead: "Choose your journey after creating your account.",
    successLead: "Your account is ready. Choose how you want to take part.",
  };
}

function journeyFromTarget(returnTarget: string | null): AuthJourney {
  if (!returnTarget) return "general";
  if (
    returnTarget.startsWith("/join/member") ||
    returnTarget.startsWith("/workspace/member")
  ) {
    return "member";
  }
  if (
    returnTarget.startsWith("/join/sangam") ||
    returnTarget.startsWith("/workspace/sangam")
  ) {
    return "sangam";
  }
  if (
    returnTarget.startsWith("/join/organisation") ||
    returnTarget.startsWith("/register") ||
    returnTarget.startsWith("/workspace/organisation")
  ) {
    return "organisation";
  }
  return "general";
}
