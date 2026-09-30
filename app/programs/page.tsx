import Link from 'next/link'
import {
  CHARACTER_STANDARDS,
  CLUB,
  DIVISIONS,
  FEE_FACTS,
  TRYOUT_PATHWAY,
} from '@/lib/data'

export const metadata = {
  title: 'Programs | Spider Sports Club',
  description:
    'SSC program details: Girls and Boys U12, U14, and U16 divisions, training schedule, fees, tryout pathway, and character standards.',
}

export default function ProgramsPage() {
  return (
    <div className="bg-zinc-950">
      {/* Page hero */}
      <section className="border-b border-zinc-800 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.14),transparent_60%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
            Programs
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Train the SSC way
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
            Six divisions, one philosophy: {CLUB.trainingFrequency},{' '}
            {CLUB.sessionLength} sessions, and a dedicated coach for every team.
          </p>
        </div>
      </section>

      {/* Divisions */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Our divisions
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Every team is capped at {CLUB.maxPlayersPerTeam} players and led by
          its own dedicated coach — no one gets lost in the numbers.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIVISIONS.map((division) => (
            <div
              key={division}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-red-600"
            >
              <h3 className="text-xl font-bold text-white">{division}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-zinc-400">
                <li>Max {CLUB.maxPlayersPerTeam} players per team</li>
                <li>One dedicated coach per team</li>
                <li>
                  {CLUB.sessionLength} sessions, {CLUB.trainingFrequency.toLowerCase()}
                </li>
                <li>Games on {CLUB.matchDays.toLowerCase()}</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Training facts */}
      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Training & matches
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Twice a week',
                detail: `${CLUB.trainingFrequency} — consistency builds mastery.`,
              },
              {
                title: `${CLUB.sessionLength} sessions`,
                detail:
                  'Focused, high-intensity sessions designed around fundamentals and tactical intelligence.',
              },
              {
                title: `Games on ${CLUB.matchDays.toLowerCase()}`,
                detail:
                  'Weekend match days are where training meets competition — and character shows.',
              },
            ].map((fact) => (
              <div
                key={fact.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-8"
              >
                <h3 className="text-xl font-bold text-red-500">{fact.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {fact.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Fees & agreements
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Simple pricing, clear terms — no surprises.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEE_FACTS.map((fact) => (
            <li
              key={fact}
              className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-600" />
              <span className="text-zinc-200">{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tryout pathway */}
      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            The tryout pathway
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Every SSC journey starts with earning the badge.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TRYOUT_PATHWAY.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-8"
              >
                <span className="text-4xl font-extrabold text-red-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Character standards */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Character standards
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-400">
          What SSC coaches evaluate in every player, every session:
        </p>
        <ul className="mt-8 space-y-3">
          {CHARACTER_STANDARDS.map((standard) => (
            <li
              key={standard}
              className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-4"
            >
              <svg
                className="mt-1 h-5 w-5 shrink-0 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-zinc-200">{standard}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl border border-zinc-800 bg-red-600 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Ready to earn the badge?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-red-100">
            Registration starts with a tryout evaluation. Take the first step
            today.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-md bg-white px-8 py-3.5 text-base font-semibold text-red-700 transition-colors hover:bg-red-50"
          >
            Register Now
          </Link>
        </div>
      </section>
    </div>
  )
}
