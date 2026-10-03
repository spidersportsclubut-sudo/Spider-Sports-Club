import Link from 'next/link'
import { CITIES, CLUB } from '@/lib/data'

export const metadata = {
  title: 'Communities We Serve | Spider Sports Club',
  description:
    'Spider Sports Club serves youth soccer families across the Salt Lake Valley — find your community.',
}

export default function CitiesIndexPage() {
  return (
    <div className="bg-zinc-950">
      <section className="border-b border-zinc-800 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.14),transparent_60%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
            Communities
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Find SSC in your neighborhood
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            {CLUB.name} serves families across the Salt Lake Valley. Pick your
            community to see local programs, training, and fees.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-red-600"
            >
              <h2 className="text-xl font-bold text-white group-hover:text-red-500">
                {city.name}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">{city.blurb}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-red-500">
                View programs →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
