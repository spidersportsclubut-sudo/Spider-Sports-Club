/**
 * Spider PR — v1 guided FAQ bot configuration.
 *
 * SINGLE SOURCE OF TRUTH for the bot's display name, greeting, escalation
 * contact, and approved answers. The widget answers ONLY from FAQS below;
 * anything else is captured as a message for the club team, never invented.
 *
 * Guardrails (from the approved bot plan, 2026-10-27):
 * - Never promise roster spots, scholarships, discounts, placement, or
 *   special pricing.
 * - Pre-launch honesty: building-language only. Nothing here claims teams
 *   are running, a field is confirmed, or a date is set.
 * - Curriculum: general pillar description only, never session detail.
 * - No payments, no term agreements, no reply-time promises.
 */

export const BOT_NAME = 'Spider PR'

export const GREETING =
  "Hi! I'm Spider PR — I answer questions about Spider Sports Club. Ask me about programs, fees, tryouts, or training — or leave a message for the club team."

/** Escalation contact for captured messages. Club address only — never a personal address. */
export const ESCALATION_EMAIL = 'info@spidersportsclub.com'

export const NO_MATCH_MESSAGE =
  "I don't have that yet — I only answer from the club's approved information, and I won't guess. Leave your name, contact, and question below and the club team will get back to you."

export type Faq = {
  id: string
  /** Short label shown on the quick-question buttons. */
  label: string
  /** Keywords used for matching (lowercase, matched as substrings). */
  keywords: string[]
  answer: string
}

export const FAQS: Faq[] = [
  {
    id: 'ages-divisions',
    label: 'What ages can join?',
    keywords: ['age', 'division', 'u12', 'u14', 'u16', 'boy', 'girl', 'old'],
    answer:
      'Spider Sports Club has boys and girls divisions at U12, U14, and U16.',
  },
  {
    id: 'fees',
    label: 'How much does it cost?',
    keywords: ['cost', 'price', 'fee', 'pay', 'month', 'due', 'late'],
    answer:
      'Fees are $150 per month per player, due between the 1st and the 5th, with a $50 late fee. Season agreements run 6–12 months. Season payment details will be confirmed before the season starts.',
  },
  {
    id: 'training',
    label: 'How often is training?',
    keywords: ['often', 'practice', 'session', 'week', 'game'],
    answer: 'Three training sessions a week, with games on weekends.',
  },
  {
    id: 'tryouts',
    label: 'When are tryouts?',
    keywords: ['tryout', 'trial', 'join the team', 'announced', 'fee'],
    answer:
      "We're forming a team for the winter indoor season, and tryout dates, location, and fee will be announced soon. Leave your name and contact and we'll let you know as soon as they're set.",
  },
  {
    id: 'guarantee',
    label: 'Can you guarantee a roster spot?',
    keywords: ['guarantee', 'guaranteed', 'promise', 'certain'],
    answer:
      "No — roster spots are decided through tryouts and evaluation, so I can't guarantee a place. Leave your contact and we'll notify you when tryouts are announced.",
  },
  {
    id: 'evaluation',
    label: 'How are players evaluated?',
    keywords: ['evaluat', 'score', '15-point', '15 point', 'pillar', 'keep', 'spot'],
    answer:
      'Players are evaluated on a 15-point system across four pillars: Technical, Tactical, Physical, and Psychological. A score of 15 keeps a roster spot.',
  },
  {
    id: 'residency',
    label: 'Do players have to live in the city?',
    keywords: ['live', 'resident', 'school', 'non-resident', 'nonresident'],
    answer:
      'Roster priority goes to players who live or attend school in the team\u2019s city. Up to 4–5 non-resident players can join an 18-player roster, and the winter 2026–27 indoor team is open-roster.',
  },
  {
    id: 'locations',
    label: 'Where do you train and play?',
    keywords: [
      'where',
      'location',
      'field',
      'city',
      'cities',
      'herriman',
      'riverton',
      'daybreak',
      'draper',
      'sandy',
      'midvale',
      'south jordan',
      'west jordan',
      'bluffdale',
    ],
    answer:
      'We serve Herriman, Riverton, Daybreak, West Jordan, Bluffdale, Draper, Sandy, Midvale, and South Jordan. The training field for the winter team will be announced with the tryouts.',
  },
  {
    id: 'register',
    label: 'How do I register?',
    keywords: ['register', 'sign up', 'signup', 'enrol', 'enroll'],
    answer:
      'You can register your interest on our register page. Full season registration opens once the season setup is complete.',
  },
  {
    id: 'coaches',
    label: 'Who are the coaches?',
    keywords: ['coach'],
    answer:
      'Each team has one dedicated coach. Our coaches are hired through screening, interviews, and a 30-day onboarding program. Coach names will be announced before tryouts.',
  },
  {
    id: 'difference',
    label: 'What makes SSC different?',
    keywords: ['different', 'special', 'unique', 'why', 'philosophy', 'character'],
    answer:
      'We train the whole player — technique, brain, body, and mind — across four pillars every week, and we coach character first: Family, Teamwork, Ambition, Respect, Effort, Humility.',
  },
  {
    id: 'scholarships',
    label: 'Scholarships or discounts?',
    keywords: ['scholarship', 'discount', 'financial aid', 'free', 'cheaper'],
    answer: 'No scholarships or discounts to announce right now.',
  },
  {
    id: 'talk-to-person',
    label: 'Can I talk to a person?',
    keywords: ['person', 'human', 'someone', 'contact', 'call', 'email', 'talk', 'message'],
    answer:
      'Yes. Leave your name, contact, and question here and the club team will get back to you.',
  },
]

/** Quick-question buttons shown under the greeting (most common topics). */
export const QUICK_QUESTIONS: Faq[] = FAQS.filter((faq) =>
  [
    'ages-divisions',
    'fees',
    'training',
    'tryouts',
    'locations',
    'talk-to-person',
  ].includes(faq.id),
)
