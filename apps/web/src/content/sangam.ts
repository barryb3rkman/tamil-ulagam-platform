/**
 * Copy and structural data for the real Tamil Sangam registration
 * journey. Kept as data, matching every other content/*.ts module, so
 * copy can be revised without touching component logic.
 *
 * Phase H3 (Tamil Sangam registration V2) rewrote this file's stage
 * copy for the new four-stage structure (About your Sangam /
 * Registration details / Leadership & contact / Review & submit),
 * replacing the old three-intake-stage copy that asked for a generic
 * "Representative" and an "Official Sangam email" — both retired from
 * the Sangam UX (H3 brief sections 3/4).
 */

export const sangamStages = [
  "About your Sangam",
  "Registration details",
  "Leadership & contact",
  "Review & submit",
] as const;

export const sangamLoggedOutContent = {
  eyebrow: "TAMIL SANGAMS",
  title: "Register a Tamil Sangam",
  description:
    "Give your Sangam its own presence within Tamil Ulagam — a global federation of Tamil organisations and community networks.",
  steps: [
    {
      title: "About your Sangam",
      description:
        "Its name, when it began, how many members it has, and where it's based.",
    },
    {
      title: "Registration details",
      description:
        "Whether it's formally registered, and any wider Tamil network it's part of.",
    },
    {
      title: "Leadership & contact",
      description:
        "A single point of contact, the Sangam's President, and its digital presence.",
    },
    {
      title: "Federation review",
      description:
        "Our federation team reviews the submission. Informal, not-yet-registered Sangams are welcome — formal registration is a trust signal, not a requirement.",
    },
  ],
} as const;

export const sangamStageOneContent = {
  title: "About your Sangam",
  description:
    "The essentials — how your Sangam is known, when it began, and where it's based.",
} as const;

export const sangamStageTwoContent = {
  title: "Registration details",
  description:
    "A little about legal standing. Informal, not-yet-registered Sangams are welcome here.",
  informalNotice:
    "Many Tamil Sangams operate informally, without formal legal registration — that's completely welcome. Formal registration is a trust signal for reviewers, never a requirement to register.",
  networkQuestion:
    "Is your Sangam already connected to a regional, national or international Tamil network or federation?",
  networkNameHelp: "The network or federation's name.",
} as const;

export const sangamNetworkAffiliationOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unspecified", label: "Prefer not to say" },
] as const;

export const sangamRegisteredOptions = [
  { value: "registered", label: "Yes" },
  { value: "informal", label: "No" },
] as const;

export const sangamStageThreeContent = {
  title: "Leadership & contact",
  description:
    "Who Tamil Ulagam and reviewers can reach, and your Sangam's presence online.",
  spocTitle: "Single Point of Contact (SPOC)",
  spocDescription: "The main contact for day-to-day communication.",
  presidentTitle: "President",
  presidentDescription:
    "The Sangam's president — this can be the same person as the SPOC.",
  sameAsSpoc: "Same as SPOC",
  digitalPresenceTitle: "Digital presence",
  declaration:
    "I confirm that I am authorised to represent this Tamil Sangam and that the information provided is accurate.",
} as const;

export const sangamReviewContent = {
  eyebrow: "REVIEW & SUBMIT",
  title: "Review your Sangam's registration",
  description:
    "Confirm each section before submitting your Sangam for federation review.",
  whatHappensNext: [
    {
      title: "1. Submit",
      description: "Your Sangam's registration enters federation review.",
    },
    {
      title: "2. Track",
      description: "Its status is always visible from your Sangam workspace.",
    },
    {
      title: "3. Respond",
      description: "Update details if our federation team requests changes.",
    },
  ],
  submitCta: "Submit registration",
  confirmDialogTitle: "Submit this Sangam's registration?",
  confirmDialogBody:
    "After submission, editing pauses while our federation team reviews it. They can request specific changes.",
} as const;

export const sangamSuccessContent = {
  title: "Registration submitted",
  body: "Our federation team will review your submission. You can track its status from your Sangam workspace at any time.",
  workspaceCta: "Go to Sangam workspace",
  browseCta: "Back to Join Tamil Ulagam",
} as const;

export const sangamWorkspaceContent = {
  eyebrow: "TAMIL SANGAM",
} as const;
