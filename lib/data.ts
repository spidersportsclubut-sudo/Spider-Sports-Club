/**
 * Real club facts for Spider Sports Club (Salt Lake City, Utah).
 * Used across public pages, registration copy, and demo fallbacks.
 */

export const CLUB = {
  name: 'Spider Sports Club',
  shortName: 'SSC',
  tagline: 'Where character comes first and the beautiful game stays pure.',
  homeCity: 'Salt Lake City, Utah',
  foundedBy: 'Isaac Tsatsu Acolatse',
  founderAka: 'SpiderVybz',
  monthlyFee: 150,
  lateFee: 50,
  paymentWindow: 'the 1st and the 5th of each month',
  maxPlayersPerTeam: 18,
  trainingFrequency: 'Twice a week, with an optional 3rd session',
  sessionLength: '90 minutes',
  matchDays: 'Weekends',
} as const

export const DNA_PILLARS = [
  'Family',
  'Teamwork',
  'Ambition',
  'Respect',
  'Effort',
  'Humility',
] as const

export const DIVISIONS = [
  'Girls U12',
  'Girls U14',
  'Girls U16',
  'Boys U12',
  'Boys U14',
  'Boys U16',
] as const

export interface CityInfo {
  name: string
  slug: string
  blurb: string
}

export const CITIES: CityInfo[] = [
  {
    name: 'Salt Lake City',
    slug: 'salt-lake-city',
    blurb:
      'Our home turf. SSC trains and plays across Salt Lake City, where the club was founded and where our first teams took the pitch.',
  },
  {
    name: 'Herriman',
    slug: 'herriman',
    blurb:
      'One of the fastest-growing soccer communities on the west side, Herriman families bring energy and numbers to every SSC squad.',
  },
  {
    name: 'Riverton',
    slug: 'riverton',
    blurb:
      'Riverton players train with the same character-first philosophy that defines every SSC team, from first touch to final whistle.',
  },
  {
    name: 'Daybreak',
    slug: 'daybreak',
    blurb:
      'Daybreak is a natural fit for SSC: a young, active community where youth soccer is part of everyday life.',
  },
  {
    name: 'West Jordan',
    slug: 'west-jordan',
    blurb:
      'West Jordan athletes get the full SSC pathway — twice-weekly training, weekend matches, and coaches who mentor on and off the field.',
  },
  {
    name: 'Bluffdale',
    slug: 'bluffdale',
    blurb:
      'Bluffdale families choose SSC for development done right: fundamentals, tactical intelligence, and respect for the game.',
  },
  {
    name: 'Draper',
    slug: 'draper',
    blurb:
      'From the south end of the valley, Draper players join SSC teams that compete hard and carry themselves with humility.',
  },
  {
    name: 'Sandy',
    slug: 'sandy',
    blurb:
      'Sandy is deep soccer country. SSC gives its players a purist’s education in the game — technique first, always.',
  },
  {
    name: 'Midvale',
    slug: 'midvale',
    blurb:
      'Midvale players are at the heart of the valley and the heart of SSC: hardworking, coachable, and proud to wear the badge.',
  },
  {
    name: 'South Jordan',
    slug: 'south-jordan',
    blurb:
      'South Jordan rounds out our valley footprint — SSC teams built on family, effort, and love for the beautiful game.',
  },
]

export const FOUNDER_BIO = `Founded by Isaac Tsatsu Acolatse — known in the game as SpiderVybz — Spider Sports Club is built on a revolutionary belief: that identity, legacy, and club ownership should be democratized and fan-owned. With over 40 years of experience as a player and mentor, beginning on the historic pitches of West Africa, Coach Acolatse is a soccer purist devoted to protecting the integrity and artistry of the beautiful game. Throughout his career he has guided countless players and organizations to unlock their full potential through masterclass fundamentals — and now he is scaling that authentic coaching philosophy through SSC.`

export const PHILOSOPHY = [
  'True athletic excellence is built on a foundation of character. At SSC we coach with empathy, dignity, integrity, and grace — developing players as people first and athletes second.',
  'We are champions of soccer purism: preserving the integrity, artistry, and passion of the beautiful game while firmly resisting the commercialization of youth sports.',
  'Our goal is to nurture fundamental skills, tactical intelligence, and a traditional style of play — shaping the next generation of soccer purists.',
]

/** What SSC coaches evaluate in every player. */
export const CHARACTER_STANDARDS = [
  'Being coachable and following instructions',
  'Showing up consistently for training and practice',
  'Maintaining high personal standards and field focus',
  'Displaying responsibility and game consistency',
  'Showing deep respect for teammates and the club',
]

export const TRYOUT_PATHWAY = [
  {
    title: 'Evaluation contract',
    detail:
      'Every new player starts on a 3–6 month evaluation contract with Spider Sports Club.',
  },
  {
    title: 'Earn your spot',
    detail:
      'After the evaluation period you receive an overall score from 1–15 across performance, skill, and decision-making. You need 15 to keep your roster spot.',
  },
  {
    title: 'Player contract',
    detail:
      'Players who meet the club’s core standards sign an SSC player contract of 1–3 years.',
  },
]

export const FEE_FACTS = [
  `$${CLUB.monthlyFee} per month, per player`,
  `Due between ${CLUB.paymentWindow} to avoid a $${CLUB.lateFee} late fee`,
  '6–12 month non-refundable agreements',
  'Early termination penalty equals 2 months of club fees',
]

/** Demo teams matching the SQL seed data — used as a fallback when Supabase is not configured. */
export interface DemoTeam {
  id: string
  name: string
  division: string
  city: string
}

export const DEMO_TEAMS: DemoTeam[] = [
  {
    id: 'demo-team-boys-u14-slc',
    name: 'SSC Boys U14 – Salt Lake City',
    division: 'Boys U14',
    city: 'Salt Lake City',
  },
  {
    id: 'demo-team-girls-u12-herriman',
    name: 'SSC Girls U12 – Herriman',
    division: 'Girls U12',
    city: 'Herriman',
  },
  {
    id: 'demo-team-boys-u16-west-jordan',
    name: 'SSC Boys U16 – West Jordan',
    division: 'Boys U16',
    city: 'West Jordan',
  },
]
