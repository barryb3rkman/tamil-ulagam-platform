import type { ImageKey } from "@/config/images";

interface NewsStream {
  /** Stable identifier, shaped like the column a news table would carry. */
  readonly slug: string;
  readonly title: string;
  readonly tamilTitle: string;
  readonly description: string;
  readonly imageKey: ImageKey;
  readonly topics: readonly string[];
}

interface ClassicalLine {
  readonly tamil: string;
  readonly english: string;
  readonly source: string;
}

interface NewsPrinciple {
  readonly title: string;
  readonly description: string;
}

export const newsContent = {
  hero: {
    eyebrow: "NEWSROOM",
    title: "What the Tamil world is doing, in Tamil and English.",
    description:
      "Federation notices, chapter reporting, and the language and heritage desk.",
    imageKey: "newsroom",
    primaryCallToAction: {
      label: "Join Tamil Ulagam",
      href: "/join",
    },
    secondaryCallToAction: {
      label: "Contact the newsroom",
      href: "/contact",
    },
  },

  /** Grouped by what a piece IS, not when it ran — the same choice a Sangam
   *  newsroom makes, and the one that keeps a page useful for longer. */
  streams: [
    {
      slug: "federation",
      title: "Federation notices",
      tamilTitle: "கூட்டமைப்பு அறிவிப்புகள்",
      description:
        "Decisions, appointments and standards, published as they are made.",
      imageKey: "newsGlobalNetwork",
      topics: [
        "Chapter recognition",
        "Governance",
        "Standards",
        "Partnerships",
      ],
    },
    {
      slug: "chapters",
      title: "From the chapters",
      tamilTitle: "கிளைச் செய்திகள்",
      description:
        "What happened in Toronto, Kuala Lumpur, Jaffna and everywhere else.",
      imageKey: "newsCommunityStory",
      topics: ["Events", "Community", "Youth", "Welfare"],
    },
    {
      slug: "language",
      title: "Language & heritage",
      tamilTitle: "மொழியும் பாரம்பரியமும்",
      description:
        "Literature, inscriptions, archives, and the work of keeping Tamil.",
      imageKey: "newsroom",
      topics: ["Literature", "Archives", "Research", "Education"],
    },
  ] as const satisfies readonly NewsStream[],

  /** Classical Tamil, out of copyright by roughly two thousand years. The
   *  first is the line the source presentation closes on. */
  classicalLines: [
    {
      tamil: "யாதும் ஊரே யாவரும் கேளிர்",
      english: "Every place is my home; everyone is my kin.",
      source: "Kaniyan Pungundranar · Purananuru 192",
    },
    {
      tamil: "கற்க கசடறக் கற்பவை கற்றபின்\nநிற்க அதற்குத் தக",
      english: "Learn thoroughly what is worth learning, then live by it.",
      source: "Thiruvalluvar · Thirukkural 391",
    },
    {
      tamil: "எல்லாரும் ஓர்குலம் எல்லாரும் ஓரினம்",
      english: "All are one clan; all are one kind.",
      source: "Bharathidasan",
    },
    {
      tamil: "தமிழுக்கு அமுதென்று பேர்",
      english: "Tamil is another name for nectar.",
      source: "Bharathidasan",
    },
  ] as const satisfies readonly ClassicalLine[],

  principles: {
    title: "How we publish",
    description: "Four rules the newsroom holds to.",
    items: [
      {
        title: "Both languages",
        description: "Tamil first where it matters, English alongside.",
      },
      {
        title: "Named sources",
        description: "Chapters and officers are named, not paraphrased.",
      },
      {
        title: "Corrections stand",
        description: "Errors are corrected in place and marked.",
      },
      {
        title: "Readable by all",
        description: "Plain language, real headings, proper contrast.",
      },
    ] as const satisfies readonly NewsPrinciple[],
  },

  finalCallToAction: {
    eyebrow: "CONTRIBUTE",
    title: "Chapters write most of what appears here.",
    description:
      "Bring your organisation into the federation and your reporting joins the newsroom.",
    primaryCallToAction: {
      label: "Register an organisation",
      href: "/join/organisation",
    },
    secondaryCallToAction: {
      label: "Contact the newsroom",
      href: "/contact",
    },
  },
} as const;
