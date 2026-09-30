import Link from 'next/link'
import {
  CITIES,
  CLUB,
  DEMO_TEAMS,
  DNA_PILLARS,
  FEE_FACTS,
  FOUNDER_BIO,
  PHILOSOPHY,
  DIVISIONS,
} from '@/lib/data'
import type { Team } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function getTeams(): Promise<
  Pick<Team, 'id' | 'name' | 'division' | 'city'>[]
> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, division, city')
      .order('name')
    if (error || !data) throw error ?? new Error('No teams returned')
    return data
  } catch {
    return DEMO_TEAMS
  }
}

function Section({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 ${className}`}
    >
      {children}
    </section>
  )
}

function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string
  title: string
  sub?: string
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
        {kicker}
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-3 text-lg text-zinc-400">{sub}</p>}
    </div>
  )
}

export default async function Home() {
  const teams = await getTeams()

  return (
    <div className="bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.18),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-xl font-extrabold text-white">
            SSC
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            {CLUB.name}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-300 sm:text-2xl">
            {CLUB.tagline}
          </p>
          <p className="mt-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
            Youth Soccer · {CLUB.homeCity}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/programs"
              className="w-full rounded-md bg-red-600 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto"
            >
              Explore Programs
            </Link>
            <Link
              href="/register"
              className="w-full rounded-md border border-zinc-700 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900 sm:w-auto"
            >
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* DNA pillars */}
      <Section>
        <SectionHeading
          kicker="Our DNA"
          title="What every SSC player is built on"
          sub="Six pillars shape everything we do — on the pitch and off it."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {DNA_PILLARS.map((pillar) => (
            <div
              key={pillar}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center transition-colors hover:border-red-600"
            >
              <p className="text-lg font-bold text-white">{pillar}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Philosophy */}
      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <Section>
          <SectionHeading
            kicker="Philosophy"
            title="Soccer purism, character-first coaching"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {PHILOSOPHY.map((paragraph, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-8"
              >
                <span className="text-4xl font-extrabold text-red-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-4 leading-relaxed text-zinc-300">{paragraph}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* Founder */}
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-3xl font-extrabold text-white">
                  IA
                </div>
                <p className="mt-4 text-lg font-bold text-white">
                  {CLUB.foundedBy}
                </p>
                <p className="text-sm text-red-500">“{CLUB.founderAka}”</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <SectionHeading kicker="Founder" title="Meet Coach SpiderVybz" />
            <p className="-mt-4 leading-relaxed text-zinc-300">{FOUNDER_BIO}</p>
          </div>
        </div>
      </Section>

      {/* Programs overview */}
      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <Section>
          <SectionHeading
            kicker="Programs"
            title="Divisions for every young player"
            sub={`Girls and Boys teams at U12, U14, and U16 — up to ${CLUB.maxPlayersPerTeam} players per team, each with a dedicated coach.`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIVISIONS.map((division) => (
              <div
                key={division}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-red-600"
              >
                <h3 className="text-xl font-bold text-white">{division}</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Max {CLUB.maxPlayersPerTeam} players · Dedicated coach ·{' '}
                  {CLUB.trainingFrequency.toLowerCase()} ({CLUB.sessionLength}{' '}
                  sessions) · Matches on {CLUB.matchDays.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/programs"
              className="inline-block rounded-md bg-red-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700"
            >
              Full Program Details
            </Link>
          </div>
        </Section>
      </section>

      {/* Our teams */}
      <Section>
        <SectionHeading
          kicker="Our Teams"
          title="SSC teams on the pitch"
          sub="Squads currently representing the club across the valley."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <h3 className="text-lg font-bold text-white">{team.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">
                {team.division} · {team.city}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Cities */}
      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <Section>
          <SectionHeading
            kicker="Communities"
            title="Across the Salt Lake Valley"
            sub="Find SSC soccer near you — click your city to learn more."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center transition-colors hover:border-red-600"
              >
                <p className="font-semibold text-white">{city.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-red-500">
                  View →
                </p>
              </Link>
            ))}
          </div>
        </Section>
      </section>

      {/* Fees snapshot */}
      <Section>
        <SectionHeading
          kicker="Fees"
          title="Simple, transparent pricing"
        />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 sm:p-10">
          <p className="text-5xl font-extrabold text-white">
            ${CLUB.monthlyFee}
            <span className="text-xl font-medium text-zinc-400">
              /month per player
            </span>
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEE_FACTS.map((fact) => (
              <li key={fact} className="flex items-start gap-3 text-zinc-300">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-600" />
                <span className="text-sm">{fact}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block rounded-md bg-red-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700"
            >
              Start Registration
            </Link>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="border-t border-zinc-800 bg-red-600">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to wear the badge?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-red-100">
            Tryouts are the first step on the SSC pathway. Join a club where
            character comes first.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-md bg-white px-8 py-3.5 text-base font-semibold text-red-700 transition-colors hover:bg-red-50 sm:w-auto"
            >
              Register Now
            </Link>
            <Link
              href="/programs"
              className="w-full rounded-md border border-red-400 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto"
            >
              Explore Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
