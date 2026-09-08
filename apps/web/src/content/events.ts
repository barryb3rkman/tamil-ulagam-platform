import type { ImageKey } from "@/config/images";

interface SignatureEvent {
  /** Stable identifier. Matches the column an events table would use, so
   *  moving this content into the database later is a swap, not a rewrite. */
  readonly slug: string;
  readonly month: string;
  readonly title: string;
  readonly tamilTitle: string;
  readonly summary: string;
  readonly imageKey: ImageKey;
}

interface TamilMonth {
  readonly tamil: string;
  readonly english: string;
  readonly span: string;
}

interface ChapterFormat {
  readonly title: string;
  readonly description: string;
}

export const eventsContent = {
  hero: {
    eyebrow: "GLOBAL EVENTS",
    title: "One Tamil world, celebrated together.",
    description:
      "Six occasions carried by every Tamil Ulagam chapter, from the harvest festival to an awards night.",
    imageKey: "eventHeritageMonth",
    primaryCallToAction: {
      label: "Join Tamil Ulagam",
      href: "/join",
    },
    secondaryCallToAction: {
      label: "Find a chapter",
      href: "/chapters",
    },
  },

  /** The federation calendar, as set out in the source presentation. Months
   *  rather than dates: each chapter fixes its own day within the month. */
  signature: [
    {
      slug: "tamil-ulagam-day",
      month: "January",
      title: "Tamil Ulagam Day",
      tamilTitle: "தமிழ் உலகம் நாள்",
      summary: "Every chapter marks the same day, in its own city.",
      imageKey: "eventTamilUlagamDay",
    },
    {
      slug: "pongal",
      month: "January",
      title: "Pongal",
      tamilTitle: "பொங்கல்",
      summary: "The harvest festival — kolam, cane, and the first rice.",
      imageKey: "eventPongal",
    },
    {
      slug: "tamil-new-year",
      month: "April",
      title: "Tamil New Year",
      tamilTitle: "தமிழ்ப் புத்தாண்டு",
      summary: "Chithirai one, kept by the diaspora wherever it lands.",
      imageKey: "eventTamilNewYear",
    },
    {
      slug: "global-tamil-summit",
      month: "June",
      title: "Global Tamil Summit",
      tamilTitle: "உலகத் தமிழ் உச்சி மாநாடு",
      summary: "Community heads, diplomats and institutions in one room.",
      imageKey: "eventGlobalSummit",
    },
    {
      slug: "tamil-heritage-month",
      month: "September",
      title: "Tamil Heritage Month",
      tamilTitle: "தமிழ் பாரம்பரிய மாதம்",
      summary: "A month of arts, literature and language across chapters.",
      imageKey: "eventHeritageMonth",
    },
    {
      slug: "awards-night",
      month: "December",
      title: "Tamil Ulagam Awards Night",
      tamilTitle: "தமிழ் உலகம் விருது இரவு",
      summary: "Tamil excellence honoured across six fields.",
      imageKey: "eventAwardsNight",
    },
  ] as const satisfies readonly SignatureEvent[],

  /** The Tamil calendar. Real months, in order, with the Gregorian span each
   *  falls across — the ribbon that runs beneath the calendar. */
  months: [
    { tamil: "சித்திரை", english: "Chithirai", span: "Apr — May" },
    { tamil: "வைகாசி", english: "Vaikasi", span: "May — Jun" },
    { tamil: "ஆனி", english: "Aani", span: "Jun — Jul" },
    { tamil: "ஆடி", english: "Aadi", span: "Jul — Aug" },
    { tamil: "ஆவணி", english: "Aavani", span: "Aug — Sep" },
    { tamil: "புரட்டாசி", english: "Purattasi", span: "Sep — Oct" },
    { tamil: "ஐப்பசி", english: "Aippasi", span: "Oct — Nov" },
    { tamil: "கார்த்திகை", english: "Karthigai", span: "Nov — Dec" },
    { tamil: "மார்கழி", english: "Margazhi", span: "Dec — Jan" },
    { tamil: "தை", english: "Thai", span: "Jan — Feb" },
    { tamil: "மாசி", english: "Maasi", span: "Feb — Mar" },
    { tamil: "பங்குனி", english: "Panguni", span: "Mar — Apr" },
  ] as const satisfies readonly TamilMonth[],

  formats: {
    title: "What a chapter runs",
    description:
      "The federation sets the calendar. Each chapter decides the shape.",
    items: [
      {
        title: "Cultural",
        description: "Music, dance, folk arts and film, staged locally.",
      },
      {
        title: "Learning",
        description: "Language classes, reading circles, heritage sessions.",
      },
      {
        title: "Community",
        description: "Family gatherings, sport, and welfare drives.",
      },
      {
        title: "Professional",
        description: "Business meets, mentoring, and student networks.",
      },
    ] as const satisfies readonly ChapterFormat[],
  },

  finalCallToAction: {
    eyebrow: "TAKE PART",
    title: "Every chapter needs people who show up.",
    description:
      "Join Tamil Ulagam, or bring your organisation into the federation.",
    primaryCallToAction: {
      label: "Join Tamil Ulagam",
      href: "/join",
    },
    secondaryCallToAction: {
      label: "Register an organisation",
      href: "/join/organisation",
    },
  },
} as const;
