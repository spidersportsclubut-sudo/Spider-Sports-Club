import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CITIES, CLUB, DIVISIONS, FEE_FACTS } from '@/lib/data'

export function generateStaticParams() {
  return CITIES.map((city) => ({ slug: city.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const city = CITIES.find((c) => c.slug === slug)
  if (!city) return {}
  return {
    title: `Youth Soccer in ${city.name} | Spider Sports Club`,
    description: `Spider Sports Club youth soccer in ${city.name}, Utah — ${city.blurb}`,
  }
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const city = CITIES.find((c) => c.slug === slug)
  if (!city) notFound()

  return (
    <div className="bg-zinc-950">
      {/* Hero */}
      <section className="border-b border-zinc-800 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.14),transparent_60%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
            SSC in your community
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Youth Soccer in {city.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
            {city.blurb}
          </p>
        </div>
      </section>

      {/* Programs in this city */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Programs in {city.name}
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-400">
          All six SSC divisions are open to {city.name} players — max{' '}
          {CLUB.maxPlayersPerTeam} players per team, each with a dedicated
          coach.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIVISIONS.map((division) => (
            <div
              key={division}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-red-600"
            >
              <h3 className="text-xl font-bold text-white">{division}</h3>
              <p className="mt-2 text-sm text-zinc-400">
                {city.name} · Max {CLUB.maxPlayersPerTeam} players · Dedicated
                coach
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Training & fees */}
      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Training
            </h2>
            <ul className="mt-4 space-y-3 text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-600" />
                <span>{CLUB.trainingFrequency}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-600" />
                <span>{CLUB.sessionLength} sessions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-600" />
                <span>Games on {CLUB.matchDays.toLowerCase()}</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Fees
            </h2>
            <ul className="mt-4 space-y-3 text-zinc-300">
              {FEE_FACTS.map((fact) => (
                <li key={fact} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-600" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-2xl border border-zinc-800 bg-red-600 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Play for SSC in {city.name}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-red-100">
            Character first. The beautiful game stays pure. Start your
            registration or explore the full program lineup.
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
              View Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
