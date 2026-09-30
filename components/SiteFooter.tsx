import Link from 'next/link'
import { CITIES, CLUB } from '@/lib/data'

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-extrabold text-white">
              SSC
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              {CLUB.name}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
            A youth soccer club in {CLUB.homeCity} building players of
            character — {CLUB.tagline}
          </p>
          <p className="mt-4 text-sm text-zinc-400">
            Contact:{' '}
            <span className="text-zinc-200">
              info@spidersportsclub.com
            </span>
          </p>
        </div>

        <nav aria-label="Quick links">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: '/', label: 'Home' },
              { href: '/programs', label: 'Programs' },
              { href: '/register', label: 'Register' },
              { href: '/login', label: 'Team Login' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Cities">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
            Where We Play
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/cities/${city.slug}`}
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-zinc-500 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} {CLUB.name}. All rights reserved.</span>
          <span>Character first. The beautiful game stays pure.</span>
        </div>
      </div>
    </footer>
  )
}
