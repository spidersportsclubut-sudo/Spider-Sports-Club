import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  getCurrentUserId,
  getMyTeams,
  getProfile,
  getSupabase,
} from './data'
import { SetupNotice } from '@/components/dashboard/SetupNotice'
import type { ClubEvent, Role } from '@/lib/types'

export const dynamic = 'force-dynamic'

const ROLE_BADGE: Record<Role, string> = {
  admin: 'bg-red-600/15 text-red-400 border-red-600/40',
  coach: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  parent: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  player: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
}

const TYPE_BADGE: Record<ClubEvent['type'], string> = {
  practice: 'bg-sky-600/15 text-sky-300 border-sky-600/40',
  game: 'bg-red-600/15 text-red-300 border-red-600/40',
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function DashboardHome() {
  const supabase = await getSupabase()
  if (!supabase) return <SetupNotice />

  const userId = await getCurrentUserId(supabase)
  if (!userId) redirect('/login')

  const profile = await getProfile(supabase, userId)
  if (!profile) redirect('/dashboard')

  const teams = await getMyTeams(supabase, userId, profile)

  let upcoming: (ClubEvent & { teamName: string })[] = []
  if (teams.length > 0) {
    const now = new Date()
    const weekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const { data } = await supabase
      .from('events')
      .select('*')
      .in(
        'team_id',
        teams.map((t) => t.id)
      )
      .gte('starts_at', now.toISOString())
      .lte('starts_at', weekOut.toISOString())
      .order('starts_at', { ascending: true })
      .limit(20)
    const nameById = new Map(teams.map((t) => [t.id, t.name]))
    upcoming = ((data as ClubEvent[]) ?? []).map((e) => ({
      ...e,
      teamName: nameById.get(e.team_id) ?? 'Team',
    }))
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">
            Welcome back, {profile.full_name?.split(' ')[0] ?? 'teammate'} 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Here&apos;s what&apos;s happening across your teams.
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${ROLE_BADGE[profile.role]}`}
        >
          {profile.role}
        </span>
      </header>

      {/* My teams */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
          My teams
        </h2>
        {teams.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
            You&apos;re not assigned to any teams yet. Ask your coach or club
            admin to add you to a roster.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <Link
                key={t.id}
                href={`/dashboard/team/${t.id}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-red-600/60 hover:bg-zinc-900"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-xl transition group-hover:bg-red-600/25">
                  ⚽
                </div>
                <p className="font-bold text-zinc-100">{t.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {t.division} · {t.city}
                </p>
                <p className="mt-3 text-xs font-semibold text-red-500 opacity-0 transition group-hover:opacity-100">
                  Open team hub →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming this week */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
          Upcoming this week
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
            Nothing scheduled in the next 7 days. Enjoy the rest — see you on
            the pitch soon.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            {upcoming.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${TYPE_BADGE[e.type]}`}
                >
                  {e.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {e.teamName}
                    {e.location ? (
                      <span className="font-normal text-zinc-400">
                        {' '}
                        · {e.location}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-zinc-500">{formatWhen(e.starts_at)}</p>
                </div>
                <Link
                  href={`/dashboard/team/${e.team_id}`}
                  className="text-xs font-semibold text-red-500 hover:text-red-400"
                >
                  View team →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
