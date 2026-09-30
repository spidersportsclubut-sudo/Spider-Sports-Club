import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  getCurrentUserId,
  getMyTeams,
  getProfile,
  getSupabase,
} from './data'
import { SetupNotice } from '@/components/dashboard/SetupNotice'
import { SignOutButton } from '@/components/dashboard/SignOutButton'
import { CLUB } from '@/lib/data'

export const dynamic = 'force-dynamic'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabase()
  if (!supabase) {
    return (
      <Shell>
        <SetupNotice />
      </Shell>
    )
  }

  const userId = await getCurrentUserId(supabase)
  if (!userId) redirect('/login')

  const profile = await getProfile(supabase, userId)
  if (!profile) {
    return (
      <Shell>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
          <h2 className="text-xl font-bold text-zinc-100">
            Profile not set up yet
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Ask your coach to set up your profile before using the team
            dashboard.
          </p>
          <div className="mx-auto mt-6 max-w-xs">
            <SignOutButton />
          </div>
        </div>
      </Shell>
    )
  }

  const teams = await getMyTeams(supabase, userId, profile)
  const displayName = profile.full_name ?? 'Team member'
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const navLink =
    'block rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Mobile top bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-sm font-black text-white">
              S
            </span>
            <span className="text-sm font-bold">
              {CLUB.shortName} <span className="text-red-600">Dashboard</span>
            </span>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-200">
            {initials}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3">
          <Link href="/dashboard" className={navLink}>
            Overview
          </Link>
          {teams.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/team/${t.id}`}
              className={`${navLink} whitespace-nowrap`}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-zinc-800 bg-zinc-900/60 md:flex">
        <div className="border-b border-zinc-800 p-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg font-black text-white shadow-lg shadow-red-600/30">
              S
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">
                {CLUB.shortName}{' '}
                <span className="text-red-600">Dashboard</span>
              </p>
              <p className="text-xs text-zinc-500">{CLUB.name}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Menu
          </p>
          <Link href="/dashboard" className={navLink}>
            📊 Overview
          </Link>
          <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            My teams
          </p>
          {teams.length === 0 && (
            <p className="px-3 text-xs text-zinc-600">
              No teams assigned yet — ask your coach.
            </p>
          )}
          {teams.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/team/${t.id}`}
              className={navLink}
            >
              ⚽ {t.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-200">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="text-xs capitalize text-zinc-500">{profile.role}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Page content */}
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
