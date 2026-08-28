/**
 * Copy and structural data for the real V3 Organisation registration
 * journey (Phase D2) — mirrors content/sangam.ts's shape for the sibling
 * journey. Kept as data, matching every other content/*.ts module.
 */

export const organisationStages = [
  "Your Organisation",
  "Contact & Representative",
  "Standing & Confirmation",
  "Review & submit",
] as const;

export const organisationLoggedOutContent = {
  eyebrow: "ORGANISATIONS",
  title: "Register an Organisation",
  description:
    "Give your organisation an official presence within Tamil Ulagam — a global federation spanning education, healthcare, business, nonprofit and community organisations.",
  steps: [
    {
      title: "Tell us about your organisation",
      description:
        "Its category, name, where it's based, and a short description.",
    },
    {
      title: "Contact & representative",
      description:
        "An official organisation contact and the representative registering it.",
    },
    {
      title: "Federation review",
      description:
        "Our federation team reviews the submission before it goes live.",
    },
    {
      title: "Your organisation's presence",
      description:
        "Once verified, your organisation gets its own workspace and can welcome members.",
    },
  ],
} as const;

export const organisationStageIdentityContent = {
  title: "Your Organisation",
  description:
    "The essentials — how your organisation is known, where it's based, and what it does.",
  sangamGuidance:
    "Registering a Tamil Sangam? Use the dedicated Tamil Sangam registration experience — it's built for how Sangams actually operate.",
  sangamGuidanceCta: "Go to Tamil Sangam registration",
} as const;

export const organisationStageContactContent = {
  title: "Contact & representative",
  description:
    "How Tamil Ulagam and reviewers can reach your organisation, and who is registering it.",
  officialEmailHelp:
    "Use your organisation's official inbox, not your personal email.",
} as const;

export const organisationStageStandingContent = {
  title: "Standing & confirmation",
  description:
    "A little about legal standing, plus one question specific to your organisation type.",
  informalNotice:
    "Legitimate small and informal organisations are welcome — this does not block submission. Formal registration is a trust signal for reviewers, never a requirement.",
  declaration:
    "I confirm that I am authorised to represent this organisation and that the information provided is accurate.",
} as const;

export const organisationReviewContent = {
  eyebrow: "REVIEW & SUBMIT",
  title: "Review your registration",
  description:
    "Confirm each section before submitting your organisation for federation review.",
  whatHappensNext: [
    {
      title: "1. Submit",
      description: "Your registration enters federation review.",
    },
    {
      title: "2. Track",
      description: "Its status is always visible from your workspace.",
    },
    {
      title: "3. Respond",
      description: "Update details if our federation team requests changes.",
    },
  ],
  submitCta: "Submit registration",
  confirmDialogTitle: "Submit this registration?",
  confirmDialogBody:
    "After submission, editing pauses while our federation team reviews it. They can request specific changes.",
} as const;

export const organisationSuccessContent = {
  title: "Registration submitted",
  body: "Our federation team will review your submission. You can track its status from your Organisation Workspace at any time.",
  workspaceCta: "Go to Organisation Workspace",
  browseCta: "Back to Join Tamil Ulagam",
} as const;
