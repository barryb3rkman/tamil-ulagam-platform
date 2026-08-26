/**
 * Copy and structural data for the real Tamil Sangam registration
 * journey (Phase D1). Kept as data, matching every other content/*.ts
 * module, so copy can be revised without touching component logic.
 */

export const sangamStages = [
  "Your Sangam",
  "Leadership & Reach",
  "Standing & Confirmation",
  "Review & submit",
] as const;

export const sangamLoggedOutContent = {
  eyebrow: "TAMIL SANGAMS",
  title: "Register a Tamil Sangam",
  description:
    "Give your Sangam its own presence within Tamil Ulagam — a global federation of Tamil organisations and community networks.",
  steps: [
    {
      title: "Tell us about your Sangam",
      description:
        "Its name, where it's based, and a short description of the community it serves.",
    },
    {
      title: "Leadership & reach",
      description:
        "An official Sangam contact and the representative registering it — plus whether it's already part of a wider Tamil network.",
    },
    {
      title: "Federation review",
      description:
        "Our federation team reviews the submission. Informal, not-yet-registered Sangams are welcome — formal registration is a trust signal, not a requirement.",
    },
    {
      title: "Your Sangam's presence",
      description:
        "Once verified, your Sangam appears in Member Registration search, and members can request to join.",
    },
  ],
} as const;

export const sangamStageOneContent = {
  title: "Your Sangam",
  description:
    "The essentials — how your Sangam is known, where it's based, and who it serves.",
  descriptionPrompt:
    "Tell us briefly who your Sangam serves and the community it represents.",
} as const;

export const sangamStageTwoContent = {
  title: "Leadership & reach",
  description:
    "How Tamil Ulagam and reviewers can reach your Sangam, and who is registering it.",
  officialEmailHelp:
    "A Sangam-owned inbox (not a personal address) — this is separate from your own account email.",
  networkQuestion:
    "Is your Sangam already connected to a regional, national or international Tamil network or federation?",
  networkNameHelp: "Optional — the network or federation's name.",
} as const;

export const sangamNetworkAffiliationOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unspecified", label: "Prefer not to say" },
] as const;

export const sangamStageThreeContent = {
  title: "Standing & confirmation",
  description:
    "A little about legal standing. Informal, not-yet-registered Sangams are welcome here.",
  informalNotice:
    "Many Tamil Sangams operate informally, without formal legal registration — that's completely welcome. Formal registration is a trust signal for reviewers, never a requirement to register.",
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

/**
 * Sangam-appropriate representative role labels, mapped onto the same
 * internal representative_relationship enum the Organisation journey
 * already uses — no new database enum values for label differences
 * alone (D1 brief section 7). "President / Chair" intentionally maps to
 * the same "president" value the Organisation journey's "Leadership"
 * grouping already uses.
 */
export const sangamRepresentativeRoleOptions = [
  { value: "president", label: "President / Chair" },
  { value: "secretary", label: "Secretary / Administrator" },
  { value: "authorised_representative", label: "Authorised Representative" },
  { value: "other", label: "Other" },
] as const;
